const User = require("../models/User");
const Complaint = require("../models/Complaint");
const Notice = require("../models/Notice");
const Event = require("../models/Event");
const Job = require("../models/Job");
const Business = require("../models/Business");
const CommunityPost = require("../models/CommunityPost");
const JobApplication = require("../models/JobApplication");
const CertificateRequest = require("../models/CertificateRequest");
const FeatureApplication = require("../models/FeatureApplication");
const VillageFeature = require("../models/VillageFeature");
const Household = require("../models/Household");
const EmergencyContact = require("../models/EmergencyContact");

/*
|--------------------------------------------------------------------------
| Admin Dashboard Stats
|--------------------------------------------------------------------------
*/

const getAdminStats = async () => {
  const now = new Date();

  const thirtyDaysAgo = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000
  );

  const [
    totalUsers,
    newUsersThisMonth,
    totalComplaints,
    pendingComplaints,
    resolvedComplaints,
    totalBusinesses,
    pendingBusinesses,
    approvedBusinesses,
    totalJobs,
    activeJobs,
    totalNotices,
    activeNotices,
    totalEvents,
    upcomingEvents,
    totalPosts,
    complaintsByCategory,
    complaintsByStatus,
    usersByRole,
    recentComplaints,
    recentUsers,
  ] = await Promise.all([
    // Users
    User.countDocuments(),

    User.countDocuments({
      createdAt: {
        $gte: thirtyDaysAgo,
      },
    }),

    // Complaints
    Complaint.countDocuments(),

    Complaint.countDocuments({
      status: "pending",
    }),

    Complaint.countDocuments({
      status: "resolved",
    }),

    // Businesses
    Business.countDocuments(),

    Business.countDocuments({
      status: "pending",
    }),

    Business.countDocuments({
      status: "approved",
    }),

    // Jobs
    Job.countDocuments(),

    Job.countDocuments({
      isActive: true,
      applyBy: {
        $gte: now,
      },
    }),

    // Notices
    Notice.countDocuments(),

    Notice.countDocuments({
      isActive: true,
    }),

    // Events
    Event.countDocuments(),

    Event.countDocuments({
      isActive: true,
      endDate: {
        $gte: now,
      },
    }),

    // Community posts
    CommunityPost.countDocuments({
      isActive: true,
    }),

    // Complaints by category
    Complaint.aggregate([
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
    ]),

    // Complaints by status
    Complaint.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]),

    // Users by role
    User.aggregate([
      {
        $group: {
          _id: "$role",
          count: {
            $sum: 1,
          },
        },
      },
    ]),

    // Recent complaints
    Complaint.find()
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .populate(
        "submittedBy",
        "name email"
      )
      .lean(),

    // Recent users
    User.find()
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .select(
        "name email role createdAt"
      )
      .lean(),
  ]);

  return {
    overview: {
      totalUsers,
      newUsersThisMonth,

      totalComplaints,
      pendingComplaints,
      resolvedComplaints,

      totalBusinesses,
      pendingBusinesses,
      approvedBusinesses,

      totalJobs,
      activeJobs,

      totalNotices,
      activeNotices,

      totalEvents,
      upcomingEvents,

      totalPosts,
    },

    charts: {
      complaintsByCategory,
      complaintsByStatus,
      usersByRole,
    },

    recent: {
      complaints: recentComplaints,
      users: recentUsers,
    },
  };
};

/*
|--------------------------------------------------------------------------
| Citizen Dashboard Stats
|--------------------------------------------------------------------------
*/

