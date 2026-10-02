const Notice = require("../models/Notice");
const User = require("../models/User");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const notificationService = require("../services/notificationService");
const Notification = require("../models/Notification");
const emailService = require("../services/emailService");
const { APPROVED_ONLY, REQUIRE_APPROVAL, submissionStatus, notExpired, pick } = require("../utils/publicVisibility");

const CITIZEN_FIELDS = ["title", "content", "category", "expiresAt"];
const ADMIN_FIELDS = [...CITIZEN_FIELDS, "priority", "publishedAt", "isActive"];

// Mongo sorts strings alphabetically, so map priority to a rank instead.
const PRIORITY_RANK = {
  $switch: {
    branches: [
      { case: { $eq: ["$priority", "urgent"] }, then: 4 },
      { case: { $eq: ["$priority", "high"] }, then: 3 },
      { case: { $eq: ["$priority", "normal"] }, then: 2 },
    ],
    default: 1,
  },
};

const isAdmin = (user) => user?.role === "admin";

const cleanBody = (body, allowed) => {
  const data = pick(body, allowed);
  if (data.expiresAt === "" || data.expiresAt === null) data.expiresAt = null;
  return data;
};

const buildFilter = (query, base) => {
  const filter = { ...base };
  if (query.category) filter.category = query.category;
  if (query.priority) filter.priority = query.priority;
  if (query.search) filter.$text = { $search: String(query.search) };
  return filter;
};

const notifyAdminsOfSubmission = (notice, user) =>
  User.find({ role: "admin", isActive: true })
    .select("_id")
    .lean()
    .then((admins) =>
      notificationService.broadcastNotification(
        admins.map((a) => a._id),
        {
          title: notice.status === "approved" ? "New notice posted by a citizen" : "New notice awaiting approval",
          message: `${user.name} ${notice.status === "approved" ? "posted" : "submitted"} a notice: "${notice.title}"`,
          type: "system",
          link: notice.status === "approved" ? "/admin/notices" : "/admin/notices?status=pending",
          refModel: "Notice",
          refId: notice._id,
        }
      )
    )
    .catch(() => {});

const broadcastPublished = (notice, sendEmail) =>
  User.find({ isActive: true })
    .select("_id email")
    .lean()
    .then(async (users) => {
      await notificationService.notifyNewNotice(users.map((u) => u._id), notice);
      if (sendEmail) await emailService.sendNewNoticeEmail(users, notice);
    })
    .catch(() => {});

