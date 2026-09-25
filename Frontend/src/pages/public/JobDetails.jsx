import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getJobById, applyForJob } from "../../services/jobService";
import JobDetailsView from "../../components/jobs/JobDetails";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState(null);
  const [applying, setApplying] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    getJobById(id)
      .then((res) => setJob(res.data.data.job))
      .catch((err) => setError(err.response?.data?.message || "Failed to load job"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      const formData = new FormData();
      formData.append("coverLetter", coverLetter);
      if (resume) formData.append("resume", resume);
      await applyForJob(id, formData);
      toast.success("Application submitted!");
      setShowModal(false);
      setCoverLetter("");
      setResume(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit application");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error) return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;
  if (!job) return null;

  return (
    <div className="page-container max-w-3xl">
      <JobDetailsView job={job} onApply={() => setShowModal(true)} applying={applying} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Apply for ${job.title}`}>
        <form onSubmit={handleApplySubmit} className="space-y-4">
          <div>
            <label className="label">Cover Letter</label>
            <textarea
              className="input"
              rows={4}
              placeholder="Tell them why you're a good fit..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Resume (optional)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResume(e.target.files[0])}
              className="input"
            />
          </div>
          <Button type="submit" loading={applying} className="w-full">Submit Application</Button>
        </form>
      </Modal>
    </div>
  );
}