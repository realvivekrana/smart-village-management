const User = require("../models/User");
const Notice = require("../models/Notice");
const Complaint = require("../models/Complaint");
const Event = require("../models/Event");
const Job = require("../models/Job");
const Business = require("../models/Business");
const Service = require("../models/Service");
const CommunityPost = require("../models/CommunityPost");
const EmergencyContact = require("../models/EmergencyContact");

/**
 * Get dashboard statistics
 */
const getDashboardStats = async () => {
  const [
    totalUsers,
    activeUsers,
    totalNotices,
    totalComplaints,
    pendingComplaints,
    totalEvents,
    totalJobs,
    activeJobs,
    totalBusinesses,
    pendingBusinesses,
    totalServices,
    totalCommunityPosts,
    totalEmergencyContacts,
  ] = await Promise.all([
    User.countDocuments(),

    User.countDocuments({
      isActive: true,
    }),

    Notice.countDocuments(),

    Complaint.countDocuments(),

    Complaint.countDocuments({
      status: {
        $in: ["pending", "in-progress"],
      },
    }),

    Event.countDocuments(),

    Job.countDocuments(),

    Job.countDocuments({
      status: "active",
    }),

    Business.countDocuments(),

    Business.countDocuments({
      status: "pending",
    }),

    Service.countDocuments(),

    CommunityPost.countDocuments(),

    EmergencyContact.countDocuments(),
  ]);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
    },

    notices: {
      total: totalNotices,
    },

    complaints: {
      total: totalComplaints,
      pending: pendingComplaints,
      resolved: Math.max(
        totalComplaints - pendingComplaints,
        0
      ),
    },

    events: {
      total: totalEvents,
    },

    jobs: {
      total: totalJobs,
      active: activeJobs,
    },

    businesses: {
      total: totalBusinesses,
      pending: pendingBusinesses,
      approved: await Business.countDocuments({
        status: "approved",
      }),
      rejected: await Business.countDocuments({
        status: "rejected",
      }),
      suspended: await Business.countDocuments({
        status: "suspended",
      }),
    },

    services: {
      total: totalServices,
    },

    community: {
      totalPosts: totalCommunityPosts,
    },

    emergencyContacts: {
      total: totalEmergencyContacts,
    },
  };
};

/**
 * Get recent dashboard activity
 */
const getRecentActivity = async (limit = 10) => {
  const safeLimit = Math.min(
    Math.max(Number(limit) || 10, 1),
    50
  );

  const [
    recentUsers,
    recentComplaints,
    recentEvents,
    recentJobs,
    recentBusinesses,
  ] = await Promise.all([
    User.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean(),

    Complaint.find()
      .select("title status createdAt")
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean(),

    Event.find()
      .select("title date createdAt")
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean(),

    Job.find()
      .select("title company status createdAt")
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean(),

    Business.find()
      .select("name status createdAt")
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean(),
  ]);

  return {
    users: recentUsers,
    complaints: recentComplaints,
    events: recentEvents,
    jobs: recentJobs,
    businesses: recentBusinesses,
  };
};

/**
 * Get complete dashboard data
 */
const getDashboardData = async (limit = 10) => {
  const [stats, recentActivity] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(limit),
  ]);

  return {
    stats,
    recentActivity,
  };
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
  getDashboardData,
};