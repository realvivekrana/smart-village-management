const express = require("express");

const router = express.Router();

const {
  createSOSAlert,

  getMySOSAlerts,
  getMyActiveSOS,
  cancelMySOS,

  getAllSOSAlerts,
  getSOSById,

  acknowledgeSOS,
  markSOSResponding,
  resolveSOS,
  markFalseAlarm,
  updateSOSResponse,
} = require("../controllers/sosController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { sosLimiter } = require("../middleware/rateLimitMiddleware");

/*
|--------------------------------------------------------------------------
| CITIZEN SOS ROUTES
|--------------------------------------------------------------------------
*/

/*
 * Create emergency SOS
 *
 * POST /api/v1/sos
 */
router.post(
  "/",
  protect,
  sosLimiter,
  createSOSAlert
);

/*
 * Get my SOS history
 *
 * GET /api/v1/sos/mine
 */
router.get(
  "/mine",
  protect,
  getMySOSAlerts
);

/*
 * Get my currently active SOS
 *
 * GET /api/v1/sos/mine/active
 */
router.get(
  "/mine/active",
  protect,
  getMyActiveSOS
);

/*
 * Cancel my SOS
 *
 * PATCH /api/v1/sos/:id/cancel
 */
router.patch(
  "/:id/cancel",
  protect,
  cancelMySOS
);

/*
|--------------------------------------------------------------------------
| ADMIN SOS ROUTES
|--------------------------------------------------------------------------
*/

/*
 * Get all SOS alerts
 *
 * GET /api/v1/sos/admin
 */
router.get(
  "/admin",
  protect,
  authorize("admin"),
  getAllSOSAlerts
);

/*
 * Get single SOS alert
 *
 * GET /api/v1/sos/admin/:id
 */
router.get(
  "/admin/:id",
  protect,
  authorize("admin"),
  getSOSById
);

/*
 * Acknowledge SOS
 *
 * PATCH /api/v1/sos/admin/:id/acknowledge
 */
router.patch(
  "/admin/:id/acknowledge",
  protect,
  authorize("admin"),
  acknowledgeSOS
);

/*
 * Mark emergency response as active
 *
 * PATCH /api/v1/sos/admin/:id/responding
 */
router.patch(
  "/admin/:id/responding",
  protect,
  authorize("admin"),
  markSOSResponding
);

/*
 * Update response team/contact/message
 *
 * PATCH /api/v1/sos/admin/:id/response
 */
router.patch(
  "/admin/:id/response",
  protect,
  authorize("admin"),
  updateSOSResponse
);

/*
 * Resolve SOS
 *
 * PATCH /api/v1/sos/admin/:id/resolve
 */
router.patch(
  "/admin/:id/resolve",
  protect,
  authorize("admin"),
  resolveSOS
);

/*
 * Mark SOS as false alarm
 *
 * PATCH /api/v1/sos/admin/:id/false-alarm
 */
router.patch(
  "/admin/:id/false-alarm",
  protect,
  authorize("admin"),
  markFalseAlarm
);

module.exports = router;