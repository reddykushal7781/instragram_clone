import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter name"],
  },
  email: {
    type: String,
    required: [true, "Please enter email"],
    unique: [true, "Email already exists"],
  },
  username: {
    type: String,
    required: [true, "Please enter username"],
    minlength: [6, "Username must be of minimum 6 characters"],
    unique: [true, "Username already exists"],
  },
  password: {
    type: String,
    required: [true, "Please enter password"],
    minlength: [6, "Password must be of minimum 6 characters"],
    select: false,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  verificationOTP: {
    type: String,
    select: false,
  },
  verificationOTPExpires: {
    type: Date,
    select: false,
  },
  avatar: {
    type: String,
  },
  bio: {
    type: String,
    default: "Hi👋 Welcome To My Profile",
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  saved: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  
  // Generate OTP for new users
  if (this.isNew && !this.isEmailVerified) {
    this.verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
    this.verificationOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  }
  
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const User = mongoose.model("User", userSchema);

export default User;
