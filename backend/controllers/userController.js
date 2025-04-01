import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import catchAsync from "../middlewares/catchAsync.js";
import sendCookie from "../utils/sendCookie.js";
import ErrorHandler from "../utils/errorHandler.js";
import crypto from "crypto";
import { deleteFile } from "../utils/awsFunctions.js";

// Signup User
export const signupUser = catchAsync(async (req, res, next) => {
  const { name, email, username, password } = req.body;

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (user) {
    if (user.username === username) {
      return next(new ErrorHandler("Username already exists", 401));
    }
    return next(new ErrorHandler("Email already exists", 401));
  }

  // Handle file path for both S3 and local storage
  const avatarPath =
    req.file.location ||
    (req.file.path && `/public/uploads/${req.file.path.split("uploads/")[1]}`);

  const newUser = await User.create({
    name,
    email,
    username,
    password,
    avatar: avatarPath,
  });

  sendCookie(newUser, 201, res);
});

// Login User
export const loginUser = catchAsync(async (req, res, next) => {
  const { userId, password } = req.body;

  const user = await User.findOne({
    $or: [{ email: userId }, { username: userId }],
  }).select("+password");

  if (!user) {
    return next(new ErrorHandler("User doesn't exist", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Password doesn't match", 401));
  }

  sendCookie(user, 201, res);
});

// Logout User
export const logoutUser = catchAsync(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Get User Details --Logged In User
export const getAccountDetails = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate({
    path: "posts",
    populate: {
      path: "postedBy",
    },
  });

  res.status(200).json({
    success: true,
    user,
  });
});

// Get User Details
export const getUserDetails = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username })
    .populate("followers following")
    .populate({
      path: "posts",
      populate: {
        path: "comments",
        populate: {
          path: "user",
        },
      },
    })
    .populate({
      path: "posts",
      populate: {
        path: "postedBy",
      },
    })
    .populate({
      path: "saved",
      populate: {
        path: "comments",
        populate: {
          path: "user",
        },
      },
    })
    .populate({
      path: "saved",
      populate: {
        path: "postedBy",
      },
    });

  res.status(200).json({
    success: true,
    user,
  });
});

// Get User Details By Id
export const getUserDetailsById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// Get All Users
export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  const suggestedUsers = users
    .filter(
      (u) =>
        !u.followers.includes(req.user._id) &&
        u._id.toString() !== req.user._id.toString()
    )
    .slice(-5);

  res.status(200).json({
    success: true,
    users: suggestedUsers,
  });
});

// Update Password
export const updatePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  const isPasswordMatched = await user.comparePassword(oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Old Password", 401));
  }

  user.password = newPassword;
  await user.save();
  sendCookie(user, 201, res);
});

// Update Profile
export const updateProfile = catchAsync(async (req, res, next) => {
  const { name, username, bio, email } = req.body;

  const newUserData = {
    name,
    username,
    bio,
    email,
  };

  const userExists = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (userExists && userExists._id.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("User Already Exists", 404));
  }

  if (req.body.avatar !== "" && req.file) {
    const user = await User.findById(req.user._id);

    await deleteFile(user.avatar);
    // Handle file path for both S3 and local storage
    newUserData.avatar =
      req.file.location ||
      (req.file.path &&
        `/public/uploads/${req.file.path.split("uploads/")[1]}`);
  }

  await User.findByIdAndUpdate(req.user._id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: true,
  });

  res.status(200).json({
    success: true,
  });
});

// Delete Profile ⚠️⚠️
export const deleteProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const posts = user.posts;
  const followers = user.followers;
  const following = user.following;
  const userId = user._id;

  // delete post & user images ⚠️⚠️

  await user.remove();

  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  for (let i = 0; i < posts.length; i++) {
    const post = await Post.findById(posts[i]);
    await post.remove();
  }

  for (let i = 0; i < followers.length; i++) {
    const follower = await User.findById(followers[i]);

    const index = follower.following.indexOf(userId);
    follower.following.splice(index, 1);
    await follower.save();
  }

  for (let i = 0; i < following.length; i++) {
    const follows = await User.findById(following[i]);

    const index = follows.followers.indexOf(userId);
    follows.followers.splice(index, 1);
    await follows.save();
  }

  res.status(200).json({
    success: true,
    message: "Profile Deleted",
  });
});

// Follow | Unfollow User
export const followUser = catchAsync(async (req, res, next) => {
  const userToFollow = await User.findById(req.params.id);
  const loggedInUser = await User.findById(req.user._id);

  if (!userToFollow) {
    return next(new ErrorHandler("User Not Found", 404));
  }

  if (loggedInUser.following.includes(userToFollow._id)) {
    const followingIndex = loggedInUser.following.indexOf(userToFollow._id);
    const followerIndex = userToFollow.followers.indexOf(loggedInUser._id);

    loggedInUser.following.splice(followingIndex, 1);
    userToFollow.followers.splice(followerIndex, 1);

    await loggedInUser.save();
    await userToFollow.save();

    return res.status(200).json({
      success: true,
      message: "User Unfollowed",
    });
  } else {
    loggedInUser.following.push(userToFollow._id);
    userToFollow.followers.push(loggedInUser._id);
    await loggedInUser.save();
    await userToFollow.save();

    res.status(200).json({
      success: true,
      message: "User Followed",
    });
  }
});

// User Search
export const searchUsers = catchAsync(async (req, res, next) => {
  if (req.query.keyword) {
    const users = await User.find({
      $or: [
        {
          name: {
            $regex: req.query.keyword,
            $options: "i",
          },
        },
        {
          username: {
            $regex: req.query.keyword,
            $options: "i",
          },
        },
      ],
    });

    res.status(200).json({
      success: true,
      users,
    });
  }
});

// User Search -- Atlas Search
// exports.searchUsers = catchAsync(async (req, res, next) => {

//     if (req.query.keyword) {
//         const users = await User.aggregate(
//             [
//                 {
//                     $search: {
//                         index: 'usersearch',
//                         text: {
//                             query: req.query.keyword,
//                             path: ['name', 'username'],
//                             fuzzy: {
//                                 maxEdits: 2.0
//                             }
//                         }
//                     }
//                 }
//             ]
//         )

//         res.status(200).json({
//             success: true,
//             users,
//         });
//     }
// });
