import express from "express";
import cors from "cors";
import connectDB from "../backend/connection/db.js";
import config from "../backend/utils/config.js";
import userRouter from "./routes/user.route.js"
const port = config.port;

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Allow frontend
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true, // Allow cookies and authentication headers
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/user",userRouter);

app.get("/", (req, res) => {
    res.send({ message: "Server is running!" });
  });

app.listen(port, () => {
  connectDB();
  console.log("server running",port);
});

export default app;
