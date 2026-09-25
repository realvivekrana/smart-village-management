import { useState } from "react";
import Pagination from "../../components/common/Pagination";

export function Page({ title, subtitle, actions, children }) {
  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="section-title">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function StatCard({ icon, label, value, tone = "blue", hint }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    green: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300",
    yellow: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300",
    red: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
    purple: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-2 text-2xl font-bold">{value ?? 0}</p>
          {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
        </div>
        <div className={`rounded-xl px-3 py-2 text-xl ${tones[tone] || tones.blue}`}>{icon}</div>
      </div>
    </div>
  );
}

export function Loading({ text = "Loading..." }) {
  return (
    <div className="card flex items-center justify-center p-10 text-sm text-gray-500">
      <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      {text}
    </div>
  );
}

export function ErrorBox({ message, retry }) {
  return (
    <div className="card border border-red-100 p-5 dark:border-red-900/40">
      <p className="font-medium text-red-600">{message || "Something went wrong"}</p>
      {retry ? <button className="btn-secondary mt-4" onClick={retry} type="button">Retry</button> : null}
    </div>
  );
}

export function Toolbar({ search, setSearch, placeholder = "Search...", filters, onRefresh }) {
  return (
    <div className="card p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {setSearch ? (
          <input
            className="input lg:max-w-sm"
            value={search || ""}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
          />
        ) : null}
        <div className="flex flex-wrap gap-3">{filters}</div>
        {onRefresh ? <button className="btn-secondary lg:ml-auto" onClick={onRefresh} type="button">↻ Refresh</button> : null}
      </div>
    </div>
  );
}

export function Table({ columns = [], rows = [], empty = "No records found" }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/70">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {rows.length ? rows.map((row, index) => (
              <tr key={row._id || index} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 align-top">
                    {column.render ? column.render(row) : row[column.key] ?? "—"}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length || 1} className="px-4 py-12 text-center text-gray-500">{empty}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminPagination({ pagination, onPageChange }) {
  return pagination ? <Pagination pagination={pagination} onPageChange={onPageChange} /> : null;
}

export function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-gray-900 ${wide ? "max-w-4xl" : "max-w-xl"}`}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-xl text-gray-400 hover:text-gray-700 dark:hover:text-white" type="button" aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, value, onChange, type = "text", placeholder, required, options, rows = 4 }) {
  const common = {
    value: value ?? "",
    onChange: (e) => onChange(e.target.value),
    required,
    className: "input",
    placeholder,
  };

  if (type === "checkbox") {
    return (
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
        <span className="text-sm font-medium">{label}</span>
      </label>
    );
  }

  return (
    <div className="form-group">
      <label className="label">{label}</label>
      {options ? (
        <select {...common}>
          <option value="">Select {label}</option>
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea {...common} rows={rows} />
      ) : (
        <input {...common} type={type} />
      )}
    </div>
  );
}

export function Form({ fields = [], initial = {}, onSubmit, submitLabel = "Save", onCancel }) {
  const [form, setForm] = useState(initial);

  const set = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  return (
    <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.name} className={field.full ? "sm:col-span-2" : ""}>
            <Field {...field} value={form[field.name]} onChange={(value) => set(field.name, value)} />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel ? <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button> : null}
        <button className="btn-primary" type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}

export function Badge({ children, tone = "gray" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function fmtDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function toneForStatus(status) {
  if (["approved", "resolved", "active", "hired"].includes(status)) return "green";
  if (["pending", "in_progress", "reviewed", "shortlisted"].includes(status)) return "yellow";
  if (["rejected", "suspended", "closed"].includes(status)) return "red";
  return "gray";
}
