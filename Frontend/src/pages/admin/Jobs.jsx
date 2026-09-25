import { useEffect, useState } from "react";
import api from "../../services/api";
import { AdminPagination, Badge, ErrorBox, Form, fmtDate, Loading, Modal, Page, Table, Toolbar } from "./AdminUI";

const categories = ["agriculture", "construction", "manufacturing", "retail", "health", "education", "it", "government", "domestic", "transportation", "other"];
const types = ["full_time", "part_time", "contract", "seasonal", "internship"];
const fields = [
  { name: "title", label: "Title", required: true }, { name: "company", label: "Company", required: true },
  { name: "category", label: "Category", options: categories.map((x) => ({ value: x, label: x })), required: true },
  { name: "type", label: "Type", options: types.map((x) => ({ value: x, label: x.replaceAll("_", " ") })), required: true },
  { name: "location", label: "Location", required: true }, { name: "openings", label: "Openings", type: "number", required: true },
  { name: "applyBy", label: "Apply by", type: "date", required: true }, { name: "salaryMin", label: "Salary min", type: "number" }, { name: "salaryMax", label: "Salary max", type: "number" },
  { name: "description", label: "Description", type: "textarea", required: true, full: true }, { name: "requirements", label: "Requirements", type: "textarea", full: true },
  { name: "isFeatured", label: "Featured job", type: "checkbox" },
];

export default function Jobs() {
  const [rows, setRows] = useState([]); const [pagination, setPagination] = useState(null); const [page, setPage] = useState(1); const [search, setSearch] = useState(""); const [category, setCategory] = useState(""); const [type, setType] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [modal, setModal] = useState(null);
  const load = async () => { setLoading(true); setError(""); try { const response = await api.get("/jobs", { params: { page, limit: 10, search: search || undefined, category: category || undefined, type: type || undefined } }); setRows(response.data?.data?.jobs || []); setPagination(response.data?.pagination || null); } catch (err) { setError(err.response?.data?.message || "Failed to load jobs"); } finally { setLoading(false); } };
  useEffect(() => { setPage(1); }, [search, category, type]); useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [page, search, category, type]);
  const save = async (form) => { const data = { ...form, openings: Number(form.openings || 1), salary: { min: form.salaryMin ? Number(form.salaryMin) : null, max: form.salaryMax ? Number(form.salaryMax) : null, currency: "INR", period: "per_month", isNegotiable: false } }; delete data.salaryMin; delete data.salaryMax; try { if (modal?.item) await api.put(`/jobs/${modal.item._id}`, data); else await api.post("/jobs", data); setModal(null); await load(); } catch (err) { setError(err.response?.data?.message || "Save failed"); } };
  const remove = async (id) => { if (!window.confirm("Delete this job?")) return; try { await api.delete(`/jobs/${id}`); await load(); } catch (err) { setError(err.response?.data?.message || "Delete failed"); } };
  const initial = (item) => item ? { ...item, salaryMin: item.salary?.min ?? "", salaryMax: item.salary?.max ?? "", applyBy: item.applyBy?.slice(0, 10) || "", isFeatured: Boolean(item.isFeatured) } : { category: "other", type: "full_time", openings: 1, isFeatured: false };
  return <Page title="Jobs" subtitle="Live job board management with category/type filters and CRUD actions.">
    <Toolbar search={search} setSearch={setSearch} placeholder="Search title, company..." filters={<><select className="input" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{categories.map((x) => <option key={x} value={x}>{x}</option>)}</select><select className="input" value={type} onChange={(e) => setType(e.target.value)}><option value="">All types</option>{types.map((x) => <option key={x} value={x}>{x.replaceAll("_", " ")}</option>)}</select></>} onRefresh={load} />
    {error ? <ErrorBox message={error} retry={load} /> : null}
    {loading ? <Loading /> : <Table rows={rows} columns={[{ key: "title", label: "Job", render: (row) => <div><p className="font-medium">{row.title}</p><p className="text-xs text-gray-500">{row.company}</p></div> }, { key: "category", label: "Category", render: (row) => <Badge>{row.category}</Badge> }, { key: "type", label: "Type", render: (row) => row.type?.replaceAll("_", " ") }, { key: "location", label: "Location" }, { key: "applyBy", label: "Apply by", render: (row) => fmtDate(row.applyBy) }, { key: "applicationCount", label: "Applications", render: (row) => row.applicationCount || 0 }, { key: "actions", label: "Actions", render: (row) => <div className="flex gap-2"><button className="btn-secondary" onClick={() => setModal({ item: row })} type="button">Edit</button><button className="btn-danger" onClick={() => remove(row._id)} type="button">Delete</button></div> }]} />}
    <AdminPagination pagination={pagination} onPageChange={setPage} />
    {modal ? <Modal title={modal.item ? "Edit Job" : "Create Job"} onClose={() => setModal(null)} wide><Form fields={fields} initial={initial(modal.item)} onSubmit={save} submitLabel={modal.item ? "Update" : "Create"} onCancel={() => setModal(null)} /></Modal> : null}
  </Page>;
}
