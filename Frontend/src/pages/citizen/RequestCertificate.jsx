import { useState } from "react";
import VoiceInput from "../../components/common/VoiceInput";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createCertificate } from "../../services/certificateService";
import BackButton from "../../components/common/BackButton";
import useAuth from "../../hooks/useAuth";
import { CERTIFICATE_TYPES } from "../../utils/constants";

export default function RequestCertificate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({
    type: "residence",
    applicantName: user?.name || "",
    fatherName: "",
    address: "",
    purpose: "",
  });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      files.slice(0, 3).forEach((f) => data.append("documents", f));
      await createCertificate(data);
      toast.success("Certificate request submitted!");
      navigate("/citizen/certificates");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <div className="mb-4"><BackButton to="/citizen/certificates" label="Back to My Certificates" /></div>
      <h1 className="section-title mb-6">📜 Request a Certificate</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label">Certificate Type</label>
          <select name="type" value={form.type} onChange={onChange} className="input">
            {CERTIFICATE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Applicant Name</label>
            <input name="applicantName" value={form.applicantName} onChange={onChange} className="input" required minLength={2} maxLength={100} />
          </div>
          <div>
            <label className="label">Father / Husband Name</label>
            <input name="fatherName" value={form.fatherName} onChange={onChange} className="input" maxLength={100} />
          </div>
        </div>
        <div>
          <label className="label">Address</label>
          <input name="address" value={form.address} onChange={onChange} className="input" required maxLength={300} />
        </div>
        <div>
          <label className="label">Purpose (kis kaam ke liye chahiye)</label>
          <VoiceInput value={form.purpose} onChange={(text) => setForm((f) => ({ ...f, purpose: text }))} rows={3} required minLength={10} maxLength={500} />
        </div>
        <div>
          <label className="label">Supporting documents (max 3 images, optional)</label>
          <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files))} className="input" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}