import dotenv from 'dotenv';
dotenv.config();

export default {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRE: process.env.JWT_EXPIRE,
    COOKIE_EXPIRE: process.env.COOKIE_EXPIRE,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
    AWS_BUCKET_REGION: process.env.AWS_BUCKET_REGION,
    AWS_IAM_USER_KEY: process.env.AWS_IAM_USER_KEY,
    AWS_IAM_USER_SECRET: process.env.AWS_IAM_USER_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD
}
