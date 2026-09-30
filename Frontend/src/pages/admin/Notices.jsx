import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { reviewNotice } from "../../services/noticeService";
import { AdminPagination, Badge, ErrorBox, Form, fmtDate, Loading, Modal, Page, Table, Toolbar, toneForStatus } from "./AdminUI";
import RejectModal from "./RejectModal";
import { NOTICE_CATEGORIES, isoToLocalInput, localToIso, prettyCategory } from "../../utils/submissionOptions";

const priorities = ["low", "normal", "high", "urgent"];
const statuses = [
  { value: "", label: "All" },
  { value: "pending", label: "Waiting for approval" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];
const fields = [
  { name: "title", label: "Title", required: true, full: true },
  { name: "content", label: "Content", type: "textarea", required: true, full: true },
  { name: "category", label: "Category", options: NOTICE_CATEGORIES.map((x) => ({ value: x, label: prettyCategory(x) })), required: true },
  { name: "priority", label: "Priority", options: priorities.map((x) => ({ value: x, label: x })), required: true },
  { name: "publishedAt", label: "Publish date", type: "datetime-local" },
  { name: "expiresAt", label: "Expiry date", type: "datetime-local" },
];

const statusOf = (row) => row.status || "approved";

export default function Notices() {
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "";

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [rejecting, setRejecting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/notices/manage", {
        params: {
          page, limit: 10,
          status: status || undefined,
          search: search || undefined,
          category: category || undefined,
          priority: priority || undefined,
        },
      });
      setRows(response.data?.data?.notices || []);
      setPendingCount(response.data?.data?.pendingCount || 0);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load notices");
    } finally {
      setLoading(false);
    }
  }, [page, status, search, category, priority]);

  useEffect(() => { setPage(1); }, [search, category, priority, status]);
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const setStatus = (value) => setParams(value ? { status: value } : {}, { replace: true });

  const save = async (form) => {
    const data = {
      title: form.title,
      content: form.content,
      category: form.category,
      priority: form.priority,
      publishedAt: localToIso(form.publishedAt),
      expiresAt: form.expiresAt ? localToIso(form.expiresAt) : null,
    };
    try {
      if (modal?.item) await api.put(`/notices/${modal.item._id}`, data);
      else await api.post("/notices", data);
      setModal(null);
      toast.success(modal?.item ? "Notice updated" : "Notice published");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Deactivate this notice?")) return;
    try {
      await api.delete(`/notices/${id}`);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const approve = async (row) => {
    try {
      await reviewNotice(row._id, { status: "approved" });
      toast.success("Notice approved and published");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not approve");
    }
  };

  const reject = async (reason) => {
    try {
      await reviewNotice(rejecting._id, { status: "rejected", rejectionReason: reason });
      toast.success("Notice rejected");
      setRejecting(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not reject");
    }
  };

  const initial = (item) =>
    item
      ? { ...item, publishedAt: isoToLocalInput(item.publishedAt), expiresAt: isoToLocalInput(item.expiresAt) }
      : { category: "general", priority: "normal" };

  const columns = [
    {
      key: "title", label: "Notice",
      render: (row) => (
        <div className="max-w-[16rem] sm:max-w-md">
          <p className="font-medium">{row.title}</p>
          <p className="line-clamp-2 text-xs text-gray-500">{row.content}</p>
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
    { key: "priority", label: "Priority", render: (row) => <Badge tone={toneForStatus(row.priority === "urgent" ? "rejected" : row.priority)}>{row.priority}</Badge> },
    { key: "publishedAt", label: "Published", render: (row) => fmtDate(row.publishedAt) },
    { key: "viewCount", label: "Views", render: (row) => row.viewCount || 0 },
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
          <button className="btn-secondary" onClick={() => remove(row._id)} type="button">Deactivate</button>
        </div>
      ),
    },
  ];

  return (
    <Page title="Notices" subtitle="Publish notices and approve the ones citizens send.">
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
        placeholder="Search notices..."
        filters={
          <>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {NOTICE_CATEGORIES.map((x) => <option key={x} value={x}>{prettyCategory(x)}</option>)}
            </select>
            <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="">All priorities</option>
              {priorities.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </>
        }
        onRefresh={load}
      />
      <div className="flex sm:justify-end">
        <button className="btn-primary w-full sm:w-auto" onClick={() => setModal({ item: null })} type="button">+ Add Notice</button>
      </div>
      {error ? <ErrorBox message={error} retry={load} /> : null}
      {loading ? <Loading /> : <Table rows={rows} columns={columns} />}
      <AdminPagination pagination={pagination} onPageChange={setPage} />

      {modal ? (
        <Modal title={modal.item ? "Edit Notice" : "Create Notice"} onClose={() => setModal(null)} wide>
          <Form fields={fields} initial={initial(modal.item)} onSubmit={save} submitLabel={modal.item ? "Update" : "Publish"} onCancel={() => setModal(null)} />
        </Modal>
      ) : null}
      {rejecting ? <RejectModal title={rejecting.title} onClose={() => setRejecting(null)} onConfirm={reject} /> : null}
    </Page>
  );
}