const JobApplication = require("../models/JobApplication");
const Job = require("../models/Job");
const User = require("../models/User");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const cloudinaryService = require("../services/cloudinaryService");
const notificationService = require("../services/notificationService");
const emailService = require("../services/emailService");
const env = require("../config/env");

/*
|--------------------------------------------------------------------------
| POST /api/v1/jobs/:jobId/apply  (citizen)
|--------------------------------------------------------------------------
*/
const applyForJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job || !job.isActive) {
      return res.status(404).json({ success: false, message: "Job not found or no longer active" });
    }
    if (new Date() > job.applyBy) {
      return res.status(400).json({ success: false, message: "Application deadline has passed" });
    }

    // Check duplicate
    const existing = await JobApplication.findOne({ job: job._id, applicant: req.user._id });
    if (existing) {
      return res.status(409).json({ success: false, message: "You have already applied for this job" });
    }

    let resume = null;
    if (req.file && env.cloudinary.enabled) {
      resume = await cloudinaryService.uploadDocument(req.file.buffer, "smart-village/resumes");
      resume.fileName = req.file.originalname;
    }

    const application = await JobApplication.create({
      job: job._id,
      applicant: req.user._id,
      coverLetter: req.body.coverLetter,
      resume,
    });

    // Increment application count
    await Job.findByIdAndUpdate(job._id, { $inc: { applicationCount: 1 } });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: { application },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "You have already applied for this job" });
    }
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/jobs/:jobId/applications  (job owner / admin)
|--------------------------------------------------------------------------
*/
const getJobApplications = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const isAdmin = req.user.role === "admin";
    if (!isAdmin && String(job.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const filter = { job: job._id };
    if (req.query.status) filter.status = req.query.status;

    const [applications, total] = await Promise.all([
      JobApplication.find(filter)
        .populate("applicant", "name email phone address")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      JobApplication.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { applications },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/applications/my  (citizen)
|--------------------------------------------------------------------------
*/
const getMyApplications = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const [applications, total] = await Promise.all([
      JobApplication.find({ applicant: req.user._id })
        .populate("job", "title company location applyBy isActive")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      JobApplication.countDocuments({ applicant: req.user._id }),
    ]);

    return res.status(200).json({
      success: true,
      data: { applications },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PATCH /api/v1/applications/:id/status  (job owner / admin)
|--------------------------------------------------------------------------
*/
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const validStatuses = ["pending", "reviewed", "shortlisted", "rejected", "hired"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const application = await JobApplication.findById(req.params.id).populate("job");
    if (!application) return res.status(404).json({ success: false, message: "Application not found" });

    const isAdmin = req.user.role === "admin";
    if (!isAdmin && String(application.job.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    application.status = status;
    if (adminNote) application.adminNote = adminNote;
    await application.save();

    // Notify applicant (non-blocking)
    const applicant = await User.findById(application.applicant).select("name email");
    if (applicant) {
      notificationService.notifyJobApplicationUpdate(applicant._id, application.job, status).catch(() => {});
      emailService.sendJobApplicationStatusEmail(applicant, application.job, application).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: "Application status updated",
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/v1/applications/:id  (citizen: own pending)
|--------------------------------------------------------------------------
*/
const withdrawApplication = async (req, res, next) => {
  try {
    const application = await JobApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: "Application not found" });

    if (String(application.applicant) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (application.status !== "pending") {
      return res.status(400).json({ success: false, message: "Cannot withdraw a processed application" });
    }

    await Job.findByIdAndUpdate(application.job, { $inc: { applicationCount: -1 } });
    await application.deleteOne();

    return res.status(200).json({ success: true, message: "Application withdrawn" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus,
  withdrawApplication,
};