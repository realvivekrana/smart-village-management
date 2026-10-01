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
import { useLanguage } from "../../context/LanguageContext";

/*
 * Admin → Households (Parivar)
 * Backend: GET /households/admin, GET /households/admin/:id,
 *          PATCH /households/admin/:id/verify | unverify
 */

export default function Households() {
  const { t } = useLanguage();
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
      setError(err.response?.data?.message || t("ui.couldNotLoadHouseholds7c9", "Could not load households"));
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
      setError(err.response?.data?.message || t("ui.updateFailed6d7", "Update failed"));
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
      setError(err.response?.data?.message || t("ui.couldNotLoadDetailsc46", "Could not load details"));
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
      title={t("ui.householdsFamiliesc4f", "Households (Families)")}
      subtitle={t("ui.checkTheDetailsOfVillage881", "Check the details of village houses and families, then verify them.")}
    >
      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder={t("ui.namePhoneHouseNumberOr518", "Name, phone, house number or ward...")}
        filters={
          <select
            className="input"
            value={verified}
            onChange={(e) => setVerified(e.target.value)}
          >
            <option value="">Sab</option>
            <option value="false">{t("ui.pendingVerification08e", "Pending verification")}</option>
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
          empty={t("ui.noHouseholdsFounda16", "No households found")}
          columns={[
            {
              key: "householdHeadName",
              label: t("ui.headOfFamilye9d", "Head of family"),
              render: (h) => (
                <div>
                  <p className="font-medium">{h.householdHeadName}</p>
                  <p className="text-xs text-gray-500">
                    {h.householdHeadPhone || h.user?.phone || "—"}
                  </p>
                </div>
              ),
            },
            { key: "address", label: t("ui.addressdd7", "Address"), render: address },
            {
              key: "members",
              label: t("ui.membersef5", "Members"),
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
              label: t("ui.addedf29", "Added"),
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
                    {t("ui.view435", "View")}
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
                <Info label={t("ui.headOfFamilye9d", "Head of family")} value={detail.householdHeadName} />
                <Info label="Phone" value={detail.householdHeadPhone} />
                <Info label={t("ui.addressdd7", "Address")} value={address(detail)} />
                <Info label="Panchayat" value={detail.panchayat} />
                <Info label={t("ui.blockDistrict9bb", "Block / District")} value={[detail.block, detail.district].filter(Boolean).join(", ")} />
                <Info label={t("ui.houseType0aa", "House type")} value={detail.houseType} />
                <Info label={t("ui.familyType3a0", "Family type")} value={detail.familyType} />
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
                      : t("ui.notVerifiedYet3c3", "Not verified yet")
                  }
                />
              </div>

              <div>
                <h3 className="mb-2 font-semibold">{t("ui.familyMembers6f5", "Family members")}</h3>
                <Table
                  rows={(detail.members || []).filter((m) => m.isActive !== false)}
                  empty={t("ui.noMembersAdded523", "No members added")}
                  columns={[
                    { key: "name", label: t("ui.name49e", "Name") },
                    { key: "relation", label: t("ui.relation671", "Relation") },
                    { key: "age", label: t("ui.age9d8", "Age"), render: (m) => m.age ?? "—" },
                    { key: "gender", label: t("ui.gender019", "Gender") },
                    { key: "occupation", label: t("ui.occupation752", "Occupation") },
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
                  {detail.isVerified ? "Unverify" : t("ui.verify5a7", "Verify")}
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