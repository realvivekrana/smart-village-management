const Event = require("../models/Event");
const User = require("../models/User");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const cloudinaryService = require("../services/cloudinaryService");
const notificationService = require("../services/notificationService");
const env = require("../config/env");
const { APPROVED_ONLY, REQUIRE_APPROVAL, submissionStatus, pick } = require("../utils/publicVisibility");

const CITIZEN_FIELDS = [
  "title", "description", "category", "startDate", "endDate",
  "location", "organizer", "maxAttendees",
];
const ADMIN_FIELDS = [...CITIZEN_FIELDS, "isFeatured", "isActive"];

const isAdmin = (user) => user?.role === "admin";

// multipart/form-data sends everything as strings, JSON sends real types.
const cleanBody = (body, allowed) => {
  const data = pick(body, allowed);
  if ("maxAttendees" in data) {
    data.maxAttendees =
      data.maxAttendees === "" || data.maxAttendees === null ? null : Number(data.maxAttendees);
  }
  if ("isFeatured" in data) data.isFeatured = data.isFeatured === true || data.isFeatured === "true";
  if ("isActive" in data) data.isActive = data.isActive === true || data.isActive === "true";
  return data;
};

const buildFilter = (query, base) => {
  const filter = { ...base };
  if (query.category) filter.category = query.category;
  if (query.upcoming === "true") filter.endDate = { $gte: new Date() };
  if (query.search) filter.$text = { $search: String(query.search) };
  return filter;
};

const LIST_FIELDS =
  "_id title description category startDate endDate location organizer images attendeeCount maxAttendees isActive isFeatured createdBy createdAt";

