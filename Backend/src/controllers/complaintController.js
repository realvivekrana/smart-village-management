const Complaint = require("../models/Complaint");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const cloudinaryService = require("../services/cloudinaryService");
const notificationService = require("../services/notificationService");
const emailService = require("../services/emailService");
const User = require("../models/User");
const env = require("../config/env");

/*
|--------------------------------------------------------------------------
| GET /api/v1/complaints  (admin: all, citizen: own)
|--------------------------------------------------------------------------
*/
const getComplaints = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, category, priority, search } = req.query;

    const filter = {};
    const isAdmin = ["admin", "super_admin"].includes(req.user.role);
    if (!isAdmin) filter.submittedBy = req.user._id;

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (search) filter.$text = { $search: search };

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate("submittedBy", "name email phone")
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Complaint.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { complaints },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/complaints/:id
|--------------------------------------------------------------------------
*/
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("submittedBy", "name email phone")
      .populate("assignedTo", "name email")
      .populate("timeline.updatedBy", "name");

    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    const isAdmin = ["admin", "super_admin"].includes(req.user.role);
    if (!isAdmin && String(complaint.submittedBy._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.status(200).json({ success: true, data: { complaint } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/v1/complaints  (citizen)
|--------------------------------------------------------------------------
*/
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority, location } = req.body;

    let images = [];
    if (req.files && req.files.length > 0 && env.cloudinary.enabled) {
      images = await cloudinaryService.uploadMultipleImages(req.files, "smart-village/complaints");
    }

    const complaint = await Complaint.create({
      title, description, category, priority, location,
      images,
      submittedBy: req.user._id,
      timeline: [{ status: "pending", note: "Complaint submitted", updatedBy: req.user._id }],
    });

    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      data: { complaint },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PATCH /api/v1/complaints/:id/status  (admin)
|--------------------------------------------------------------------------
*/
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, note, adminNote } = req.body;

    const complaint = await Complaint.findById(req.params.id).populate("submittedBy", "name email");
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    complaint.status = status;
    if (adminNote) complaint.adminNote = adminNote;

    // Add timeline entry
    complaint.timeline.push({ status, note: note || adminNote, updatedBy: req.user._id });

    await complaint.save();

    // Notify and email the submitter (non-blocking)
    const submitter = complaint.submittedBy;
    notificationService.notifyComplaintUpdate(submitter._id, complaint).catch(() => {});
    emailService.sendComplaintStatusEmail(submitter, complaint).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Complaint status updated",
      data: { complaint },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PATCH /api/v1/complaints/:id/assign  (admin)
|--------------------------------------------------------------------------
*/
const assignComplaint = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const user = await User.findById(assignedTo);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedTo, status: "in_progress" },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    return res.status(200).json({ success: true, message: "Complaint assigned", data: { complaint } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/v1/complaints/:id  (citizen: own pending, admin: any)
|--------------------------------------------------------------------------
*/
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    const isAdmin = ["admin", "super_admin"].includes(req.user.role);
    const isOwner = String(complaint.submittedBy) === String(req.user._id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (!isAdmin && complaint.status !== "pending") {
      return res.status(400).json({ success: false, message: "Cannot delete a complaint that is already being processed" });
    }

    // Delete images from Cloudinary
    if (complaint.images.length > 0) {
      const publicIds = complaint.images.map((img) => img.publicId).filter(Boolean);
      await cloudinaryService.deleteMultipleImages(publicIds);
    }

    await complaint.deleteOne();
    return res.status(200).json({ success: true, message: "Complaint deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaintStatus,
  assignComplaint,
  deleteComplaint,
};
