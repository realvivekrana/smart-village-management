import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");

      const data =
        response?.data?.data?.users ??
        response?.data?.users ??
        [];

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
        "Failed to fetch users:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (userId) => {
    try {
      setActionLoading(userId);
      setError("");

      await api.patch(
        `/users/${userId}/toggle-active`
      );

      await fetchUsers();
    } catch (err) {
      console.error(
        "Failed to update user status:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to update user status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const updateUserRole = async (
    userId,
    role
  ) => {
    try {
      setActionLoading(userId);
      setError("");

      await api.patch(
        `/users/${userId}/role`,
        {
          role,
        }
      );

      await fetchUsers();
    } catch (err) {
      console.error(
        "Failed to update user role:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to update user role."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(userId);
      setError("");

      await api.delete(
        `/users/${userId}`
      );

      setUsers((currentUsers) =>
        currentUsers.filter(
          (user) =>
            (user._id || user.id) !==
            userId
        )
      );
    } catch (err) {
      console.error(
        "Failed to delete user:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete user."
      );
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Users
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage registered village users
            and their access.
          </p>
        </div>

        <div className="rounded-lg bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Total: {users.length}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/70">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  User
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Phone
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Role
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const userId =
                    user._id || user.id;

                  const isActive =
                    user.isActive !== false;

                  return (
                    <tr
                      key={userId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                            {user.name
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "U"}
                          </div>

                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {user.name ||
                                "Unknown User"}
                            </div>

                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email ||
                                "No email"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {user.phone || "—"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <select
                          value={
                            user.role ||
                            "citizen"
                          }
                          disabled={
                            actionLoading ===
                            userId
                          }
                          onChange={(event) =>
                            updateUserRole(
                              userId,
                              event.target.value
                            )
                          }
                          className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm capitalize outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="citizen">
                            Citizen
                          </option>

                          <option value="business_owner">
                            Business Owner
                          </option>

                          <option value="admin">
                            Admin
                          </option>
                        </select>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            isActive
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                          }`}
                        >
                          {isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/users/${userId}`}
                            className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            View
                          </Link>

                          <button
                            type="button"
                            disabled={
                              actionLoading ===
                              userId
                            }
                            onClick={() =>
                              toggleUserStatus(
                                userId
                              )
                            }
                            className={`rounded-md px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
                              isActive
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200 dark:bg-green-900/40"
                            }`}
                          >
                            {actionLoading ===
                            userId
                              ? "Saving..."
                              : isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>

                          {user.role !==
                            "super_admin" && (
                            <button
                              type="button"
                              disabled={
                                actionLoading ===
                                userId
                              }
                              onClick={() =>
                                deleteUser(
                                  userId
                                )
                              }
                              className="rounded-md bg-red-100 dark:bg-red-900/30 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-200 dark:bg-red-900/40 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;