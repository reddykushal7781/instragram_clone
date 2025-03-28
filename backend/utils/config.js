import dotenv from "dotenv";
dotenv.config();

export default  {
    port: process.env.PORT || 3000,
    uri: process.env.MONGO_URI,
    secret_key:process.env.SECRET_KEY,
    url: process.env.URL
}