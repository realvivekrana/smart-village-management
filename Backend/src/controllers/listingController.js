const Listing = require("../models/Listing");
const env = require("../config/env");
const cloudinaryService = require("../services/cloudinaryService");
const { createNotification } = require("../services/notificationService");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const { REQUIRE_APPROVAL, submissionStatus } = require("../utils/publicVisibility");

const TYPES = ["buy-sell", "lost-found", "equipment-rental"];
const TYPE_LABEL = {
  "buy-sell": "Khareed-Bikri",
  "lost-found": "Khoya-Paya",
  "equipment-rental": "Kiraya",
};

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Sirf ye fields user badal sakta hai (status/createdBy jaise nahi)
const pickFields = (body) => {
  const out = {};
  [
    "type",
    "title",
    "description",
    "itemStatus",
    "price",
    "priceUnit",
    "location",
    "contactName",
    "contactPhone",
  ].forEach((k) => {
    if (body[k] !== undefined) out[k] = body[k];
  });

  if (out.price === "" || out.price === null) out.price = null;
  else if (out.price !== undefined) out.price = Number(out.price);

  return out;
};

// type ke hisaab se itemStatus / priceUnit theek karo
const normalizeByType = (data) => {
  if (data.type === "lost-found") {
    if (!["lost", "found"].includes(data.itemStatus)) data.itemStatus = "lost";
    data.price = null;
    data.priceUnit = "fixed";
  } else {
    data.itemStatus = "available";
    if (data.type === "buy-sell") data.priceUnit = "fixed";
    if (data.type === "equipment-rental" && (!data.priceUnit || data.priceUnit === "fixed")) {
      data.priceUnit = "day";
    }
  }
  return data;
};

/*
| GET /api/v1/listings   (public — sirf approved)
*/
const getListings = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 12 });
    const { type, search, closed } = req.query;

    const filter = { status: "approved", isActive: true };
    if (TYPES.includes(type)) filter.type = type;
    if (closed !== "true") filter.isClosed = false;
    if (search && search.trim()) {
      const rx = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [{ title: rx }, { description: rx }, { location: rx }];
    }

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate("createdBy", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Listing.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { listings },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/*
| GET /api/v1/listings/my   (logged-in — apni sabhi, har status)
*/
const getMyListings = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 20 });
    const filter = { createdBy: req.user._id, isActive: true };

    const [listings, total] = await Promise.all([
      Listing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Listing.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { listings },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/*
| GET /api/v1/listings/admin/all   (admin)
*/
const getAllListingsAdmin = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 20 });
    const { status, type, search } = req.query;

    const filter = { isActive: true };
    if (["pending", "approved", "rejected"].includes(status)) filter.status = status;
    if (TYPES.includes(type)) filter.type = type;
    if (search && search.trim()) {
      const rx = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [{ title: rx }, { description: rx }];
    }

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate("createdBy", "name avatar phone email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Listing.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { listings },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/*
| POST /api/v1/listings   (logged-in)
*/
const createListing = async (req, res, next) => {
  try {
    const data = normalizeByType(pickFields(req.body));

    if (!TYPES.includes(data.type)) {
      return res.status(400).json({ success: false, message: "Invalid listing type" });
    }

    let images = [];
    if (req.files && req.files.length > 0 && env.cloudinary.enabled) {
      images = await cloudinaryService.uploadMultipleImages(req.files, "smart-village/bazaar");
      images = images.map(({ url, publicId }) => ({ url, publicId }));
    }

    // Ab post seedhe sabko dikhti hai (admin baad me hata sakta hai)
    const status = submissionStatus(req.user);
    const published = status === "approved";

    const listing = await Listing.create({
      ...data,
      contactName: data.contactName || req.user.name,
      images,
      createdBy: req.user._id,
      status,
      reviewedBy: published ? req.user._id : null,
      reviewedAt: published ? new Date() : null,
    });

    return res.status(201).json({
      success: true,
      message: published
        ? "Listing published. It is now visible to everyone."
        : "Listing submitted. It will be visible to everyone after admin approval.",
      data: { listing },
    });
  } catch (error) {
    next(error);
  }
};

/*
| PUT /api/v1/listings/:id   (owner / admin)
| Edit turant live hota hai (REQUIRE_ADMIN_APPROVAL=true ho to dobara approval).
*/
const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing || !listing.isActive) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const isAdmin = req.user.role === "admin";
    if (!isAdmin && String(listing.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const data = pickFields(req.body);
    // type badalna allowed nahi
    delete data.type;
    const merged = normalizeByType({ ...listing.toObject(), ...data, type: listing.type });
    ["title", "description", "itemStatus", "price", "priceUnit", "location", "contactName", "contactPhone"].forEach(
      (k) => {
        listing[k] = merged[k];
      }
    );

    // Sirf "approval required" mode me edit ke baad dobara approval chahiye.
    // Warna edit turant live; admin ne jo reject kiya hai wo edit se wapas publish nahi hota.
    const needsReview = !isAdmin && REQUIRE_APPROVAL;
    if (needsReview) {
      listing.status = "pending";
      listing.rejectionReason = "";
    }

    await listing.save();

    return res.status(200).json({
      success: true,
      message: needsReview ? "Listing updated. Dobara admin approval ke baad dikhegi." : "Listing updated",
      data: { listing },
    });
  } catch (error) {
    next(error);
  }
};

