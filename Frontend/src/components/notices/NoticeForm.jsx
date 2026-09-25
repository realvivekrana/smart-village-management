import { useState } from "react";
import Button from "../common/Button";
import { NOTICE_CATEGORIES } from "../../utils/constants";

export default function NoticeForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    title: initial.title || "",
    content: initial.content || "",
    category: initial.category || "general",
    priority: initial.priority || "normal",
    expiresAt: initial.expiresAt ? initial.expiresAt.slice(0, 10) : "",
  });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.expiresAt) delete payload.expiresAt;
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="label">Title *</label>
        <input className="input" value={form.title} onChange={set("title")} required minLength={5} maxLength={200} />
      </div>
      <div className="form-group">
        <label className="label">Content *</label>
        <textarea className="input min-h-[140px]" value={form.content} onChange={set("content")} required minLength={10} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={set("category")}>
            {NOTICE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Priority</label>
          <select className="input" value={form.priority} onChange={set("priority")}>
            {["low","normal","high","urgent"].map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="label">Expires At (optional)</label>
        <input type="date" className="input" value={form.expiresAt} onChange={set("expiresAt")} />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>{initial._id ? "Update Notice" : "Publish Notice"}</Button>
      </div>
    </form>
  );
}
