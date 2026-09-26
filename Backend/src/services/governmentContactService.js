const GovernmentContact = require("../models/GovernmentContact");

/**
 * Get all active government contacts
 */
const getAllGovernmentContacts = async (filters = {}) => {
  const {
    category,
    search,
    emergency,
    featured,
  } = filters;

  const query = {
    isActive: true,
  };

  if (category && category !== "all") {
    query.category = category;
  }

  if (emergency !== undefined) {
    query.isEmergency = emergency === true || emergency === "true";
  }

  if (featured !== undefined) {
    query.isFeatured = featured === true || featured === "true";
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(
      search.trim(),
      "i"
    );

    query.$or = [
      { name: searchRegex },
      { designation: searchRegex },
      { department: searchRegex },
      { office: searchRegex },
      { category: searchRegex },
    ];
  }

  return GovernmentContact.find(query)
    .sort({
      isEmergency: -1,
      isFeatured: -1,
      displayOrder: 1,
      name: 1,
    })
    .lean();
};

/**
 * Get government contact by ID
 */
const getGovernmentContactById = async (id) => {
  return GovernmentContact.findOne({
    _id: id,
    isActive: true,
  }).lean();
};

/**
 * Get emergency contacts
 */
const getEmergencyContacts = async () => {
  return GovernmentContact.find({
    isActive: true,
    isEmergency: true,
  })
    .sort({
      displayOrder: 1,
      name: 1,
    })
    .lean();
};

/**
 * Get featured contacts
 */
const getFeaturedGovernmentContacts = async () => {
  return GovernmentContact.find({
    isActive: true,
    isFeatured: true,
  })
    .sort({
      isEmergency: -1,
      displayOrder: 1,
      name: 1,
    })
    .lean();
};

/**
 * Get contacts by category
 */
const getGovernmentContactsByCategory = async (
  category
) => {
  return GovernmentContact.find({
    category,
    isActive: true,
  })
    .sort({
      isEmergency: -1,
      isFeatured: -1,
      displayOrder: 1,
      name: 1,
    })
    .lean();
};

/**
 * Create government contact
 */
const createGovernmentContact = async (data) => {
  return GovernmentContact.create(data);
};

/**
 * Update government contact
 */
const updateGovernmentContact = async (
  id,
  data
) => {
  return GovernmentContact.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};

/**
 * Delete government contact
 */
const deleteGovernmentContact = async (id) => {
  return GovernmentContact.findByIdAndDelete(id);
};

/**
 * Update contact status
 */
const updateGovernmentContactStatus = async (
  id,
  isActive
) => {
  return GovernmentContact.findByIdAndUpdate(
    id,
    { isActive },
    {
      new: true,
      runValidators: true,
    }
  );
};

/**
 * Get contact statistics
 */
const getGovernmentContactStats = async () => {
  const [
    total,
    active,
    emergency,
    featured,
  ] = await Promise.all([
    GovernmentContact.countDocuments(),
    GovernmentContact.countDocuments({
      isActive: true,
    }),
    GovernmentContact.countDocuments({
      isActive: true,
      isEmergency: true,
    }),
    GovernmentContact.countDocuments({
      isActive: true,
      isFeatured: true,
    }),
  ]);

  const categories =
    await GovernmentContact.aggregate([
      {
        $match: {
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$category",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

  return {
    total,
    active,
    emergency,
    featured,
    categories,
  };
};

module.exports = {
  getAllGovernmentContacts,
  getGovernmentContactById,
  getEmergencyContacts,
  getFeaturedGovernmentContacts,
  getGovernmentContactsByCategory,
  createGovernmentContact,
  updateGovernmentContact,
  deleteGovernmentContact,
  updateGovernmentContactStatus,
  getGovernmentContactStats,
};