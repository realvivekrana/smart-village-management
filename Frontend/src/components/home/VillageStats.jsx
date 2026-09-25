import { useEffect, useState } from "react";
import api from "../../services/api";

export default function VillageStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Try to load public stats from the health endpoint or dashboard
    api.get("/village").then((res) => {
      const v = res.data.data.village;
      setStats([
        { label: "Population", value: v.population?.toLocaleString() || "—", icon: "👥" },
        { label: "Area (sq km)", value: v.area || "—", icon: "🗺️" },
        { label: "District", value: v.district, icon: "📍" },
        { label: "State", value: v.state, icon: "🏛️" },
      ]);
    }).catch(() => {
      setStats([
        { label: "Active Users", value: "500+", icon: "👥" },
        { label: "Complaints Resolved", value: "200+", icon: "✅" },
        { label: "Local Businesses", value: "50+", icon: "🏪" },
        { label: "Government Services", value: "20+", icon: "🔧" },
      ]);
    });
  }, []);

  if (!stats) return null;

  return (
    <section className="bg-white dark:bg-gray-800 py-12 border-b border-gray-100 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-primary-700 dark:text-primary-400">{s.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
