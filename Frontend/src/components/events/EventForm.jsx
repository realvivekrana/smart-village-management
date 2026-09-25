import { useState } from "react";
import Button from "../common/Button";
import { EVENT_CATEGORIES } from "../../utils/constants";

export default function EventForm({ initial = {}, onSubmit, loading }) {
  const fmt = (d) => d ? new Date(d).toISOString().slice(0, 16) : "";
  const [form, setForm] = useState({
    title: initial.title || "",
    description: initial.description || "",
    category: initial.category || "other",
    startDate: fmt(initial.startDate),
    endDate: fmt(initial.endDate),
    location: initial.location || "",
    organizer: initial.organizer || "",
  });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="label">Title *</label>
        <input className="input" value={form.title} onChange={set("title")} required minLength={5} />
      </div>
      <div className="form-group">
        <label className="label">Description *</label>
        <textarea className="input min-h-[120px]" value={form.description} onChange={set("description")} required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={set("category")}>
            {EVENT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Organizer</label>
          <input className="input" value={form.organizer} onChange={set("organizer")} />
        </div>
        <div className="form-group">
          <label className="label">Start Date & Time *</label>
          <input type="datetime-local" className="input" value={form.startDate} onChange={set("startDate")} required />
        </div>
        <div className="form-group">
          <label className="label">End Date & Time *</label>
          <input type="datetime-local" className="input" value={form.endDate} onChange={set("endDate")} required />
        </div>
      </div>
      <div className="form-group">
        <label className="label">Location *</label>
        <input className="input" value={form.location} onChange={set("location")} required />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>{initial._id ? "Update Event" : "Create Event"}</Button>
      </div>
    </form>
  );
}
