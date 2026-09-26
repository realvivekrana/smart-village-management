const Job = require("../models/Job");
const User = require("../models/User");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const notificationService = require("../services/notificationService");

/*
|--------------------------------------------------------------------------
| GET /api/v1/jobs  (public)
|--------------------------------------------------------------------------
*/
const getJobs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { category, type, search } = req.query;

    const filter = { isActive: true, applyBy: { $gte: new Date() } };
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (search) filter.$text = { $search: search };

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate("postedBy", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { jobs },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/jobs/:id  (public)
|--------------------------------------------------------------------------
*/
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("postedBy", "name email")
      .populate("business", "name category")
      .lean();

    if (!job || !job.isActive) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    return res.status(200).json({ success: true, data: { job } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/jobs/my  (citizen)
|--------------------------------------------------------------------------
*/
const getMyJobs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const filter = { postedBy: req.user._id };
    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Job.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { jobs },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/v1/jobs  (citizen / admin)
|--------------------------------------------------------------------------
*/
const createJob = async (req, res, next) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user._id });

    // Notify all active citizens (non-blocking)
    User.find({ isActive: true, role: "citizen" })
      .select("_id")
      .lean()
      .then(async (users) => {
        const ids = users.map((u) => u._id);
        await notificationService.notifyNewJob(ids, job);
      })
      .catch(() => {});

    return res.status(201).json({ success: true, message: "Job posted", data: { job } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/v1/jobs/:id  (owner / admin)
|--------------------------------------------------------------------------
*/
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const isAdmin = req.user.role === "admin";
    if (!isAdmin && String(job.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    Object.assign(job, req.body);
    await job.save();

    return res.status(200).json({ success: true, message: "Job updated", data: { job } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/v1/jobs/:id  (owner / admin)
|--------------------------------------------------------------------------
*/
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const isAdmin = req.user.role === "admin";
    if (!isAdmin && String(job.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    job.isActive = false;
    await job.save();

    return res.status(200).json({ success: true, message: "Job deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getJobs, getJobById, getMyJobs, createJob, updateJob, deleteJob };