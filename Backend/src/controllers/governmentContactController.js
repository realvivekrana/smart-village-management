const GovernmentContact = require("../models/GovernmentContact");

/**
 * @desc    Get all government contacts
 * @route   GET /api/v1/government-contacts
 * @access  Public
 */
const getGovernmentContacts = async (req, res) => {
  try {
    const {
      category,
      search,
      emergency,
      featured,
      active,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    // Active filter
    if (active !== undefined) {
      query.isActive = active === "true";
    } else {
      query.isActive = true;
    }

    // Category filter
    if (category && category !== "all") {
      query.category = category;
    }

    // Emergency filter
    if (emergency !== undefined) {
      query.isEmergency = emergency === "true";
    }

    // Featured filter
    if (featured !== undefined) {
      query.isFeatured = featured === "true";
    }

    // Search
    if (search && search.trim()) {
      query.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          designation: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          department: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          office: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(
      Math.max(Number(limit) || 50, 1),
      100
    );

    const skip = (pageNumber - 1) * limitNumber;

    const [contacts, total] = await Promise.all([
      GovernmentContact.find(query)
        .sort({
          isEmergency: -1,
          isFeatured: -1,
          displayOrder: 1,
          name: 1,
        })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      GovernmentContact.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Government contacts fetched successfully",
      data: contacts,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error(
      "Get government contacts error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch government contacts",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/**
 * @desc    Get single government contact
 * @route   GET /api/v1/government-contacts/:id
 * @access  Public
 */
const getGovernmentContactById = async (req, res) => {
  try {
    const contact = await GovernmentContact.findOne({
      _id: req.params.id,
      isActive: true,
    }).lean();

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Government contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Government contact fetched successfully",
      data: contact,
    });
  } catch (error) {
    console.error(
      "Get government contact error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch government contact",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/**
 * @desc    Create government contact
 * @route   POST /api/v1/government-contacts
 * @access  Admin
 */
const createGovernmentContact = async (req, res) => {
  try {
    const {
      name,
      designation,
      department,
      category,
      office,
      phone,
      alternatePhone,
      email,
      address,
      description,
      website,
      isEmergency,
      isFeatured,
      isActive,
      displayOrder,
      source,
      lastVerifiedAt,
    } = req.body;

    if (!name || !designation || !department || !category) {
      return res.status(400).json({
        success: false,
        message:
          "Name, designation, department and category are required",
      });
    }

    const contact = await GovernmentContact.create({
      name,
      designation,
      department,
      category,
      office,
      phone,
      alternatePhone,
      email,
      address,
      description,
      website,
      isEmergency,
      isFeatured,
      isActive,
      displayOrder,
      source,
      lastVerifiedAt,
    });

    return res.status(201).json({
      success: true,
      message: "Government contact created successfully",
      data: contact,
    });
  } catch (error) {
    console.error(
      "Create government contact error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create government contact",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/**
 * @desc    Update government contact
 * @route   PUT /api/v1/government-contacts/:id
 * @access  Admin
 */
const updateGovernmentContact = async (req, res) => {
  try {
    const contact = await GovernmentContact.findById(
      req.params.id
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Government contact not found",
      });
    }

    const allowedFields = [
      "name",
      "designation",
      "department",
      "category",
      "office",
      "phone",
      "alternatePhone",
      "email",
      "address",
      "description",
      "website",
      "isEmergency",
      "isFeatured",
      "isActive",
      "displayOrder",
      "source",
      "lastVerifiedAt",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        contact[field] = req.body[field];
      }
    });

    await contact.save();

    return res.status(200).json({
      success: true,
      message: "Government contact updated successfully",
      data: contact,
    });
  } catch (error) {
    console.error(
      "Update government contact error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update government contact",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/**
 * @desc    Delete government contact
 * @route   DELETE /api/v1/government-contacts/:id
 * @access  Admin
 */
const deleteGovernmentContact = async (req, res) => {
  try {
    const contact = await GovernmentContact.findById(
      req.params.id
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Government contact not found",
      });
    }

    await contact.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Government contact deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete government contact error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete government contact",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/**
 * @desc    Soft delete / deactivate government contact
 * @route   PATCH /api/v1/government-contacts/:id/status
 * @access  Admin
 */
const updateGovernmentContactStatus = async (
  req,
  res
) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean value",
      });
    }

    const contact =
      await GovernmentContact.findByIdAndUpdate(
        req.params.id,
        { isActive },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Government contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Government contact ${
        isActive ? "activated" : "deactivated"
      } successfully`,
      data: contact,
    });
  } catch (error) {
    console.error(
      "Update government contact status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update government contact status",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

module.exports = {
  getGovernmentContacts,
  getGovernmentContactById,
  createGovernmentContact,
  updateGovernmentContact,
  deleteGovernmentContact,
  updateGovernmentContactStatus,
};