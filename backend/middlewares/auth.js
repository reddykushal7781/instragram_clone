import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
// import ErrorHandler from "../utils/errorHandler.js";
import catchAsync from "./catchAsync.js";

export const isAuthenticated = catchAsync(async (req, res, next) => {
  // Get token from cookie
  const token = req.cookies.token;

  if (!token) {
    // return next();
    return res.status(401).json({ success: false, message: "Login required" });
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData.id);
  next();
});
