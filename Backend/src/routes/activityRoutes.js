const express = require("express");
const router = express.Router();

const {
  track,
  getOverview,
  getLive,
  getSessions,
  getSessionDetail,
  getEvents,
  cleanup,
} = require("../controllers/activityController");

const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { trackLimiter } = require("../middleware/rateLimitMiddleware");

/*
|--------------------------------------------------------------------------
| Public tracker (guest + logged-in)
|--------------------------------------------------------------------------
*/
router.post("/track", trackLimiter, optionalAuth, track);

/*
|--------------------------------------------------------------------------
| Admin only
|--------------------------------------------------------------------------
*/
router.get("/overview", protect, authorize("admin"), getOverview);
router.get("/live", protect, authorize("admin"), getLive);
router.get("/sessions", protect, authorize("admin"), getSessions);
router.get("/sessions/:sessionId", protect, authorize("admin"), getSessionDetail);
router.get("/events", protect, authorize("admin"), getEvents);
router.delete("/cleanup", protect, authorize("admin"), cleanup);

module.exports = router;