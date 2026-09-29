import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  AdminPagination,
  Badge,
  ErrorBox,
  fmtDate,
  Loading,
  Modal,
  Page,
  Table,
  Toolbar,
} from "./AdminUI";

/*
 * Admin → Households (Parivar)
 * Backend: GET /households/admin, GET /households/admin/:id,
 *          PATCH /households/admin/:id/verify | unverify
 */

export default function Households() {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [verified, setVerified] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/households/admin", {
        params: {
          page,
          limit: 10,
          search: search || undefined,
          verified: verified || undefined,
        },
      });
      setRows(response.data?.data || []);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      setError(err.response?.data?.message || "Households load nahi ho paye");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, verified]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, verified]);

  const toggleVerify = async (row) => {
    setBusyId(row._id);
    setError("");
    try {
      await api.patch(
        `/households/admin/${row._id}/${row.isVerified ? "unverify" : "verify"}`
      );
      if (detail?._id === row._id) {
        setDetail({ ...detail, isVerified: !row.isVerified });
      }
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Update fail ho gaya");
    } finally {
      setBusyId("");
    }
  };

  const openDetail = async (row) => {
    setDetail(row);
    setDetailLoading(true);
    try {
      const response = await api.get(`/households/admin/${row._id}`);
      setDetail(response.data?.data || row);
    } catch (err) {
      setError(err.response?.data?.message || "Detail load nahi ho paya");
    } finally {
      setDetailLoading(false);
    }
  };

  const address = (h) =>
    [h.houseNumber, h.street, h.ward && `Ward ${h.ward}`, h.villageName]
      .filter(Boolean)
      .join(", ") || "—";

  return (
    <Page
      title="Households (Parivar)"
      subtitle="Gaon ke ghar aur parivar ki jaankari check karke verify karein."
    >
      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder="Naam, phone, ghar number ya ward..."
        filters={
          <select
            className="input"
            value={verified}
            onChange={(e) => setVerified(e.target.value)}
          >
            <option value="">Sab</option>
            <option value="false">Verify baaki</option>
            <option value="true">Verified</option>
          </select>
        }
        onRefresh={load}
      />

      {error ? <ErrorBox message={error} retry={load} /> : null}

      {loading ? (
        <Loading />
      ) : (
        <Table
          rows={rows}
          empty="Koi household nahi mila"
          columns={[
            {
              key: "householdHeadName",
              label: "Mukhiya",
              render: (h) => (
                <div>
                  <p className="font-medium">{h.householdHeadName}</p>
                  <p className="text-xs text-gray-500">
                    {h.householdHeadPhone || h.user?.phone || "—"}
                  </p>
                </div>
              ),
            },
            { key: "address", label: "Pata", render: address },
            {
              key: "members",
              label: "Sadasya",
              render: (h) =>
                (h.members || []).filter((m) => m.isActive !== false).length,
            },
            {
              key: "isVerified",
              label: "Status",
              render: (h) => (
                <Badge tone={h.isVerified ? "green" : "yellow"}>
                  {h.isVerified ? "Verified" : "Pending"}
                </Badge>
              ),
            },
            {
              key: "createdAt",
              label: "Joda gaya",
              render: (h) => fmtDate(h.createdAt),
            },
            {
              key: "actions",
              label: "Actions",
              render: (h) => (
                <div className="flex gap-2">
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={() => openDetail(h)}
                  >
                    Dekhein
                  </button>
                  <button
                    className={h.isVerified ? "btn-danger" : "btn-primary"}
                    type="button"
                    disabled={busyId === h._id}
                    onClick={() => toggleVerify(h)}
                  >
                    {h.isVerified ? "Unverify" : "Verify"}
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      <AdminPagination pagination={pagination} onPageChange={setPage} />

      {detail ? (
        <Modal title="Household detail" wide onClose={() => setDetail(null)}>
          {detailLoading ? (
            <Loading />
          ) : (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="Mukhiya" value={detail.householdHeadName} />
                <Info label="Phone" value={detail.householdHeadPhone} />
                <Info label="Pata" value={address(detail)} />
                <Info label="Panchayat" value={detail.panchayat} />
                <Info label="Block / Zila" value={[detail.block, detail.district].filter(Boolean).join(", ")} />
                <Info label="Ghar ka type" value={detail.houseType} />
                <Info label="Parivar type" value={detail.familyType} />
                <Info
                  label="Account"
                  value={
                    detail.user
                      ? `${detail.user.name || ""} (${detail.user.email || detail.user.phone || ""})`
                      : ""
                  }
                />
                <Info
                  label="Verified by"
                  value={
                    detail.isVerified
                      ? `${detail.verifiedBy?.name || "Admin"} · ${fmtDate(detail.verifiedAt)}`
                      : "Abhi verify nahi hua"
                  }
                />
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Parivar ke sadasya</h3>
                <Table
                  rows={(detail.members || []).filter((m) => m.isActive !== false)}
                  empty="Koi sadasya nahi joda gaya"
                  columns={[
                    { key: "name", label: "Naam" },
                    { key: "relation", label: "Rishta" },
                    { key: "age", label: "Umar", render: (m) => m.age ?? "—" },
                    { key: "gender", label: "Ling" },
                    { key: "occupation", label: "Kaam" },
                    { key: "bloodGroup", label: "Blood" },
                  ]}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => setDetail(null)}
                >
                  Band karein
                </button>
                <button
                  className={detail.isVerified ? "btn-danger" : "btn-primary"}
                  type="button"
                  disabled={busyId === detail._id}
                  onClick={() => toggleVerify(detail)}
                >
                  {detail.isVerified ? "Unverify" : "Verify karein"}
                </button>
              </div>
            </div>
          )}
        </Modal>
      ) : null}
    </Page>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}