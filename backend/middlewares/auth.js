import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
// import ErrorHandler from "../utils/errorHandler.js";
import catchAsync from "./catchAsync.js";

export const isAuthenticated = catchAsync(async (req, res, next) => {
  // Get token from cookie or Authorization header
  let token = req.cookies.token;
  
  // If no token in cookie, check Authorization header
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "Please login to access this resource"
    });
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);
    next();
  } catch {
    return res.status(401).json({ 
      success: false,
      message: "Invalid or expired token. Please login again."
    });
  }
});
