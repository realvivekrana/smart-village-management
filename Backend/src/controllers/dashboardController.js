const dashboardService = require("../services/dashboardService");

/*
|--------------------------------------------------------------------------
| GET /api/v1/dashboard/admin  (admin)
|--------------------------------------------------------------------------
*/
const getAdminDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardService.getAdminStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/dashboard/citizen  (citizen)
|--------------------------------------------------------------------------
*/
const getCitizenDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardService.getCitizenStats(req.user._id);
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/dashboard/business-owner  (business_owner)
|--------------------------------------------------------------------------
*/
const getBusinessOwnerDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardService.getBusinessOwnerStats(req.user._id);
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getCitizenDashboard,
  getBusinessOwnerDashboard,
};
