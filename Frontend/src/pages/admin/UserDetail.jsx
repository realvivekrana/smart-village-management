import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteUser,
  getUserById,
  toggleUserActive,
  updateUserRole,
} from "../../services/userService";
import { Badge, ErrorBox, Loading, Page } from "./AdminUI";

const roles = ["citizen", "admin"];

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getUserById(id);
      const data = response.data?.data?.user || response.data?.user || null;
      setUser(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleToggleActive = async () => {
    try {
      setActionLoading(true);
      await toggleUserActive(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (event) => {
    const role = event.target.value;
    try {
      setActionLoading(true);
      await updateUserRole(id, role);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user role");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    try {
      setActionLoading(true);
      await deleteUser(id);
      navigate("/admin/users");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Page title="User Details">
        <Loading text="Loading user..." />
      </Page>
    );
  }

  if (error && !user) {
    return (
      <Page title="User Details">
        <ErrorBox message={error} retry={load} />
      </Page>
    );
  }

  if (!user) {
    return (
      <Page title="User Details">
        <ErrorBox message="User not found" />
      </Page>
    );
  }

  const isActive = user.isActive !== false;
  const address = user.address || {};
  const addressParts = [
    address.houseNumber,
    address.street,
    address.village,
    address.district,
    address.state,
    address.pincode,
  ].filter(Boolean);

  return (
    <Page
      title="User Details"
      subtitle="View and manage this user's account."
      actions={
        <Link className="btn-secondary" to="/admin/users">
          ← Back to Users
        </Link>
      }
    >
      {error ? <ErrorBox message={error} retry={load} /> : null}

      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-semibold text-primary-700">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {user.name || "Unknown User"}
              </h2>
              <p className="text-sm text-gray-500">{user.email || "No email"}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone="blue">{(user.role || "citizen").replaceAll("_", " ")}</Badge>
                <Badge tone={isActive ? "green" : "red"}>{isActive ? "Active" : "Inactive"}</Badge>
                {user.isEmailVerified ? <Badge tone="green">Email verified</Badge> : <Badge tone="yellow">Email unverified</Badge>}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              className="input"
              value={user.role || "citizen"}
              disabled={actionLoading}
              onChange={handleRoleChange}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.replaceAll("_", " ")}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn-secondary"
              disabled={actionLoading}
              onClick={handleToggleActive}
            >
              {isActive ? "Deactivate" : "Activate"}
            </button>

            <button
              type="button"
              className="btn-danger"
              disabled={actionLoading}
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-4 font-semibold">Contact Information</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{user.phone || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{user.email || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Address</dt>
              <dd className="text-right font-medium text-gray-900 dark:text-white">
                {addressParts.length ? addressParts.join(", ") : "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="card p-6">
          <h3 className="mb-4 font-semibold">Account Information</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">User ID</dt>
              <dd className="font-mono text-xs text-gray-900 dark:text-white">{user._id || user.id}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Joined</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Last login</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleString("en-IN") : "Never"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </Page>
  );
}