const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");

// Debug AWS credentials
console.log("AWS Configuration:");
console.log("AWS_BUCKET_NAME:", process.env.AWS_BUCKET_NAME);
console.log("AWS_BUCKET_REGION:", process.env.AWS_BUCKET_REGION);
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

// Configure AWS SDK
const s3Config = new aws.S3({
  accessKeyId: process.env.AWS_IAM_USER_KEY,
  secretAccessKey: process.env.AWS_IAM_USER_SECRET,
  region: process.env.AWS_BUCKET_REGION,
});

// Test S3 connection
console.log("Testing S3 connection...");
s3Config.listBuckets((err, data) => {
  if (err) {
    console.error("Error connecting to S3:", err);
  } else {
    console.log(
      "S3 Connection successful. Available buckets:",
      data.Buckets.map((b) => b.Name).join(", ")
    );
  }
});

const avatarS3Config = multerS3({
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

const postS3Config = multerS3({
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

exports.uploadAvatar = multer({
  storage: avatarS3Config,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

exports.uploadPost = multer({
  storage: postS3Config,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

exports.deleteFile = async (fileuri) => {
  console.log(`Attempting to delete file: ${fileuri}`);
  try {
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
    throw error;
  }
};
