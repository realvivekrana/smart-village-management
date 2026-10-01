import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  AdminPagination,
  Badge,
  ErrorBox,
  Loading,
  Modal,
  Page,
  Table,
  Toolbar,
  fmtDate,
  fmtDateTime,
} from "./AdminUI";

const STATUSES = [
  "submitted",
  "under-review",
  "documents-required",
  "approved",
  "rejected",
  "completed",
  "cancelled",
];

const toneFor = (status) => {
  if (["approved", "completed"].includes(status)) return "green";
  if (["under-review", "documents-required"].includes(status)) return "yellow";
  if (["rejected", "cancelled"].includes(status)) return "red";
  return "gray";
};

const label = (s) => String(s || "").replaceAll("-", " ");

export default function FeatureApplications() {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ status: "", statusMessage: "", adminRemarks: "", rejectionReason: "" });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  // search ko thoda ruk ke chalate hain taaki har akshar pe request na jaye
  useEffect(() => {
    const id = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [search]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/village-features/admin/applications", {
        params: { page, limit: 20, status: status || undefined, search: query || undefined },
      });
      setRows(response.data?.data || []);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      setError(err.response?.data?.message || "Applications load nahi ho payi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, query]);

  const open = (row) => {
    setSelected(row);
    setModalError("");
    setForm({
      status: row.status || "submitted",
      statusMessage: row.statusMessage || "",
      adminRemarks: row.adminRemarks || "",
      rejectionReason: row.rejectionReason || "",
    });
  };

  const save = async () => {
    if (form.status === "rejected" && !form.rejectionReason.trim()) {
      setModalError("Reject karne ka karan likhna zaroori hai.");
      return;
    }
    setSaving(true);
    setModalError("");
    try {
      await api.patch(`/village-features/admin/applications/${selected._id}`, {
        status: form.status,
        statusMessage: form.statusMessage,
        adminRemarks: form.adminRemarks,
        rejectionReason: form.rejectionReason,
      });
      setSelected(null);
      await load();
    } catch (err) {
      setModalError(err.response?.data?.message || "Update nahi ho paya");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm("Ye application delete ho jayegi. Delete karein?")) return;
    try {
      await api.delete(`/village-features/admin/applications/${row._id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Delete nahi hua");
    }
  };

  return (
    <Page
      title="Yojana Applications"
      subtitle="Gaon walon ne jin yojanaon aur sevaon ke liye aavedan kiya hai, unhe yahan dekhein aur approve ya reject karein."
    >
      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder="Tracking ID, naam, phone ya yojana khojein..."
        onRefresh={load}
        filters={
          <select
            className="input"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {label(s)}
              </option>
            ))}
          </select>
        }
      />

      {error ? <ErrorBox message={error} retry={load} /> : null}

      {loading ? (
        <Loading />
      ) : (
        <>
          <Table
            empty="Koi application nahi mili"
            rows={rows}
            columns={[
              {
                key: "trackingId",
                label: "Tracking ID",
                render: (row) => <span className="font-mono text-xs">{row.trackingId}</span>,
              },
              {
                key: "featureTitle",
                label: "Yojana / Seva",
                render: (row) => (
                  <div>
                    <p className="font-medium">{row.featureTitle || row.feature?.title || "—"}</p>
                    <p className="text-xs text-gray-500">{row.category || row.feature?.category}</p>
                  </div>
                ),
              },
              {
                key: "applicantName",
                label: "Applicant",
                render: (row) => (
                  <div>
                    <p className="font-medium">{row.applicantName || row.applicant?.name || "—"}</p>
                    <p className="text-xs text-gray-500">{row.applicantPhone || row.applicant?.phone}</p>
                  </div>
                ),
              },
              { key: "createdAt", label: "Applied", render: (row) => fmtDate(row.createdAt) },
              {
                key: "status",
                label: "Status",
                render: (row) => <Badge tone={toneFor(row.status)}>{label(row.status)}</Badge>,
              },
              {
                key: "actions",
                label: "Actions",
                render: (row) => (
                  <div className="flex gap-2">
                    <button className="btn-secondary" type="button" onClick={() => open(row)}>
                      Review
                    </button>
                    <button className="btn-danger" type="button" onClick={() => remove(row)}>
                      Delete
                    </button>
                  </div>
                ),
              },
            ]}
          />
          <AdminPagination pagination={pagination} onPageChange={setPage} />
        </>
      )}

      {selected ? (
        <Modal title={selected.featureTitle || "Application"} onClose={() => setSelected(null)} wide>
          <div className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">Tracking ID</p>
                <p className="font-mono">{selected.trackingId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Applicant</p>
                <p className="font-medium">{selected.applicantName || selected.applicant?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">{selected.applicantPhone || selected.applicant?.phone || "—"}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Applied {fmtDateTime(selected.createdAt)}</p>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Applicant ko dikhne wala sandesh</label>
              <textarea
                className="input"
                rows={2}
                value={form.statusMessage}
                onChange={(e) => setForm((f) => ({ ...f, statusMessage: e.target.value }))}
              />
            </div>

            {form.status === "rejected" ? (
              <div>
                <label className="mb-1 block text-xs text-gray-500">Reject karne ka karan</label>
                <textarea
                  className="input"
                  rows={2}
                  value={form.rejectionReason}
                  onChange={(e) => setForm((f) => ({ ...f, rejectionReason: e.target.value }))}
                />
              </div>
            ) : null}

            <div>
              <label className="mb-1 block text-xs text-gray-500">Admin remarks (internal)</label>
              <textarea
                className="input"
                rows={2}
                value={form.adminRemarks}
                onChange={(e) => setForm((f) => ({ ...f, adminRemarks: e.target.value }))}
              />
            </div>

            {modalError ? <p className="text-sm font-medium text-red-600">{modalError}</p> : null}

            <div className="flex justify-end gap-2">
              <button className="btn-secondary" type="button" onClick={() => setSelected(null)}>
                Cancel
              </button>
              <button className="btn-primary" type="button" disabled={saving} onClick={save}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </Page>
  );
}