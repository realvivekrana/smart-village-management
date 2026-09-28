
const express = require("express");

const router = express.Router();

const {
  getVillageFeatures,
  getVillageFeatureById,
  createVillageFeature,
  updateVillageFeature,
  deleteVillageFeature,

  applyForFeature,
  getMyApplications,
  trackApplication,

  getAllApplications,
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/villageFeatureController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

/*
|--------------------------------------------------------------------------
| PUBLIC / CITIZEN ROUTES
|--------------------------------------------------------------------------
*/

/*
 * Get all published village features
 *
 * GET /api/v1/village-features
 */
router.get(
  "/",
  getVillageFeatures
);

/*
 * Get single village feature
 *
 * GET /api/v1/village-features/:id
 */
router.get(
  "/:id",
  getVillageFeatureById
);

/*
|--------------------------------------------------------------------------
| CITIZEN ROUTES
|--------------------------------------------------------------------------
*/

/*
 * IMPORTANT:
 * These routes are placed before "/:id"
 * so Express does not treat "applications"
 * as a MongoDB ID.
 */

/*
 * Get my applications
 *
 * GET /api/v1/village-features/applications/mine
 */
router.get(
  "/applications/mine",
  protect,
  getMyApplications
);

/*
 * Track application
 *
 * GET /api/v1/village-features/applications/track/:trackingId
 */
router.get(
  "/applications/track/:trackingId",
  protect,
  trackApplication
);

/*
 * Apply for scheme/service/program
 *
 * POST /api/v1/village-features/:id/apply
 */
router.post(
  "/:id/apply",
  protect,
  applyForFeature
);

/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
*/

/*
 * Create village feature
 *
 * POST /api/v1/village-features
 */
router.post(
  "/",
  protect,
  authorize("admin"),
  createVillageFeature
);

/*
 * Get all applications
 *
 * GET /api/v1/village-features/admin/applications
 */
router.get(
  "/admin/applications",
  protect,
  authorize("admin"),
  getAllApplications
);

/*
 * Update application status
 *
 * PATCH /api/v1/village-features/admin/applications/:id
 */
router.patch(
  "/admin/applications/:id",
  protect,
  authorize("admin"),
  updateApplicationStatus
);

/*
 * Delete application
 *
 * DELETE /api/v1/village-features/admin/applications/:id
 */
router.delete(
  "/admin/applications/:id",
  protect,
  authorize("admin"),
  deleteApplication
);

/*
 * Update village feature
 *
 * PUT /api/v1/village-features/:id
 */
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateVillageFeature
);

/*
 * Delete village feature
 *
 * DELETE /api/v1/village-features/:id
 */
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteVillageFeature
);

module.exports = router;