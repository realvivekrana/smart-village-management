import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getServiceById } from "../../services/serviceService";
import ServiceDetailsView from "../../components/services/ServiceDetails";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function ServiceDetails() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getServiceById(id)
      .then((res) => setService(res.data.data.service))
      .catch((err) => setError(err.response?.data?.message || "Failed to load service"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) return <Loader fullScreen />;
  if (error) return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;
  if (!service) return null;

  return (
    <div className="page-container max-w-3xl">
      <ServiceDetailsView service={service} />
    </div>
  );
}