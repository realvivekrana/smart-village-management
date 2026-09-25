const cloudinary = require("../config/cloudinary");
const env = require("../config/env");
const logger = require("../utils/logger");

/*
|--------------------------------------------------------------------------
| Upload Buffer to Cloudinary
|--------------------------------------------------------------------------
| Multer memory storage se jo buffer aata hai usse Cloudinary pe upload karo
*/

const uploadImage = (buffer, folder = "smart-village", options = {}) => {
  return new Promise((resolve, reject) => {
    if (!env.cloudinary.enabled) {
      return reject(new Error("Cloudinary is not configured"));
    }

    const uploadOptions = {
      folder,
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ quality: "auto", fetch_format: "auto" }],
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

/*
|--------------------------------------------------------------------------
| Upload Multiple Images
|--------------------------------------------------------------------------
*/

const uploadMultipleImages = async (files, folder = "smart-village") => {
  const uploads = files.map((file) => uploadImage(file.buffer, folder));
  return Promise.all(uploads);
};

/*
|--------------------------------------------------------------------------
| Delete Image from Cloudinary
|--------------------------------------------------------------------------
*/

const deleteImage = async (publicId) => {
  if (!env.cloudinary.enabled || !publicId) return null;

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error("Cloudinary delete error:", error);
    return null;
  }
};

/*
|--------------------------------------------------------------------------
| Delete Multiple Images
|--------------------------------------------------------------------------
*/

const deleteMultipleImages = async (publicIds = []) => {
  if (!env.cloudinary.enabled || publicIds.length === 0) return null;

  const valid = publicIds.filter(Boolean);
  if (valid.length === 0) return null;

  try {
    const result = await cloudinary.api.delete_resources(valid);
    return result;
  } catch (error) {
    logger.error("Cloudinary batch delete error:", error);
    return null;
  }
};

/*
|--------------------------------------------------------------------------
| Upload Resume / Document (PDF, DOC)
|--------------------------------------------------------------------------
*/

const uploadDocument = (buffer, folder = "smart-village/resumes", options = {}) => {
  return new Promise((resolve, reject) => {
    if (!env.cloudinary.enabled) {
      return reject(new Error("Cloudinary is not configured"));
    }

    const uploadOptions = {
      folder,
      resource_type: "raw",
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          size: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  uploadDocument,
};
