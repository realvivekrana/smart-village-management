const express = require("express");

const {
  getMyProfile,
} = require("../controllers/userController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| User Profile Routes
|--------------------------------------------------------------------------
*/

/*
GET /api/v1/users/profile

Protected:
Sirf logged-in user apni profile dekh sakta hai.
*/

router.get(
  "/profile",
  protect,
  getMyProfile
);

module.exports = router;