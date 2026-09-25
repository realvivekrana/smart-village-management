const categoryColors = {
  police: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
  fire: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
  ambulance: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
  hospital: "bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800",
  electricity: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
  water: "bg-cyan-50 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-800",
};

const categoryIcons = {
  police: "👮", fire: "🚒", ambulance: "🚑", hospital: "🏥",
  electricity: "⚡", water: "💧", panchayat: "🏛️",
  disaster_relief: "🆘", women_helpline: "👩", child_helpline: "👶", other: "📞",
};

export default function EmergencyCard({ contact }) {
  const colorClass = categoryColors[contact.category] || "bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600";
  return (
    <div className={`rounded-xl border-2 p-4 ${colorClass}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{categoryIcons[contact.category] || "📞"}</span>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{contact.name}</h3>
          {contact.designation && <p className="text-xs text-gray-500">{contact.designation}</p>}
        </div>
        {contact.available24x7 && (
          <span className="ml-auto badge badge-green text-xs">24×7</span>
        )}
      </div>
      <a
        href={`tel:${contact.phone}`}
        className="block text-2xl font-bold text-primary-700 dark:text-primary-400 hover:text-primary-600 mb-1"
      >
        {contact.phone}
      </a>
      {contact.alternatePhone && (
        <a href={`tel:${contact.alternatePhone}`} className="block text-sm text-primary-600">
          Alt: {contact.alternatePhone}
        </a>
      )}
      {contact.description && <p className="text-xs text-gray-500 mt-1">{contact.description}</p>}
    </div>
  );
}