/* GET /events  (public: approved + active only) */
const getEvents = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = buildFilter(req.query, { isActive: true, ...APPROVED_ONLY });

    const [events, total] = await Promise.all([
      Event.find(filter)
        .select(LIST_FIELDS)
        .populate("createdBy", "name avatar")
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: { events },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/* GET /events/manage  (admin: every status, optional ?status=pending) */
const getManageEvents = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const base = { isActive: true };
    if (["pending", "approved", "rejected"].includes(req.query.status)) {
      base.status = req.query.status === "approved" ? APPROVED_ONLY.status : req.query.status;
    }
    const filter = buildFilter(req.query, base);

    const [events, total, pendingCount] = await Promise.all([
      Event.find(filter)
        .populate("createdBy", "name avatar email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(filter),
      Event.countDocuments({ isActive: true, status: "pending" }),
    ]);

    res.status(200).json({
      success: true,
      data: { events, pendingCount },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/* GET /events/mine */
const getMyEvents = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { createdBy: req.user._id, isActive: true };
    const [events, total] = await Promise.all([
      Event.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Event.countDocuments(filter),
    ]);
    res.status(200).json({
      success: true,
      data: { events },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/* GET /events/:id */
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate("createdBy", "name avatar").lean();

    const isOwner = event && req.user && String(event.createdBy?._id) === String(req.user._id);
    const approved = event && !["pending", "rejected"].includes(event.status);

    if (!event || !event.isActive || (!approved && !isOwner && !isAdmin(req.user))) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, data: { event } });
  } catch (error) {
    next(error);
  }
};

const broadcastPublished = (event) =>
  User.find({ isActive: true })
    .select("_id")
    .lean()
    .then((users) => notificationService.notifyNewEvent(users.map((u) => u._id), event))
    .catch(() => {});

/* POST /events  (goes live immediately; admin can moderate afterwards) */
const createEvent = async (req, res, next) => {
  try {
    const admin = isAdmin(req.user);
    const data = cleanBody(req.body, admin ? ADMIN_FIELDS : CITIZEN_FIELDS);

    let images = [];
    if (req.files && req.files.length > 0 && env.cloudinary.enabled) {
      images = await cloudinaryService.uploadMultipleImages(req.files, "smart-village/events");
    }

    data.status = submissionStatus(req.user);
    if (data.status === "approved") {
      data.reviewedBy = req.user._id;
      data.reviewedAt = new Date();
    }

    const event = await Event.create({ ...data, images, createdBy: req.user._id });

    if (event.status === "approved") {
      broadcastPublished(event);
    }

    if (!admin) {
      const published = event.status === "approved";
      User.find({ role: "admin", isActive: true })
        .select("_id")
        .lean()
        .then((admins) =>
          notificationService.broadcastNotification(
            admins.map((a) => a._id),
            {
              title: published ? "New event posted by a citizen" : "New event awaiting approval",
              message: `${req.user.name} ${published ? "posted" : "submitted"} an event: "${event.title}"`,
              type: "system",
              link: published ? "/admin/events" : "/admin/events?status=pending",
              refModel: "Event",
              refId: event._id,
            }
          )
        )
        .catch(() => {});
    }

    res.status(201).json({
      success: true,
      message:
        event.status === "approved"
          ? "Event published. Everyone can see it now."
          : "Event submitted. It will be visible to everyone after admin approval.",
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

/* PUT /events/:id  (admin: any event; citizen: own event) */
const updateEvent = async (req, res, next) => {
  try {
    const admin = isAdmin(req.user);
    const event = await Event.findById(req.params.id);
    if (!event || (!admin && !event.isActive)) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    if (!admin && String(event.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You can only edit your own events" });
    }

    event.set(cleanBody(req.body, admin ? ADMIN_FIELDS : CITIZEN_FIELDS));
    // only when the village runs in "approval required" mode
    if (!admin && REQUIRE_APPROVAL) event.status = "pending";
    await event.save(); // schema hook checks end date is after start date

    res.status(200).json({ success: true, message: "Event updated", data: { event } });
  } catch (error) {
    next(error);
  }
};

/* PATCH /events/:id/review  (admin) */
const reviewEvent = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event || !event.isActive) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // already approved: do nothing (avoids re-sending notifications to the whole village)
    if (status === "approved" && event.status === "approved") {
      return res.status(200).json({ success: true, message: "Event is already approved", data: { event } });
    }

    event.status = status;
    event.rejectionReason = status === "rejected" ? String(rejectionReason || "").trim() : "";
    event.reviewedBy = req.user._id;
    event.reviewedAt = new Date();
    await event.save();

    if (String(event.createdBy) !== String(req.user._id)) {
      notificationService
        .createNotification({
          recipient: event.createdBy,
          title: status === "approved" ? "Your event was approved" : "Your event was rejected",
          message:
            status === "approved"
              ? `"${event.title}" is now visible to everyone.`
              : `"${event.title}" was not approved. Reason: ${event.rejectionReason}`,
          type: "system",
          link:
            status === "approved"
              ? `/citizen/events/${event._id}`
              : `/citizen/my-submissions?tab=events&highlight=${event._id}`,
          refModel: "Event",
          refId: event._id,
        })
        .catch(() => {});
    }
    if (status === "approved") broadcastPublished(event);

    res.status(200).json({
      success: true,
      message: status === "approved" ? "Event approved" : "Event rejected",
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

/* DELETE /events/:id  (admin: any; citizen: own event) */
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    if (!isAdmin(req.user)) {
      if (String(event.createdBy) !== String(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: "You can only remove your own events",
        });
      }
    }

    event.isActive = false;
    await event.save();
    res.status(200).json({ success: true, message: "Event deleted" });
  } catch (error) {
    next(error);
  }
};

/* POST /events/:id/interested */
const toggleInterested = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.isActive || ["pending", "rejected"].includes(event.status)) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const userId = req.user._id;
    const isInterested = event.interestedUsers.some((id) => String(id) === String(userId));

    if (isInterested) {
      event.interestedUsers.pull(userId);
      event.attendeeCount = Math.max(0, event.attendeeCount - 1);
    } else {
      event.interestedUsers.push(userId);
      event.attendeeCount += 1;
    }
    await event.save();

    res.status(200).json({
      success: true,
      message: isInterested ? "Removed from interested" : "Marked as interested",
      data: { interested: !isInterested, attendeeCount: event.attendeeCount },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents, getManageEvents, getMyEvents, getEventById,
  createEvent, updateEvent, reviewEvent, deleteEvent, toggleInterested,
};