import { JOB_CATEGORIES, JOB_TYPES } from "../../utils/constants";

export default function JobFilters({ filters, onChange }) {
  const set = (k) => (e) => onChange({ ...filters, [k]: e.target.value });

  return (
    <div className="card p-4 flex flex-wrap gap-3">
      <input
        className="input max-w-xs"
        placeholder="Search jobs..."
        value={filters.search || ""}
        onChange={set("search")}
      />
      <select className="input max-w-[160px]" value={filters.category || ""} onChange={set("category")}>
        <option value="">All Categories</option>
        {JOB_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
      <select className="input max-w-[160px]" value={filters.type || ""} onChange={set("type")}>
        <option value="">All Types</option>
        {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
    </div>
  );
}
