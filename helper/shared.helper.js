const bycrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");

const PlaintoHash = async (plain_text, hash_text) => {
  return await bycrypt.compare(plain_text, hash_text);
};

const EncryptPassword = async (password) => {
  return await bycrypt.hash(password, 12);
};

const GenerateToken = async (payload) => {
  try {
    return await jwt.sign(payload, process.env.SECRET_KEY);
  } catch (e) {
    throw e;
  }
};

const VerifyToken = async (req, res, next) => {
  try {
    let token = _.get(req, "headers.authorization", " ");

    if (!token) {
      return res.status(401).send({ message: "Invalid token" });
    } else {
      const result = await jwt.verify(token.split(" ")[1], process.env.SECRET_KEY);

      if (_.isEmpty(result)) {
        return res.status(401).send({ message: "Invalid token" });
      }
      req.userData = result;
      console.log(" Payload:", req.userData);
      next();
    }
  } catch (e) {
    return res.status(401).send({ message: "Invalid token" });
  }
};

const getdatas = (value, extravalue) => {
  let basePath = path.join(__dirname, "../templates");
  try {
    switch (value) {
      case "reset":
        let payload = {
          url: extravalue,
          template: fs.readFileSync(`${basePath}/resetPassword.ejs`, "utf-8"),
        };
        return {
          subject: "Password Reset Request",
          html: ejs.render(payload.template, { url: payload.url }),
        };
    }
  } catch (err) {
    console.log(err);
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  secure: false,
  port: 587,
  auth: {
    user: process.env.USER,
    pass: process.env.APP_PASS,
  },
});

const sendMail = async (email, resetLink = false) => {
  try {
    const mailOptions = {
      from: {
        address: "support@Subham.com",
        name: "Subham",
      },
      to: email,
      ...getdatas("reset", resetLink),
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  PlaintoHash,
  EncryptPassword,
  GenerateToken,
  VerifyToken,
  sendMail,
};
