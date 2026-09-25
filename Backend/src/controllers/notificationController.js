const Notification = require("../models/Notification");
const { getPagination, getPaginationMeta } = require("../utils/pagination");

/*
|--------------------------------------------------------------------------
| GET /api/v1/notifications  (protected — own)
|--------------------------------------------------------------------------
*/
const getMyNotifications = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { unreadOnly } = req.query;

    const filter = { recipient: req.user._id };
    if (unreadOnly === "true") filter.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    return res.status(200).json({
      success: true,
      data: { notifications, unreadCount },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PATCH /api/v1/notifications/:id/read  (protected)
|--------------------------------------------------------------------------
*/
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PATCH /api/v1/notifications/read-all  (protected)
|--------------------------------------------------------------------------
*/
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/v1/notifications/:id  (protected — own)
|--------------------------------------------------------------------------
*/
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });

    return res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/v1/notifications  (protected — clear all own)
|--------------------------------------------------------------------------
*/
const clearAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    return res.status(200).json({ success: true, message: "All notifications cleared" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
};
