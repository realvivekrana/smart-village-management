import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { reviewEvent } from "../../services/eventService";
import { AdminPagination, Badge, ErrorBox, Form, fmtDateTime, Loading, Modal, Page, Table, Toolbar, toneForStatus } from "./AdminUI";
import RejectModal from "./RejectModal";
import { EVENT_CATEGORIES, isoToLocalInput, localToIso, prettyCategory } from "../../utils/submissionOptions";

const statuses = [
  { value: "", label: "All" },
  { value: "pending", label: "Waiting for approval" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];
const fields = [
  { name: "title", label: "Title", required: true, full: true },
  { name: "description", label: "Description", type: "textarea", required: true, full: true },
  { name: "category", label: "Category", options: EVENT_CATEGORIES.map((x) => ({ value: x, label: prettyCategory(x) })), required: true },
  { name: "startDate", label: "Start", type: "datetime-local", required: true },
  { name: "endDate", label: "End", type: "datetime-local", required: true },
  { name: "location", label: "Location", required: true },
  { name: "organizer", label: "Organizer" },
  { name: "maxAttendees", label: "Max attendees", type: "number" },
  { name: "isFeatured", label: "Featured event", type: "checkbox" },
];

const statusOf = (row) => row.status || "approved";

export default function Events() {
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "";

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [upcoming, setUpcoming] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [rejecting, setRejecting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/events/manage", {
        params: {
          page, limit: 10,
          status: status || undefined,
          search: search || undefined,
          category: category || undefined,
          upcoming: upcoming || undefined,
        },
      });
      setRows(response.data?.data?.events || []);
      setPendingCount(response.data?.data?.pendingCount || 0);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [page, status, search, category, upcoming]);

  useEffect(() => { setPage(1); }, [search, category, upcoming, status]);
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const setStatus = (value) => setParams(value ? { status: value } : {}, { replace: true });

  const save = async (form) => {
    const data = {
      title: form.title,
      description: form.description,
      category: form.category,
      startDate: localToIso(form.startDate),
      endDate: localToIso(form.endDate),
      location: form.location,
      organizer: form.organizer || undefined,
      maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : null,
      isFeatured: Boolean(form.isFeatured),
    };
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      toast.error("End time must be after the start time");
      return;
    }
    try {
      if (modal?.item) await api.put(`/events/${modal.item._id}`, data);
      else await api.post("/events", data);
      setModal(null);
      toast.success(modal?.item ? "Event updated" : "Event created");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await api.delete(`/events/${id}`);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const approve = async (row) => {
    try {
      await reviewEvent(row._id, { status: "approved" });
      toast.success("Event approved and published");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not approve");
    }
  };

  const reject = async (reason) => {
    try {
      await reviewEvent(rejecting._id, { status: "rejected", rejectionReason: reason });
      toast.success("Event rejected");
      setRejecting(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not reject");
    }
  };

  const initial = (item) =>
    item
      ? {
          ...item,
          startDate: isoToLocalInput(item.startDate),
          endDate: isoToLocalInput(item.endDate),
          maxAttendees: item.maxAttendees || "",
          isFeatured: Boolean(item.isFeatured),
        }
      : { category: "other", startDate: "", endDate: "", maxAttendees: "", isFeatured: false };

  const columns = [
    {
      key: "title", label: "Event",
      render: (row) => (
        <div className="max-w-[16rem] sm:max-w-md">
          <p className="font-medium">{row.title}</p>
          <p className="text-xs text-gray-500">{row.location}</p>
          {statusOf(row) === "rejected" && row.rejectionReason ? (
            <p className="mt-1 text-xs text-red-600">Reason: {row.rejectionReason}</p>
          ) : null}
        </div>
      ),
    },
    { key: "status", label: "Status", render: (row) => <Badge tone={toneForStatus(statusOf(row))}>{statusOf(row)}</Badge> },
    {
      key: "by", label: "By",
      render: (row) => (
        <span className="whitespace-nowrap text-xs">
          {row.createdBy?.name || "—"}
          {row.createdBy?.role === "admin" ? " (admin)" : ""}
        </span>
      ),
    },
    { key: "category", label: "Category", render: (row) => <Badge>{prettyCategory(row.category)}</Badge> },
    { key: "startDate", label: "Start", render: (row) => <span className="whitespace-nowrap">{fmtDateTime(row.startDate)}</span> },
    { key: "attendeeCount", label: "Interested", render: (row) => row.attendeeCount || 0 },
    { key: "isFeatured", label: "Featured", render: (row) => <Badge tone={row.isFeatured ? "green" : "gray"}>{row.isFeatured ? "Yes" : "No"}</Badge> },
    {
      key: "actions", label: "Actions",
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          {statusOf(row) === "pending" ? (
            <>
              <button className="btn-primary" onClick={() => approve(row)} type="button">Approve</button>
              <button className="btn-danger" onClick={() => setRejecting(row)} type="button">Reject</button>
            </>
          ) : null}
          <button className="btn-secondary" onClick={() => setModal({ item: row })} type="button">Edit</button>
          <button className="btn-secondary" onClick={() => remove(row._id)} type="button">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <Page title="Events" subtitle="Manage events and approve the ones citizens send.">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statuses.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setStatus(s.value)}
            className={`min-h-[44px] whitespace-nowrap rounded-lg px-4 text-sm font-medium ${
              status === s.value
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
            }`}
          >
            {s.label}
            {s.value === "pending" && pendingCount > 0 ? ` (${pendingCount})` : ""}
          </button>
        ))}
      </div>

      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder="Search events..."
        filters={
          <>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {EVENT_CATEGORIES.map((x) => <option key={x} value={x}>{prettyCategory(x)}</option>)}
            </select>
            <select className="input" value={upcoming} onChange={(e) => setUpcoming(e.target.value)}>
              <option value="">All events</option>
              <option value="true">Upcoming only</option>
            </select>
          </>
        }
        onRefresh={load}
      />
      <div className="flex sm:justify-end">
        <button className="btn-primary w-full sm:w-auto" onClick={() => setModal({ item: null })} type="button">+ Add Event</button>
      </div>
      {error ? <ErrorBox message={error} retry={load} /> : null}
      {loading ? <Loading /> : <Table rows={rows} columns={columns} />}
      <AdminPagination pagination={pagination} onPageChange={setPage} />

      {modal ? (
        <Modal title={modal.item ? "Edit Event" : "Create Event"} onClose={() => setModal(null)} wide>
          <Form fields={fields} initial={initial(modal.item)} onSubmit={save} submitLabel={modal.item ? "Update" : "Create"} onCancel={() => setModal(null)} />
        </Modal>
      ) : null}
      {rejecting ? <RejectModal title={rejecting.title} onClose={() => setRejecting(null)} onConfirm={reject} /> : null}
    </Page>
  );
}