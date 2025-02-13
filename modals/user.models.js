const { Schema, model } = require("mongoose");

module.exports = model(
  "user",
  Schema(
    {
      reg_no: {
        type: String,
        unique: true,
      },
      user_img: {
        type: String,
      },
      qr_code_url: {
        type: String,
      },
      first_name: {
        type: String,
        required: true,
      },
      last_name: {
        type: String,
      },
      role: {
        type: String,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      mobile_number: {
        type: Number,
      },
      address: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      pincode: {
        type: Number,
      },
      country: {
        type: String,
      },
      password: {
        type: String,
        required: true,
      },
    },
    {
      collection: "user",
      timestamps: true,
    }
  )
);
