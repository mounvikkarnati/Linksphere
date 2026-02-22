const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = (buffer, originalName) => {
  return new Promise((resolve, reject) => {

    const isPdfOrDoc =
      originalName.endsWith(".pdf") ||
      originalName.endsWith(".doc") ||
      originalName.endsWith(".docx");

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "bchat",
        resource_type: isPdfOrDoc ? "raw" : "auto", // 🔥 IMPORTANT FIX
        use_filename: true,
        unique_filename: false,
        overwrite: true
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = uploadToCloudinary;