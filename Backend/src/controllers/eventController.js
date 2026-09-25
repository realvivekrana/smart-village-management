const Event = require("../models/Event");
const User = require("../models/User");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const cloudinaryService = require("../services/cloudinaryService");
const notificationService = require("../services/notificationService");
const env = require("../config/env");

/*
|--------------------------------------------------------------------------
| GET /api/v1/events  (public)
|--------------------------------------------------------------------------
*/
const getEvents = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { category, upcoming, search } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (upcoming === "true") filter.endDate = { $gte: new Date() };
    if (search) filter.$text = { $search: search };

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate("createdBy", "name")
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { events },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/events/:id  (public)
|--------------------------------------------------------------------------
*/
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name")
      .lean();
    if (!event || !event.isActive) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    return res.status(200).json({ success: true, data: { event } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/v1/events  (admin)
|--------------------------------------------------------------------------
*/
const createEvent = async (req, res, next) => {
  try {
    let images = [];
    if (req.files && req.files.length > 0 && env.cloudinary.enabled) {
      images = await cloudinaryService.uploadMultipleImages(req.files, "smart-village/events");
    }

    const event = await Event.create({ ...req.body, images, createdBy: req.user._id });

    // Notify all users (non-blocking)
    User.find({ isActive: true }).select("_id").lean().then(async (users) => {
      const ids = users.map((u) => u._id);
      await notificationService.notifyNewEvent(ids, event);
    }).catch(() => {});

    return res.status(201).json({ success: true, message: "Event created", data: { event } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/v1/events/:id  (admin)
|--------------------------------------------------------------------------
*/
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    return res.status(200).json({ success: true, message: "Event updated", data: { event } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/v1/events/:id  (admin)
|--------------------------------------------------------------------------
*/
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    return res.status(200).json({ success: true, message: "Event deleted" });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/v1/events/:id/interested  (protected)
|--------------------------------------------------------------------------
*/
const toggleInterested = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.isActive) {
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
    return res.status(200).json({
      success: true,
      message: isInterested ? "Removed from interested" : "Marked as interested",
      data: { interested: !isInterested, attendeeCount: event.attendeeCount },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleInterested,
};
