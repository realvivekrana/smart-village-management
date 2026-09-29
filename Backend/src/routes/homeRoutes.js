const express = require("express");

const {
  getHomeData,
} = require("../controllers/homeController");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| HOME PAGE ROUTE
|--------------------------------------------------------------------------
|
| GET /api/v1/home
|
| Homepage ke optimized data ke liye single API endpoint.
|
| Is endpoint se:
|
| - Upcoming Events
| - Latest Notices
|
| ek hi request me milenge.
|--------------------------------------------------------------------------
*/

router.get("/", getHomeData);

module.exports = router;