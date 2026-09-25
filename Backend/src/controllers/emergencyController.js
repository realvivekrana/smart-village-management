const EmergencyContact = require("../models/EmergencyContact");
const { getPagination, getPaginationMeta } = require("../utils/pagination");

/*
|--------------------------------------------------------------------------
| GET /api/v1/emergency  (public)
|--------------------------------------------------------------------------
*/
const getEmergencyContacts = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;

    const contacts = await EmergencyContact.find(filter)
      .sort({ order: 1, category: 1 })
      .lean();

    return res.status(200).json({ success: true, data: { contacts } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/v1/emergency  (admin)
|--------------------------------------------------------------------------
*/
const createEmergencyContact = async (req, res, next) => {
  try {
    const contact = await EmergencyContact.create({
      ...req.body,
      createdBy: req.user._id,
    });
    return res.status(201).json({ success: true, message: "Emergency contact created", data: { contact } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/v1/emergency/:id  (admin)
|--------------------------------------------------------------------------
*/
const updateEmergencyContact = async (req, res, next) => {
  try {
    const contact = await EmergencyContact.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!contact) return res.status(404).json({ success: false, message: "Contact not found" });
    return res.status(200).json({ success: true, message: "Contact updated", data: { contact } });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/v1/emergency/:id  (admin)
|--------------------------------------------------------------------------
*/
const deleteEmergencyContact = async (req, res, next) => {
  try {
    const contact = await EmergencyContact.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!contact) return res.status(404).json({ success: false, message: "Contact not found" });
    return res.status(200).json({ success: true, message: "Emergency contact deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
};
