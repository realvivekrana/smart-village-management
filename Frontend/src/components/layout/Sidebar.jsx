import { NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useLanguage } from "../../context/LanguageContext";

const adminLinks = [
  { to: "/admin/dashboard", icon: "📊", label: "Dashboard", key: "sidebar.dashboard" },
  { to: "/admin/users", icon: "👥", label: "Users", key: "sidebar.users" },
  { to: "/admin/complaints", icon: "📋", label: "Complaints", key: "sidebar.complaints" },
  { to: "/admin/businesses", icon: "🏪", label: "Businesses", key: "sidebar.businesses" },
  { to: "/admin/events", icon: "📅", label: "Events", key: "sidebar.events" },
  { to: "/admin/jobs", icon: "💼", label: "Jobs", key: "sidebar.jobs" },
  { to: "/admin/notices", icon: "📢", label: "Notices", key: "sidebar.notices" },
  { to: "/admin/services", icon: "🔧", label: "Services", key: "sidebar.services" },
  { to: "/admin/emergency", icon: "🚨", label: "Emergency", key: "sidebar.emergency" },
  { to: "/admin/village-features", icon: "🌾", label: "Village Features", key: "sidebar.villageFeatures" },
  { to: "/admin/government-contacts", icon: "🏛️", label: "Government Contacts", key: "sidebar.governmentContacts" },
  { to: "/admin/community", icon: "💬", label: "Community", key: "sidebar.community" },
  { to: "/admin/reports", icon: "📈", label: "Reports", key: "sidebar.reports" },
  { to: "/admin/village-settings", icon: "⚙️", label: "Village Settings", key: "sidebar.villageSettings" },
  { to: "/admin/village-directory", icon: "🗂️", label: "Village Directory", key: "sidebar.villageDirectory" },
  { to: "/admin/households", icon: "🏠", label: "Households", key: "sidebar.households" },
  { to: "/admin/submissions", icon: "✅", label: "Citizen Approvals", key: "sidebar.submissions" },
];

const citizenLinks = [
  { to: "/citizen/dashboard", icon: "📊", label: "Dashboard", key: "sidebar.dashboard" },
  { to: "/citizen/complaints", icon: "📋", label: "My Complaints", key: "sidebar.myComplaints" },
  { to: "/citizen/complaints/create", icon: "➕", label: "File Complaint", key: "sidebar.fileComplaint" },
  { to: "/citizen/notices", icon: "📢", label: "Notices", key: "sidebar.notices" },
  { to: "/citizen/events", icon: "📅", label: "Events", key: "sidebar.events" },
  { to: "/citizen/sos", icon: "🆘", label: "Emergency SOS", key: "sidebar.emergencySos" },
  { to: "/citizen/village-services", icon: "🌾", label: "Village Services", key: "sidebar.villageServices" },
  { to: "/citizen/applications", icon: "📝", label: "My Yojana Applications", key: "sidebar.myApplications" },
  { to: "/citizen/job-applications", icon: "🧑‍💼", label: "My Job Applications", key: "sidebar.myJobApplications" },
  { to: "/citizen/household", icon: "🏠", label: "My Household", key: "sidebar.myHousehold" },
  { to: "/citizen/posts", icon: "💬", label: "My Posts", key: "sidebar.myPosts" },
  { to: "/citizen/bazaar", icon: "🛒", label: "My Bazaar Posts", key: "sidebar.myBazaar" },
  { to: "/citizen/photos", icon: "📷", label: "My Photos", key: "sidebar.myPhotos" },
  { to: "/business-owner/my-business", icon: "🏪", label: "My Business", key: "sidebar.myBusiness" },
  { to: "/business-owner/add-business", icon: "➕", label: "Add Business", key: "sidebar.addBusiness" },
  { to: "/business-owner/my-jobs", icon: "💼", label: "My Jobs", key: "sidebar.myJobs" },
  { to: "/citizen/notifications", icon: "🔔", label: "Notifications", key: "sidebar.notifications" },
  { to: "/citizen/profile", icon: "👤", label: "Profile", key: "sidebar.profile" },
];

function getLinks(role) {
  if (role === "admin") return adminLinks;
  return citizenLinks;
}

export default function Sidebar({ onClose }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const links = getLinks(user?.role);

  return (
    <aside className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 w-64">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-gray-700">
        <span className="font-bold text-primary-700 dark:text-primary-400 text-lg">🏘️ {t("layout.brand")}</span>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-gray-600">✕</button>
        )}
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{t(`roles.${user?.role}`, user?.role?.replace("_", " "))}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              }`
            }
          >
            <span className="text-base">{link.icon}</span>
            <span>{t(link.key, link.label)}</span>
          </NavLink>
        ))}
      </nav>

      {/* Back to site */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
        <a
          href="/"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400"
        >
          {t("layout.backToSite")}
        </a>
      </div>
    </aside>
  );
}