const getCitizenStats = async (userId) => {
  const [
    totalComplaints,
    pendingComplaints,
    resolvedComplaints,
    totalApplications,
    pendingApplications,
    shortlistedApplications,
    totalPosts,
    totalCertificates,
    pendingCertificates,
    approvedCertificates,
    totalFeatureApps,
    pendingFeatureApps,
    approvedFeatureApps,
    household,
    latestNotices,
    upcomingEvents,
    nextGramSabha,
    mandiPrices,
    emergencyContacts,
  ] = await Promise.all([
    Complaint.countDocuments({
      submittedBy: userId,
    }),

    Complaint.countDocuments({
      submittedBy: userId,
      status: "pending",
    }),

    Complaint.countDocuments({
      submittedBy: userId,
      status: "resolved",
    }),

    JobApplication.countDocuments({
      applicant: userId,
    }),

    JobApplication.countDocuments({
      applicant: userId,
      status: "pending",
    }),

    JobApplication.countDocuments({
      applicant: userId,
      status: "shortlisted",
    }),

    CommunityPost.countDocuments({
      createdBy: userId,
      isActive: true,
    }),

    CertificateRequest.countDocuments({ submittedBy: userId }),
    CertificateRequest.countDocuments({ submittedBy: userId, status: { $in: ["pending", "in_progress"] } }),
    CertificateRequest.countDocuments({ submittedBy: userId, status: "approved" }),

    // Scheme / village-service applications
    FeatureApplication.countDocuments({ applicant: userId }),
    FeatureApplication.countDocuments({
      applicant: userId,
      status: { $in: ["submitted", "under-review", "documents-required"] },
    }),
    FeatureApplication.countDocuments({
      applicant: userId,
      status: { $in: ["approved", "completed"] },
    }),

    // Household (parivar) summary
    Household.findOne({ user: userId })
      .select("householdHeadName members houseNumber ward")
      .lean(),

    // Latest active notices (expired ones hidden)
    Notice.find({
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gte: new Date() } }],
    })
      .sort({ publishedAt: -1 })
      .limit(4)
      .select("title category priority publishedAt")
      .lean(),

    // Upcoming events
    Event.find({ isActive: true, endDate: { $gte: new Date() } })
      .sort({ startDate: 1 })
      .limit(3)
      .select("title startDate endDate location category")
      .lean(),

    // Next Gram Sabha meeting
    VillageFeature.findOne({
      category: "gram-sabha",
      status: "active",
      isPublished: true,
      meetingDate: { $gte: new Date() },
    })
      .sort({ meetingDate: 1 })
      .select("title meetingDate meetingLocation agenda")
      .lean(),

    // Latest mandi prices (admin-managed crop rows)
    VillageFeature.find({
      status: "active",
      isPublished: true,
      cropName: { $ne: "" },
      modalPrice: { $ne: null },
    })
      .sort({ priceDate: -1, updatedAt: -1 })
      .limit(6)
      .select("cropName cropUnit minPrice maxPrice modalPrice mandiName priceDate")
      .lean(),

    // Important helpline numbers
    EmergencyContact.find({ isActive: true })
      .sort({ order: 1 })
      .limit(5)
      .select("name designation phone category")
      .lean(),
  ]);

  const activeMembers = Array.isArray(household?.members)
    ? household.members.filter((m) => m.isActive !== false)
    : [];

  const recentComplaints =
    await Complaint.find({
      submittedBy: userId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean();

  return {
    certificates: {
      total: totalCertificates,
      pending: pendingCertificates,
      approved: approvedCertificates,
    },

    featureApplications: {
      total: totalFeatureApps,
      pending: pendingFeatureApps,
      approved: approvedFeatureApps,
    },

    household: household
      ? {
          exists: true,
          headName: household.householdHeadName,
          houseNumber: household.houseNumber || "",
          ward: household.ward || "",
          memberCount: activeMembers.length,
        }
      : { exists: false, memberCount: 0 },

    latestNotices,
    upcomingEvents,
    nextGramSabha: nextGramSabha || null,
    mandiPrices,
    emergencyContacts,

    complaints: {
      total: totalComplaints,
      pending: pendingComplaints,
      resolved: resolvedComplaints,
    },

    applications: {
      total: totalApplications,
      pending: pendingApplications,
      shortlisted: shortlistedApplications,
    },

    posts: {
      total: totalPosts,
    },

    recentComplaints,
  };
};

/*
|--------------------------------------------------------------------------
| Business Owner Dashboard Stats
|--------------------------------------------------------------------------
*/

const getBusinessOwnerStats = async (
  userId
) => {
  const businesses =
    await Business.find({
      owner: userId,
    })
      .select(
        "_id name rating status"
      )
      .lean();

  const jobs =
    await Job.find({
      postedBy: userId,
    })
      .select("_id")
      .lean();

  const jobIds = jobs.map(
    (job) => job._id
  );

  const [
    totalJobs,
    activeJobs,
    totalApplications,
    pendingApplications,
  ] = await Promise.all([
    Job.countDocuments({
      postedBy: userId,
    }),

    Job.countDocuments({
      postedBy: userId,
      isActive: true,
      applyBy: {
        $gte: new Date(),
      },
    }),

    JobApplication.countDocuments({
      job: {
        $in: jobIds.length
          ? jobIds
          : [],
      },
    }),

    JobApplication.countDocuments({
      job: {
        $in: jobIds.length
          ? jobIds
          : [],
      },
      status: "pending",
    }),
  ]);

  return {
    businesses: {
      total: businesses.length,

      approved:
        businesses.filter(
          (business) =>
            business.status ===
            "approved"
        ).length,

      pending:
        businesses.filter(
          (business) =>
            business.status ===
            "pending"
        ).length,

      list: businesses,
    },

    jobs: {
      total: totalJobs,
      active: activeJobs,
    },

    applications: {
      total: totalApplications,
      pending:
        pendingApplications,
    },
  };
};

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  getAdminStats,
  getCitizenStats,
  getBusinessOwnerStats,
};