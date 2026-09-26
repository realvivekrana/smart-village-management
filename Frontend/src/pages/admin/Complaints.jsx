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
        return "bg-blue-100 text-blue-800";

      case "resolved":
        return "bg-green-100 text-green-800";

      case "rejected":
        return "bg-red-100 text-red-800";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading complaints...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Complaints
          </h1>

          <p className="mt-1 text-sm text-gray-500">
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
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Complaints */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Complaint
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Citizen
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Category
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Date
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {complaints.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-sm text-gray-500"
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
                        className="hover:bg-gray-50"
                      >
                        {/* Complaint */}
                        <td className="max-w-xs px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {complaint.title ||
                              complaint.subject ||
                              "Untitled Complaint"}
                          </div>

                          <div className="mt-1 truncate text-sm text-gray-500">
                            {complaint.description ||
                              "No description"}
                          </div>

                          {(complaint.adminNote ||
                            complaint.note) && (
                            <div className="mt-2 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
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
                          <div className="text-sm font-medium text-gray-900">
                            {citizenName}
                          </div>

                          {citizenEmail && (
                            <div className="text-xs text-gray-500">
                              {citizenEmail}
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
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
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
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