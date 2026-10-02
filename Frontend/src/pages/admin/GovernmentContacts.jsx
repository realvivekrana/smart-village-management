import { useEffect, useState } from "react";
import api from "../../services/api";
import { Badge, ErrorBox, Form, Loading, Modal, Page, Table, Toolbar } from "./AdminUI";

const categories = ["Emergency", "District Administration", "Block Administration", "Panchayat", "Elected Representatives", "Police", "Health", "Education", "Agriculture", "Electricity", "Water Supply", "Transport", "Legal", "Government Services", "Other"];
const fields = [
  { name: "name", label: "Name", required: true }, { name: "designation", label: "Designation", required: true }, { name: "department", label: "Department", required: true },
  { name: "category", label: "Category", options: categories.map((x) => ({ value: x, label: x })), required: true }, { name: "office", label: "Office" },
  { name: "phone", label: "Phone" }, { name: "alternatePhone", label: "Alternate phone" }, { name: "email", label: "Email" }, { name: "website", label: "Website" },
  { name: "address", label: "Address", type: "textarea", full: true }, { name: "description", label: "Description", type: "textarea", full: true },
  { name: "isEmergency", label: "Show as emergency contact", type: "checkbox" }, { name: "isFeatured", label: "Featured (shown first)", type: "checkbox" },
  { name: "isActive", label: "Active (visible to public)", type: "checkbox" }, { name: "displayOrder", label: "Display order", type: "number" }, { name: "source", label: "Source / verified by" },
];

export default function GovernmentContacts() {
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [search, setSearch] = useState(""); const [category, setCategory] = useState(""); const [modal, setModal] = useState(null);
  const load = async () => { setLoading(true); setError(""); try { const response = await api.get("/government-contacts", { params: { category: category || undefined, limit: 100 } }); setRows(response.data?.data || []); } catch (err) { setError(err.response?.data?.message || "Failed to load contacts"); } finally { setLoading(false); } };
  useEffect(() => { load(); }, [category]);
  const save = async (form) => { const data = { ...form, displayOrder: Number(form.displayOrder || 0), isEmergency: Boolean(form.isEmergency), isFeatured: Boolean(form.isFeatured), isActive: form.isActive === undefined ? true : Boolean(form.isActive) }; try { if (modal?.item) await api.put(`/government-contacts/${modal.item._id}`, data); else await api.post("/government-contacts", data); setModal(null); await load(); } catch (err) { setError(err.response?.data?.message || "Save failed"); } };
  const remove = async (id) => { if (!window.confirm("Delete this government contact? This cannot be undone.")) return; try { await api.delete(`/government-contacts/${id}`); await load(); } catch (err) { setError(err.response?.data?.message || "Delete failed"); } };
  const filtered = rows.filter((row) => `${row.name || ""} ${row.designation || ""} ${row.department || ""} ${row.phone || ""} ${row.category || ""}`.toLowerCase().includes(search.toLowerCase()));
  const initial = (item) => item ? { ...item, isEmergency: Boolean(item.isEmergency), isFeatured: Boolean(item.isFeatured), isActive: item.isActive !== false } : { category: "Other", isEmergency: false, isFeatured: false, isActive: true, displayOrder: 0 };
  return <Page title="Government Contacts" subtitle="Directory of BDO, CO, DC and other government officials, departments and helplines shown to villagers." actions={<button className="btn-primary" onClick={() => setModal({ item: null })} type="button">+ Add Contact</button>}>
    <Toolbar search={search} setSearch={setSearch} placeholder="Search contacts..." filters={<select className="input" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{categories.map((x) => <option key={x} value={x}>{x}</option>)}</select>} onRefresh={load} />
    {error ? <ErrorBox message={error} retry={load} /> : null}
    {loading ? <Loading /> : <Table rows={filtered} columns={[
      { key: "name", label: "Contact", render: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-gray-500">{row.designation}</p></div> },
      { key: "department", label: "Department / Office", render: (row) => <div><p>{row.department}</p>{row.office ? <p className="text-xs text-gray-500">{row.office}</p> : null}</div> },
      { key: "phone", label: "Phone", render: (row) => row.phone || "—" },
      { key: "category", label: "Category", render: (row) => <Badge>{row.category}</Badge> },
      { key: "flags", label: "Status", render: (row) => <div className="flex flex-wrap gap-1"><Badge tone={row.isActive === false ? "gray" : "green"}>{row.isActive === false ? "Inactive" : "Active"}</Badge>{row.isEmergency ? <Badge tone="red">Emergency</Badge> : null}{row.isFeatured ? <Badge tone="yellow">Featured</Badge> : null}</div> },
      { key: "displayOrder", label: "Order" },
      { key: "actions", label: "Actions", render: (row) => <div className="flex gap-2"><button className="btn-secondary" onClick={() => setModal({ item: row })} type="button">Edit</button><button className="btn-danger" onClick={() => remove(row._id)} type="button">Delete</button></div> },
    ]} />}
    {modal ? <Modal title={modal.item ? "Edit Contact" : "Create Contact"} onClose={() => setModal(null)} wide><Form fields={fields} initial={initial(modal.item)} onSubmit={save} submitLabel={modal.item ? "Update" : "Create"} onCancel={() => setModal(null)} /></Modal> : null}
  </Page>;
}