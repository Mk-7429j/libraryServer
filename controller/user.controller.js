const {
  SOMETING_WENT_WRONG,
  USER_ADD_FAILED,
  USER_ADD_SUCCESS,
} = require("../helper/message.helper");
const { errorResponse, successResponse } = require("../helper/responce.helper");
const { EncryptPassword } = require("../helper/shared.helper");
const { UserSchema } = require("./models_import");
const mongoose = require("mongoose");

const addUser = async (req, res) => {
  console.log(req.body,"sddsd");
  try {
    req.body.password = await EncryptPassword(req.body.password);

    await UserSchema.create(req.body);

    return successResponse(res, USER_ADD_SUCCESS);
  } catch (err) {
    console.log(err);
    return errorResponse(res, USER_ADD_FAILED);
  }
};

const editUser = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  try {
    if (email) {
      const existingUser = await UserSchema.findOne({
        email,
        _id: { $ne: id },
      });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Email is already in use by another user." });
      }
    }
    const updatedData = { ...req.body };

    const updatedUser = await UserSchema.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

const getSingleUser = async (req, res) => {
  try {
    const userData = req.userData;
    const { id } = req.params;

    let where = "";

    if (id !== "null") {
      where = id;
    } else {
      where = userData.id;
    }

    let result = await UserSchema.findOne({ _id: where }, { password: 0 });
    successResponse(res, "", result);
  } catch (err) {
    console.log(err);
    errorResponse(res, SOMETING_WENT_WRONG);
  }
};

module.exports = {
  addUser,
  editUser,
  getSingleUser,
};
