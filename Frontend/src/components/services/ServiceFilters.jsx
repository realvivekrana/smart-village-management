import { SERVICE_CATEGORIES } from "../../utils/constants";

export default function ServiceFilters({ filters, onChange }) {
  const set = (k) => (e) => onChange({ ...filters, [k]: e.target.value });
  return (
    <div className="card p-4 flex flex-wrap gap-3 mb-6">
      <input className="input max-w-xs" placeholder="Search services..." value={filters.search || ""} onChange={set("search")} />
      <select className="input max-w-[200px]" value={filters.category || ""} onChange={set("category")}>
        <option value="">All Categories</option>
        {SERVICE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
    </div>
  );
}
