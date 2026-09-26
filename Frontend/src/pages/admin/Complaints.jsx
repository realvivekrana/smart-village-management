import { useEffect, useState } from "react";
import api from "../../services/api";

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(null);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: 1,
        limit: 50,
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await api.get(
        "/complaints",
        {
          params,
        }
      );

      const data =
        response?.data?.data?.complaints ??
        response?.data?.complaints ??
        [];

      setComplaints(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Failed to fetch complaints:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const updateComplaint = async (
    complaintId,
    status,
    adminNote = ""
  ) => {
    try {
      setActionLoading(complaintId);
      setError("");

      await api.patch(
        `/complaints/${complaintId}/status`,
        {
          status,
          adminNote,
        }
      );

      await fetchComplaints();
    } catch (err) {
      console.error(
        "Failed to update complaint:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to update complaint."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (
    complaint
  ) => {
    const complaintId =
      complaint._id || complaint.id;

    const newStatus =
      complaint.status === "resolved"
        ? "in_progress"
        : "resolved";

    const note = window.prompt(
      "Enter admin note:",
      complaint.adminNote ||
        complaint.note ||
        ""
    );

    if (note === null) {
      return;
    }

    await updateComplaint(
      complaintId,
      newStatus,
      note
    );
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Pending";

      case "in_progress":
        return "In Progress";

      case "resolved":
        return "Resolved";

      case "rejected":
        return "Rejected";

      default:
        return status || "Unknown";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";

      case "in_progress":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800";

      case "resolved":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";

      case "rejected":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";

      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Loading complaints...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Complaints
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and respond to citizen
            complaints.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">
            All Statuses
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="in_progress">
            In Progress
          </option>

          <option value="resolved">
            Resolved
          </option>

          <option value="rejected">
            Rejected
          </option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Complaints */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/70">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Complaint
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Citizen
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Category
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Date
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {complaints.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No complaints found.
                  </td>
                </tr>
              ) : (
                complaints.map(
                  (complaint) => {
                    const complaintId =
                      complaint._id ||
                      complaint.id;

                    const citizen =
                      complaint.user ||
                      complaint.citizen ||
                      complaint.createdBy;

                    const citizenName =
                      citizen?.name ||
                      complaint.userName ||
                      "Unknown";

                    const citizenEmail =
                      citizen?.email ||
                      complaint.userEmail ||
                      "";

                    return (
                      <tr
                        key={
                          complaintId
                        }
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        {/* Complaint */}
                        <td className="max-w-xs px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {complaint.title ||
                              complaint.subject ||
                              "Untitled Complaint"}
                          </div>

                          <div className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
                            {complaint.description ||
                              "No description"}
                          </div>

                          {(complaint.adminNote ||
                            complaint.note) && (
                            <div className="mt-2 rounded-md bg-gray-50 dark:bg-gray-800/70 px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-semibold">
                                Admin Note:
                              </span>{" "}
                              {complaint.adminNote ||
                                complaint.note}
                            </div>
                          )}
                        </td>

                        {/* Citizen */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {citizenName}
                          </div>

                          {citizenEmail && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {citizenEmail}
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {complaint.category ||
                            "—"}
                        </td>

                        {/* Status */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              complaint.status
                            )}`}
                          >
                            {getStatusLabel(
                              complaint.status
                            )}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {complaint.createdAt
                            ? new Date(
                                complaint.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "—"}
                        </td>

                        {/* Action */}
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <button
                            type="button"
                            disabled={
                              actionLoading ===
                              complaintId
                            }
                            onClick={() =>
                              handleStatusChange(
                                complaint
                              )
                            }
                            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {actionLoading ===
                            complaintId
                              ? "Saving..."
                              : complaint.status ===
                                "resolved"
                              ? "Reopen"
                              : "Update"}
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Complaints;