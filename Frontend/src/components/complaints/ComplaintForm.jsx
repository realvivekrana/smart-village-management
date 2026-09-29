import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../common/Button";
import VoiceInput from "../common/VoiceInput";
import { COMPLAINT_CATEGORIES } from "../../utils/constants";
import { useLanguage } from "../../context/LanguageContext";

export default function ComplaintForm({ onSubmit, loading }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ title: "", description: "", category: "", priority: "medium", location: "" });
  const [images, setImages] = useState([]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // VoiceInput is not a native required/minLength field, so validate here
    if (form.description.trim().length < 20) {
      toast.error(t("complaintForm.descriptionTooShort"));
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
    images.forEach((img) => fd.append("images", img));
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="label">{t("complaintForm.title")} *</label>
        <input className="input" value={form.title} onChange={set("title")} required minLength={5} maxLength={200} placeholder={t("complaintForm.titlePlaceholder")} />
      </div>
      <div className="form-group">
        <label className="label">{t("complaintForm.description")} *</label>
        <VoiceInput
          value={form.description}
          onChange={(text) => setForm((p) => ({ ...p, description: text }))}
          placeholder={t("complaintForm.descriptionPlaceholder")}
          rows={5}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="label">{t("complaintForm.category")} *</label>
          <select className="input" value={form.category} onChange={set("category")} required>
            <option value="">{t("complaintForm.selectCategory")}</option>
            {COMPLAINT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{t(`complaintCategory.${c.value}`, c.label)}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="label">{t("complaintForm.priority")}</label>
          <select className="input" value={form.priority} onChange={set("priority")}>
            {["low", "medium", "high", "urgent"].map((p) => (
              <option key={p} value={p}>{t(`priority.${p}`, p)}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="label">{t("complaintForm.location")}</label>
        <input className="input" value={form.location} onChange={set("location")} placeholder={t("complaintForm.locationPlaceholder")} />
      </div>
      <div className="form-group">
        <label className="label">{t("complaintForm.attachPhotos")}</label>
        <input
          type="file"
          accept="image/*"
          multiple
          className="input"
          onChange={(e) => setImages(Array.from(e.target.files).slice(0, 3))}
        />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading} size="lg">{t("complaintForm.submit")}</Button>
      </div>
    </form>
  );
}