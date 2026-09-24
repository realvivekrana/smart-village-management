const multer = require("multer");

const ApiError = require("../utils/ApiError");

/*
|--------------------------------------------------------------------------
| Multer (memory storage)
|--------------------------------------------------------------------------
| File disk pe save nahi hoti, buffer me aati hai (req.file.buffer),
| phir cloudinaryService usse Cloudinary pe upload karega.
*/

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const imageFilter = (req, file, cb) => {
  if (IMAGE_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(ApiError.badRequest("Only JPG, PNG and WEBP images are allowed"));
};

const resumeFilter = (req, file, cb) => {
  if (RESUME_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(ApiError.badRequest("Only PDF, DOC and DOCX files are allowed"));
};

const imageUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: resumeFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = {
  // Ek image:      uploadSingleImage("avatar")
  uploadSingleImage: (field = "image") => imageUpload.single(field),

  // Multiple image: uploadMultipleImages("images", 5)
  uploadMultipleImages: (field = "images", maxCount = 5) =>
    imageUpload.array(field, maxCount),

  // Job application resume (field name: "resume")
  uploadResume: resumeUpload.single("resume"),
};