const Service = require("../models/Service");
const { getPagination, getPaginationMeta } = require("../utils/pagination");

/*
|--------------------------------------------------------------------------
| GET /api/v1/services  (public)
|--------------------------------------------------------------------------
*/
const getServices = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { category, search } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const [services, total] = await Promise.all([
      Service.find(filter)
        .sort({ isFeatured: -1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Service.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { services },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/services/:id  (public)
|--------------------------------------------------------------------------
*/
const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).lean();
    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    return res.status(200).json({ success: true, data: { service } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/v1/services  (admin)
|--------------------------------------------------------------------------
*/
const createService = async (req, res, next) => {
  try {
    const service = await Service.create({ ...req.body, createdBy: req.user._id });
    return res.status(201).json({ success: true, message: "Service created", data: { service } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/v1/services/:id  (admin)
|--------------------------------------------------------------------------
*/
const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });
    return res.status(200).json({ success: true, message: "Service updated", data: { service } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/v1/services/:id  (admin)
|--------------------------------------------------------------------------
*/
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });
    return res.status(200).json({ success: true, message: "Service deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getServices, getServiceById, createService, updateService, deleteService };
