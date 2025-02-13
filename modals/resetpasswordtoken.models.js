const mongoose = require("mongoose");
const { Schema } = mongoose;

const PasswordResetTokenSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  reset_link: {
    type: String,
    required: true,
    unique: true,  
  },

  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true 
});

module.exports = mongoose.model("PasswordResetToken", PasswordResetTokenSchema);