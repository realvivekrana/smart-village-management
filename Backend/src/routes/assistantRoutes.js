const express = require("express");
const router = express.Router();

const { chat, suggestions } = require("../controllers/assistantController");
const { optionalAuth } = require("../middleware/authMiddleware");
const { assistantLimiter } = require("../middleware/rateLimitMiddleware");

router.get("/suggestions", suggestions);
router.post("/chat", assistantLimiter, optionalAuth, chat);

module.exports = router;