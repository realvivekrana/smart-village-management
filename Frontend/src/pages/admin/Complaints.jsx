import { useEffect, useState } from "react";
import api from "../../services/api";

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const [selectedComplaint, setSelectedComplaint] =
    useState(null);

  const [note, setNote] = useState("");

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/complaints");

      const data =
        response?.data?.data ??
        response?.data?.complaints ??
        response?.data ??
        [];

      setComplaints(Array.isArray(data) ? data : []);
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
  }, []);

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
          note: adminNote,
        }
      );

      setSelectedComplaint(null);
      setNote("");

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

  const deleteComplaint = async (complaintId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this complaint?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(complaintId);
      setError("");

      await api.delete(
        `/complaints/${complaintId}`
      );

      setComplaints((current) =>
        current.filter(
          (complaint) =>
            (complaint._id || complaint.id) !==
            complaintId
        )
      );
    } catch (err) {
      console.error(
        "Failed to delete complaint:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete complaint."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-700";

      case "in-progress":
      case "in_progress":
        return "bg-blue-100 text-blue-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading complaints...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Complaints
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review and manage complaints submitted by
            villagers.
          </p>
        </div>

        <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
          Total: {complaints.length}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

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

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {complaints.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    No complaints found.
                  </td>
                </tr>
              ) : (
                complaints.map((complaint) => {
                  const complaintId =
                    complaint._id || complaint.id;

                  const citizen =
                    complaint.user ||
                    complaint.createdBy ||
                    complaint.citizen;

                  return (
                    <tr
                      key={complaintId}
                      className="hover:bg-gray-50"
                    >
                      <td className="max-w-xs px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {complaint.title ||
                            complaint.subject ||
                            "Untitled Complaint"}
                        </div>

                        <p className="mt-1 truncate text-sm text-gray-500">
                          {complaint.description ||
                            complaint.message ||
                            "No description"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {citizen?.name ||
                            complaint.name ||
                            "Unknown"}
                        </div>

                        <div className="text-xs text-gray-500">
                          {citizen?.email ||
                            complaint.email ||
                            ""}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {complaint.category || "General"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                            complaint.status
                          )}`}
                        >
                          {String(
                            complaint.status ||
                              "pending"
                          ).replace(
                            /-/g,
                            " "
                          )}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedComplaint(
                                complaint
                              );
                              setNote(
                                complaint.adminNote ||
                                  complaint.note ||
                                  ""
                              );
                            }}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Manage
                          </button>

                          <button
                            type="button"
                            disabled={
                              actionLoading ===
                              complaintId
                            }
                            onClick={() =>
                              deleteComplaint(
                                complaintId
                              )
                            }
                            className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
                          >
                            Delete
                          </button>
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

      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Manage Complaint
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {selectedComplaint.title ||
                  selectedComplaint.subject ||
                  "Complaint"}
              </p>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Admin Note
                </label>

                <textarea
                  value={note}
                  onChange={(event) =>
                    setNote(event.target.value)
                  }
                  rows={4}
                  placeholder="Add a note for this complaint..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Update Status
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={
                      actionLoading ===
                      (selectedComplaint._id ||
                        selectedComplaint.id)
                    }
                    onClick={() =>
                      updateComplaint(
                        selectedComplaint._id ||
                          selectedComplaint.id,
                        "pending",
                        note
                      )
                    }
                    className="rounded-lg bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800 hover:bg-yellow-200"
                  >
                    Pending
                  </button>

                  <button
                    type="button"
                    disabled={
                      actionLoading ===
                      (selectedComplaint._id ||
                        selectedComplaint.id)
                    }
                    onClick={() =>
                      updateComplaint(
                        selectedComplaint._id ||
                          selectedComplaint.id,
                        "in-progress",
                        note
                      )
                    }
                    className="rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 hover:bg-blue-200"
                  >
                    In Progress
                  </button>

                  <button
                    type="button"
                    disabled={
                      actionLoading ===
                      (selectedComplaint._id ||
                        selectedComplaint.id)
                    }
                    onClick={() =>
                      updateComplaint(
                        selectedComplaint._id ||
                          selectedComplaint.id,
                        "resolved",
                        note
                      )
                    }
                    className="rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-200"
                  >
                    Resolved
                  </button>

                  <button
                    type="button"
                    disabled={
                      actionLoading ===
                      (selectedComplaint._id ||
                        selectedComplaint.id)
                    }
                    onClick={() =>
                      updateComplaint(
                        selectedComplaint._id ||
                          selectedComplaint.id,
                        "rejected",
                        note
                      )
                    }
                    className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Rejected
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedComplaint(null);
                  setNote("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;