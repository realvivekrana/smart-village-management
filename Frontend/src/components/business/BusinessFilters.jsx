import { BUSINESS_CATEGORIES } from "../../utils/constants";

export default function BusinessFilters({ filters, onChange }) {
  const set = (k) => (e) => onChange({ ...filters, [k]: e.target.value });
  return (
    <div className="card p-4 flex flex-wrap gap-3">
      <input
        className="input max-w-xs"
        placeholder="Search businesses..."
        value={filters.search || ""}
        onChange={set("search")}
      />
      <select className="input max-w-[180px]" value={filters.category || ""} onChange={set("category")}>
        <option value="">All Categories</option>
        {BUSINESS_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
    </div>
  );
}
