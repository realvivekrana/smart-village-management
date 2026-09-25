import { useEffect, useState } from "react";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";
import { AdminPagination, Badge, ErrorBox, fmtDate, Loading, Page, Table, Toolbar } from "./AdminUI";

const roles = ["citizen", "business_owner", "admin", "super_admin"];

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [active, setActive] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const response = await api.get("/users", { params: { page, limit: 10, search: search || undefined, role: role || undefined, isActive: active || undefined } });
      setUsers(response.data?.data?.users || []); setPagination(response.data?.pagination || null);
    } catch (err) { setError(err.response?.data?.message || "Failed to load users"); }
    finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [role, active, search]);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [page, role, active, search]);

  const toggleActive = async (id) => {
    try { await api.patch(`/users/${id}/toggle-active`); await load(); }
    catch (err) { setError(err.response?.data?.message || "Action failed"); }
  };

  const changeRole = async (id, value) => {
    try { await api.patch(`/users/${id}/role`, { role: value }); await load(); }
    catch (err) { setError(err.response?.data?.message || "Unable to change role"); }
  };

  return (
    <Page title="Users" subtitle="Live user accounts with search, filters, activation and role management.">
      <Toolbar search={search} setSearch={setSearch} placeholder="Search name, email or phone" filters={<><select className="input" value={role} onChange={(e) => setRole(e.target.value)}><option value="">All roles</option>{roles.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select><select className="input" value={active} onChange={(e) => setActive(e.target.value)}><option value="">All status</option><option value="true">Active</option><option value="false">Inactive</option></select></>} onRefresh={load} />
      {error ? <ErrorBox message={error} retry={load} /> : null}
      {loading ? <Loading /> : <Table rows={users} columns={[
        { key: "name", label: "User", render: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-gray-500">{row.email}</p></div> },
        { key: "phone", label: "Phone" },
        { key: "role", label: "Role", render: (row) => <Badge tone={row.role?.includes("admin") ? "purple" : "blue"}>{row.role?.replaceAll("_", " ")}</Badge> },
        { key: "isActive", label: "Status", render: (row) => <Badge tone={row.isActive ? "green" : "red"}>{row.isActive ? "Active" : "Inactive"}</Badge> },
        { key: "createdAt", label: "Joined", render: (row) => fmtDate(row.createdAt) },
        { key: "actions", label: "Actions", render: (row) => <div className="flex flex-wrap gap-2"><button className={row.isActive ? "btn-danger" : "btn-secondary"} disabled={row._id === me?._id || row.role === "super_admin"} onClick={() => toggleActive(row._id)} type="button">{row.isActive ? "Deactivate" : "Activate"}</button>{me?.role === "super_admin" && row._id !== me?._id ? <select className="input w-auto" value={row.role} onChange={(e) => changeRole(row._id, e.target.value)}>{roles.filter((item) => item !== "super_admin").map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}<option value="super_admin">super admin</option></select> : null}</div> },
      ]} />}
      <AdminPagination pagination={pagination} onPageChange={setPage} />
    </Page>
  );
}
