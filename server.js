// Load environment variables first - MUST BE AT THE TOP
// import dotenv from "dotenv";
import config from './backend/config/config.js';
import path from "path";
import { fileURLToPath } from "url";

// Create __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
// dotenv.config({ path: path.join(__dirname, "backend/config/config.env") });

console.log("====== Environment Variables ======");
console.log("AWS_BUCKET_NAME:", config.AWS_BUCKET_NAME);
console.log("AWS_BUCKET_REGION:", config.AWS_BUCKET_REGION);
console.log(
  "AWS_IAM_USER_KEY:",
  config.AWS_IAM_USER_KEY ? "******** (set)" : "undefined"
);
console.log(
  "AWS_IAM_USER_SECRET:",
  config.AWS_IAM_USER_SECRET ? "******** (set)" : "undefined"
);
console.log("NODE_ENV:", config.NODE_ENV);
console.log("PORT:", config.PORT);
console.log("==================================");

// Now import the rest of the dependencies
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./backend/app.js";
import connectDatabase from "./backend/connection/db.js";

const PORT = config.PORT || 4001;

connectDatabase();

// Serve static files from public directory
app.use("/public", express.static(path.join(__dirname, "public")));

// Development route
app.get("/", (req, res) => {
  res.send("Server is Running! 🚀");
});

const httpServer = createServer(app);
const server = httpServer.listen(PORT, () => {
  console.log(`Server Running on http://localhost:${PORT}`);
});

// ============= socket.io ==============
const io = new Server(server, {
  cors: {
    origin: ["https://instagram-clone-one-virid.vercel.app", "http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  pingTimeout: 60000,
  transports: ["polling", "websocket"],
  allowEIO3: true,
  path: "/socket.io",
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("Someone connected!");

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("sendMessage", ({ senderId, receiverId, content }) => {
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("getMessage", {
      senderId,
      content,
    });
  });

  socket.on("typing", ({ senderId, receiverId }) => {
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("typing", senderId);
  });

  socket.on("typing stop", ({ senderId, receiverId }) => {
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("typing stop", senderId);
  });

  socket.on("disconnect", () => {
    console.log("Someone disconnected");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
