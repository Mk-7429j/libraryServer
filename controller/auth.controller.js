const PasswordResetToken = require("../modals/resetpasswordtoken.models");
const { sendMail } = require("../helper/shared.helper");
const {
  INVALID_ACCOUTN_DETAILS,
  INCORRECT_PASSWORD,
  LOGIN_SUCCESS,
  PASSWORD_CHANGED_SUCCESSFULLY,
  PASSWORD_CHANGING_ERROR,
  SOMETING_WENT_WRONG,
} = require("../helper/message.helper");
const { errorResponse, successResponse } = require("../helper/responce.helper");
const { UserSchema } = require("../controller/models_import");
const {
  GenerateToken,
  PlaintoHash,
  EncryptPassword,
} = require("../helper/shared.helper");
const _ = require("lodash");
const crypto = require("crypto");
const FRONTEND_URL = process.env.FRONTEND_URL;

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await UserSchema.aggregate([{ $match: { email } }]);

    if (_.isEmpty(result)) {
      return errorResponse(res, INVALID_ACCOUTN_DETAILS);
    }

    const isPasswordValid = await PlaintoHash(
      password,
      _.get(result, "[0].password", "")
    );
    if (isPasswordValid) {
      const payload = {
        id: _.get(result, "[0]._id", ""),
        email: _.get(result, "[0].email", ""),
        role: _.get(result, "[0].role", ""),
      };

      const token = await GenerateToken(payload);
      return successResponse(res, LOGIN_SUCCESS, {
        token,
        data: { email: payload.email, role: payload.role },
      });
    } else {
      return errorResponse(res, INCORRECT_PASSWORD);
    }
  } catch (err) {
    console.log(err);
    return errorResponse(res, SOMETING_WENT_WRONG);
  }
};

const checkLoginStatus = async (req, res) => {
  try {
    const { id } = req.userData;
    const result = await UserSchema.findOne({ _id: id }, { password: 0 });

    if (_.isEmpty(result)) {
      return res.status(200).send({ message: "Invalid token" });
    }

    return res.status(200).send({ message: "Already logged in", data: result });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userData.id;

    const user = await UserSchema.findById(userId);
    if (!user) {
      return errorResponse(res, "User not found");
    }

    const isMatch = await PlaintoHash(oldPassword, user.password);
    if (!isMatch) {
      return errorResponse(res, INCORRECT_PASSWORD);
    }

    const hashedNewPassword = await EncryptPassword(newPassword);
    user.password = hashedNewPassword;
    await user.save();
    return successResponse(res, PASSWORD_CHANGED_SUCCESSFULLY);
  } catch (err) {
    return errorResponse(res, PASSWORD_CHANGING_ERROR);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserSchema.findOne({ email });

    if (!user) {
      return errorResponse(res, "User not found");
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const expiresAt = Date.now() + 5 * 60 * 1000;

    await PasswordResetToken.create({
      user_id: user._id,
      reset_link: resetToken,
      expiresAt: expiresAt,
    });

    const resetLink = `${FRONTEND_URL}/reset-password/${resetToken}`;
    await sendMail(email, resetLink);

    return successResponse(
      res,
      "Reset password link has been sent to your email."
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      "An error occurred while processing your request."
    );
  }
};

const VerifyResetLink = async (req, res) => {
  try {
    const { id } = req.params;
    const verification_result = await PasswordResetToken.aggregate([
      {
        $match: {
          reset_link: id,
          expiresAt: { $gt: new Date() },
        },
      },
    ]);

    if (_.isEmpty(verification_result)) {
      return errorResponse(res, "Invalid or expired token.", { result: false });
    }

    return successResponse(res, "Sucess this valid token", { result: true });
  } catch (err) {
    console.log("Error during token verification:", err);
    return errorResponse(res, "Error verifying token.");
  }
};

const resetPassword = async (req, res) => {
  try {
    const { reset_url, newPassword } = req.body;
    const tokenData = await PasswordResetToken.findOne({
      reset_link: reset_url,
    });

    if (!tokenData) {
      return errorResponse(res, "Invalid or expired token.");
    }

    const hashedPassword = await EncryptPassword(newPassword);
    await UserSchema.findByIdAndUpdate(tokenData.user_id, {
      password: hashedPassword,
    });
    await PasswordResetToken.deleteOne({ reset_link: reset_url });

    return successResponse(res, PASSWORD_CHANGED_SUCCESSFULLY);
  } catch (err) {
    console.error(err);
    return errorResponse(res, SOMETING_WENT_WRONG);
  }
};

module.exports = {
  login,
  checkLoginStatus,
  changePassword,
  VerifyResetLink,
  forgotPassword,
  resetPassword,
};
