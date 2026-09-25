import { useEffect, useState } from "react";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";

const typeIcons = {
  temple: "🛕", school: "🏫", hospital: "🏥", park: "🌳",
  market: "🛒", government_office: "🏛️", water_body: "💧", other: "📍",
};

export default function VillagePlaces() {
  const [places, setPlaces] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api
      .get("/village")
      .then((res) => setPlaces(res.data.data.village.places || []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load places"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <Loader fullScreen />;
  if (error) return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;

  return (
    <div className="page-container">
      <h1 className="section-title mb-6">🗺️ Places of Interest</h1>
      {!places || places.length === 0 ? (
        <EmptyState icon="🗺️" title="No places added yet" description="Village places will show up here once added by the admin." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((p, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{typeIcons[p.type] || "📍"}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{p.name}</h3>
                  <span className="badge badge-blue capitalize text-xs">{p.type?.replace("_", " ")}</span>
                </div>
              </div>
              {p.description && <p className="text-sm text-gray-500 dark:text-gray-400">{p.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}