import express from "express";
import {
  newPost,
  likeUnlikePost,
  deletePost,
  newComment,
  allPosts,
  getPostsOfFollowing,
  updateCaption,
  saveUnsavePost,
  getPostDetails,
} from "../controllers/postController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { uploadPost } from "../utils/awsFunctions.js";

const router = express.Router();

//configured multer instance
const postUploader = uploadPost();

router
  .route("/post/new")
  .post(isAuthenticated, postUploader.single("post"), newPost);

router.route("/posts/all").get(allPosts);

router.route("/posts").get(isAuthenticated, getPostsOfFollowing);

router.route("/post/detail/:id").get(isAuthenticated, getPostDetails);

router
  .route("/post/:id")
  .get(isAuthenticated, likeUnlikePost)
  .post(isAuthenticated, saveUnsavePost)
  .put(isAuthenticated, updateCaption)
  .delete(isAuthenticated, deletePost);

router.route("/post/comment/:id").post(isAuthenticated, newComment);

export default router;
