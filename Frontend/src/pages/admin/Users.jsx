import React, { useEffect, useMemo, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  useEffect(() => {
    fetchUsers();
  }, []);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/admin/users`,
        {
          headers: getHeaders(),
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            `Failed to load users (${response.status})`
        );
      }

      const data =
        result?.data?.users ||
        result?.users ||
        result?.data ||
        [];

      setUsers(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error("Users error:", err);

      setError(
        err.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !keyword ||
        String(user.name || "")
          .toLowerCase()
          .includes(keyword) ||
        String(user.email || "")
          .toLowerCase()
          .includes(keyword) ||
        String(user.phone || "")
          .toLowerCase()
          .includes(keyword);

      const matchesRole =
        roleFilter === "all" ||
        String(user.role || "")
          .toLowerCase() ===
          roleFilter.toLowerCase();

      const isActive =
        user.isActive !== false &&
        user.active !== false;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          isActive) ||
        (statusFilter === "inactive" &&
          !isActive);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  const roles = useMemo(() => {
    return [
      ...new Set(
        users
          .map((user) => user.role)
          .filter(Boolean)
      ),
    ];
  }, [users]);

  const statistics = useMemo(() => {
    const active = users.filter(
      (user) =>
        user.isActive !== false &&
        user.active !== false
    ).length;

    const inactive =
      users.length - active;

    const admins = users.filter(
      (user) =>
        String(user.role || "")
          .toLowerCase() === "admin"
    ).length;

    const citizens = users.filter(
      (user) =>
        String(user.role || "")
          .toLowerCase() === "citizen"
    ).length;

    return {
      total: users.length,
      active,
      inactive,
      admins,
      citizens,
    };
  }, [users]);

  const deleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${
        user.name || user.email
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const userId =
        user._id || user.id;

      const response = await fetch(
        `${API_URL}/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Failed to delete user."
        );
      }

      setUsers((previous) =>
        previous.filter(
          (item) =>
            (item._id || item.id) !==
            userId
        )
      );

      setSuccess(
        result?.message ||
          "User deleted successfully."
      );

      setShowDetails(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(
        "Delete user error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete user."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const toggleUserStatus = async (user) => {
    const userId =
      user._id || user.id;

    const currentStatus =
      user.isActive !== false &&
      user.active !== false;

    const nextStatus =
      !currentStatus;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      /*
       * This endpoint assumes the admin user
       * status route used by the backend.
       */
      const response = await fetch(
        `${API_URL}/admin/users/${userId}/status`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            isActive: nextStatus,
            active: nextStatus,
          }),
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Failed to update user status."
        );
      }

      const updatedUser =
        result?.data?.user ||
        result?.user ||
        result?.data;

      setUsers((previous) =>
        previous.map((item) => {
          const itemId =
            item._id || item.id;

          if (itemId !== userId) {
            return item;
          }

          return {
            ...item,
            ...(updatedUser || {}),
            isActive: nextStatus,
            active: nextStatus,
          };
        })
      );

      setSelectedUser((previous) =>
        previous
          ? {
              ...previous,
              ...(updatedUser || {}),
              isActive: nextStatus,
              active: nextStatus,
            }
          : previous
      );

      setSuccess(
        result?.message ||
          `User ${
            nextStatus
              ? "activated"
              : "deactivated"
          } successfully.`
      );
    } catch (err) {
      console.error(
        "Toggle user status error:",
        err
      );

      setError(
        err.message ||
          "Unable to update user status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openDetails = (user) => {
    setSelectedUser(user);
    setShowDetails(true);
    setError("");
    setSuccess("");
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />

          <p className="mt-4 text-sm text-gray-500">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Administration
              </p>

              <h1 className="mt-1 text-2xl font-bold text-gray-900">
                Users
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage registered village users and
                their account status.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchUsers}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            ✓ {success}
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total Users"
            value={statistics.total}
            icon="👥"
          />

          <StatCard
            label="Active"
            value={statistics.active}
            icon="✓"
          />

          <StatCard
            label="Inactive"
            value={statistics.inactive}
            icon="⏸"
          />

          <StatCard
            label="Admins"
            value={statistics.admins}
            icon="🛡️"
          />

          <StatCard
            label="Citizens"
            value={statistics.citizens}
            icon="🏠"
          />
        </div>

        {/* Filters */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Search
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search by name, email or phone..."
                  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <Select
              label="Role"
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value)
              }
            >
              <option value="all">
                All Roles
              </option>

              {roles.map((role) => (
                <option
                  key={role}
                  value={role}
                >
                  {formatRole(role)}
                </option>
              ))}
            </Select>

            <Select
              label="Status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-gray-900">
                Registered Users
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {filteredUsers.length} user
                {filteredUsers.length !== 1
                  ? "s"
                  : ""}{" "}
                displayed
              </p>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <EmptyUsers
              search={search}
              filters={
                roleFilter !== "all" ||
                statusFilter !== "all"
              }
            />
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <Th>User</Th>
                      <Th>Phone</Th>
                      <Th>Role</Th>
                      <Th>Status</Th>
                      <Th>Joined</Th>
                      <Th align="right">
                        Actions
                      </Th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredUsers.map(
                      (user) => (
                        <UserRow
                          key={
                            user._id ||
                            user.id ||
                            user.email
                          }
                          user={user}
                          onView={() =>
                            openDetails(user)
                          }
                          onStatus={() =>
                            toggleUserStatus(
                              user
                            )
                          }
                          onDelete={() =>
                            deleteUser(user)
                          }
                          actionLoading={
                            actionLoading
                          }
                        />
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-gray-100 lg:hidden">
                {filteredUsers.map(
                  (user) => (
                    <MobileUserCard
                      key={
                        user._id ||
                        user.id ||
                        user.email
                      }
                      user={user}
                      onView={() =>
                        openDetails(user)
                      }
                      onStatus={() =>
                        toggleUserStatus(
                          user
                        )
                      }
                      onDelete={() =>
                        deleteUser(user)
                      }
                      actionLoading={
                        actionLoading
                      }
                    />
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={closeDetails}
          onStatus={() =>
            toggleUserStatus(
              selectedUser
            )
          }
          onDelete={() =>
            deleteUser(selectedUser)
          }
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Table Row
|--------------------------------------------------------------------------
*/

const UserRow = ({
  user,
  onView,
  onStatus,
  onDelete,
  actionLoading,
}) => {
  const active =
    user.isActive !== false &&
    user.active !== false;

  return (
    <tr className="hover:bg-gray-50">
      <td className="whitespace-nowrap px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar user={user} />

          <div>
            <p className="text-sm font-semibold text-gray-900">
              {user.name || "Unnamed User"}
            </p>

            <p className="mt-0.5 text-xs text-gray-500">
              {user.email || "No email"}
            </p>
          </div>
        </div>
      </td>

      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
        {user.phone || "—"}
      </td>

      <td className="whitespace-nowrap px-5 py-4">
        <RoleBadge role={user.role} />
      </td>

      <td className="whitespace-nowrap px-5 py-4">
        <StatusBadge active={active} />
      </td>

      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
        {formatDate(
          user.createdAt ||
            user.created_at ||
            user.date
        )}
      </td>

      <td className="whitespace-nowrap px-5 py-4">
        <div className="flex justify-end gap-2">
          <ActionButton
            label="View"
            onClick={onView}
          />

          <ActionButton
            label={
              active
                ? "Disable"
                : "Enable"
            }
            onClick={onStatus}
            disabled={actionLoading}
          />

          <ActionButton
            label="Delete"
            danger
            onClick={onDelete}
            disabled={actionLoading}
          />
        </div>
      </td>
    </tr>
  );
};

/*
|--------------------------------------------------------------------------
| Mobile Card
|--------------------------------------------------------------------------
*/

const MobileUserCard = ({
  user,
  onView,
  onStatus,
  onDelete,
  actionLoading,
}) => {
  const active =
    user.isActive !== false &&
    user.active !== false;

  return (
    <div className="p-5">
      <div className="flex items-start gap-3">
        <Avatar user={user} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-900">
              {user.name || "Unnamed User"}
            </h3>

            <RoleBadge role={user.role} />
            <StatusBadge active={active} />
          </div>

          <p className="mt-1 truncate text-sm text-gray-500">
            {user.email || "No email"}
          </p>

          {user.phone && (
            <p className="mt-1 text-sm text-gray-500">
              📞 {user.phone}
            </p>
          )}

          <p className="mt-1 text-xs text-gray-400">
            Joined{" "}
            {formatDate(
              user.createdAt ||
                user.created_at ||
                user.date
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton
          label="View Details"
          onClick={onView}
        />

        <ActionButton
          label={
            active
              ? "Disable"
              : "Enable"
          }
          onClick={onStatus}
          disabled={actionLoading}
        />

        <ActionButton
          label="Delete"
          danger
          onClick={onDelete}
          disabled={actionLoading}
        />
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Details Modal
|--------------------------------------------------------------------------
*/

const UserDetailsModal = ({
  user,
  onClose,
  onStatus,
  onDelete,
  actionLoading,
}) => {
  const active =
    user.isActive !== false &&
    user.active !== false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              User Details
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Complete account information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-5">
            <Avatar
              user={user}
              large
            />

            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {user.name ||
                  "Unnamed User"}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {user.email ||
                  "No email"}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                <RoleBadge
                  role={user.role}
                />

                <StatusBadge
                  active={active}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <DetailItem
              label="Full Name"
              value={user.name}
            />

            <DetailItem
              label="Email"
              value={user.email}
            />

            <DetailItem
              label="Phone"
              value={user.phone}
            />

            <DetailItem
              label="Role"
              value={formatRole(
                user.role
              )}
            />

            <DetailItem
              label="Account Status"
              value={
                active
                  ? "Active"
                  : "Inactive"
              }
            />

            <DetailItem
              label="Joined"
              value={formatDate(
                user.createdAt ||
                  user.created_at ||
                  user.date
              )}
            />

            <DetailItem
              label="Updated"
              value={formatDate(
                user.updatedAt ||
                  user.updated_at
              )}
            />

            <DetailItem
              label="User ID"
              value={
                user._id ||
                user.id
              }
            />
          </div>

          {user.address && (
            <div className="mt-4 rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Address
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-700">
                {formatAddress(
                  user.address
                )}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onStatus}
            disabled={actionLoading}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {active
              ? "Disable Account"
              : "Enable Account"}
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={actionLoading}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Reusable Components
|--------------------------------------------------------------------------
*/

const StatCard = ({
  label,
  value,
  icon,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
          {icon}
        </div>

        <div>
          <p className="text-2xl font-bold text-gray-900">
            {value}
          </p>

          <p className="mt-0.5 text-xs text-gray-500">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
};

const Avatar = ({
  user,
  large = false,
}) => {
  const name =
    user?.name ||
    user?.email ||
    "U";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");

  if (user?.avatar || user?.profileImage) {
    return (
      <img
        src={
          user.avatar ||
          user.profileImage
        }
        alt={name}
        className={`shrink-0 rounded-full object-cover ${
          large
            ? "h-16 w-16"
            : "h-10 w-10"
        }`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 ${
        large
          ? "h-16 w-16 text-lg"
          : "h-10 w-10 text-sm"
      }`}
    >
      {initials || "U"}
    </div>
  );
};

const RoleBadge = ({ role }) => {
  const normalized = String(
    role || "user"
  ).toLowerCase();

  const classes =
    normalized === "admin"
      ? "bg-purple-50 text-purple-700"
      : normalized === "official"
      ? "bg-blue-50 text-blue-700"
      : normalized === "staff"
      ? "bg-orange-50 text-orange-700"
      : "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}
    >
      {formatRole(role || "user")}
    </span>
  );
};

const StatusBadge = ({
  active,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-green-50 text-green-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? "bg-green-500"
            : "bg-red-500"
        }`}
      />

      {active ? "Active" : "Inactive"}
    </span>
  );
};

const ActionButton = ({
  label,
  onClick,
  danger = false,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
};

const Select = ({
  label,
  value,
  onChange,
  children,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {children}
      </select>
    </div>
  );
};

const Th = ({
  children,
  align,
}) => {
  return (
    <th
      className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 ${
        align === "right"
          ? "text-right"
          : ""
      }`}
    >
      {children}
    </th>
  );
};

const DetailItem = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-gray-900">
        {value || "—"}
      </p>
    </div>
  );
};

const EmptyUsers = ({
  search,
  filters,
}) => {
  return (
    <div className="px-6 py-16 text-center">
      <div className="text-5xl">👥</div>

      <h3 className="mt-4 text-lg font-bold text-gray-900">
        No users found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        {search || filters
          ? "No users match the selected search or filters."
          : "No registered users are available yet."}
      </p>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Utility Functions
|--------------------------------------------------------------------------
*/

const formatRole = (role) => {
  if (!role) {
    return "User";
  }

  return String(role)
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatAddress = (
  address
) => {
  if (!address) {
    return "";
  }

  if (typeof address === "string") {
    return address;
  }

  if (Array.isArray(address)) {
    return address
      .filter(Boolean)
      .join(", ");
  }

  return [
    address.line1,
    address.line2,
    address.village,
    address.city,
    address.district,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(", ");
};

export default Users;