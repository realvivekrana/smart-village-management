import { Link } from "react-router-dom";

const quickContacts = [
  { name: "Police", phone: "100", icon: "👮" },
  { name: "Fire", phone: "101", icon: "🚒" },
  { name: "Ambulance", phone: "102", icon: "🚑" },
  { name: "All Emergencies", phone: "112", icon: "🆘" },
];

export default function EmergencySection() {
  return (
    <section className="py-12 bg-red-50 dark:bg-red-900/10 border-y border-red-100 dark:border-red-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">🚨 Emergency Contacts</h2>
          <Link to="/emergency" className="text-sm text-red-600 hover:underline font-medium">View all →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickContacts.map((c) => (
            <a
              key={c.name}
              href={`tel:${c.phone}`}
              className="card p-4 text-center hover:shadow-md transition-shadow border-red-100 dark:border-red-900/30"
            >
              <div className="text-3xl mb-2">{c.icon}</div>
              <div className="font-semibold text-gray-900 dark:text-white text-sm">{c.name}</div>
              <div className="text-xl font-bold text-red-600 mt-1">{c.phone}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