/* GET /notices  (public: approved, active, not expired) */
const getNotices = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = buildFilter(req.query, { isActive: true, ...APPROVED_ONLY, ...notExpired() });

    const [rows, total] = await Promise.all([
      Notice.aggregate([
        { $match: filter },
        { $addFields: { priorityRank: PRIORITY_RANK } },
        { $sort: { priorityRank: -1, publishedAt: -1, _id: -1 } },
        { $skip: skip },
        { $limit: limit },
        { $project: { priorityRank: 0, attachments: 0 } },
      ]),
      Notice.countDocuments(filter),
    ]);

    const notices = await Notice.populate(rows, { path: "createdBy", select: "name avatar" });

    res.status(200).json({
      success: true,
      data: { notices },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/* GET /notices/manage  (admin: every status, optional ?status=pending) */
const getManageNotices = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const base = { isActive: true };
    if (["pending", "approved", "rejected"].includes(req.query.status)) {
      base.status = req.query.status === "approved" ? APPROVED_ONLY.status : req.query.status;
    }
    const filter = buildFilter(req.query, base);

    const [notices, total, pendingCount] = await Promise.all([
      Notice.find(filter)
        .populate("createdBy", "name avatar email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notice.countDocuments(filter),
      Notice.countDocuments({ isActive: true, status: "pending" }),
    ]);

    res.status(200).json({
      success: true,
      data: { notices, pendingCount },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/* GET /notices/mine  (logged-in user's own submissions, any status) */
const getMyNotices = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { createdBy: req.user._id, isActive: true };
    const [notices, total] = await Promise.all([
      Notice.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notice.countDocuments(filter),
    ]);
    res.status(200).json({
      success: true,
      data: { notices },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/* GET /notices/:id  (public if approved; owner/admin can see their own) */
const getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id).populate("createdBy", "name avatar").lean();

    const isOwner = notice && req.user && String(notice.createdBy?._id) === String(req.user._id);
    const approved = notice && !["pending", "rejected"].includes(notice.status);

    if (!notice || !notice.isActive || (!approved && !isOwner && !isAdmin(req.user))) {
      return res.status(404).json({ success: false, message: "Notice not found" });
    }

    if (approved) {
      Notice.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }).catch(() => {});
    }

    res.status(200).json({ success: true, data: { notice } });
  } catch (error) {
    next(error);
  }
};

/* POST /notices  (goes live immediately; admin can moderate afterwards) */
const createNotice = async (req, res, next) => {
  try {
    const admin = isAdmin(req.user);
    const data = cleanBody(req.body, admin ? ADMIN_FIELDS : CITIZEN_FIELDS);

    // citizens can never mark a notice urgent / high (it would alert the whole village)
    if (!admin) data.priority = "normal";

    data.status = submissionStatus(req.user);
    if (data.status === "approved") {
      data.reviewedBy = req.user._id;
      data.reviewedAt = new Date();
    }

    const notice = await Notice.create({ ...data, createdBy: req.user._id });

    if (notice.status === "approved") {
      // e-mail blast only for admin notices, in-app notification for everyone
      broadcastPublished(notice, admin && req.body.sendEmail);
    }
    if (!admin) notifyAdminsOfSubmission(notice, req.user);

    res.status(201).json({
      success: true,
      message:
        notice.status === "approved"
          ? "Notice published. Everyone can see it now."
          : "Notice submitted. It will be visible to everyone after admin approval.",
      data: { notice },
    });
  } catch (error) {
    next(error);
  }
};

/* PUT /notices/:id  (admin: any notice; citizen: own notice) */
const updateNotice = async (req, res, next) => {
  try {
    const admin = isAdmin(req.user);
    const notice = await Notice.findById(req.params.id);
    if (!notice || (!admin && !notice.isActive)) {
      return res.status(404).json({ success: false, message: "Notice not found" });
    }
    if (!admin && String(notice.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You can only edit your own notices" });
    }

    notice.set(cleanBody(req.body, admin ? ADMIN_FIELDS : CITIZEN_FIELDS));
    // only when the village runs in "approval required" mode
    if (!admin && REQUIRE_APPROVAL) notice.status = "pending";
    await notice.save();

    res.status(200).json({ success: true, message: "Notice updated", data: { notice } });
  } catch (error) {
    next(error);
  }
};

/* PATCH /notices/:id/review  (admin approves or rejects a submission) */
const reviewNotice = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const notice = await Notice.findById(req.params.id);
    if (!notice || !notice.isActive) {
      return res.status(404).json({ success: false, message: "Notice not found" });
    }

    // already approved: do nothing (avoids re-sending notifications to the whole village)
    if (status === "approved" && notice.status === "approved") {
      return res.status(200).json({ success: true, message: "Notice is already approved", data: { notice } });
    }

    notice.status = status;
    notice.rejectionReason = status === "rejected" ? String(rejectionReason || "").trim() : "";
    notice.reviewedBy = req.user._id;
    notice.reviewedAt = new Date();
    if (status === "approved") notice.publishedAt = new Date();
    await notice.save();

    if (String(notice.createdBy) !== String(req.user._id)) {
      notificationService
        .createNotification({
          recipient: notice.createdBy,
          title: status === "approved" ? "Your notice was approved" : "Your notice was rejected",
          message:
            status === "approved"
              ? `"${notice.title}" is now visible to everyone.`
              : `"${notice.title}" was not approved. Reason: ${notice.rejectionReason}`,
          type: "system",
          link:
            status === "approved"
              ? `/citizen/notices/${notice._id}`
              : `/citizen/my-submissions?highlight=${notice._id}`,
          refModel: "Notice",
          refId: notice._id,
        })
        .catch(() => {});
    }
    if (status === "approved") broadcastPublished(notice, false);

    res.status(200).json({
      success: true,
      message: status === "approved" ? "Notice approved" : "Notice rejected",
      data: { notice },
    });
  } catch (error) {
    next(error);
  }
};

/* DELETE /notices/:id  (admin: any; citizen: own notice) */
const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: "Notice not found" });

    if (!isAdmin(req.user)) {
      if (String(notice.createdBy) !== String(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: "You can only remove your own notices",
        });
      }
    }

    notice.isActive = false;
    await notice.save();

    // remove stale notifications so nobody clicks into a deleted notice
    await Notification.deleteMany({ refModel: "Notice", refId: notice._id }).catch(() => {});

    res.status(200).json({ success: true, message: "Notice deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotices,
  getManageNotices,
  getMyNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  reviewNotice,
  deleteNotice,
};