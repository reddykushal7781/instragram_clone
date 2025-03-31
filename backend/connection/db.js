import mongoose from "mongoose";

const connectDatabase = () => {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
  };
  mongoose
    .connect(process.env.MONGO_URI, options)
    .then(() => {
      console.log("MongoDB Connected Successfully");
    })
    .catch((error) => {
      console.log("MongoDB Connection Error:");
      console.log(error);
      console.log("Server will run without database");
    });
};

export default connectDatabase;
