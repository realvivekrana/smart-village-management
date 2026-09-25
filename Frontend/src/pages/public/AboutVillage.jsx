import { useEffect, useState } from "react";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function AboutVillage() {
  const [village, setVillage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api
      .get("/village")
      .then((res) => setVillage(res.data.data.village))
      .catch((err) => setError(err.response?.data?.message || "Failed to load village info"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <Loader fullScreen />;
  if (error) return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;
  if (!village) return null;

  return (
    <div className="page-container max-w-4xl space-y-6">
      <h1 className="section-title">🏡 About {village.name}</h1>

      {village.images?.[0]?.url && (
        <img src={village.images[0].url} alt={village.name} className="w-full h-64 object-cover rounded-xl" />
      )}

      <div className="card p-6">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{village.description || "No description added yet."}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-3xl mb-1">👥</div>
          <div className="text-xl font-bold text-primary-700 dark:text-primary-400">{village.population?.toLocaleString() || "—"}</div>
          <div className="text-xs text-gray-500">Population</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl mb-1">🗺️</div>
          <div className="text-xl font-bold text-primary-700 dark:text-primary-400">{village.area || "—"} sq km</div>
          <div className="text-xs text-gray-500">Area</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl mb-1">📍</div>
          <div className="text-xl font-bold text-primary-700 dark:text-primary-400">{village.district}</div>
          <div className="text-xs text-gray-500">District</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl mb-1">🏛️</div>
          <div className="text-xl font-bold text-primary-700 dark:text-primary-400">{village.state}</div>
          <div className="text-xs text-gray-500">State</div>
        </div>
      </div>

      {village.sarpanch?.name && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Gram Panchayat Head</h2>
          <p className="text-gray-700 dark:text-gray-300">👤 {village.sarpanch.name}</p>
          {village.sarpanch.phone && <p className="text-sm text-gray-500">📞 {village.sarpanch.phone}</p>}
        </div>
      )}
    </div>
  );
}