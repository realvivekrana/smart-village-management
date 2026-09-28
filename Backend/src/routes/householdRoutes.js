
const express = require("express");

const router = express.Router();

const {
  getMyHousehold,
  upsertMyHousehold,

  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  getFamilyMember,

  deleteMyHousehold,

  getAllHouseholds,
  getHouseholdById,
  verifyHousehold,
  unverifyHousehold,
} = require("../controllers/householdController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

/*
|--------------------------------------------------------------------------
| CITIZEN HOUSEHOLD ROUTES
|--------------------------------------------------------------------------
*/

/*
 * Get logged-in user's household
 *
 * GET /api/v1/households/mine
 */
router.get(
  "/mine",
  protect,
  getMyHousehold
);

/*
 * Create or update logged-in user's household
 *
 * PUT /api/v1/households/mine
 */
router.put(
  "/mine",
  protect,
  upsertMyHousehold
);

/*
 * Delete logged-in user's household
 *
 * DELETE /api/v1/households/mine
 */
router.delete(
  "/mine",
  protect,
  deleteMyHousehold
);

/*
|--------------------------------------------------------------------------
| FAMILY MEMBER ROUTES
|--------------------------------------------------------------------------
*/

/*
 * Add family member
 *
 * POST /api/v1/households/mine/members
 */
router.post(
  "/mine/members",
  protect,
  addFamilyMember
);

/*
 * Get single family member
 *
 * GET /api/v1/households/mine/members/:memberId
 */
router.get(
  "/mine/members/:memberId",
  protect,
  getFamilyMember
);

/*
 * Update family member
 *
 * PUT /api/v1/households/mine/members/:memberId
 */
router.put(
  "/mine/members/:memberId",
  protect,
  updateFamilyMember
);

/*
 * Delete family member
 *
 * DELETE /api/v1/households/mine/members/:memberId
 */
router.delete(
  "/mine/members/:memberId",
  protect,
  deleteFamilyMember
);

/*
|--------------------------------------------------------------------------
| ADMIN HOUSEHOLD ROUTES
|--------------------------------------------------------------------------
*/

/*
 * Get all households
 *
 * GET /api/v1/households/admin
 */
router.get(
  "/admin",
  protect,
  authorize("admin"),
  getAllHouseholds
);

/*
 * Get household by ID
 *
 * GET /api/v1/households/admin/:id
 */
router.get(
  "/admin/:id",
  protect,
  authorize("admin"),
  getHouseholdById
);

/*
 * Verify household
 *
 * PATCH /api/v1/households/admin/:id/verify
 */
router.patch(
  "/admin/:id/verify",
  protect,
  authorize("admin"),
  verifyHousehold
);

/*
 * Remove household verification
 *
 * PATCH /api/v1/households/admin/:id/unverify
 */
router.patch(
  "/admin/:id/unverify",
  protect,
  authorize("admin"),
  unverifyHousehold
);

module.exports = router;