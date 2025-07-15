// models/Userc.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String },
  prenom: { type: String, default: "" },          // <---- NEW
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tel: { type: String, default: "" },             // <---- NEW
  profession: { type: String, default: "" },      // <---- NEW
  photo: { type: String, default: "" },
  active: { type: Boolean, default: true },
  verificationCode: { type: String },
  verificationCodeExpiresAt: { type: Date },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ["admin", "user"], default: "user" },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Userc", userSchema);
