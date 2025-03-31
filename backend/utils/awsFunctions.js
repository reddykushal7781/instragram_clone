import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//direct environment variable loading here as a backup
dotenv.config({
  path: path.join(__dirname, "../../backend/config/config.env"),
});

// Create local storage directory paths
const publicDir = path.join(__dirname, "../../public");
const profilesDir = path.join(publicDir, "profiles");
const postsDir = path.join(publicDir, "posts");

//storage state
let s3Config = null;
let useS3Storage = false;
let storageInitialized = false;
let initializationInProgress = false;

// S3 initialization function
const initializeStorage = () => {
  if (storageInitialized || initializationInProgress) return;

  //To stop concurrent
  initializationInProgress = true;

  console.log("Initializing storage system...");
  console.log("AWS Configuration (in awsFunctions.js):");
  console.log("AWS_BUCKET_NAME:", process.env.AWS_BUCKET_NAME || "undefined");
  console.log(
    "AWS_BUCKET_REGION:",
    process.env.AWS_BUCKET_REGION || "undefined"
  );
  console.log(
    "AWS_IAM_USER_KEY:",
    process.env.AWS_IAM_USER_KEY
      ? "********" + process.env.AWS_IAM_USER_KEY.substr(-4)
      : "undefined"
  );
  console.log(
    "AWS_IAM_USER_SECRET:",
    process.env.AWS_IAM_USER_SECRET ? "********" : "undefined"
  );

  // fallback
  ensureLocalDirectories();

  // Check if AWS credentials are available
  const hasAWSCredentials = !!(
    process.env.AWS_BUCKET_NAME &&
    process.env.AWS_BUCKET_REGION &&
    process.env.AWS_IAM_USER_KEY &&
    process.env.AWS_IAM_USER_SECRET
  );

  if (hasAWSCredentials) {
    console.log("AWS credentials found. Configuring S3...");
    try {
      s3Config = new aws.S3({
        accessKeyId: process.env.AWS_IAM_USER_KEY,
        secretAccessKey: process.env.AWS_IAM_USER_SECRET,
        region: process.env.AWS_BUCKET_REGION,
        apiVersion: "2006-03-01",
      });

      console.log(`Using S3 bucket: ${process.env.AWS_BUCKET_NAME}`);
      useS3Storage = true;
      storageInitialized = true;
      initializationInProgress = false;
    } catch (error) {
      console.error("Error creating S3 client:", error);
      console.log("Falling back to local storage...");
      useS3Storage = false;
      storageInitialized = true;
      initializationInProgress = false;
    }
  } else {
    console.log("AWS credentials not found. Using local storage.");
    useS3Storage = false;
    storageInitialized = true;
    initializationInProgress = false;
  }
};

const ensureLocalDirectories = () => {
  console.log("Setting up local storage directories...");
  [publicDir, profilesDir, postsDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

const getAvatarStorage = () => {
  //storage initialized
  initializeStorage();

  if (useS3Storage) {
    console.log("Using S3 storage for avatars");
    return getS3AvatarStorage();
  } else {
    console.log("Using local storage for avatars");
    return getLocalAvatarStorage();
  }
};

const getPostStorage = () => {
  initializeStorage();

  if (useS3Storage) {
    console.log("Using S3 storage for posts");
    return getS3PostStorage();
  } else {
    console.log("Using local storage for posts");
    return getLocalPostStorage();
  }
};

//specific storage implementations
const getS3AvatarStorage = () => {
  return multerS3({
    s3: s3Config,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "public-read",
    metadata: function (req, file, cb) {
      console.log("Processing avatar metadata:", file.fieldname);
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const key =
        "profiles/" +
        file.fieldname +
        "_" +
        uniqueSuffix +
        path.extname(file.originalname);
      console.log("Generated avatar key:", key);
      cb(null, key);
    },
  });
};

const getLocalAvatarStorage = () => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, profilesDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "_" + uniqueSuffix + path.extname(file.originalname)
      );
    },
  });
};

const getS3PostStorage = () => {
  return multerS3({
    s3: s3Config,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "public-read",
    metadata: function (req, file, cb) {
      console.log("Processing post metadata:", file.fieldname);
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const key =
        "posts/" +
        file.fieldname +
        "_" +
        uniqueSuffix +
        path.extname(file.originalname);
      console.log("Generated post key:", key);
      cb(null, key);
    },
  });
};

const getLocalPostStorage = () => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, postsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "_" + uniqueSuffix + path.extname(file.originalname)
      );
    },
  });
};

export const uploadAvatar = () => {
  // Delayed initialization of multer
  initializeStorage();
  return multer({
    storage: getAvatarStorage(),
    limits: {
      fileSize: 1024 * 1024 * 5, // 5MB
    },
  });
};

export const uploadPost = () => {
  // Delayed initialization of multer
  initializeStorage();
  return multer({
    storage: getPostStorage(),
    limits: {
      fileSize: 1024 * 1024 * 5, // 5MB
    },
  });
};

// Delete file function for S3
export const deleteFile = async (fileuri) => {
  initializeStorage();
  console.log(`Attempting to delete file: ${fileuri}`);

  if (!fileuri) {
    console.log("No file URI provided, skipping deletion");
    return;
  }

  if (useS3Storage && fileuri.includes("amazonaws.com")) {
    try {
      // Extract the file key from the S3 URL
      const fileKey = fileuri.split("/").slice(-2).join("/");
      console.log(`Parsed file key: ${fileKey}`);

      const result = await s3Config
        .deleteObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: fileKey,
        })
        .promise();

      console.log("File deletion successful:", result);
      return result;
    } catch (error) {
      console.error("Error deleting file from S3:", error);
      return { error: error.message };
    }
  } else {
    //Local file deletion
    try {
      const localPath = path.join(publicDir, fileuri.split("/public/")[1]);
      console.log(`Attempting to delete local file: ${localPath}`);

      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        console.log(`Local file deleted: ${localPath}`);
        return { success: true };
      } else {
        console.log(`Local file not found: ${localPath}`);
        return { warning: "File not found" };
      }
    } catch (error) {
      console.error("Error deleting local file:", error);
      return { error: error.message };
    }
  }
};
