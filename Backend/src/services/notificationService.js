const Notification = require("../models/Notification");
const logger = require("../utils/logger");

/*
|--------------------------------------------------------------------------
| Create a single notification for one user
|--------------------------------------------------------------------------
*/

const createNotification = async ({
  recipient,
  title,
  message,
  type = "general",
  link = "",
  refModel = null,
  refId = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      title,
      message,
      type,
      link,
      refModel,
      refId,
    });
    return notification;
  } catch (error) {
    // Notifications are non-critical — log and swallow
    logger.error("Failed to create notification:", error.message);
    return null;
  }
};

/*
|--------------------------------------------------------------------------
| Broadcast notification to multiple users
|--------------------------------------------------------------------------
*/

const broadcastNotification = async (recipientIds, payload) => {
  if (!recipientIds || recipientIds.length === 0) return [];

  try {
    const docs = recipientIds.map((recipientId) => ({
      recipient: recipientId,
      ...payload,
    }));

    const result = await Notification.insertMany(docs, { ordered: false });
    return result;
  } catch (error) {
    logger.error("Failed to broadcast notifications:", error.message);
    return [];
  }
};

/*
|--------------------------------------------------------------------------
| Notify: Complaint Status Changed
|--------------------------------------------------------------------------
*/

const notifyComplaintUpdate = async (userId, complaint) => {
  return createNotification({
    recipient: userId,
    title: "Complaint Status Updated",
    message: `Your complaint "${complaint.title}" status changed to: ${complaint.status.replace("_", " ").toUpperCase()}`,
    type: "complaint_update",
    link: `/citizen/complaints`,
    refModel: "Complaint",
    refId: complaint._id,
  });
};

/*
|--------------------------------------------------------------------------
| Notify: Job Application Status Changed
|--------------------------------------------------------------------------
*/

const notifyJobApplicationUpdate = async (userId, job, status) => {
  const messages = {
    reviewed: `Your application for "${job.title}" at ${job.company} has been reviewed.`,
    shortlisted: `Great news! You've been shortlisted for "${job.title}" at ${job.company}.`,
    rejected: `Your application for "${job.title}" at ${job.company} was not selected.`,
    hired: `Congratulations! You've been hired for "${job.title}" at ${job.company}!`,
  };

  return createNotification({
    recipient: userId,
    title: "Job Application Update",
    message: messages[status] || `Your job application status has been updated.`,
    type: "job_application",
    link: `/citizen/dashboard`,
    refModel: "Job",
    refId: job._id,
  });
};

/*
|--------------------------------------------------------------------------
| Notify: New Notice Published
|--------------------------------------------------------------------------
*/

const notifyNewNotice = async (recipientIds, notice) => {
  return broadcastNotification(recipientIds, {
    title: "New Notice Published",
    message: `A new notice has been published: "${notice.title}"`,
    type: "new_notice",
    link: `/notices/${notice._id}`,
    refModel: "Notice",
    refId: notice._id,
  });
};

/*
|--------------------------------------------------------------------------
| Notify: New Event Published
|--------------------------------------------------------------------------
*/

const notifyNewEvent = async (recipientIds, event) => {
  return broadcastNotification(recipientIds, {
    title: "New Event Announced",
    message: `A new event has been announced: "${event.title}"`,
    type: "new_event",
    link: `/events/${event._id}`,
    refModel: "Event",
    refId: event._id,
  });
};

/*
|--------------------------------------------------------------------------
| Notify: Business Status Changed
|--------------------------------------------------------------------------
*/

const notifyBusinessStatus = async (ownerId, business) => {
  return createNotification({
    recipient: ownerId,
    title: `Business ${business.status === "approved" ? "Approved" : "Status Updated"}`,
    message: `Your business "${business.name}" has been ${business.status}.`,
    type: "business_status",
    link: `/business-owner/my-business`,
    refModel: "Business",
    refId: business._id,
  });
};

/*
|--------------------------------------------------------------------------
| Notify: New Comment on Community Post
|--------------------------------------------------------------------------
*/

const notifyNewComment = async (postAuthorId, commenter, post) => {
  // Don't notify if user is commenting on their own post
  if (String(postAuthorId) === String(commenter._id)) return null;

  return createNotification({
    recipient: postAuthorId,
    title: "New Comment on Your Post",
    message: `${commenter.name} commented on your community post.`,
    type: "community_comment",
    link: `/community`,
    refModel: "CommunityPost",
    refId: post._id,
  });
};

/*
|--------------------------------------------------------------------------
| Notify: New Job Posted (to all citizens)
|--------------------------------------------------------------------------
*/

const notifyNewJob = async (recipientIds, job) => {
  return broadcastNotification(recipientIds, {
    title: "New Job Opportunity",
    message: `A new job is available: "${job.title}" at ${job.company}`,
    type: "new_job",
    link: `/jobs/${job._id}`,
    refModel: "Job",
    refId: job._id,
  });
};

module.exports = {
  createNotification,
  broadcastNotification,
  notifyComplaintUpdate,
  notifyJobApplicationUpdate,
  notifyNewNotice,
  notifyNewEvent,
  notifyBusinessStatus,
  notifyNewComment,
  notifyNewJob,
};
