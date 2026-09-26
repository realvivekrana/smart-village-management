const User = require("../models/User");
const Complaint = require("../models/Complaint");
const Notice = require("../models/Notice");
const Event = require("../models/Event");
const Job = require("../models/Job");
const Business = require("../models/Business");
const CommunityPost = require("../models/CommunityPost");
const JobApplication = require("../models/JobApplication");

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
  ]);

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