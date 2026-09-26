import React, { useEffect, useMemo, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [status, setStatus] = useState("");
  const [adminResponse, setAdminResponse] = useState("");

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/admin/complaints`,
        {
          headers,
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            `Failed to load complaints (${response.status})`
        );
      }

      const data =
        result?.data?.complaints ||
        result?.complaints ||
        result?.data ||
        [];

      setComplaints(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (complaint) =>
    String(
      complaint.status ||
        complaint.complaintStatus ||
        "pending"
    ).toLowerCase();

  const getPriority = (complaint) =>
    String(
      complaint.priority || "medium"
    ).toLowerCase();

  const filteredComplaints = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return complaints.filter(
      (complaint) => {
        const title =
          complaint.title ||
          complaint.subject ||
          complaint.name ||
          "";

        const description =
          complaint.description ||
          complaint.message ||
          "";

        const category =
          complaint.category || "";

        const userName =
          complaint.user?.name ||
          complaint.user?.fullName ||
          complaint.userName ||
          complaint.name ||
          "";

        const matchesSearch =
          !keyword ||
          String(title)
            .toLowerCase()
            .includes(keyword) ||
          String(description)
            .toLowerCase()
            .includes(keyword) ||
          String(category)
            .toLowerCase()
            .includes(keyword) ||
          String(userName)
            .toLowerCase()
            .includes(keyword);

        const matchesStatus =
          statusFilter === "all" ||
          getStatus(complaint) ===
            statusFilter;

        const matchesPriority =
          priorityFilter === "all" ||
          getPriority(complaint) ===
            priorityFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority
        );
      }
    );
  }, [
    complaints,
    search,
    statusFilter,
    priorityFilter,
  ]);

  const stats = useMemo(() => {
    return {
      total: complaints.length,

      pending: complaints.filter(
        (item) =>
          getStatus(item) === "pending"
      ).length,

      inProgress: complaints.filter(
        (item) =>
          getStatus(item) ===
          "in-progress" ||
          getStatus(item) ===
          "in_progress"
      ).length,

      resolved: complaints.filter(
        (item) =>
          getStatus(item) ===
          "resolved"
      ).length,

      rejected: complaints.filter(
        (item) =>
          getStatus(item) ===
          "rejected"
      ).length,
    };
  }, [complaints]);

  const openComplaint = (complaint) => {
    setSelectedComplaint(
      complaint
    );

    setStatus(getStatus(complaint));

    setAdminResponse(
      complaint.adminResponse ||
        complaint.response ||
        complaint.resolution ||
        ""
    );

    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const updateComplaint = async (
    event
  ) => {
    event.preventDefault();

    if (!selectedComplaint) {
      return;
    }

    const id =
      selectedComplaint._id ||
      selectedComplaint.id;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const payload = {
        status,
        adminResponse,
        response: adminResponse,
      };

      const possibleUrls = [
        `${API_URL}/admin/complaints/${id}`,
        `${API_URL}/admin/complaints/${id}/status`,
      ];

      let response = null;
      let result = {};

      for (
        let index = 0;
        index < possibleUrls.length;
        index += 1
      ) {
        response = await fetch(
          possibleUrls[index],
          {
            method:
              index === 0
                ? "PUT"
                : "PATCH",
            headers,
            body: JSON.stringify(
              payload
            ),
          }
        );

        result = await response
          .json()
          .catch(() => ({}));

        if (
          response.ok ||
          response.status !== 404
        ) {
          break;
        }
      }

      if (!response?.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Failed to update complaint."
        );
      }

      const updated =
        result?.data?.complaint ||
        result?.complaint ||
        result?.data;

      setComplaints((previous) =>
        previous.map((item) => {
          const itemId =
            item._id || item.id;

          if (itemId !== id) {
            return item;
          }

          return {
            ...item,
            ...(updated || {}),
            status,
            complaintStatus: status,
            adminResponse,
            response: adminResponse,
          };
        })
      );

      setSuccess(
        result?.message ||
          "Complaint updated successfully."
      );

      setShowModal(false);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to update complaint."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const deleteComplaint = async (
    complaint
  ) => {
    const id =
      complaint._id ||
      complaint.id;

    const confirmed = window.confirm(
      "Are you sure you want to delete this complaint?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/admin/complaints/${id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Failed to delete complaint."
        );
      }

      setComplaints((previous) =>
        previous.filter(
          (item) =>
            (item._id || item.id) !== id
        )
      );

      setSuccess(
        result?.message ||
          "Complaint deleted successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to delete complaint."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />

          <p className="mt-4 text-sm text-gray-500">
            Loading complaints...
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
                Complaints
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Review, manage and resolve
                complaints submitted by villagers.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchComplaints}
              className="w-fit rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Stat
            title="Total"
            value={stats.total}
            icon="📋"
          />

          <Stat
            title="Pending"
            value={stats.pending}
            icon="⏳"
          />

          <Stat
            title="In Progress"
            value={stats.inProgress}
            icon="🔄"
          />

          <Stat
            title="Resolved"
            value={stats.resolved}
            icon="✓"
          />

          <Stat
            title="Rejected"
            value={stats.rejected}
            icon="✕"
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
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                  🔍
                </span>

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search complaints..."
                  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All Status
              </option>
              <option value="pending">
                Pending
              </option>
              <option value="in-progress">
                In Progress
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
            </FilterSelect>

            <FilterSelect
              label="Priority"
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All Priority
              </option>
              <option value="low">
                Low
              </option>
              <option value="medium">
                Medium
              </option>
              <option value="high">
                High
              </option>
              <option value="urgent">
                Urgent
              </option>
            </FilterSelect>
          </div>
        </div>

        {/* Complaints */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-bold text-gray-900">
              Complaint Management
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {filteredComplaints.length} complaint
              {filteredComplaints.length !== 1
                ? "s"
                : ""}{" "}
              displayed
            </p>
          </div>

          {filteredComplaints.length ===
          0 ? (
            <EmptyState
              filtered={
                Boolean(search) ||
                statusFilter !== "all" ||
                priorityFilter !== "all"
              }
            />
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <Th>Complaint</Th>
                      <Th>Citizen</Th>
                      <Th>Category</Th>
                      <Th>Priority</Th>
                      <Th>Status</Th>
                      <Th>Date</Th>
                      <Th>Action</Th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredComplaints.map(
                      (complaint) => (
                        <ComplaintRow
                          key={
                            complaint._id ||
                            complaint.id
                          }
                          complaint={
                            complaint
                          }
                          onView={() =>
                            openComplaint(
                              complaint
                            )
                          }
                          onDelete={() =>
                            deleteComplaint(
                              complaint
                            )
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
                {filteredComplaints.map(
                  (complaint) => (
                    <ComplaintCard
                      key={
                        complaint._id ||
                        complaint.id
                      }
                      complaint={
                        complaint
                      }
                      onView={() =>
                        openComplaint(
                          complaint
                        )
                      }
                      onDelete={() =>
                        deleteComplaint(
                          complaint
                        )
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
      {showModal &&
        selectedComplaint && (
          <ComplaintModal
            complaint={
              selectedComplaint
            }
            status={status}
            setStatus={setStatus}
            adminResponse={
              adminResponse
            }
            setAdminResponse={
              setAdminResponse
            }
            onSubmit={
              updateComplaint
            }
            onClose={() => {
              setShowModal(false);
              setSelectedComplaint(
                null
              );
            }}
            actionLoading={
              actionLoading
            }
          />
        )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Complaint Row */
/* -------------------------------------------------------------------------- */

const ComplaintRow = ({
  complaint,
  onView,
  onDelete,
  actionLoading,
}) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="max-w-[300px] px-5 py-4">
        <p className="truncate text-sm font-semibold text-gray-900">
          {getTitle(complaint)}
        </p>

        <p className="mt-1 truncate text-xs text-gray-500">
          {getDescription(complaint)}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-gray-800">
          {getCitizen(complaint)}
        </p>

        {complaint.user?.email && (
          <p className="mt-1 text-xs text-gray-500">
            {complaint.user.email}
          </p>
        )}
      </td>

      <td className="px-5 py-4">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          {formatLabel(
            complaint.category ||
              "General"
          )}
        </span>
      </td>

      <td className="px-5 py-4">
        <PriorityBadge
          priority={getPriority(
            complaint
          )}
        />
      </td>

      <td className="px-5 py-4">
        <StatusBadge
          status={getStatus(
            complaint
          )}
        />
      </td>

      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
        {formatDate(
          complaint.createdAt ||
            complaint.created_at
        )}
      </td>

      <td className="px-5 py-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onView}
            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
          >
            View
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={actionLoading}
            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

/* -------------------------------------------------------------------------- */
/* Mobile Card */
/* -------------------------------------------------------------------------- */

const ComplaintCard = ({
  complaint,
  onView,
  onDelete,
  actionLoading,
}) => {
  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900">
            {getTitle(complaint)}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {getCitizen(complaint)}
          </p>
        </div>

        <PriorityBadge
          priority={getPriority(
            complaint
          )}
        />
      </div>

      <p className="mt-3 text-sm leading-6 text-gray-600">
        {getDescription(complaint)}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          {formatLabel(
            complaint.category ||
              "General"
          )}
        </span>

        <StatusBadge
          status={getStatus(
            complaint
          )}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {formatDate(
            complaint.createdAt ||
              complaint.created_at
          )}
        </span>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onView}
            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700"
          >
            View
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={actionLoading}
            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Modal */
/* -------------------------------------------------------------------------- */

const ComplaintModal = ({
  complaint,
  status,
  setStatus,
  adminResponse,
  setAdminResponse,
  onSubmit,
  onClose,
  actionLoading,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Complaint Details
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              {getTitle(complaint)}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-gray-400 hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="p-6"
        >
          {/* Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Detail
              label="Citizen"
              value={getCitizen(
                complaint
              )}
            />

            <Detail
              label="Category"
              value={formatLabel(
                complaint.category ||
                  "General"
              )}
            />

            <Detail
              label="Priority"
              value={formatLabel(
                getPriority(
                  complaint
                )
              )}
            />

            <Detail
              label="Submitted"
              value={formatDate(
                complaint.createdAt ||
                  complaint.created_at
              )}
            />

            {complaint.location && (
              <Detail
                label="Location"
                value={
                  typeof complaint.location ===
                  "string"
                    ? complaint.location
                    : complaint.location
                        ?.address ||
                      complaint.location
                        ?.village ||
                      "Location available"
                }
              />
            )}

            {complaint.phone && (
              <Detail
                label="Phone"
                value={
                  complaint.phone
                }
              />
            )}
          </div>

          {/* Description */}
          <div className="mt-6">
            <h3 className="text-sm font-bold text-gray-900">
              Complaint Description
            </h3>

            <div className="mt-2 rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-700">
              {getDescription(
                complaint
              )}
            </div>
          </div>

          {/* Current Status */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Update Status
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="pending">
                Pending
              </option>

              <option value="in-progress">
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

          {/* Response */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Admin Response
            </label>

            <textarea
              value={adminResponse}
              onChange={(event) =>
                setAdminResponse(
                  event.target.value
                )
              }
              rows={5}
              placeholder="Write a response or resolution note..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={actionLoading}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={actionLoading}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading
                ? "Updating..."
                : "Update Complaint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Components */
/* -------------------------------------------------------------------------- */

const Stat = ({
  title,
  value,
  icon,
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
        {icon}
      </div>

      <div>
        <p className="text-2xl font-bold text-gray-900">
          {value}
        </p>

        <p className="text-xs text-gray-500">
          {title}
        </p>
      </div>
    </div>
  </div>
);

const FilterSelect = ({
  label,
  value,
  onChange,
  children,
}) => (
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

const Th = ({ children }) => (
  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
    {children}
  </th>
);

const Detail = ({
  label,
  value,
}) => (
  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
      {label}
    </p>

    <p className="mt-1 text-sm font-medium text-gray-800">
      {value || "—"}
    </p>
  </div>
);

const StatusBadge = ({
  status,
}) => {
  const config = {
    pending: {
      text: "Pending",
      className:
        "bg-yellow-50 text-yellow-700",
    },

    "in-progress": {
      text: "In Progress",
      className:
        "bg-blue-50 text-blue-700",
    },

    in_progress: {
      text: "In Progress",
      className:
        "bg-blue-50 text-blue-700",
    },

    resolved: {
      text: "Resolved",
      className:
        "bg-green-50 text-green-700",
    },

    rejected: {
      text: "Rejected",
      className:
        "bg-red-50 text-red-700",
    },
  };

  const current =
    config[status] || {
      text: formatLabel(status),
      className:
        "bg-gray-100 text-gray-700",
    };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${current.className}`}
    >
      {current.text}
    </span>
  );
};

