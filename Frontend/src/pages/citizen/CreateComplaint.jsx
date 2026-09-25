import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createComplaint } from "../../services/complaintService";
import ComplaintForm from "../../components/complaints/ComplaintForm";

export default function CreateComplaint() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await createComplaint(formData);
      toast.success("Complaint submitted successfully!");
      navigate("/citizen/complaints");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <h1 className="section-title mb-6">📋 File a Complaint</h1>
      <div className="card p-6">
        <ComplaintForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}