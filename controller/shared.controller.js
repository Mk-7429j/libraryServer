const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const filePath = require("path");
const { successResponse } = require("../helper/responce.helper");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadImage = async (req, res) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Body: req.file.buffer,
      Key: `${Date.now()}${filePath.extname(req.file.originalname)}`,
      ACL: "public-read",
    };

    const uploadMedia = new PutObjectCommand(params);
    await s3Client.send(uploadMedia);
    const result = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
    successResponse(res, "upload success", { url: result });
  } catch (err) {
    console.log(err);
  }
};

const uploadQr = async (base64Data, fileName) => {
  // Prepare S3 upload parameters
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: `qrcodes/${fileName}`, // Folder structure
    Body: Buffer.from(
      base64Data.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    ),
    ContentEncoding: "base64", // Required for base64-encoded files
    ContentType: "image/png", // File type
    ACL: "public-read", // Make the file publicly readable
  };

  try {
    // Upload the file to S3
    const uploadCommand = new PutObjectCommand(params);
    await s3Client.send(uploadCommand);

    // Return the file's public URL
    const resultUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    return resultUrl;
  } catch (err) {
    console.error("Error uploading QR code to S3:", err);
    throw new Error("Failed to upload QR code.");
  }
};

const handleQrUpload = async (req, res) => {
  try {
    const { base64Data, fileName } = req.body;

    if (!base64Data || !fileName) {
      return res.status(400).json({ message: "Invalid request data." });
    }

    const qrUrl = await uploadQr(base64Data, fileName);
    res.status(200).json({ message: "QR code uploaded successfully.", qrUrl });
  } catch (err) {
    console.error("Error in handleQrUpload:", err.message);
    res.status(500).json({ message: "Failed to upload QR code." });
  }
};

const deleteImage = async (fileKey) => {
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: fileKey,
  };

  try {
    const deleteCommand = new DeleteObjectCommand(params);
    await s3Client.send(deleteCommand);
    console.log(`File deleted: ${fileKey}`);
    return { success: true, message: "Image deleted successfully" };
  } catch (err) {
    console.error("Error deleting image from S3:", err);
    throw new Error("Failed to delete image.");
  }
};

module.exports = { uploadImage, handleQrUpload, deleteImage };
