import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import config from "../config/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add direct environment variable loading here as a backup
// This ensures environment variables are loaded regardless of import order
dotenv.config({
  path: path.join(__dirname, "../../backend/config/config.env"),
});

// Create local storage directory paths
const publicDir = path.join(__dirname, "../../public");
const profilesDir = path.join(publicDir, "profiles");
const postsDir = path.join(publicDir, "posts");

// Initialize storage state - will be set during runtime
let s3Config = null;
let useS3Storage = false;
let storageInitialized = false;
let initializationInProgress = false;

// S3 initialization function to be called at runtime
const initializeStorage = () => {
  // Skip if already initialized or in progress
  if (storageInitialized || initializationInProgress) return;

  // Set flag to prevent concurrent initialization
  initializationInProgress = true;

  console.log("Initializing storage system...");
  console.log("AWS Configuration (in awsFunctions.js):");
  console.log("AWS_BUCKET_NAME:", config.AWS_BUCKET_NAME || "undefined");
  console.log(
    "AWS_BUCKET_REGION:",
    config.AWS_BUCKET_REGION || "undefined"
  );
  console.log(
    "AWS_IAM_USER_KEY:",
    config.AWS_IAM_USER_KEY
      ? "********" + config.AWS_IAM_USER_KEY.substr(-4)
      : "undefined"
  );
  console.log(
    "AWS_IAM_USER_SECRET:",
    config.AWS_IAM_USER_SECRET ? "********" : "undefined"
  );

  // Ensure local directories exist for fallback
  ensureLocalDirectories();

  // Check if AWS credentials are available
  const hasAWSCredentials = !!(
    config.AWS_BUCKET_NAME &&
    config.AWS_BUCKET_REGION &&
    config.AWS_IAM_USER_KEY &&
    config.AWS_IAM_USER_SECRET
  );

  if (hasAWSCredentials) {
    console.log("AWS credentials found. Configuring S3...");
    try {
      s3Config = new aws.S3({
        accessKeyId: config.AWS_IAM_USER_KEY,
        secretAccessKey: config.AWS_IAM_USER_SECRET,
        region: config.AWS_BUCKET_REGION,
        apiVersion: "2006-03-01",
      });

      // Simple synchronous check instead of async operation
      console.log(`Using S3 bucket: ${config.AWS_BUCKET_NAME}`);
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

// Ensure local directories exist if needed
const ensureLocalDirectories = () => {
  console.log("Setting up local storage directories...");
  [publicDir, profilesDir, postsDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Get storage based on availability - these will wait for initialization if needed
const getAvatarStorage = () => {
  // Make sure storage is initialized
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
  // Make sure storage is initialized
  initializeStorage();

  if (useS3Storage) {
    console.log("Using S3 storage for posts");
    return getS3PostStorage();
  } else {
    console.log("Using local storage for posts");
    return getLocalPostStorage();
  }
};

// Helper functions to get specific storage implementations
const getS3AvatarStorage = () => {
  return multerS3({
    s3: s3Config,
    bucket: config.AWS_BUCKET_NAME,
    // acl: "public-read",
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
    bucket: config.AWS_BUCKET_NAME,
    // acl: "public-read",
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

// Configure multer with appropriate storage - using factory functions for delayed initialization
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

// Delete file function for S3 or local storage
export const deleteFile = async (fileuri) => {
  // Ensure storage is initialized before deleting
  initializeStorage();

  console.log(`Attempting to delete file: ${fileuri}`);

  if (!fileuri) {
    console.log("No file URI provided, skipping deletion");
    return;
  }

  if (useS3Storage && fileuri.includes("amazonaws.com")) {
    try {
      // Extract the file key from the S3 URL
      // Format: https://bucket-name.s3.region.amazonaws.com/path/to/file.jpg
      const fileKey = fileuri.split("/").slice(-2).join("/");
      console.log(`Parsed file key: ${fileKey}`);

      const result = await s3Config
        .deleteObject({
          Bucket: config.AWS_BUCKET_NAME,
          Key: fileKey,
        })
        .promise();

      console.log("File deletion successful:", result);
      return result;
    } catch (error) {
      console.error("Error deleting file from S3:", error);
      // Log the error but don't throw it to prevent application crashes
      return { error: error.message };
    }
  } else {
    // Local file deletion
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
