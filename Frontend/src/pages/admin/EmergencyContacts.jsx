import { useEffect, useState } from "react";
import api from "../../services/api";
import { Badge, ErrorBox, Form, Loading, Modal, Page, Table, Toolbar } from "./AdminUI";

const categories = ["police", "fire", "ambulance", "hospital", "electricity", "water", "panchayat", "disaster_relief", "women_helpline", "child_helpline", "other"];
const fields = [
  { name: "name", label: "Contact name", required: true }, { name: "designation", label: "Designation" }, { name: "phone", label: "Phone", required: true }, { name: "alternatePhone", label: "Alternate phone" },
  { name: "category", label: "Category", options: categories.map((x) => ({ value: x, label: x.replaceAll("_", " ") })), required: true }, { name: "description", label: "Description", type: "textarea", full: true },
  { name: "address", label: "Address", type: "textarea", full: true }, { name: "available24x7", label: "Available 24x7", type: "checkbox" }, { name: "order", label: "Display order", type: "number" },
];

export default function EmergencyContacts() {
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [search, setSearch] = useState(""); const [category, setCategory] = useState(""); const [modal, setModal] = useState(null);
  const load = async () => { setLoading(true); setError(""); try { const response = await api.get("/emergency", { params: { category: category || undefined } }); setRows(response.data?.data?.contacts || []); } catch (err) { setError(err.response?.data?.message || "Failed to load contacts"); } finally { setLoading(false); } };
  useEffect(() => { load(); }, [category]);
  const save = async (form) => { const data = { ...form, order: Number(form.order || 0), available24x7: Boolean(form.available24x7) }; try { if (modal?.item) await api.put(`/emergency/${modal.item._id}`, data); else await api.post("/emergency", data); setModal(null); await load(); } catch (err) { setError(err.response?.data?.message || "Save failed"); } };
  const remove = async (id) => { if (!window.confirm("Deactivate this emergency contact?")) return; try { await api.delete(`/emergency/${id}`); await load(); } catch (err) { setError(err.response?.data?.message || "Delete failed"); } };
  const filtered = rows.filter((row) => `${row.name || ""} ${row.phone || ""} ${row.category || ""}`.toLowerCase().includes(search.toLowerCase()));
  const initial = (item) => item ? { ...item, available24x7: Boolean(item.available24x7) } : { category: "other", available24x7: false, order: 0 };
  return <Page title="Emergency Contacts" subtitle="Live emergency helpline directory with category filtering and CRUD controls." actions={<button className="btn-primary" onClick={() => setModal({ item: null })} type="button">+ Add Contact</button>}>
    <Toolbar search={search} setSearch={setSearch} placeholder="Search contacts..." filters={<select className="input" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{categories.map((x) => <option key={x} value={x}>{x.replaceAll("_", " ")}</option>)}</select>} onRefresh={load} />
    {error ? <ErrorBox message={error} retry={load} /> : null}
    {loading ? <Loading /> : <Table rows={filtered} columns={[{ key: "name", label: "Contact", render: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-gray-500">{row.designation}</p></div> }, { key: "phone", label: "Phone" }, { key: "category", label: "Category", render: (row) => <Badge>{row.category}</Badge> }, { key: "available24x7", label: "Availability", render: (row) => <Badge tone={row.available24x7 ? "green" : "gray"}>{row.available24x7 ? "24x7" : "Limited"}</Badge> }, { key: "order", label: "Order" }, { key: "actions", label: "Actions", render: (row) => <div className="flex gap-2"><button className="btn-secondary" onClick={() => setModal({ item: row })} type="button">Edit</button><button className="btn-danger" onClick={() => remove(row._id)} type="button">Deactivate</button></div> }]} />}
    {modal ? <Modal title={modal.item ? "Edit Contact" : "Create Contact"} onClose={() => setModal(null)} wide><Form fields={fields} initial={initial(modal.item)} onSubmit={save} submitLabel={modal.item ? "Update" : "Create"} onCancel={() => setModal(null)} /></Modal> : null}
  </Page>;
}
