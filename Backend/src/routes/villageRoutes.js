const express = require("express");

const {
  getVillage,
  createVillage,
  updateVillage,
  uploadVillageImages,
  getVillagePlaces,
  addVillagePlace,
  updateVillagePlace,
  deleteVillagePlace,
} = require("../controllers/villageController");

const { protect, authorize } = require("../middleware/authMiddleware");

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

// Update village information
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
  uploadVillageImages
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