import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">🏘️ Smart Village</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Connecting residents, services, and government for a smarter village community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About Village" },
                { to: "/notices", label: "Notices" },
                { to: "/events", label: "Events" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-3">Services</h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/businesses", label: "Local Businesses" },
                { to: "/jobs", label: "Jobs" },
                { to: "/services", label: "Government Services" },
                { to: "/emergency", label: "Emergency Contacts" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-white font-semibold mb-3">Community</h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/register", label: "Join Now" },
                { to: "/login", label: "Login" },
                { to: "/citizen/complaints/create", label: "File Complaint" },
                { to: "/village-places", label: "Village Places" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Smart Village Management. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            🚨 Emergency:{" "}
            <a href="tel:112" className="text-red-400 font-semibold hover:text-red-300">
              112
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
