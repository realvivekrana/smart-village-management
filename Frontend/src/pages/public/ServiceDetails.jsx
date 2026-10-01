import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getServiceById } from "../../services/serviceService";
import ServiceDetailsView from "../../components/services/ServiceDetails";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import BackButton from "../../components/common/BackButton";
import SEO from "../../components/common/SEO";

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
      .catch((err) =>
        setError(
          err.response?.data?.message || "Failed to load service"
        )
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) return <Loader fullScreen />;

  if (error) {
    return (
      <div className="page-container">
        <div className="mb-4">
          <BackButton to="/services" label="Back to Services" />
        </div>
        <ErrorMessage message={error} onRetry={load} />
      </div>
    );
  }

  if (!service) return null;

  const serviceName =
    service.name || service.title || "Village Service";

  const serviceDescription =
    service.description ||
    `Get complete information about ${serviceName}, including available details and assistance for this village service.`;

  return (
    <>
      <SEO
        title={serviceName}
        description={serviceDescription.slice(0, 155)}
        path={`/services/${id}`}
      />

      <div className="page-container max-w-3xl">
        <div className="mb-4">
          <BackButton to="/services" label="Back to Services" />
        </div>

        <ServiceDetailsView service={service} />
      </div>
    </>
  );
}