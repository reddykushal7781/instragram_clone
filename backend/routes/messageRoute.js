import express from "express";
import { newMessage, getMessages } from "../controllers/messageController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.route("/newMessage").post(isAuthenticated, newMessage);
router.route("/messages/:chatId").get(isAuthenticated, getMessages);

export default router;
