import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getBusinessById, updateBusiness } from "../../services/businessService";
import BusinessForm from "../../components/business/BusinessForm";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import BackButton from "../../components/common/BackButton";

export default function EditBusiness() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getBusinessById(id)
      .then((res) => setBusiness(res.data.data.business))
      .catch((err) =>
        setError(
          err.response?.status === 404
            ? "Ye business ab available nahi hai (shayad delete ho chuka hai)."
            : err.response?.data?.message || "Failed to load business"
        )
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleSubmit = async (formData) => {
    setSaving(true);
    try {
      const res = await updateBusiness(id, formData);
      toast.success(res.data?.message || "Business updated");
      navigate("/business-owner/my-business");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update business");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="page-container max-w-2xl">
      <div className="mb-6">
        <BackButton to="/business-owner/my-business" label="Back to My Businesses" />
        <h1 className="section-title mt-2">✏️ Edit Business</h1>
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : (
        <div className="card p-6">
          <BusinessForm initial={business} onSubmit={handleSubmit} loading={saving} />
        </div>
      )}
    </div>
  );
}