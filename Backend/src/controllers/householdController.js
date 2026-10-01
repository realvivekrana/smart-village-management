const escapeRegex = require("../utils/escapeRegex");
const mongoose = require("mongoose");
const { getActiveVillageName } = require("../utils/villageHelper");

const Household = require("../models/Household");

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
| GET MY HOUSEHOLD
|--------------------------------------------------------------------------
|
| GET /api/v1/households/mine
|
|--------------------------------------------------------------------------
*/

const getMyHousehold = async (
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

    const household =
      await Household.findOne({
        user: userId,
      }).lean();

    if (!household) {
      return res.status(200).json({
        success: true,
        message:
          "Household profile not created yet",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Household fetched successfully",
      data: household,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| CREATE OR UPDATE MY HOUSEHOLD
|--------------------------------------------------------------------------
|
| PUT /api/v1/households/mine
|
|--------------------------------------------------------------------------
*/

const upsertMyHousehold = async (
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

    const existingHousehold =
      await Household.findOne({
        user: userId,
      });

    const householdData = {
      ...req.body,
      user: userId,
    };

    /*
     * Do not allow citizen to change
     * verification information.
     */

    delete householdData.isVerified;
    delete householdData.verifiedBy;
    delete householdData.verifiedAt;

    if (
      !householdData.villageName
    ) {
      householdData.villageName = await getActiveVillageName();
    }

    let household;

    if (existingHousehold) {
      household = await Household.findOneAndUpdate(
        {
          user: userId,
        },
        householdData,
        {
          new: true,
          runValidators: true,
        }
      );
    } else {
      household =
        await Household.create(
          householdData
        );
    }

    return res.status(200).json({
      success: true,
      message: existingHousehold
        ? "Household updated successfully"
        : "Household created successfully",
      data: household,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ADD FAMILY MEMBER
|--------------------------------------------------------------------------
|
| POST /api/v1/households/mine/members
|
|--------------------------------------------------------------------------
*/

const addFamilyMember = async (
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

    const household =
      await Household.findOne({
        user: userId,
      });

    if (!household) {
      return res.status(404).json({
        success: false,
        message:
          "Please create household profile first",
      });
    }

    if (!req.body.name) {
      return res.status(400).json({
        success: false,
        message: "Member name is required",
      });
    }

    if (!req.body.relation) {
      return res.status(400).json({
        success: false,
        message:
          "Member relation is required",
      });
    }

    const memberData = {
      ...req.body,
    };

    /*
     * Prevent clients from injecting
     * internal MongoDB fields.
     */

    delete memberData._id;
    delete memberData.createdAt;
    delete memberData.updatedAt;

    household.members.push(
      memberData
    );

    await household.save();

    const newMember =
      household.members[
        household.members.length - 1
      ];

    return res.status(201).json({
      success: true,
      message:
        "Family member added successfully",
      data: newMember,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE FAMILY MEMBER
|--------------------------------------------------------------------------
|
| PUT /api/v1/households/mine/members/:memberId
|
|--------------------------------------------------------------------------
*/

const updateFamilyMember = async (
  req,
  res,
  next
) => {
  try {
    const userId = getUserId(req);
    const { memberId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (
      !isValidObjectId(memberId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid family member ID",
      });
    }

    const household =
      await Household.findOne({
        user: userId,
      });

    if (!household) {
      return res.status(404).json({
        success: false,
        message: "Household not found",
      });
    }

    const member =
      household.members.id(memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message:
          "Family member not found",
      });
    }

    const allowedFields = [
      "name",
      "relation",
      "gender",
      "dateOfBirth",
      "age",
      "aadhaarLast4",
      "voterId",
      "phone",
      "email",
      "education",
      "occupation",
      "isStudent",
      "schoolOrCollege",
      "schemes",
      "bloodGroup",
      "disability",
      "disabilityDetails",
      "isPrimaryContact",
      "isActive",
    ];

    allowedFields.forEach((field) => {
      if (
        req.body[field] !== undefined
      ) {
        member[field] =
          req.body[field];
      }
    });

    await household.save();

    return res.status(200).json({
      success: true,
      message:
        "Family member updated successfully",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE FAMILY MEMBER
|--------------------------------------------------------------------------
|
| DELETE /api/v1/households/mine/members/:memberId
|
|--------------------------------------------------------------------------
*/

const deleteFamilyMember = async (
  req,
  res,
  next
) => {
  try {
    const userId = getUserId(req);
    const { memberId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (
      !isValidObjectId(memberId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid family member ID",
      });
    }

    const household =
      await Household.findOne({
        user: userId,
      });

    if (!household) {
      return res.status(404).json({
        success: false,
        message: "Household not found",
      });
    }

    const member =
      household.members.id(memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message:
          "Family member not found",
      });
    }

    member.deleteOne();

    await household.save();

    return res.status(200).json({
      success: true,
      message:
        "Family member removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET HOUSEHOLD MEMBER
|--------------------------------------------------------------------------
|
| GET /api/v1/households/mine/members/:memberId
|
|--------------------------------------------------------------------------
*/

const getFamilyMember = async (
  req,
  res,
  next
) => {
  try {
    const userId = getUserId(req);
    const { memberId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (
      !isValidObjectId(memberId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid family member ID",
      });
    }

    const household =
      await Household.findOne({
        user: userId,
      }).lean();

    if (!household) {
      return res.status(404).json({
        success: false,
        message: "Household not found",
      });
    }

    const member =
      household.members.find(
        (item) =>
          item._id.toString() ===
          memberId
      );

    if (!member) {
      return res.status(404).json({
        success: false,
        message:
          "Family member not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Family member fetched successfully",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE MY HOUSEHOLD
|--------------------------------------------------------------------------
|
| DELETE /api/v1/households/mine
|
|--------------------------------------------------------------------------
*/

const deleteMyHousehold = async (
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

    const household =
      await Household.findOneAndDelete({
        user: userId,
      });

    if (!household) {
      return res.status(404).json({
        success: false,
        message: "Household not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Household deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN - GET ALL HOUSEHOLDS
|--------------------------------------------------------------------------
|
| GET /api/v1/households/admin
|
|--------------------------------------------------------------------------
*/

const getAllHouseholds = async (
  req,
  res,
  next
) => {
  try {
    const {
      villageName,
      search,
      verified,
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
      isActive: true,
    };

    if (villageName) {
      filter.villageName = villageName;
    }

    if (verified !== undefined) {
      filter.isVerified =
        verified === "true";
    }

    if (search && search.trim()) {
      filter.$or = [
        {
          householdHeadName: {
            $regex: escapeRegex(search),
            $options: "i",
          },
        },
        {
          householdHeadPhone: {
            $regex: escapeRegex(search),
            $options: "i",
          },
        },
        {
          houseNumber: {
            $regex: escapeRegex(search),
            $options: "i",
          },
        },
        {
          ward: {
            $regex: escapeRegex(search),
            $options: "i",
          },
        },
      ];
    }

    const skip =
      (pageNumber - 1) *
      limitNumber;

    const [households, total] =
      await Promise.all([
        Household.find(filter)
          .populate(
            "user",
            "name email phone role"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        Household.countDocuments(filter),
      ]);

    return res.status(200).json({
      success: true,
      message:
        "Households fetched successfully",
      data: households,
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
| ADMIN - GET HOUSEHOLD BY ID
|--------------------------------------------------------------------------
|
| GET /api/v1/households/admin/:id
|
|--------------------------------------------------------------------------
*/

const getHouseholdById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid household ID",
      });
    }

    const household =
      await Household.findById(id)
        .populate(
          "user",
          "name email phone role"
        )
        .populate(
          "verifiedBy",
          "name email"
        )
        .lean();

    if (!household) {
      return res.status(404).json({
        success: false,
        message: "Household not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Household fetched successfully",
      data: household,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN - VERIFY HOUSEHOLD
|--------------------------------------------------------------------------
|
| PATCH /api/v1/households/admin/:id/verify
|
|--------------------------------------------------------------------------
*/

const verifyHousehold = async (
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
        message:
          "Invalid household ID",
      });
    }

    const household =
      await Household.findById(id);

    if (!household) {
      return res.status(404).json({
        success: false,
        message: "Household not found",
      });
    }

    household.isVerified = true;
    household.verifiedBy =
      adminId || null;
    household.verifiedAt =
      new Date();

    await household.save();

    return res.status(200).json({
      success: true,
      message:
        "Household verified successfully",
      data: household,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN - UNVERIFY HOUSEHOLD
|--------------------------------------------------------------------------
|
| PATCH /api/v1/households/admin/:id/unverify
|
|--------------------------------------------------------------------------
*/

const unverifyHousehold = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid household ID",
      });
    }

    const household =
      await Household.findById(id);

    if (!household) {
      return res.status(404).json({
        success: false,
        message: "Household not found",
      });
    }

    household.isVerified = false;
    household.verifiedBy = null;
    household.verifiedAt = null;

    await household.save();

    return res.status(200).json({
      success: true,
      message:
        "Household verification removed",
      data: household,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyHousehold,
  upsertMyHousehold,

  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  getFamilyMember,

  deleteMyHousehold,

  getAllHouseholds,
  getHouseholdById,
  verifyHousehold,
  unverifyHousehold,
};