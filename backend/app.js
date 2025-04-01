import express from "express";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// AWS S3 functionality
dotenv.config({ path: path.join(__dirname, "config/config.env") });

console.log("App.js - Loading environment variables");
console.log("AWS_BUCKET_NAME:", process.env.AWS_BUCKET_NAME);
console.log("AWS_BUCKET_REGION:", process.env.AWS_BUCKET_REGION);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/public", express.static("public"));

//routes
import post from "./routes/postRoute.js";
import user from "./routes/userRoute.js";
import chat from "./routes/chatRoute.js";
import message from "./routes/messageRoute.js";

app.use("/api/v1", post);
app.use("/api/v1", user);
app.use("/api/v1", chat);
app.use("/api/v1", message);

// error middleware
app.use(errorMiddleware);

export default app;
