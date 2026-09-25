import { useEffect, useState } from "react";
import api from "../../services/api";
import { AdminPagination, Badge, ErrorBox, Form, fmtDateTime, Loading, Modal, Page, Table, Toolbar } from "./AdminUI";

const categories = ["cultural", "religious", "sports", "health", "education", "agriculture", "government", "environment", "social", "other"];
const fields = [
  { name: "title", label: "Title", required: true, full: true },
  { name: "description", label: "Description", type: "textarea", required: true, full: true },
  { name: "category", label: "Category", options: categories.map((x) => ({ value: x, label: x })), required: true },
  { name: "startDate", label: "Start", type: "datetime-local", required: true },
  { name: "endDate", label: "End", type: "datetime-local", required: true },
  { name: "location", label: "Location", required: true },
  { name: "organizer", label: "Organizer" },
  { name: "maxAttendees", label: "Max attendees", type: "number" },
  { name: "isFeatured", label: "Featured event", type: "checkbox" },
];

export default function Events() {
  const [rows, setRows] = useState([]); const [pagination, setPagination] = useState(null); const [page, setPage] = useState(1); const [search, setSearch] = useState(""); const [category, setCategory] = useState(""); const [upcoming, setUpcoming] = useState("true"); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [modal, setModal] = useState(null);
  const load = async () => { setLoading(true); setError(""); try { const response = await api.get("/events", { params: { page, limit: 10, search: search || undefined, category: category || undefined, upcoming: upcoming || undefined } }); setRows(response.data?.data?.events || []); setPagination(response.data?.pagination || null); } catch (err) { setError(err.response?.data?.message || "Failed to load events"); } finally { setLoading(false); } };
  useEffect(() => { setPage(1); }, [search, category, upcoming]); useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [page, search, category, upcoming]);
  const save = async (form) => { const data = { ...form, maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : null }; try { if (modal?.item) await api.put(`/events/${modal.item._id}`, data); else await api.post("/events", data); setModal(null); await load(); } catch (err) { setError(err.response?.data?.message || "Save failed"); } };
  const remove = async (id) => { if (!window.confirm("Delete this event?")) return; try { await api.delete(`/events/${id}`); await load(); } catch (err) { setError(err.response?.data?.message || "Delete failed"); } };
  const initial = (item) => item ? { ...item, startDate: item.startDate?.slice(0, 16) || "", endDate: item.endDate?.slice(0, 16) || "", maxAttendees: item.maxAttendees || "", isFeatured: Boolean(item.isFeatured) } : { category: "other", startDate: "", endDate: "", maxAttendees: "", isFeatured: false };
  return <Page title="Events" subtitle="Live event management with filters, create/edit and soft-delete.">
    <Toolbar search={search} setSearch={setSearch} placeholder="Search events..." filters={<><select className="input" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{categories.map((x) => <option key={x} value={x}>{x}</option>)}</select><select className="input" value={upcoming} onChange={(e) => setUpcoming(e.target.value)}><option value="true">Upcoming</option><option value="">All active events</option></select></>} onRefresh={load} />
    {error ? <ErrorBox message={error} retry={load} /> : null}
    {loading ? <Loading /> : <Table rows={rows} columns={[{ key: "title", label: "Event", render: (row) => <div><p className="font-medium">{row.title}</p><p className="text-xs text-gray-500">{row.location}</p></div> }, { key: "category", label: "Category", render: (row) => <Badge>{row.category}</Badge> }, { key: "startDate", label: "Start", render: (row) => fmtDateTime(row.startDate) }, { key: "attendeeCount", label: "Interested", render: (row) => row.attendeeCount || 0 }, { key: "isFeatured", label: "Featured", render: (row) => <Badge tone={row.isFeatured ? "green" : "gray"}>{row.isFeatured ? "Yes" : "No"}</Badge> }, { key: "actions", label: "Actions", render: (row) => <div className="flex gap-2"><button className="btn-secondary" onClick={() => setModal({ item: row })} type="button">Edit</button><button className="btn-danger" onClick={() => remove(row._id)} type="button">Delete</button></div> }]} />}
    <AdminPagination pagination={pagination} onPageChange={setPage} />
    {modal ? <Modal title={modal.item ? "Edit Event" : "Create Event"} onClose={() => setModal(null)} wide><Form fields={fields} initial={initial(modal.item)} onSubmit={save} submitLabel={modal.item ? "Update" : "Create"} onCancel={() => setModal(null)} /></Modal> : null}
  </Page>;
}
