import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsync from "./catchAsync.js";

export const isAuthenticated = catchAsync(async (req, res, next) => {
  //Token from cookie
  const token = req.cookies.token;

  if (!token) {
    return next(new ErrorHandler("Please Login to Access", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData.id);
  next();
});
