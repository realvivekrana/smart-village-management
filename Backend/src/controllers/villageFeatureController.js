
const mongoose = require("mongoose");

const VillageFeature = require("../models/VillageFeature");
const FeatureApplication = require("../models/FeatureApplication");
const Household = require("../models/Household");

/*
|--------------------------------------------------------------------------
| Helper
|--------------------------------------------------------------------------
*/

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getUserId = (req) => {
  return req.user?._id || req.user?.id;
};

/*
|--------------------------------------------------------------------------
| GET ALL VILLAGE FEATURES
|--------------------------------------------------------------------------
| Public/Citizen
|
| GET /api/v1/village-features
|
| Query:
| ?category=scheme
| ?status=active
| ?search=PM
| ?page=1
| ?limit=20
|--------------------------------------------------------------------------
*/

const getVillageFeatures = async (req, res, next) => {
  try {
    const {
      category,
      status = "active",
      search,
      villageName = "Kakarcholi",
      page = 1,
      limit = 20,
      featured,
    } = req.query;

    const pageNumber = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 20, 1),
      100
    );

    const filter = {
      villageName,
      isPublished: true,
    };

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (featured !== undefined) {
      filter.featured =
        featured === "true";
    }

    if (search && search.trim()) {
      filter.$text = {
        $search: search.trim(),
      };
    }

    const skip =
      (pageNumber - 1) * limitNumber;

    const [features, total] =
      await Promise.all([
        VillageFeature.find(filter)
          .sort({
            featured: -1,
            priority: -1,
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        VillageFeature.countDocuments(filter),
      ]);

    return res.status(200).json({
      success: true,
      message: "Village features fetched successfully",
      data: features,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(
          total / limitNumber
        ),
        hasNextPage:
          pageNumber <
          Math.ceil(total / limitNumber),
        hasPreviousPage:
          pageNumber > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET FEATURE BY ID
|--------------------------------------------------------------------------
|
| GET /api/v1/village-features/:id
|--------------------------------------------------------------------------
*/

const getVillageFeatureById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid village feature ID",
      });
    }

    const feature =
      await VillageFeature.findById(id)
        .populate(
          "villageId",
          "name district block state"
        )
        .lean();

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Village feature not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Village feature fetched successfully",
      data: feature,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| CREATE VILLAGE FEATURE
|--------------------------------------------------------------------------
| Admin
|
| POST /api/v1/village-features
|--------------------------------------------------------------------------
*/

const createVillageFeature = async (
  req,
  res,
  next
) => {
  try {
    const userId = getUserId(req);

    const featureData = {
      ...req.body,
      createdBy: userId || null,
      updatedBy: userId || null,
    };

    if (!featureData.villageName) {
      featureData.villageName =
        "Kakarcholi";
    }

    const feature =
      await VillageFeature.create(
        featureData
      );

    return res.status(201).json({
      success: true,
      message:
        "Village feature created successfully",
      data: feature,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE VILLAGE FEATURE
|--------------------------------------------------------------------------
| Admin
|
| PUT /api/v1/village-features/:id
|--------------------------------------------------------------------------
*/

const updateVillageFeature = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid village feature ID",
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: userId || null,
    };

    delete updateData._id;
    delete updateData.createdBy;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const feature =
      await VillageFeature.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Village feature not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Village feature updated successfully",
      data: feature,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE VILLAGE FEATURE
|--------------------------------------------------------------------------
| Admin
|
| DELETE /api/v1/village-features/:id
|--------------------------------------------------------------------------
*/

const deleteVillageFeature = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid village feature ID",
      });
    }

    const feature =
      await VillageFeature.findByIdAndDelete(
        id
      );

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Village feature not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Village feature deleted successfully",
      data: {
        id: feature._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| APPLY FOR FEATURE / SCHEME
|--------------------------------------------------------------------------
| Citizen
|
| POST /api/v1/village-features/:id/apply
|--------------------------------------------------------------------------
*/

const applyForFeature = async (
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
        message: "Invalid village feature ID",
      });
    }

    const feature =
      await VillageFeature.findById(id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Village feature not found",
      });
    }

    if (
      !feature.isPublished ||
      feature.status !== "active"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This feature is not currently available",
      });
    }

    /*
     * Prevent duplicate active application.
     */

    const existingApplication =
      await FeatureApplication.findOne({
        applicant: userId,
        feature: feature._id,
        status: {
          $nin: [
            "rejected",
            "cancelled",
            "completed",
          ],
        },
      });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message:
          "You already have an active application for this feature",
        data: existingApplication,
      });
    }

    /*
     * Get applicant details from household
     * when available.
     */

    let household = null;

    try {
      household =
        await Household.findOne({
          user: userId,
        }).lean();
    } catch (householdError) {
      console.error(
        "Household lookup error:",
        householdError.message
      );
    }

    const applicantName =
      req.body.applicantName ||
      household?.householdHeadName ||
      req.user?.name ||
      "Citizen";

    const applicantPhone =
      req.body.applicantPhone ||
      household?.householdHeadPhone ||
      req.user?.phone ||
      "";

    const applicantEmail =
      req.body.applicantEmail ||
      req.user?.email ||
      "";

    let applicationType =
      req.body.applicationType;

    if (!applicationType) {
      applicationType =
        feature.category === "scheme"
          ? "scheme"
          : feature.category ===
              "gram-sabha"
            ? "gram-sabha-rsvp"
            : feature.category ===
                "scholarship"
              ? "scholarship"
              : feature.category ===
                  "skill-training"
                ? "skill-training"
                : feature.category ===
                    "health-camp"
                  ? "health-camp"
                  : feature.category ===
                      "vaccination"
                    ? "vaccination"
                    : feature.category ===
                        "equipment-rental"
                      ? "equipment-rental"
                      : feature.category ===
                          "volunteer"
                        ? "volunteer"
                        : "other";
    }

    const application =
      await FeatureApplication.create({
        applicant: userId,
        applicantName,
        applicantPhone,
        applicantEmail,

        feature: feature._id,
        category: feature.category,
        featureTitle: feature.title,

        applicationType,

        familyId:
          req.body.familyId ||
          household?._id ||
          null,

        householdDetails:
          household || {},

        eligibilityDetails:
          req.body.eligibilityDetails ||
          feature.eligibility ||
          "",

        formData:
          req.body.formData || {},

        documents:
          Array.isArray(req.body.documents)
            ? req.body.documents
            : [],

        rsvp:
          applicationType ===
          "gram-sabha-rsvp"
            ? req.body.rsvp ||
              "attending"
            : "pending",

        rsvpAt:
          applicationType ===
          "gram-sabha-rsvp"
            ? new Date()
            : null,

        villageName:
          feature.villageName ||
          "Kakarcholi",

        villageId:
          feature.villageId || null,

        notes:
          req.body.notes || "",
      });

    return res.status(201).json({
      success: true,
      message:
        "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET MY APPLICATIONS
|--------------------------------------------------------------------------
| Citizen
|
| GET /api/v1/village-features/applications/mine
|--------------------------------------------------------------------------
*/

const getMyApplications = async (
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
      category,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNumber = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 20, 1),
      100
    );

    const filter = {
      applicant: userId,
    };

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    const skip =
      (pageNumber - 1) * limitNumber;

    const [applications, total] =
      await Promise.all([
        FeatureApplication.find(filter)
          .populate(
            "feature",
            "title category description status"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        FeatureApplication.countDocuments(
          filter
        ),
      ]);

    return res.status(200).json({
      success: true,
      message:
        "Applications fetched successfully",
      data: applications,
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
| GET APPLICATION BY TRACKING ID
|--------------------------------------------------------------------------
| Citizen
|
| GET /api/v1/village-features/applications/track/:trackingId
|--------------------------------------------------------------------------
*/

const trackApplication = async (
  req,
  res,
  next
) => {
  try {
    const userId = getUserId(req);
    const { trackingId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!trackingId) {
      return res.status(400).json({
        success: false,
        message: "Tracking ID is required",
      });
    }

    const application =
      await FeatureApplication.findOne({
        trackingId:
          trackingId.trim().toUpperCase(),
        applicant: userId,
      })
        .populate(
          "feature",
          "title category description"
        )
        .lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message:
          "Application not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Application status fetched successfully",
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN - GET ALL APPLICATIONS
|--------------------------------------------------------------------------
|
| GET /api/v1/village-features/admin/applications
|--------------------------------------------------------------------------
*/

const getAllApplications = async (
  req,
  res,
  next
) => {
  try {
    const {
      status,
      category,
      applicationType,
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
      Math.max(parseInt(limit, 10) || 20, 1),
      100
    );

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (applicationType) {
      filter.applicationType =
        applicationType;
    }

    if (villageName) {
      filter.villageName = villageName;
    }

    if (search && search.trim()) {
      filter.$or = [
        {
          trackingId: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          applicantName: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          applicantPhone: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          featureTitle: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    const skip =
      (pageNumber - 1) * limitNumber;

    const [applications, total] =
      await Promise.all([
        FeatureApplication.find(filter)
          .populate(
            "applicant",
            "name email phone role"
          )
          .populate(
            "feature",
            "title category status"
          )
          .populate(
            "reviewedBy",
            "name email"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        FeatureApplication.countDocuments(
          filter
        ),
      ]);

    return res.status(200).json({
      success: true,
      message:
        "All applications fetched successfully",
      data: applications,
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
| ADMIN - UPDATE APPLICATION STATUS
|--------------------------------------------------------------------------
|
| PATCH /api/v1/village-features/admin/applications/:id
|--------------------------------------------------------------------------
*/

const updateApplicationStatus = async (
  req,
  res,
  next
) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const {
      status,
      statusMessage,
      adminRemarks,
      rejectionReason,
      rsvp,
      notes,
    } = req.body;

    const allowedStatuses = [
      "submitted",
      "under-review",
      "documents-required",
      "approved",
      "rejected",
      "completed",
      "cancelled",
    ];

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const application =
      await FeatureApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (status) {
      application.status = status;

      if (
        status === "approved" ||
        status === "rejected" ||
        status === "completed"
      ) {
        application.reviewedBy =
          userId || null;

        application.reviewedAt =
          new Date();
      }
    }

    if (statusMessage !== undefined) {
      application.statusMessage =
        statusMessage;
    }

    if (adminRemarks !== undefined) {
      application.adminRemarks =
        adminRemarks;
    }

    if (rejectionReason !== undefined) {
      application.rejectionReason =
        rejectionReason;
    }

    if (rsvp !== undefined) {
      const allowedRsvp = [
        "pending",
        "attending",
        "not-attending",
      ];

      if (!allowedRsvp.includes(rsvp)) {
        return res.status(400).json({
          success: false,
          message: "Invalid RSVP status",
        });
      }

      application.rsvp = rsvp;
      application.rsvpAt = new Date();
    }

    if (notes !== undefined) {
      application.notes = notes;
    }

    await application.save();

    return res.status(200).json({
      success: true,
      message:
        "Application updated successfully",
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN - DELETE APPLICATION
|--------------------------------------------------------------------------
|
| DELETE /api/v1/village-features/admin/applications/:id
|--------------------------------------------------------------------------
*/

const deleteApplication = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application =
      await FeatureApplication.findByIdAndDelete(
        id
      );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Application deleted successfully",
      data: {
        id: application._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVillageFeatures,
  getVillageFeatureById,
  createVillageFeature,
  updateVillageFeature,
  deleteVillageFeature,

  applyForFeature,
  getMyApplications,
  trackApplication,

  getAllApplications,
  updateApplicationStatus,
  deleteApplication,
};