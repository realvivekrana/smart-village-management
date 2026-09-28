const CertificateRequest = require("../models/CertificateRequest");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const cloudinaryService = require("../services/cloudinaryService");
const notificationService = require("../services/notificationService");
const env = require("../config/env");

const isAdminUser = (req) => req.user.role === "admin";
const isOwner = (doc, req) => String(doc.submittedBy?._id || doc.submittedBy) === String(req.user._id);

// GET /api/v1/certificates (admin: all, citizen: own)
const getCertificateRequests = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, type, search } = req.query;

    const filter = {};
    if (!isAdminUser(req)) filter.submittedBy = req.user._id;
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      const rx = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ applicantName: rx }, { requestNumber: rx }];
    }

    const [certificates, total] = await Promise.all([
      CertificateRequest.find(filter)
        .populate("submittedBy", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CertificateRequest.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: { certificates },
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/certificates/:id
const getCertificateRequestById = async (req, res, next) => {
  try {
    const certificate = await CertificateRequest.findById(req.params.id)
      .populate("submittedBy", "name email phone")
      .populate("timeline.updatedBy", "name");

    if (!certificate) return res.status(404).json({ success: false, message: "Certificate request not found" });
    if (!isAdminUser(req) && !isOwner(certificate, req)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.status(200).json({ success: true, data: { certificate } });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/certificates (citizen)
const createCertificateRequest = async (req, res, next) => {
  try {
    const { type, applicantName, fatherName, address, purpose } = req.body;

    let documents = [];
    if (req.files && req.files.length > 0 && env.cloudinary.enabled) {
      documents = await cloudinaryService.uploadMultipleImages(req.files, "smart-village/certificates");
    }

    const certificate = await CertificateRequest.create({
      type, applicantName, fatherName, address, purpose,
      documents,
      submittedBy: req.user._id,
      timeline: [{ status: "pending", note: "Request submitted", updatedBy: req.user._id }],
    });

    return res.status(201).json({
      success: true,
      message: "Certificate request submitted successfully",
      data: { certificate },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/certificates/:id/status (admin)
const updateCertificateStatus = async (req, res, next) => {
  try {
    const { status, note, adminNote } = req.body;

    const certificate = await CertificateRequest.findById(req.params.id);
    if (!certificate) return res.status(404).json({ success: false, message: "Certificate request not found" });

    if (certificate.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Cancelled requests cannot be updated" });
    }

    certificate.status = status;
    if (adminNote) certificate.adminNote = adminNote;
    certificate.timeline.push({ status, note: note || adminNote, updatedBy: req.user._id });
    await certificate.save();

    notificationService.notifyCertificateUpdate(certificate.submittedBy, certificate).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Certificate request updated",
      data: { certificate },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/certificates/:id/cancel (citizen: own, only while pending)
const cancelCertificateRequest = async (req, res, next) => {
  try {
    const certificate = await CertificateRequest.findById(req.params.id);
    if (!certificate) return res.status(404).json({ success: false, message: "Certificate request not found" });
    if (!isOwner(certificate, req)) return res.status(403).json({ success: false, message: "Access denied" });
    if (certificate.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending requests can be cancelled" });
    }

    certificate.status = "cancelled";
    certificate.timeline.push({ status: "cancelled", note: "Cancelled by applicant", updatedBy: req.user._id });
    await certificate.save();

    return res.status(200).json({ success: true, message: "Request cancelled", data: { certificate } });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/certificates/:id (owner: only cancelled/rejected | admin: any)
const deleteCertificateRequest = async (req, res, next) => {
  try {
    const certificate = await CertificateRequest.findById(req.params.id);
    if (!certificate) return res.status(404).json({ success: false, message: "Certificate request not found" });

    const admin = isAdminUser(req);
    if (!admin && !isOwner(certificate, req)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (!admin && !["cancelled", "rejected"].includes(certificate.status)) {
      return res.status(400).json({ success: false, message: "Cancel the request before deleting it" });
    }

    const publicIds = (certificate.documents || []).map((d) => d.publicId).filter(Boolean);
    if (publicIds.length > 0) await cloudinaryService.deleteMultipleImages(publicIds);

    await certificate.deleteOne();
    return res.status(200).json({ success: true, message: "Certificate request deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCertificateRequests,
  getCertificateRequestById,
  createCertificateRequest,
  updateCertificateStatus,
  cancelCertificateRequest,
  deleteCertificateRequest,
};