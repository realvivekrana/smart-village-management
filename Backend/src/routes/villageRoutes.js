const express = require("express");

const {
  getVillage,
  createVillage,
  updateVillage,
  updateActiveVillage,
  uploadVillageImages,
  deleteVillageImage,
  getVillagePlaces,
  addVillagePlace,
  updateVillagePlace,
  deleteVillagePlace,
} = require("../controllers/villageController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { uploadMultipleImages } = require("../middleware/uploadMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Village Routes
|--------------------------------------------------------------------------
*/

// Get active village information
router.get("/", getVillage);

// Get village places/directory
router.get("/places", getVillagePlaces);


/*
|--------------------------------------------------------------------------
| Admin Village Routes
|--------------------------------------------------------------------------
*/

// Create village
router.post(
  "/",
  protect,
  authorize("admin", "super_admin"),
  createVillage
);

// Update active village (no id in URL — frontend calls PUT /api/v1/village directly)
router.put(
  "/",
  protect,
  authorize("admin", "super_admin"),
  updateActiveVillage
);

// Update village information by id
router.put(
  "/:id",
  protect,
  authorize("admin", "super_admin"),
  updateVillage
);

// Upload village images
router.post(
  "/:id/images",
  protect,
  authorize("admin", "super_admin"),
  uploadMultipleImages("images", 10),
  uploadVillageImages
);

// Delete a village image
router.delete(
  "/:id/images/:imageId",
  protect,
  authorize("admin", "super_admin"),
  deleteVillageImage
);


/*
|--------------------------------------------------------------------------
| Admin Village Places Routes
|--------------------------------------------------------------------------
*/

// Add school / hospital / temple / mosque / ATM / railway station etc.
router.post(
  "/:id/places",
  protect,
  authorize("admin", "super_admin"),
  addVillagePlace
);

// Update a place
router.put(
  "/:id/places/:placeId",
  protect,
  authorize("admin", "super_admin"),
  updateVillagePlace
);

// Delete a place
router.delete(
  "/:id/places/:placeId",
  protect,
  authorize("admin", "super_admin"),
  deleteVillagePlace
);

module.exports = router;