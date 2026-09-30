import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { createNotice, getNoticeById, updateNotice } from "../../services/noticeService";
import BackButton, { useGoBack } from "../../components/common/BackButton";
import VoiceInput from "../../components/common/VoiceInput";
import Loader from "../../components/common/Loader";
import { NOTICE_CATEGORIES, prettyCategory } from "../../utils/submissionOptions";
import { useLanguage } from "../../context/LanguageContext";

export default function AddNotice() {
  const navigate = useNavigate();
  const goBack = useGoBack("/citizen/dashboard");
  const { t } = useLanguage();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "general", expiresAt: "" });

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  // edit mode: load the citizen's own notice into the form
  useEffect(() => {
    if (!isEdit) return;
    getNoticeById(id)
      .then((res) => {
        const n = res.data?.data?.notice;
        if (!n) throw new Error("not found");
        setForm({
          title: n.title || "",
          content: n.content || "",
          category: n.category || "general",
          expiresAt: n.expiresAt ? String(n.expiresAt).slice(0, 10) : "",
        });
      })
      .catch(() => {
        toast.error("Could not load this notice");
        navigate("/citizen/my-submissions", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const title = form.title.trim();
    const content = form.content.trim();

    // VoiceInput is not a native field, so check lengths here
    if (title.length < 5) return toast.error("Title must be at least 5 characters");
    if (content.length < 10) return toast.error("Details must be at least 10 characters");

    const payload = { title, content, category: form.category };
    if (isEdit && !form.expiresAt) payload.expiresAt = null;
    if (form.expiresAt) {
      // date picker gives YYYY-MM-DD; expire at the end of that day (local time)
      const end = new Date(`${form.expiresAt}T23:59:59`);
      if (end <= new Date()) return toast.error("Expiry date must be in the future");
      payload.expiresAt = end.toISOString();
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateNotice(id, payload);
        toast.success("Notice updated");
      } else {
        await createNotice(payload);
        toast.success("Notice published! Everyone can see it now.");
      }
      navigate("/citizen/my-submissions", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || (isEdit ? "Could not update the notice" : "Could not submit the notice"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container max-w-2xl">
      <div className="mb-4">
        <BackButton fallback="/citizen/dashboard" label={t("submit.back", "Back")} />
      </div>
      <h1 className="section-title mb-2">📝 {isEdit ? "Edit Notice" : t("submit.addNotice", "Add Notice")}</h1>
      <p className="mb-5 rounded-lg bg-primary-50 p-3 text-sm text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
        {t("submit.approvalInfo", "Your post goes live for everyone right away. The village admin can remove anything that breaks the rules.")}
      </p>

      <form onSubmit={handleSubmit} className="card space-y-4 p-4 sm:p-6">
        <div className="form-group">
          <label className="label" htmlFor="notice-title">Title *</label>
          <input
            id="notice-title"
            className="input"
            value={form.title}
            onChange={set("title")}
            minLength={5}
            maxLength={200}
            required
            placeholder="e.g. Water supply will be off on Sunday"
          />
        </div>

        <div className="form-group">
          <label className="label">Details *</label>
          <VoiceInput
            value={form.content}
            onChange={(text) => setForm((p) => ({ ...p, content: text }))}
            placeholder="Write the full notice here..."
            rows={6}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="form-group">
            <label className="label" htmlFor="notice-category">Category</label>
            <select id="notice-category" className="input" value={form.category} onChange={set("category")}>
              {NOTICE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{prettyCategory(c)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label" htmlFor="notice-expiry">Valid until (optional)</label>
            <input id="notice-expiry" type="date" className="input" value={form.expiresAt} onChange={set("expiresAt")} />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={goBack} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? t("submit.submitting", "Submitting...") : isEdit ? "Save changes" : t("submit.submitNotice", "Submit Notice")}
          </button>
        </div>
      </form>
    </div>
  );
}