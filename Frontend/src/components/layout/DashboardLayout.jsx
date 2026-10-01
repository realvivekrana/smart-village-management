import ChatAssistant from "../assistant/ChatAssistant";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "./Sidebar";
import { useGoBack } from "../common/BackButton";
import { ThemeContext } from "../../context/ThemeContext";
import { NotificationContext } from "../../context/NotificationContext";
import useAuth from "../../hooks/useAuth";
import { useLanguage } from "../../context/LanguageContext";
import { LanguageToggle } from "../common/LanguageSwitcher";

// Home screens of each dashboard: no back arrow needed there.
const HOME_PATHS = ["/citizen/dashboard", "/admin/dashboard", "/business-owner/dashboard"];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { unreadCount } = useContext(NotificationContext);
  const { logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const mainRef = useRef(null);

  const homePath = pathname.startsWith("/admin") ? "/admin/dashboard" : "/citizen/dashboard";
  const goBack = useGoBack(homePath);
  const showBack = !HOME_PATHS.includes(pathname);

  // Every page change: start at the top and close the mobile drawer.
  // (The scrolling element here is <main>, not the window.)
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 });
    setSidebarOpen(false);
  }, [pathname]);

  // Esc closes the drawer
  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setSidebarOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  const handleLogout = async () => {
    setSidebarOpen(false);
    await logout();
    toast.success(t("layout.loggedOut"));
    navigate("/login");
  };

  const iconBtn =
    "flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800";

  return (
    <div className="flex h-dvh bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 h-full">
            <Sidebar onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 h-14 flex items-center justify-between gap-1">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label={t("layout.openMenu", "Open menu")}
              className={`lg:hidden ${iconBtn}`}
            >
              ☰
            </button>
            {showBack && (
              <button
                type="button"
                onClick={goBack}
                aria-label={t("submit.back", "Back")}
                className={`lg:hidden text-lg font-semibold ${iconBtn}`}
              >
                ←
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            <LanguageToggle />
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={t("layout.toggleTheme")}
              className={iconBtn}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <Link
              to="/citizen/notifications"
              aria-label={t("layout.notifications", "Notifications")}
              className={`relative ${iconBtn}`}
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-[1rem] px-0.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            {/* On phones Logout lives in the drawer to keep this bar from overflowing */}
            <button
              type="button"
              onClick={handleLogout}
              className="hidden sm:inline-flex text-sm text-gray-500 hover:text-red-500 px-2 py-1"
            >
              {t("layout.logout")}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <ChatAssistant />
    </div>
  );
}