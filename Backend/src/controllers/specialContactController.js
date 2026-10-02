const mongoose = require("mongoose");
const escapeRegex = require("../utils/escapeRegex");
const SpecialContact = require("../models/SpecialContact");

const FIELDS = [
  "name", "kind", "isPending", "role", "group", "wardNumber", "area", "phone", "alternatePhone",
  "whatsapp", "email", "officeAddress", "availability", "about", "photo",
  "isActive", "isFeatured", "displayOrder",
];

const PHONE_RE = /^[0-9+\-()\s]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHOTO_RE = /^https?:\/\//i;

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

const serverError = (res, label, error) => {
  console.error(label, error);
  return res.status(500).json({
    success: false,
    message: label,
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
};

/** Pick allowed fields, trim strings, and validate. Returns { data, error } */
const buildPayload = (body, { partial = false } = {}) => {
  const data = {};
  FIELDS.forEach((key) => {
    if (body[key] === undefined) return;
    data[key] = typeof body[key] === "string" ? body[key].trim() : body[key];
  });

  ["isActive", "isFeatured", "isPending"].forEach((key) => {
    if (data[key] !== undefined) data[key] = Boolean(data[key]);
  });

  if (data.kind !== undefined && !["person", "place"].includes(data.kind)) {
    return { error: "Type must be person or place" };
  }

  // A "verification pending" entry may have no name yet
  if (!partial) {
    if (!data.name && !data.isPending) return { error: "Name is required" };
    if (!data.role) return { error: "Role / branch heading is required" };
  } else {
    if (data.name === "" && data.isPending !== true) return { error: "Name cannot be empty" };
    if (data.role === "") return { error: "Role / branch heading cannot be empty" };
  }

  if (data.group !== undefined && !data.group) data.group = "Other";

  for (const key of ["phone", "alternatePhone", "whatsapp"]) {
    if (data[key] && !PHONE_RE.test(data[key])) {
      return { error: `Invalid ${key === "alternatePhone" ? "alternate phone" : key} number` };
    }
  }
  if (data.email && !EMAIL_RE.test(data.email)) return { error: "Invalid email address" };
  if (data.photo && !PHOTO_RE.test(data.photo)) {
    return { error: "Photo must be a link starting with http:// or https://" };
  }
  if (data.displayOrder !== undefined) {
    data.displayOrder = Number(data.displayOrder) || 0;
  }
  return { data };
};

const buildFilter = (req, { adminView }) => {
  const { group, search, ward, featured, active } = req.query;
  const query = {};

  if (adminView) {
    if (active !== undefined && active !== "") query.isActive = active === "true";
  } else {
    query.isActive = true;
  }

  if (group && group !== "all") query.group = group;
  if (ward) query.wardNumber = String(ward).trim();
  if (featured !== undefined && featured !== "") query.isFeatured = featured === "true";

  if (search && search.trim()) {
    const rx = { $regex: escapeRegex(search.trim()), $options: "i" };
    query.$or = [
      { name: rx }, { role: rx }, { group: rx }, { area: rx },
      { wardNumber: rx }, { phone: rx },
    ];
  }
  return query;
};

const list = (adminView) => async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 200, 1), 500);

    const query = buildFilter(req, { adminView });

    const [contacts, total] = await Promise.all([
      SpecialContact.find(query)
        .sort({ displayOrder: 1, name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      SpecialContact.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Special contacts fetched successfully",
      data: contacts,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(res, "Failed to fetch special contacts", error);
  }
};

/** @route GET /api/v1/special-contacts  (public, active only) */
const getSpecialContacts = list(false);

/** @route GET /api/v1/special-contacts/admin/all  (admin, includes inactive) */
const getAllSpecialContacts = list(true);

/** @route GET /api/v1/special-contacts/admin/meta  (admin) — groups & roles already in use */
const getSpecialContactMeta = async (req, res) => {
  try {
    const [groups, roles] = await Promise.all([
      SpecialContact.distinct("group"),
      SpecialContact.distinct("role"),
    ]);
    return res.status(200).json({
      success: true,
      data: { groups: groups.filter(Boolean).sort(), roles: roles.filter(Boolean).sort() },
    });
  } catch (error) {
    return serverError(res, "Failed to fetch contact options", error);
  }
};

/** @route POST /api/v1/special-contacts  (admin) */
const createSpecialContact = async (req, res) => {
  try {
    const { data, error } = buildPayload(req.body);
    if (error) return fail(res, 400, error);

    const contact = await SpecialContact.create(data);
    return res.status(201).json({
      success: true,
      message: "Contact added successfully",
      data: contact,
    });
  } catch (error) {
    return serverError(res, "Failed to add contact", error);
  }
};

/** @route PUT /api/v1/special-contacts/:id  (admin) */
const updateSpecialContact = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 400, "Invalid contact id");

    const { data, error } = buildPayload(req.body, { partial: true });
    if (error) return fail(res, 400, error);

    const contact = await SpecialContact.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!contact) return fail(res, 404, "Contact not found");

    return res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: contact,
    });
  } catch (error) {
    return serverError(res, "Failed to update contact", error);
  }
};

/** @route PATCH /api/v1/special-contacts/:id/status  (admin) — show / hide */
const updateSpecialContactStatus = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 400, "Invalid contact id");
    if (typeof req.body.isActive !== "boolean") return fail(res, 400, "isActive must be true or false");

    const contact = await SpecialContact.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true }
    );
    if (!contact) return fail(res, 404, "Contact not found");

    return res.status(200).json({
      success: true,
      message: `Contact ${req.body.isActive ? "shown" : "hidden"} successfully`,
      data: contact,
    });
  } catch (error) {
    return serverError(res, "Failed to update contact status", error);
  }
};

/** @route DELETE /api/v1/special-contacts/:id  (admin) */
const deleteSpecialContact = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 400, "Invalid contact id");

    const contact = await SpecialContact.findByIdAndDelete(req.params.id);
    if (!contact) return fail(res, 404, "Contact not found");

    return res.status(200).json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    return serverError(res, "Failed to delete contact", error);
  }
};

module.exports = {
  getSpecialContacts,
  getAllSpecialContacts,
  getSpecialContactMeta,
  createSpecialContact,
  updateSpecialContact,
  updateSpecialContactStatus,
  deleteSpecialContact,
};