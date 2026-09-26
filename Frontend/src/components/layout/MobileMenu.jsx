import { NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/notices", label: "Notices" },
  { to: "/events", label: "Events" },
  { to: "/jobs", label: "Jobs" },
  { to: "/businesses", label: "Businesses" },
  { to: "/services", label: "Services" },
  { to: "/emergency", label: "Emergency" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About Village" },
  { to: "/contact", label: "Contact" },
];

export default function MobileMenu({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <nav className="absolute top-0 left-0 bottom-0 w-72 bg-white dark:bg-gray-900 shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-gray-700">
          <span className="font-bold text-primary-700 dark:text-primary-400 text-lg">🏘️ Kakarcholi</span>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="py-3 px-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                  isActive
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {user ? (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role?.replace("_", " ")}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); onClose(); }}
              className="w-full btn-danger text-sm"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-2">
            <NavLink to="/login" onClick={onClose} className="btn-secondary text-sm text-center">Login</NavLink>
            <NavLink to="/register" onClick={onClose} className="btn-primary text-sm text-center">Register</NavLink>
          </div>
        )}
      </nav>
    </div>
  );
}
