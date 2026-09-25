import { useState } from "react";
import Button from "../common/Button";
import { JOB_CATEGORIES, JOB_TYPES } from "../../utils/constants";

export default function JobForm({ initial = {}, onSubmit, loading }) {
  const fmt = (d) => d ? new Date(d).toISOString().slice(0, 10) : "";
  const [form, setForm] = useState({
    title: initial.title || "",
    description: initial.description || "",
    requirements: initial.requirements || "",
    company: initial.company || "",
    category: initial.category || "other",
    type: initial.type || "full_time",
    location: initial.location || "",
    openings: initial.openings || 1,
    applyBy: fmt(initial.applyBy),
    "salary.min": initial.salary?.min || "",
    "salary.max": initial.salary?.max || "",
    "salary.period": initial.salary?.period || "per_month",
    "salary.isNegotiable": initial.salary?.isNegotiable || false,
  });

  const set = (k) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [k]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: form.title, description: form.description, requirements: form.requirements,
      company: form.company, category: form.category, type: form.type,
      location: form.location, openings: Number(form.openings), applyBy: form.applyBy,
      salary: {
        min: form["salary.min"] ? Number(form["salary.min"]) : null,
        max: form["salary.max"] ? Number(form["salary.max"]) : null,
        period: form["salary.period"],
        isNegotiable: form["salary.isNegotiable"],
      },
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="label">Job Title *</label>
          <input className="input" value={form.title} onChange={set("title")} required />
        </div>
        <div className="form-group">
          <label className="label">Company / Organization *</label>
          <input className="input" value={form.company} onChange={set("company")} required />
        </div>
      </div>
      <div className="form-group">
        <label className="label">Description *</label>
        <textarea className="input min-h-[120px]" value={form.description} onChange={set("description")} required />
      </div>
      <div className="form-group">
        <label className="label">Requirements</label>
        <textarea className="input min-h-[100px]" value={form.requirements} onChange={set("requirements")} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="form-group">
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={set("category")}>
            {JOB_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Type</label>
          <select className="input" value={form.type} onChange={set("type")}>
            {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Openings *</label>
          <input type="number" className="input" value={form.openings} onChange={set("openings")} min={1} required />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="label">Location *</label>
          <input className="input" value={form.location} onChange={set("location")} required />
        </div>
        <div className="form-group">
          <label className="label">Apply By *</label>
          <input type="date" className="input" value={form.applyBy} onChange={set("applyBy")} required />
        </div>
        <div className="form-group">
          <label className="label">Min Salary (₹)</label>
          <input type="number" className="input" value={form["salary.min"]} onChange={set("salary.min")} min={0} />
        </div>
        <div className="form-group">
          <label className="label">Max Salary (₹)</label>
          <input type="number" className="input" value={form["salary.max"]} onChange={set("salary.max")} min={0} />
        </div>
        <div className="form-group">
          <label className="label">Salary Period</label>
          <select className="input" value={form["salary.period"]} onChange={set("salary.period")}>
            {["per_day","per_week","per_month","per_year","fixed"].map((p) => (
              <option key={p} value={p}>{p.replace("_"," ")}</option>
            ))}
          </select>
        </div>
        <div className="form-group flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form["salary.isNegotiable"]} onChange={set("salary.isNegotiable")} />
            <span className="text-sm text-gray-700 dark:text-gray-300">Salary is negotiable</span>
          </label>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>{initial._id ? "Update Job" : "Post Job"}</Button>
      </div>
    </form>
  );
}