/*
| PATCH /api/v1/listings/:id/close   (owner / admin)
| Sold / Mil gaya / Kiraye pe chala gaya — approval nahi chahiye.
*/
const toggleClosed = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing || !listing.isActive) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const isAdmin = req.user.role === "admin";
    if (!isAdmin && String(listing.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    listing.isClosed = !listing.isClosed;
    await listing.save();

    return res.status(200).json({ success: true, data: { listing } });
  } catch (error) {
    next(error);
  }
};

/*
| DELETE /api/v1/listings/:id   (owner / admin)
*/
const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing || !listing.isActive) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const isAdmin = req.user.role === "admin";
    if (!isAdmin && String(listing.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (env.cloudinary.enabled && listing.images?.length) {
      const ids = listing.images.map((i) => i.publicId).filter(Boolean);
      if (ids.length) await cloudinaryService.deleteMultipleImages(ids);
    }

    listing.isActive = false;
    await listing.save();

    return res.status(200).json({ success: true, message: "Listing deleted" });
  } catch (error) {
    next(error);
  }
};

/*
| PATCH /api/v1/listings/:id/review   (admin)
| body: { status: "approved" | "rejected", rejectionReason }
*/
const reviewListing = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be approved or rejected" });
    }
    if (status === "rejected" && !(rejectionReason || "").trim()) {
      return res.status(400).json({ success: false, message: "Rejection reason is required" });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing || !listing.isActive) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    listing.status = status;
    listing.rejectionReason = status === "rejected" ? rejectionReason.trim() : "";
    listing.reviewedBy = req.user._id;
    listing.reviewedAt = new Date();
    await listing.save();

    await createNotification({
      recipient: listing.createdBy,
      title: status === "approved" ? "Your post was approved" : "Your post was not approved",
      message:
        status === "approved"
          ? `Your ${TYPE_LABEL[listing.type]} post "${listing.title}" is now visible to everyone.`
          : `Your ${TYPE_LABEL[listing.type]} post "${listing.title}" was rejected. Reason: ${listing.rejectionReason}`.slice(0, 500),
      type: "general",
      link: `/citizen/bazaar?highlight=${listing._id}`,
      refModel: "Listing",
      refId: listing._id,
    });

    return res.status(200).json({
      success: true,
      message: `Listing ${status}`,
      data: { listing },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getListings,
  getMyListings,
  getAllListingsAdmin,
  createListing,
  updateListing,
  toggleClosed,
  deleteListing,
  reviewListing,
};