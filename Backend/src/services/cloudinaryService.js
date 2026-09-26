const cloudinary = require("../config/cloudinary");
const env = require("../config/env");
const logger = require("../utils/logger");

/*
|--------------------------------------------------------------------------
| Upload Buffer to Cloudinary
|--------------------------------------------------------------------------
| Multer memory storage se jo buffer aata hai
| usse Cloudinary par upload karta hai.
|--------------------------------------------------------------------------
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
      transformation: [
        {
          quality: "auto",
          fetch_format: "auto",
        },
      ],
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return reject(error);
        }

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

const uploadMultipleImages = async (
  files,
  folder = "smart-village"
) => {
  if (!files || files.length === 0) {
    return [];
  }

  const uploads = files.map((file) => {
    return uploadImage(file.buffer, folder);
  });

  return Promise.all(uploads);
};

/*
|--------------------------------------------------------------------------
| Delete Single Image from Cloudinary
|--------------------------------------------------------------------------
*/

const deleteImage = async (publicId) => {
  if (!env.cloudinary.enabled) {
    return null;
  }

  if (!publicId) {
    return null;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    logger.info(
      `Cloudinary image deleted: ${publicId}`
    );

    return result;
  } catch (error) {
    logger.error(
      "Cloudinary delete error:",
      error
    );

    return null;
  }
};

/*
|--------------------------------------------------------------------------
| Delete Multiple Images
|--------------------------------------------------------------------------
*/

const deleteMultipleImages = async (publicIds = []) => {
  if (!env.cloudinary.enabled) {
    return null;
  }

  if (!Array.isArray(publicIds) || publicIds.length === 0) {
    return null;
  }

  const validPublicIds = publicIds.filter(Boolean);

  if (validPublicIds.length === 0) {
    return null;
  }

  try {
    const result = await cloudinary.api.delete_resources(
      validPublicIds,
      {
        resource_type: "image",
      }
    );

    logger.info(
      `Cloudinary images deleted: ${validPublicIds.length}`
    );

    return result;
  } catch (error) {
    logger.error(
      "Cloudinary batch delete error:",
      error
    );

    return null;
  }
};

/*
|--------------------------------------------------------------------------
| Upload Resume / Document
|--------------------------------------------------------------------------
| PDF / DOC / DOCX etc.
|--------------------------------------------------------------------------
*/

const uploadDocument = (
  buffer,
  folder = "smart-village/resumes",
  options = {}
) => {
  return new Promise((resolve, reject) => {
    if (!env.cloudinary.enabled) {
      return reject(
        new Error("Cloudinary is not configured")
      );
    }

    const uploadOptions = {
      folder,
      resource_type: "raw",
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return reject(error);
        }

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

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
| IMPORTANT:
| deleteImage MUST be exported because villageController.js
| calls cloudinaryService.deleteImage(...)
|--------------------------------------------------------------------------
*/

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  uploadDocument,
};