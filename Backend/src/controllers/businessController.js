const Business = require("../models/Business");
const Review = require("../models/Review");
const Job = require("../models/Job");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const cloudinaryService = require("../services/cloudinaryService");
const notificationService = require("../services/notificationService");
const emailService = require("../services/emailService");
const env = require("../config/env");
const { REQUIRE_APPROVAL, submissionStatus } = require("../utils/publicVisibility");

// Owner sirf ye fields badal sakta hai (status / owner / rating jaise fields nahi)
const OWNER_FIELDS = [
  "name", "description", "category", "phone", "alternatePhone",
  "email", "website", "address", "openingHours", "tags",
];
const ADMIN_FIELDS = [...OWNER_FIELDS, "isFeatured", "isActive"];
const pickFields = (body = {}, allowed) => {
  const out = allowed.reduce((acc, key) => {
    if (body[key] !== undefined) acc[key] = body[key];
    return acc;
  }, {});

  // "example.com" likha ho to link relative ban ke toot jaata hai
  if (typeof out.website === "string" && out.website.trim() && !/^https?:\/\//i.test(out.website.trim())) {
    out.website = `https://${out.website.trim()}`;
  }
  return out;
};

const toIdList = (value) => (Array.isArray(value) ? value : value ? [value] : []).map(String);

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
        .populate("owner", "name avatar")
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
      .populate("owner", "name avatar email phone")
      .lean();

    if (!business || !business.isActive) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    // Non-approved businesses visible only to owner / admin
    const isAdmin = req.user && req.user.role === "admin";
    const isOwner = req.user && business.owner && String(business.owner._id) === String(req.user._id);
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
| GET /api/v1/businesses/my  (citizen)
|--------------------------------------------------------------------------
*/
const getMyBusiness = async (req, res, next) => {
  try {
    const businesses = await Business.find({ owner: req.user._id, isActive: true })
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
        .populate("owner", "name avatar email phone")
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
| POST /api/v1/businesses  (citizen)
|--------------------------------------------------------------------------
*/
const createBusiness = async (req, res, next) => {
  try {
    let images = [];
    const hasFiles = req.files && req.files.length > 0;
    if (hasFiles && env.cloudinary.enabled) {
      images = await cloudinaryService.uploadMultipleImages(req.files, "smart-village/businesses");
      images[0].isMain = true;
    }

    const status = submissionStatus(req.user);
    const published = status === "approved";

    const business = await Business.create({
      ...pickFields(req.body, OWNER_FIELDS),
      images,
      owner: req.user._id,
      status,
      approvedBy: published ? req.user._id : undefined,
    });

    return res.status(201).json({
      success: true,
      message: published
        ? "Business registered. It is now visible to everyone."
        : "Business registered. Pending admin approval.",
      ...(hasFiles && !env.cloudinary.enabled && {
        warning: "Photos were not saved: Cloudinary is not configured on the server.",
      }),
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
    const isAdmin = req.user.role === "admin";
    if (!business || (!business.isActive && !isAdmin)) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    if (!isAdmin && String(business.owner) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Owner ke edit turant live. Admin ne reject / suspend kiya ho to wo status nahi badalta.
    // "Approval required" mode me edit ke baad dobara pending.
    Object.assign(business, pickFields(req.body, isAdmin ? ADMIN_FIELDS : OWNER_FIELDS));
    if (!isAdmin && REQUIRE_APPROVAL) business.status = "pending";

    // Owner ne jo purani photos hataai hain (removeImages = publicId / _id list)
    const removeIds = toIdList(req.body.removeImages);
    if (removeIds.length > 0) {
      const removed = business.images.filter(
        (img) => removeIds.includes(String(img._id)) || removeIds.includes(String(img.publicId))
      );
      business.images = business.images.filter((img) => !removed.includes(img));
      cloudinaryService.deleteMultipleImages(removed.map((img) => img.publicId)).catch(() => {});
      if (business.images.length > 0 && !business.images.some((img) => img.isMain)) {
        business.images[0].isMain = true;
      }
    }

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

    const business = await Business.findById(req.params.id).populate("owner", "name avatar email");
    if (!business) return res.status(404).json({ success: false, message: "Business not found" });

    business.status = status;
    if (status === "approved") business.rejectionReason = undefined;
    business.approvedBy = req.user._id;
    if (rejectionReason) business.rejectionReason = rejectionReason;
    await business.save();

    // Notify and email owner (non-blocking)
    if (business.owner) {
      notificationService.notifyBusinessStatus(business.owner._id, business).catch(() => {});
      emailService.sendBusinessStatusEmail(business.owner, business).catch(() => {});
    }

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

    const isAdmin = req.user.role === "admin";
    if (!isAdmin && String(business.owner) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Permanent delete: DB se hamesha ke liye hata do (pehle sirf isActive=false hota tha,
    // isliye admin list reload par business wapas aa jaati thi)
    const publicIds = (business.images || []).map((img) => img.publicId).filter(Boolean);
    await Promise.all([
      Review.deleteMany({ business: business._id }),
      Job.updateMany({ business: business._id }, { $unset: { business: "" } }),
      business.deleteOne(),
    ]);
    cloudinaryService.deleteMultipleImages(publicIds).catch(() => {});

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