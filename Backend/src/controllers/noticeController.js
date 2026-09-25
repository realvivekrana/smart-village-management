const Notice = require("../models/Notice");
const User = require("../models/User");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const notificationService = require("../services/notificationService");
const emailService = require("../services/emailService");

/*
|--------------------------------------------------------------------------
| GET /api/v1/notices  (public)
|--------------------------------------------------------------------------
*/
const getNotices = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { category, priority, search } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (search) filter.$text = { $search: search };

    const [notices, total] = await Promise.all([
      Notice.find(filter)
        .populate("createdBy", "name")
        .sort({ priority: -1, publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notice.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { notices },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/notices/:id  (public)
|--------------------------------------------------------------------------
*/
const getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id).populate("createdBy", "name").lean();
    if (!notice || !notice.isActive) {
      return res.status(404).json({ success: false, message: "Notice not found" });
    }

    // Increment view count
    await Notice.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    return res.status(200).json({ success: true, data: { notice } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/v1/notices  (admin)
|--------------------------------------------------------------------------
*/
const createNotice = async (req, res, next) => {
  try {
    const notice = await Notice.create({ ...req.body, createdBy: req.user._id });

    // Notify all active users (background, non-blocking)
    User.find({ isActive: true }).select("_id email").lean().then(async (users) => {
      const ids = users.map((u) => u._id);
      await notificationService.notifyNewNotice(ids, notice);
      if (req.body.sendEmail) {
        await emailService.sendNewNoticeEmail(users, notice);
      }
    }).catch(() => {});

    return res.status(201).json({ success: true, message: "Notice created", data: { notice } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/v1/notices/:id  (admin)
|--------------------------------------------------------------------------
*/
const updateNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!notice) return res.status(404).json({ success: false, message: "Notice not found" });
    return res.status(200).json({ success: true, message: "Notice updated", data: { notice } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/v1/notices/:id  (admin)
|--------------------------------------------------------------------------
*/
const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!notice) return res.status(404).json({ success: false, message: "Notice not found" });
    return res.status(200).json({ success: true, message: "Notice deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotices, getNoticeById, createNotice, updateNotice, deleteNotice };
