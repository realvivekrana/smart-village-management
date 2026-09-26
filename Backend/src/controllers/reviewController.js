const Review = require("../models/Review");
const Business = require("../models/Business");
const { getPagination, getPaginationMeta } = require("../utils/pagination");

/*
|--------------------------------------------------------------------------
| Recalculate business rating
|--------------------------------------------------------------------------
*/
const recalculateBusinessRating = async (businessId) => {
  const result = await Review.aggregate([
    { $match: { business: businessId, isActive: true } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const avg = result.length > 0 ? Math.round(result[0].avg * 10) / 10 : 0;
  const count = result.length > 0 ? result[0].count : 0;

  await Business.findByIdAndUpdate(businessId, {
    "rating.average": avg,
    "rating.count": count,
  });
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/businesses/:businessId/reviews  (public)
|--------------------------------------------------------------------------
*/
const getBusinessReviews = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const filter = { business: req.params.businessId, isActive: true };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("reviewer", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { reviews },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/v1/businesses/:businessId/reviews  (citizen / any logged-in user)
|--------------------------------------------------------------------------
*/
const createReview = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.businessId);
    if (!business || !business.isActive || business.status !== "approved") {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    // Owner cannot review their own business
    if (String(business.owner) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: "You cannot review your own business" });
    }

    const existing = await Review.findOne({ business: business._id, reviewer: req.user._id });
    if (existing) {
      return res.status(409).json({ success: false, message: "You have already reviewed this business" });
    }

    const review = await Review.create({
      business: business._id,
      reviewer: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    await recalculateBusinessRating(business._id);
    await review.populate("reviewer", "name avatar");

    return res.status(201).json({ success: true, message: "Review submitted", data: { review } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "You have already reviewed this business" });
    }
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/v1/reviews/:id  (reviewer)
|--------------------------------------------------------------------------
*/
const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review || !review.isActive) return res.status(404).json({ success: false, message: "Review not found" });

    if (String(review.reviewer) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (req.body.rating) review.rating = req.body.rating;
    if (req.body.comment !== undefined) review.comment = req.body.comment;
    await review.save();

    await recalculateBusinessRating(review.business);

    return res.status(200).json({ success: true, message: "Review updated", data: { review } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/v1/reviews/:id  (reviewer / admin)
|--------------------------------------------------------------------------
*/
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    const isAdmin = req.user.role === "admin";
    if (!isAdmin && String(review.reviewer) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    review.isActive = false;
    await review.save();
    await recalculateBusinessRating(review.business);

    return res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/v1/reviews/:id/respond  (business owner)
|--------------------------------------------------------------------------
*/
const respondToReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id).populate("business");
    if (!review || !review.isActive) return res.status(404).json({ success: false, message: "Review not found" });

    if (String(review.business.owner) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    review.ownerResponse = { content: req.body.content, respondedAt: new Date() };
    await review.save();

    return res.status(200).json({ success: true, message: "Response added", data: { review } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBusinessReviews,
  createReview,
  updateReview,
  deleteReview,
  respondToReview,
};