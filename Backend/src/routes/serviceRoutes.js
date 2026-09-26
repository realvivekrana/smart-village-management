const express = require("express");

const router = express.Router();

const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Get all services
router.get("/", getServices);

// Get single service
router.get("/:id", getServiceById);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

// Create service
router.post(
  "/",
  protect,
  authorize("admin"),
  createService
);

// Update service
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateService
);

// Delete service
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteService
);

module.exports = router;