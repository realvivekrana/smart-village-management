const Business = require("../models/Business");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const cloudinaryService = require("../services/cloudinaryService");
const notificationService = require("../services/notificationService");
const emailService = require("../services/emailService");
const env = require("../config/env");

/*
|--------------------------------------------------------------------------
| GET /api/v1/businesses  (public — only approved)
|--------------------------------------------------------------------------
*/
const getBusinesses = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { category, search } = req.query;

    const filter = { status: "approved", isActive: true };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const [businesses, total] = await Promise.all([
      Business.find(filter)
        .populate("owner", "name")
        .sort({ isFeatured: -1, "rating.average": -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Business.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { businesses },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/businesses/:id  (public)
|--------------------------------------------------------------------------
*/
const getBusinessById = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate("owner", "name email phone")
      .lean();

    if (!business || !business.isActive) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    // Non-approved businesses visible only to owner / admin
    const isAdmin = req.user && ["admin", "super_admin"].includes(req.user.role);
    const isOwner = req.user && String(business.owner._id) === String(req.user._id);
    if (business.status !== "approved" && !isAdmin && !isOwner) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    return res.status(200).json({ success: true, data: { business } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/businesses/my  (business_owner)
|--------------------------------------------------------------------------
*/
const getMyBusiness = async (req, res, next) => {
  try {
    const businesses = await Business.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, data: { businesses } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/businesses/admin/all  (admin)
|--------------------------------------------------------------------------
*/
const getAllBusinessesAdmin = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, category, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const [businesses, total] = await Promise.all([
      Business.find(filter)
        .populate("owner", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Business.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { businesses },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/v1/businesses  (business_owner)
|--------------------------------------------------------------------------
*/
const createBusiness = async (req, res, next) => {
  try {
    let images = [];
    if (req.files && req.files.length > 0 && env.cloudinary.enabled) {
      images = await cloudinaryService.uploadMultipleImages(req.files, "smart-village/businesses");
      images[0].isMain = true;
    }

    const business = await Business.create({
      ...req.body,
      images,
      owner: req.user._id,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Business registered. Pending admin approval.",
      data: { business },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/v1/businesses/:id  (owner / admin)
|--------------------------------------------------------------------------
*/
const updateBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ success: false, message: "Business not found" });

    const isAdmin = ["admin", "super_admin"].includes(req.user.role);
    if (!isAdmin && String(business.owner) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // If owner updates, reset to pending
    const updates = { ...req.body };
    if (!isAdmin) updates.status = "pending";

    Object.assign(business, updates);

    // Newly uploaded photos (if any) are appended to the existing gallery
    if (req.files && req.files.length > 0 && env.cloudinary.enabled) {
      const uploaded = await cloudinaryService.uploadMultipleImages(req.files, "smart-village/businesses");
      const hasMainImage = business.images.some((img) => img.isMain);
      if (!hasMainImage && uploaded.length > 0) uploaded[0].isMain = true;
      business.images.push(...uploaded);
    }

    await business.save();

    return res.status(200).json({ success: true, message: "Business updated", data: { business } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PATCH /api/v1/businesses/:id/review  (admin)
|--------------------------------------------------------------------------
*/
const reviewBusiness = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    const business = await Business.findById(req.params.id).populate("owner", "name email");
    if (!business) return res.status(404).json({ success: false, message: "Business not found" });

    business.status = status;
    business.approvedBy = req.user._id;
    if (rejectionReason) business.rejectionReason = rejectionReason;
    await business.save();

    // Notify and email owner (non-blocking)
    notificationService.notifyBusinessStatus(business.owner._id, business).catch(() => {});
    emailService.sendBusinessStatusEmail(business.owner, business).catch(() => {});

    return res.status(200).json({
      success: true,
      message: `Business ${status}`,
      data: { business },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/v1/businesses/:id  (owner / admin)
|--------------------------------------------------------------------------
*/
const deleteBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ success: false, message: "Business not found" });

    const isAdmin = ["admin", "super_admin"].includes(req.user.role);
    if (!isAdmin && String(business.owner) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    business.isActive = false;
    await business.save();

    return res.status(200).json({ success: true, message: "Business deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBusinesses,
  getBusinessById,
  getMyBusiness,
  getAllBusinessesAdmin,
  createBusiness,
  updateBusiness,
  reviewBusiness,
  deleteBusiness,
};