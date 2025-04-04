import express from "express";
import {
  followUser,
  getUserDetails,
  getUserDetailsById,
  loginUser,
  logoutUser,
  searchUsers,
  signupUser,
  updatePassword,
  updateProfile,
  getAllUsers,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { uploadAvatar } from "../utils/awsFunctions.js";

const router = express.Router();

// multer instance
const avatarUploader = uploadAvatar();

router.route("/signup").post(avatarUploader.single("avatar"), signupUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);

// Email verification routes
router.route("/verify-email").post(verifyEmail);
router.route("/resend-verification").post(resendVerificationEmail);

router.route("/me").get(isAuthenticated, getUserDetails);

router.route("/user/:username").get(isAuthenticated, getUserDetails);
router.route("/userdetails/:id").get(isAuthenticated, getUserDetailsById);

router
  .route("/update/profile")
  .put(isAuthenticated, avatarUploader.single("avatar"), updateProfile);
router.route("/update/password").put(isAuthenticated, updatePassword);

router.route("/follow/:id").get(isAuthenticated, followUser);

router.route("/users").get(isAuthenticated, searchUsers);
router.route("/users/suggested").get(isAuthenticated, getAllUsers);

export default router;
