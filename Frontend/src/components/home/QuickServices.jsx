import { Link } from "react-router-dom";

const services = [
  { to: "/notices", icon: "📢", title: "Notices", desc: "Official announcements & updates", color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  { to: "/events", icon: "📅", title: "Events", desc: "Cultural & community events", color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
  { to: "/jobs", icon: "💼", title: "Jobs", desc: "Local job opportunities", color: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
  { to: "/businesses", icon: "🏪", title: "Businesses", desc: "Discover local shops & services", color: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
  { to: "/services", icon: "🔧", title: "Gov. Services", desc: "Certificates, licenses & more", color: "bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" },
  { to: "/citizen/complaints/create", icon: "📋", title: "File Complaint", desc: "Report an issue in your village", color: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
  { to: "/emergency", icon: "🚨", title: "Emergency", desc: "Important helpline numbers", color: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  { to: "/village-places", icon: "🗺️", title: "Village Map", desc: "Places of interest", color: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" },
];

export default function QuickServices() {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">🔧 Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {services.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="card p-5 text-center hover:shadow-md transition-shadow block"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl text-3xl mb-3 ${s.color}`}>
                {s.icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{s.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
