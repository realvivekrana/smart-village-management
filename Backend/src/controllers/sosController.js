const escapeRegex = require("../utils/escapeRegex");
const mongoose = require("mongoose");
const { getActiveVillageName } = require("../utils/villageHelper");

const SOSAlert = require("../models/SOSAlert");

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const getUserId = (req) => {
  return req.user?._id || req.user?.id;
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/*
|--------------------------------------------------------------------------
| CREATE SOS ALERT
|--------------------------------------------------------------------------
|
| POST /api/v1/sos
|
|--------------------------------------------------------------------------
*/

const createSOSAlert = async (
  req,
  res,
  next
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      emergencyType = "other",
      message = "",
      location = {},
      notifiedContacts = [],
      deviceInfo = {},
      metadata = {},
      isTestAlert = false,
    } = req.body;

    const userName =
      req.user?.name || "Citizen";

    const userPhone =
      req.user?.phone || "";

    const allowedEmergencyTypes = [
      "medical",
      "police",
      "fire",
      "accident",
      "women-safety",
      "child-safety",
      "animal",
      "natural-disaster",
      "other",
    ];

    if (
      !allowedEmergencyTypes.includes(
        emergencyType
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid emergency type",
      });
    }

    /*
     * Prevent accidental duplicate SOS
     * within a very short period.
     */

    const recentAlert =
      await SOSAlert.findOne({
        user: userId,
        status: {
          $in: [
            "active",
            "acknowledged",
            "responding",
          ],
        },
        createdAt: {
          $gte: new Date(
            Date.now() - 2 * 60 * 1000
          ),
        },
      });

    if (recentAlert) {
      return res.status(409).json({
        success: false,
        message:
          "You already have an active SOS alert",
        data: recentAlert,
      });
    }

    const normalizedLocation = {
      latitude:
        typeof location.latitude ===
        "number"
          ? location.latitude
          : null,

      longitude:
        typeof location.longitude ===
        "number"
          ? location.longitude
          : null,

      accuracy:
        typeof location.accuracy ===
        "number"
          ? location.accuracy
          : null,

      address:
        location.address || "",

      villageName:
        location.villageName || (await getActiveVillageName()),

      landmark:
        location.landmark || "",
    };

    const alert =
      await SOSAlert.create({
        user: userId,
        userName,
        userPhone,

        emergencyType,
        message,

        location:
          normalizedLocation,

        notifiedContacts:
          Array.isArray(
            notifiedContacts
          )
            ? notifiedContacts
            : [],

        villageName:
          normalizedLocation.villageName || (await getActiveVillageName()),

        deviceInfo,
        metadata,
        isTestAlert,
      });

    return res.status(201).json({
      success: true,
      message:
        "Emergency SOS alert created successfully",
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET MY SOS ALERTS
|--------------------------------------------------------------------------
|
| GET /api/v1/sos/mine
|
|--------------------------------------------------------------------------
*/

const getMySOSAlerts = async (
  req,
  res,
  next
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      status,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNumber = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(
        parseInt(limit, 10) || 20,
        1
      ),
      100
    );

    const filter = {
      user: userId,
    };

    if (status) {
      filter.status = status;
    }

    const skip =
      (pageNumber - 1) *
      limitNumber;

    const [alerts, total] =
      await Promise.all([
        SOSAlert.find(filter)
          .populate(
            "acknowledgedBy",
            "name email"
          )
          .populate(
            "resolvedBy",
            "name email"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        SOSAlert.countDocuments(filter),
      ]);

    return res.status(200).json({
      success: true,
      message:
        "SOS alerts fetched successfully",
      data: alerts,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(
          total / limitNumber
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET ACTIVE USER SOS
|--------------------------------------------------------------------------
|
| GET /api/v1/sos/mine/active
|
|--------------------------------------------------------------------------
*/

const getMyActiveSOS = async (
  req,
  res,
  next
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const alert =
      await SOSAlert.findOne({
        user: userId,
        status: {
          $in: [
            "active",
            "acknowledged",
            "responding",
          ],
        },
      })
        .sort({
          createdAt: -1,
        })
        .populate(
          "acknowledgedBy",
          "name phone"
        )
        .lean();

    return res.status(200).json({
      success: true,
      message:
        alert
          ? "Active SOS alert found"
          : "No active SOS alert",
      data: alert || null,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| CANCEL MY SOS
|--------------------------------------------------------------------------
|
| PATCH /api/v1/sos/:id/cancel
|
|--------------------------------------------------------------------------
*/

const cancelMySOS = async (
  req,
  res,
  next
) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SOS alert ID",
      });
    }

    const alert =
      await SOSAlert.findOne({
        _id: id,
        user: userId,
      });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message:
          "SOS alert not found",
      });
    }

    if (
      ![
        "active",
        "acknowledged",
      ].includes(alert.status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This SOS alert cannot be cancelled",
      });
    }

    alert.status = "cancelled";

    alert.resolvedAt =
      new Date();

    alert.resolutionNote =
      req.body?.reason ||
      "Cancelled by citizen";

    await alert.save();

    return res.status(200).json({
      success: true,
      message:
        "SOS alert cancelled successfully",
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN - GET ALL SOS ALERTS
|--------------------------------------------------------------------------
|
| GET /api/v1/sos/admin
|
|--------------------------------------------------------------------------
*/

const getAllSOSAlerts = async (
  req,
  res,
  next
) => {
  try {
    const {
      status,
      emergencyType,
      villageName,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNumber = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(
        parseInt(limit, 10) || 20,
        1
      ),
      100
    );

    const filter = {
    };

    if (villageName) {
      filter.villageName = villageName;
    }

    if (status) {
      filter.status = status;
    }

    if (emergencyType) {
      filter.emergencyType =
        emergencyType;
    }

    if (search && search.trim()) {
      filter.$or = [
        {
          userName: {
            $regex: escapeRegex(search),
            $options: "i",
          },
        },
        {
          userPhone: {
            $regex: escapeRegex(search),
            $options: "i",
          },
        },
        {
          "location.address": {
            $regex: escapeRegex(search),
            $options: "i",
          },
        },
        {
          "location.landmark": {
            $regex: escapeRegex(search),
            $options: "i",
          },
        },
      ];
    }

    const skip =
      (pageNumber - 1) *
      limitNumber;

    const [alerts, total] =
      await Promise.all([
        SOSAlert.find(filter)
          .populate(
            "user",
            "name email phone role"
          )
          .populate(
            "acknowledgedBy",
            "name email phone"
          )
          .populate(
            "resolvedBy",
            "name email phone"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        SOSAlert.countDocuments(
          filter
        ),
      ]);

    return res.status(200).json({
      success: true,
      message:
        "SOS alerts fetched successfully",
      data: alerts,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(
          total / limitNumber
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN - GET SOS BY ID
|--------------------------------------------------------------------------
|
| GET /api/v1/sos/admin/:id
|
|--------------------------------------------------------------------------
*/

const getSOSById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SOS alert ID",
      });
    }

    const alert =
      await SOSAlert.findById(id)
        .populate(
          "user",
          "name email phone role"
        )
        .populate(
          "acknowledgedBy",
          "name email phone"
        )
        .populate(
          "resolvedBy",
          "name email phone"
        )
        .lean();

    if (!alert) {
      return res.status(404).json({
        success: false,
        message:
          "SOS alert not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "SOS alert fetched successfully",
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN - ACKNOWLEDGE SOS
|--------------------------------------------------------------------------
|
| PATCH /api/v1/sos/admin/:id/acknowledge
|
|--------------------------------------------------------------------------
*/

const acknowledgeSOS = async (
  req,
  res,
  next
) => {
  try {
    const adminId = getUserId(req);
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SOS alert ID",
      });
    }

    const alert =
      await SOSAlert.findById(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message:
          "SOS alert not found",
      });
    }

    if (
      [
        "resolved",
        "cancelled",
        "false-alarm",
      ].includes(alert.status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This SOS alert is no longer active",
      });
    }

    alert.status =
      "acknowledged";

    alert.acknowledgedBy =
      adminId || null;

    alert.acknowledgedAt =
      new Date();

    if (req.body?.responseMessage) {
      alert.responseMessage =
        req.body.responseMessage;
    }

    await alert.save();

    return res.status(200).json({
      success: true,
      message:
        "SOS alert acknowledged successfully",
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN - MARK RESPONDING
|--------------------------------------------------------------------------
|
| PATCH /api/v1/sos/admin/:id/responding
|
|--------------------------------------------------------------------------
*/

const markSOSResponding = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SOS alert ID",
      });
    }

    const alert =
      await SOSAlert.findById(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message:
          "SOS alert not found",
      });
    }

    if (
      [
        "resolved",
        "cancelled",
        "false-alarm",
      ].includes(alert.status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This SOS alert is no longer active",
      });
    }

    alert.status =
      "responding";

    if (req.body?.responseTeam) {
      alert.responseTeam =
        req.body.responseTeam;
    }

    if (req.body?.responseContact) {
      alert.responseContact =
        req.body.responseContact;
    }

    if (req.body?.responseMessage) {
      alert.responseMessage =
        req.body.responseMessage;
    }

    await alert.save();

    return res.status(200).json({
      success: true,
      message:
        "Emergency response marked as active",
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN - RESOLVE SOS
|--------------------------------------------------------------------------
|
| PATCH /api/v1/sos/admin/:id/resolve
|
|--------------------------------------------------------------------------
*/

const resolveSOS = async (
  req,
  res,
  next
) => {
  try {
    const adminId = getUserId(req);
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SOS alert ID",
      });
    }

    const alert =
      await SOSAlert.findById(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message:
          "SOS alert not found",
      });
    }

    alert.status = "resolved";

    alert.resolvedBy =
      adminId || null;

    alert.resolvedAt =
      new Date();

    alert.resolutionNote =
      req.body?.resolutionNote ||
      "Emergency resolved";

    if (req.body?.responseMessage) {
      alert.responseMessage =
        req.body.responseMessage;
    }

    await alert.save();

    return res.status(200).json({
      success: true,
      message:
        "SOS alert resolved successfully",
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN - MARK FALSE ALARM
|--------------------------------------------------------------------------
|
| PATCH /api/v1/sos/admin/:id/false-alarm
|
|--------------------------------------------------------------------------
*/

const markFalseAlarm = async (
  req,
  res,
  next
) => {
  try {
    const adminId = getUserId(req);
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SOS alert ID",
      });
    }

    const alert =
      await SOSAlert.findById(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message:
          "SOS alert not found",
      });
    }

    alert.status =
      "false-alarm";

    alert.resolvedBy =
      adminId || null;

    alert.resolvedAt =
      new Date();

    alert.resolutionNote =
      req.body?.resolutionNote ||
      "Marked as false alarm";

    await alert.save();

    return res.status(200).json({
      success: true,
      message:
        "SOS marked as false alarm",
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN - UPDATE RESPONSE DETAILS
|--------------------------------------------------------------------------
|
| PATCH /api/v1/sos/admin/:id/response
|
|--------------------------------------------------------------------------
*/

const updateSOSResponse = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SOS alert ID",
      });
    }

    const alert =
      await SOSAlert.findById(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message:
          "SOS alert not found",
      });
    }

    if (
      req.body.responseTeam !==
      undefined
    ) {
      alert.responseTeam =
        req.body.responseTeam;
    }

    if (
      req.body.responseContact !==
      undefined
    ) {
      alert.responseContact =
        req.body.responseContact;
    }

    if (
      req.body.responseMessage !==
      undefined
    ) {
      alert.responseMessage =
        req.body.responseMessage;
    }

    await alert.save();

    return res.status(200).json({
      success: true,
      message:
        "SOS response updated successfully",
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSOSAlert,

  getMySOSAlerts,
  getMyActiveSOS,
  cancelMySOS,

  getAllSOSAlerts,
  getSOSById,

  acknowledgeSOS,
  markSOSResponding,
  resolveSOS,
  markFalseAlarm,
  updateSOSResponse,
};