import { useEffect, useState } from "react";
import api from "../../services/api";

const Businesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(null);
  const [error, setError] = useState("");

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/businesses/admin/all"
      );

      const data =
        response?.data?.data?.businesses ??
        response?.data?.businesses ??
        [];

      setBusinesses(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Failed to fetch businesses:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load businesses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const updateBusinessStatus = async (
    businessId,
    status
  ) => {
    try {
      setActionLoading(businessId);
      setError("");

      await api.patch(
        `/businesses/${businessId}/review`,
        {
          status,
        }
      );

      await fetchBusinesses();
    } catch (err) {
      console.error(
        "Failed to update business status:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to update business status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const deleteBusiness = async (
    businessId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this business?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(businessId);
      setError("");

      await api.delete(
        `/businesses/${businessId}`
      );

      setBusinesses((current) =>
        current.filter(
          (business) =>
            (business._id ||
              business.id) !==
            businessId
        )
      );
    } catch (err) {
      console.error(
        "Failed to delete business:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete business."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-800";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "suspended":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "approved":
        return "Approved";

      case "pending":
        return "Pending";

      case "rejected":
        return "Rejected";

      case "suspended":
        return "Suspended";

      default:
        return status || "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading businesses...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Businesses
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage registered businesses in
            the village.
          </p>
        </div>

        <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
          Total: {businesses.length}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Business
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Owner
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Category
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Contact
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {businesses.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    No businesses found.
                  </td>
                </tr>
              ) : (
                businesses.map(
                  (business) => {
                    const businessId =
                      business._id ||
                      business.id;

                    const owner =
                      business.owner ||
                      business.user;

                    const ownerName =
                      owner?.name ||
                      business.ownerName ||
                      "Unknown";

                    const ownerEmail =
                      owner?.email ||
                      business.ownerEmail ||
                      "";

                    return (
                      <tr
                        key={
                          businessId
                        }
                        className="hover:bg-gray-50"
                      >
                        {/* Business */}
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {business.name ||
                              "Unnamed Business"}
                          </div>

                          {business.description && (
                            <div className="mt-1 max-w-xs truncate text-sm text-gray-500">
                              {
                                business.description
                              }
                            </div>
                          )}
                        </td>

                        {/* Owner */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {ownerName}
                          </div>

                          {ownerEmail && (
                            <div className="text-xs text-gray-500">
                              {ownerEmail}
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {business.category ||
                            business.businessType ||
                            "—"}
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">
                            {business.phone ||
                              "—"}
                          </div>

                          {business.email && (
                            <div className="text-xs text-gray-500">
                              {business.email}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              business.status
                            )}`}
                          >
                            {getStatusLabel(
                              business.status
                            )}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            {business.status !==
                              "approved" && (
                              <button
                                type="button"
                                disabled={
                                  actionLoading ===
                                  businessId
                                }
                                onClick={() =>
                                  updateBusinessStatus(
                                    businessId,
                                    "approved"
                                  )
                                }
                                className="rounded-md bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-200 disabled:opacity-50"
                              >
                                Approve
                              </button>
                            )}

                            {business.status !==
                              "rejected" && (
                              <button
                                type="button"
                                disabled={
                                  actionLoading ===
                                  businessId
                                }
                                onClick={() =>
                                  updateBusinessStatus(
                                    businessId,
                                    "rejected"
                                  )
                                }
                                className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            )}

                            {business.status !==
                              "suspended" && (
                              <button
                                type="button"
                                disabled={
                                  actionLoading ===
                                  businessId
                                }
                                onClick={() =>
                                  updateBusinessStatus(
                                    businessId,
                                    "suspended"
                                  )
                                }
                                className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                              >
                                Suspend
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={
                                actionLoading ===
                                businessId
                              }
                              onClick={() =>
                                deleteBusiness(
                                  businessId
                                )
                              }
                              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
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

export default Businesses;