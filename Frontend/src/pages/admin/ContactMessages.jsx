import { useEffect, useState } from "react";
import api from "../../services/api";
import { Badge, ErrorBox, Loading, Modal, Page, Table, Toolbar, fmtDateTime } from "./AdminUI";

import { useLanguage } from "../../context/LanguageContext";
const STATUSES = ["new", "read", "replied", "resolved"];

const toneFor = (status) =>
  status === "new" ? "red" : status === "read" ? "yellow" : status === "replied" ? "blue" : "green";

export default function ContactMessages() {
  const { t } = useLanguage();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/contact");
      setRows(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || t("ui.couldNotLoadMessages7a4", "Could not load messages"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (row, next) => {
    if (row.status === next) return;
    setBusy(true);
    try {
      await api.patch(`/contact/${row._id}/status`, { status: next });
      setRows((list) => list.map((r) => (r._id === row._id ? { ...r, status: next } : r)));
      setSelected((cur) => (cur && cur._id === row._id ? { ...cur, status: next } : cur));
    } catch (err) {
      setError(err.response?.data?.message || t("ui.couldNotUpdateStatusa01", "Could not update status"));
    } finally {
      setBusy(false);
    }
  };

  const openMessage = (row) => {
    setSelected(row);
    if (row.status === "new") changeStatus(row, "read");
  };

  const remove = async (row) => {
    if (!window.confirm(t("ui.thisMessageWillBeDeletedb35", "This message will be deleted permanently. Delete it?"))) return;
    try {
      await api.delete(`/contact/${row._id}`);
      setRows((list) => list.filter((r) => r._id !== row._id));
      setSelected(null);
    } catch (err) {
      setError(err.response?.data?.message || t("ui.couldNotDeletee8a", "Could not delete"));
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = rows.filter((row) => {
    if (status && row.status !== status) return false;
    if (!q) return true;
    return `${row.name || ""} ${row.email || ""} ${row.phone || ""} ${row.subject || ""} ${row.message || ""}`
      .toLowerCase()
      .includes(q);
  });

  const newCount = rows.filter((r) => r.status === "new").length;

  return (
    <Page
      title="Contact Messages"
      subtitle={t("ui.contactFormMessages", "Messages from villagers sent via the contact form. New: {count}", { count: newCount })}
    >
      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder={t("ui.searchNameEmailPhoneOr3c2", "Search name, email, phone or message...")}
        onRefresh={load}
        filters={
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        }
      />

      {error ? <ErrorBox message={error} retry={load} /> : null}

      {loading ? (
        <Loading />
      ) : (
        <Table
          empty={t("ui.noMessagesYet981", "No messages yet")}
          rows={filtered}
          columns={[
            {
              key: "name",
              label: "From",
              render: (row) => (
                <div>
                  <p className="font-medium">{row.name}</p>
                  <p className="text-xs text-gray-500">{row.email}</p>
                  {row.phone ? <p className="text-xs text-gray-500">{row.phone}</p> : null}
                </div>
              ),
            },
            {
              key: "subject",
              label: "Message",
              render: (row) => (
                <div className="max-w-md">
                  <p className="font-medium">{row.subject || "(no subject)"}</p>
                  <p className="line-clamp-2 text-xs text-gray-500">{row.message}</p>
                </div>
              ),
            },
            { key: "createdAt", label: "Received", render: (row) => fmtDateTime(row.createdAt) },
            {
              key: "status",
              label: "Status",
              render: (row) => <Badge tone={toneFor(row.status)}>{row.status}</Badge>,
            },
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <div className="flex gap-2">
                  <button className="btn-secondary" type="button" onClick={() => openMessage(row)}>
                    Open
                  </button>
                  <button className="btn-danger" type="button" onClick={() => remove(row)}>
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      {selected ? (
        <Modal title={selected.subject || "Contact message"} onClose={() => setSelected(null)} wide>
          <div className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-medium">{selected.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <a className="font-medium text-primary-600 break-all" href={`mailto:${selected.email}`}>
                  {selected.email}
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                {selected.phone ? (
                  <a className="font-medium text-primary-600" href={`tel:${selected.phone}`}>
                    {selected.phone}
                  </a>
                ) : (
                  <p className="font-medium">—</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500">Received {fmtDateTime(selected.createdAt)}</p>
              <p className="mt-2 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 dark:bg-gray-700/40">
                {selected.message}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500">{t("ui.changeStatusaf5", "Change status")}</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={busy}
                    onClick={() => changeStatus(selected, s)}
                    className={selected.status === s ? "btn-primary" : "btn-secondary"}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      ) : null}
    </Page>
  );
}