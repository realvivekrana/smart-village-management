/*
|--------------------------------------------------------------------------
| Notification -> destination page
|--------------------------------------------------------------------------
| Notification par click karne se user ko wahi page dikhna chahiye jahan
| us action ka result hai (complaint status, job application, notice, ...).
|
| Priority:
|   1. type ke hisaab se fixed mapping (purani notifications ke saved link
|      galat/generic hon tab bhi sahi page milta hai)
|   2. backend ka saved `link` (system/general notifications ke liye)
|   3. refModel + refId se fallback
|   4. null  -> kahin nahi jaana (sirf read mark hoga)
*/

const isInternalPath = (path) =>
  typeof path === "string" && path.startsWith("/") && !path.startsWith("//");

const isAdminPath = (path) => path === "/admin" || path.startsWith("/admin/");

export function getNotificationTarget(notification, user) {
  if (!notification) return null;

  const admin = user?.role === "admin";
  const id = notification.refId ? String(notification.refId) : "";
  const { type, refModel, link } = notification;

  const highlight = (path) => (id ? `${path}?highlight=${id}` : path);
  const noticePath = () => (id ? `${admin ? "" : "/citizen"}/notices/${id}` : admin ? "/notices" : "/citizen/notices");
  const eventPath = () => (id ? `${admin ? "" : "/citizen"}/events/${id}` : admin ? "/events" : "/citizen/events");

  // 1. type based
  switch (type) {
    case "complaint_update":
      return highlight("/citizen/complaints");

    case "job_application":
      return refModel === "JobApplication"
        ? highlight("/citizen/job-applications")
        : "/citizen/job-applications";

    case "new_notice":
      return noticePath();

    case "new_event":
      return eventPath();

    case "new_job":
      return id ? `/jobs/${id}` : "/jobs";

    case "business_status":
      return "/business-owner/my-business";

    case "community_comment":
    case "community_like":
      return id ? `/community?post=${id}` : "/community";

    default:
      break;
  }

  // 2. saved link (admin-only pages sirf admin ko)
  if (isInternalPath(link) && (admin || !isAdminPath(link))) {
    return link;
  }

  // 3. refModel fallback
  switch (refModel) {
    case "Complaint":
      return highlight("/citizen/complaints");
    case "Job":
      return id ? `/jobs/${id}` : "/jobs";
    case "JobApplication":
      return highlight("/citizen/job-applications");
    case "Notice":
      return admin ? "/admin/notices" : noticePath();
    case "Event":
      return admin ? "/admin/events" : eventPath();
    case "Business":
      return admin ? "/admin/businesses" : "/business-owner/my-business";
    case "CommunityPost":
      return id ? `/community?post=${id}` : "/community";
    case "Listing":
      return highlight("/citizen/bazaar");
    case "GalleryPhoto":
      return highlight("/citizen/photos");
    default:
      return null;
  }
}