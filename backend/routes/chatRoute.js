import express from "express";
import { newChat, getChats } from "../controllers/chatController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.route("/newChat").post(isAuthenticated, newChat);
router.route("/chats").get(isAuthenticated, getChats);

export default router;
