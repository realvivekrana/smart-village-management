import { NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const adminLinks = [
  { to: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/admin/users", icon: "👥", label: "Users" },
  { to: "/admin/complaints", icon: "📋", label: "Complaints" },
  { to: "/admin/businesses", icon: "🏪", label: "Businesses" },
  { to: "/admin/events", icon: "📅", label: "Events" },
  { to: "/admin/jobs", icon: "💼", label: "Jobs" },
  { to: "/admin/notices", icon: "📢", label: "Notices" },
  { to: "/admin/services", icon: "🔧", label: "Services" },
  { to: "/admin/emergency", icon: "🚨", label: "Emergency" },
  { to: "/admin/community", icon: "💬", label: "Community" },
  { to: "/admin/reports", icon: "📈", label: "Reports" },
  { to: "/admin/village-settings", icon: "⚙️", label: "Village Settings" },
];

const businessLinks = [
  { to: "/business-owner/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/business-owner/my-business", icon: "🏪", label: "My Business" },
  { to: "/business-owner/add-business", icon: "➕", label: "Add Business" },
  { to: "/business-owner/my-jobs", icon: "💼", label: "My Jobs" },
];

const citizenLinks = [
  { to: "/citizen/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/citizen/complaints", icon: "📋", label: "My Complaints" },
  { to: "/citizen/complaints/create", icon: "➕", label: "File Complaint" },
  { to: "/citizen/posts", icon: "💬", label: "My Posts" },
  { to: "/citizen/notifications", icon: "🔔", label: "Notifications" },
  { to: "/citizen/profile", icon: "👤", label: "Profile" },
];

function getLinks(role) {
  if (["admin", "super_admin"].includes(role)) return adminLinks;
  if (role === "business_owner") return businessLinks;
  return citizenLinks;
}

export default function Sidebar({ onClose }) {
  const { user } = useAuth();
  const links = getLinks(user?.role);

  return (
    <aside className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 w-64">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-gray-700">
        <span className="font-bold text-primary-700 dark:text-primary-400 text-lg">🏘️ Kakarcholi</span>
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
            <p className="text-xs text-gray-500 capitalize">{user?.role?.replace("_", " ")}</p>
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
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Back to site */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
        <a
          href="/"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400"
        >
          ← Back to Site
        </a>
      </div>
    </aside>
  );
}
