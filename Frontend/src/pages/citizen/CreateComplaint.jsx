import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createComplaint } from "../../services/complaintService";
import ComplaintForm from "../../components/complaints/ComplaintForm";
import BackButton from "../../components/common/BackButton";
import { useLanguage } from "../../context/LanguageContext";

export default function CreateComplaint() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await createComplaint(formData);
      toast.success(t("complaintForm.submitted"));
      navigate("/citizen/complaints");
    } catch (err) {
      toast.error(err.response?.data?.message || t("complaintForm.submitFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <div className="mb-4">
        <BackButton to="/citizen/complaints" label={t("complaintForm.backToMy")} />
      </div>
      <h1 className="section-title mb-6">📋 {t("complaintForm.pageTitle")}</h1>
      <div className="card p-6">
        <ComplaintForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}