const PriorityBadge = ({
  priority,
}) => {
  const config = {
    low: {
      className:
        "bg-gray-100 text-gray-700",
    },

    medium: {
      className:
        "bg-blue-50 text-blue-700",
    },

    high: {
      className:
        "bg-orange-50 text-orange-700",
    },

    urgent: {
      className:
        "bg-red-50 text-red-700",
    },
  };

  const current =
    config[priority] || config.medium;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${current.className}`}
    >
      {formatLabel(priority)}
    </span>
  );
};

const EmptyState = ({
  filtered,
}) => (
  <div className="px-6 py-16 text-center">
    <div className="text-5xl">
      📋
    </div>

    <h3 className="mt-4 text-lg font-bold text-gray-900">
      No complaints found
    </h3>

    <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
      {filtered
        ? "No complaints match the current search or filters."
        : "There are no complaints in the system yet."}
    </p>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------------------------------- */

const getTitle = (complaint) =>
  complaint.title ||
  complaint.subject ||
  complaint.name ||
  "Untitled Complaint";

const getDescription = (
  complaint
) =>
  complaint.description ||
  complaint.message ||
  complaint.details ||
  complaint.content ||
  "No description available.";

const getCitizen = (complaint) =>
  complaint.user?.name ||
  complaint.user?.fullName ||
  complaint.userName ||
  complaint.citizenName ||
  complaint.name ||
  "Unknown Citizen";

const formatLabel = (value) =>
  String(value || "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

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

export default Complaints;