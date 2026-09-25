import { useState } from "react";
import Button from "../common/Button";
import { COMPLAINT_CATEGORIES } from "../../utils/constants";

export default function ComplaintForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ title: "", description: "", category: "", priority: "medium", location: "" });
  const [images, setImages] = useState([]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
    images.forEach((img) => fd.append("images", img));
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="label">Title *</label>
        <input className="input" value={form.title} onChange={set("title")} required minLength={5} maxLength={200} placeholder="Brief summary of the issue" />
      </div>
      <div className="form-group">
        <label className="label">Description *</label>
        <textarea className="input min-h-[120px]" value={form.description} onChange={set("description")} required minLength={20} placeholder="Describe the issue in detail..." />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="label">Category *</label>
          <select className="input" value={form.category} onChange={set("category")} required>
            <option value="">Select category</option>
            {COMPLAINT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Priority</label>
          <select className="input" value={form.priority} onChange={set("priority")}>
            {["low","medium","high","urgent"].map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="label">Location</label>
        <input className="input" value={form.location} onChange={set("location")} placeholder="Where is the issue located?" />
      </div>
      <div className="form-group">
        <label className="label">Attach Photos (max 3)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          className="input"
          onChange={(e) => setImages(Array.from(e.target.files).slice(0, 3))}
        />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading} size="lg">Submit Complaint</Button>
      </div>
    </form>
  );
}
