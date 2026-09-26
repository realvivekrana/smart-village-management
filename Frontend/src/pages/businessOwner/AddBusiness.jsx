import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { createBusiness } from "../../services/businessService";
import BusinessForm from "../../components/business/BusinessForm";

export default function AddBusiness() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await createBusiness(formData);
      toast.success("Business registered! It will appear once approved by an admin.");
      navigate("/business-owner/my-business");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not register business");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <div className="mb-6">
        <Link to="/business-owner/my-business" className="text-sm text-primary-600 hover:underline">← My Businesses</Link>
        <h1 className="section-title mt-2">➕ Register a Business</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Tell villagers about your business. Your listing goes live once an admin approves it.
        </p>
      </div>
      <div className="card p-6">
        <BusinessForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}