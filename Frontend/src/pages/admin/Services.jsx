import { useEffect, useState } from "react";
import api from "../../services/api";
import { AdminPagination, Badge, ErrorBox, Form, Loading, Modal, Page, Table, Toolbar } from "./AdminUI";

const categories = ["certificate", "license", "utility", "health", "education", "social_welfare", "agriculture", "land_records", "infrastructure", "other"];
const fields = [
  { name: "name", label: "Service name", required: true }, { name: "category", label: "Category", options: categories.map((x) => ({ value: x, label: x.replaceAll("_", " ") })), required: true },
  { name: "description", label: "Description", type: "textarea", required: true, full: true }, { name: "howToApply", label: "How to apply", type: "textarea", full: true },
  { name: "requiredDocuments", label: "Required documents", placeholder: "Aadhaar, photo, application form", full: true }, { name: "processingTime", label: "Processing time" }, { name: "feeAmount", label: "Fee amount", type: "number" }, { name: "onlineLink", label: "Official portal link" },
  { name: "contactName", label: "Contact person" }, { name: "contactPhone", label: "Contact phone" }, { name: "contactEmail", label: "Contact email" }, { name: "isFeatured", label: "Featured service", type: "checkbox" },
];

export default function Services() {
  const [rows, setRows] = useState([]); const [pagination, setPagination] = useState(null); const [page, setPage] = useState(1); const [search, setSearch] = useState(""); const [category, setCategory] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [modal, setModal] = useState(null);
  const load = async () => { setLoading(true); setError(""); try { const response = await api.get("/services", { params: { page, limit: 10, search: search || undefined, category: category || undefined } }); setRows(response.data?.data?.services || []); setPagination(response.data?.pagination || null); } catch (err) { setError(err.response?.data?.message || "Failed to load services"); } finally { setLoading(false); } };
  useEffect(() => { setPage(1); }, [search, category]); useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [page, search, category]);
  const save = async (form) => { const fee = Number(form.feeAmount || 0); const data = { ...form, requiredDocuments: form.requiredDocuments ? form.requiredDocuments.split(",").map((x) => x.trim()).filter(Boolean) : [], fees: { amount: fee, currency: "INR", isFree: fee === 0 }, contactInfo: { name: form.contactName || "", phone: form.contactPhone || "", email: form.contactEmail || "" } }; delete data.feeAmount; delete data.contactName; delete data.contactPhone; delete data.contactEmail; try { if (modal?.item) await api.put(`/services/${modal.item._id}`, data); else await api.post("/services", data); setModal(null); await load(); } catch (err) { setError(err.response?.data?.message || "Save failed"); } };
  const remove = async (id) => { if (!window.confirm("Deactivate this service?")) return; try { await api.delete(`/services/${id}`); await load(); } catch (err) { setError(err.response?.data?.message || "Delete failed"); } };
  const initial = (item) => item ? { ...item, requiredDocuments: (item.requiredDocuments || []).join(", "), feeAmount: item.fees?.amount ?? "", contactName: item.contactInfo?.name || "", contactPhone: item.contactInfo?.phone || "", contactEmail: item.contactInfo?.email || "", isFeatured: Boolean(item.isFeatured) } : { category: "other", feeAmount: 0, isFeatured: false };
  return <Page title="Services" subtitle="Live public-service directory with category filters and CRUD controls.">
    <Toolbar search={search} setSearch={setSearch} placeholder="Search services..." filters={<select className="input" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{categories.map((x) => <option key={x} value={x}>{x.replaceAll("_", " ")}</option>)}</select>} onRefresh={load} />
    <div className="flex justify-end"><button className="btn-primary" onClick={() => setModal({ item: null })} type="button">+ Add Service</button></div>
    {error ? <ErrorBox message={error} retry={load} /> : null}
    {loading ? <Loading /> : <Table rows={rows} columns={[{ key: "name", label: "Service", render: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-gray-500">{row.description}</p></div> }, { key: "category", label: "Category", render: (row) => <Badge>{row.category}</Badge> }, { key: "fees", label: "Fee", render: (row) => row.fees?.isFree ? "Free" : `₹${row.fees?.amount || 0}` }, { key: "isFeatured", label: "Featured", render: (row) => <Badge tone={row.isFeatured ? "green" : "gray"}>{row.isFeatured ? "Yes" : "No"}</Badge> }, { key: "actions", label: "Actions", render: (row) => <div className="flex gap-2"><button className="btn-secondary" onClick={() => setModal({ item: row })} type="button">Edit</button><button className="btn-danger" onClick={() => remove(row._id)} type="button">Deactivate</button></div> }]} />}
    <AdminPagination pagination={pagination} onPageChange={setPage} />
    {modal ? <Modal title={modal.item ? "Edit Service" : "Create Service"} onClose={() => setModal(null)} wide><Form fields={fields} initial={initial(modal.item)} onSubmit={save} submitLabel={modal.item ? "Update" : "Create"} onCancel={() => setModal(null)} /></Modal> : null}
  </Page>;
}
