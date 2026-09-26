import React, { useEffect, useMemo, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const Businesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [showModal, setShowModal] =
    useState(false);
  const [editingBusiness, setEditingBusiness] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    ownerName: "",
    category: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    village: "",
    openingHours: "",
    status: "active",
    image: "",
  });

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
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/admin/businesses`,
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
            "Failed to load businesses."
        );
      }

      const data =
        result?.data?.businesses ||
        result?.businesses ||
        result?.data ||
        [];

      setBusinesses(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load businesses."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return businesses.filter(
      (business) => {
        const name =
          business.name ||
          business.businessName ||
          "";

        const owner =
          business.ownerName ||
          business.owner?.name ||
          "";

        const category =
          business.category || "";

        const village =
          business.village ||
          business.location?.village ||
          "";

        const status =
          String(
            business.status || "active"
          ).toLowerCase();

        const matchesSearch =
          !keyword ||
          String(name)
            .toLowerCase()
            .includes(keyword) ||
          String(owner)
            .toLowerCase()
            .includes(keyword) ||
          String(category)
            .toLowerCase()
            .includes(keyword) ||
          String(village)
            .toLowerCase()
            .includes(keyword);

        const matchesStatus =
          statusFilter === "all" ||
          status === statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    businesses,
    search,
    statusFilter,
  ]);

  const stats = useMemo(() => {
    return {
      total: businesses.length,

      active: businesses.filter(
        (item) =>
          String(
            item.status || "active"
          ).toLowerCase() === "active"
      ).length,

      pending: businesses.filter(
        (item) =>
          String(
            item.status || ""
          ).toLowerCase() === "pending"
      ).length,

      inactive: businesses.filter(
        (item) =>
          String(
            item.status || ""
          ).toLowerCase() === "inactive"
      ).length,
    };
  }, [businesses]);

  const resetForm = () => {
    setForm({
      name: "",
      ownerName: "",
      category: "",
      description: "",
      phone: "",
      email: "",
      address: "",
      village: "",
      openingHours: "",
      status: "active",
      image: "",
    });
  };

  const openAddModal = () => {
    setEditingBusiness(null);
    resetForm();
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (business) => {
    setEditingBusiness(business);

    setForm({
      name:
        business.name ||
        business.businessName ||
        "",

      ownerName:
        business.ownerName ||
        business.owner?.name ||
        "",

      category:
        business.category || "",

      description:
        business.description || "",

      phone:
        business.phone ||
        business.contactNumber ||
        "",

      email:
        business.email || "",

      address:
        typeof business.address ===
        "string"
          ? business.address
          : business.address?.address ||
            "",

      village:
        business.village ||
        business.location?.village ||
        "",

      openingHours:
        business.openingHours ||
        business.hours ||
        "",

      status:
        business.status || "active",

      image:
        business.image ||
        business.imageUrl ||
        "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const saveBusiness = async (
    event
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError(
        "Business name is required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const id =
        editingBusiness?._id ||
        editingBusiness?.id;

      const isEditing =
        Boolean(editingBusiness);

      const urls = isEditing
        ? [
            `${API_URL}/admin/businesses/${id}`,
            `${API_URL}/businesses/${id}`,
          ]
        : [
            `${API_URL}/admin/businesses`,
            `${API_URL}/businesses`,
          ];

      const payload = {
        ...form,

        businessName: form.name,

        contactNumber: form.phone,
      };

      let response = null;
      let result = {};

      for (
        let index = 0;
        index < urls.length;
        index += 1
      ) {
        response = await fetch(
          urls[index],
          {
            method: isEditing
              ? "PUT"
              : "POST",
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
            `Unable to ${
              isEditing
                ? "update"
                : "create"
            } business.`
        );
      }

      const saved =
        result?.data?.business ||
        result?.business ||
        result?.data;

      if (isEditing) {
        setBusinesses(
          (previous) =>
            previous.map((item) => {
              const itemId =
                item._id || item.id;

              if (itemId !== id) {
                return item;
              }

              return {
                ...item,
                ...(saved || {}),
                ...payload,
              };
            })
        );
      } else {
        const newBusiness =
          saved || {
            ...payload,
            _id: `local-${Date.now()}`,
          };

        setBusinesses(
          (previous) => [
            newBusiness,
            ...previous,
          ]
        );
      }

      setSuccess(
        result?.message ||
          `Business ${
            isEditing
              ? "updated"
              : "created"
          } successfully.`
      );

      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to save business."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteBusiness = async (
    business
  ) => {
    const id =
      business._id ||
      business.id;

    const confirmed =
      window.confirm(
        `Delete "${
          business.name ||
          business.businessName ||
          "this business"
        }"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/admin/businesses/${id}`,
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
            "Failed to delete business."
        );
      }

      setBusinesses(
        (previous) =>
          previous.filter(
            (item) =>
              (item._id || item.id) !==
              id
          )
      );

      setSuccess(
        result?.message ||
          "Business deleted successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to delete business."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (
    business
  ) => {
    const id =
      business._id ||
      business.id;

    const currentStatus =
      String(
        business.status || "active"
      ).toLowerCase();

    const newStatus =
      currentStatus === "active"
        ? "inactive"
        : "active";

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${API_URL}/admin/businesses/${id}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            status: newStatus,
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
            "Failed to update status."
        );
      }

      setBusinesses(
        (previous) =>
          previous.map((item) => {
            const itemId =
              item._id || item.id;

            if (itemId !== id) {
              return item;
            }

            return {
              ...item,
              status: newStatus,
            };
          })
      );

      setSuccess(
        `Business marked as ${newStatus}.`
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to update status."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />

          <p className="mt-4 text-sm text-gray-500">
            Loading businesses...
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
                Village Businesses
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage local businesses,
                owners and business information.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={fetchBusinesses}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                ↻ Refresh
              </button>

              <button
                type="button"
                onClick={openAddModal}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                + Add Business
              </button>
            </div>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            icon="🏪"
            title="Total Businesses"
            value={stats.total}
          />

          <Stat
            icon="✓"
            title="Active"
            value={stats.active}
          />

          <Stat
            icon="⏳"
            title="Pending"
            value={stats.pending}
          />

          <Stat
            icon="○"
            title="Inactive"
            value={stats.inactive}
          />
        </div>

        {/* Filters */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Search Businesses
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
                  placeholder="Search by name, owner, category or village..."
                  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">
                  All Status
                </option>

                <option value="active">
                  Active
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-bold text-gray-900">
              Business Directory
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {filteredBusinesses.length} business
              {filteredBusinesses.length !==
              1
                ? "es"
                : ""}{" "}
              displayed
            </p>
          </div>

          {filteredBusinesses.length ===
          0 ? (
            <EmptyState
              filtered={
                Boolean(search) ||
                statusFilter !== "all"
              }
              onAdd={openAddModal}
            />
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <Th>Business</Th>
                      <Th>Owner</Th>
                      <Th>Category</Th>
                      <Th>Contact</Th>
                      <Th>Village</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredBusinesses.map(
                      (business) => (
                        <BusinessRow
                          key={
                            business._id ||
                            business.id
                          }
                          business={
                            business
                          }
                          onEdit={() =>
                            openEditModal(
                              business
                            )
                          }
                          onDelete={() =>
                            deleteBusiness(
                              business
                            )
                          }
                          onToggle={() =>
                            toggleStatus(
                              business
                            )
                          }
                          disabled={saving}
                        />
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-gray-100 lg:hidden">
                {filteredBusinesses.map(
                  (business) => (
                    <BusinessCard
                      key={
                        business._id ||
                        business.id
                      }
                      business={
                        business
                      }
                      onEdit={() =>
                        openEditModal(
                          business
                        )
                      }
                      onDelete={() =>
                        deleteBusiness(
                          business
                        )
                      }
                      onToggle={() =>
                        toggleStatus(
                          business
                        )
                      }
                      disabled={saving}
                    />
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <BusinessModal
          form={form}
          editingBusiness={
            editingBusiness
          }
          saving={saving}
          onChange={handleChange}
          onSubmit={saveBusiness}
          onClose={() => {
            setShowModal(false);
            setEditingBusiness(null);
          }}
        />
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Desktop Row */
/* -------------------------------------------------------------------------- */

const BusinessRow = ({
  business,
  onEdit,
  onDelete,
  onToggle,
  disabled,
}) => {
  const name =
    business.name ||
    business.businessName ||
    "Unnamed Business";

  const owner =
    business.ownerName ||
    business.owner?.name ||
    "—";

  const category =
    business.category ||
    "General";

  const phone =
    business.phone ||
    business.contactNumber ||
    "—";

  const village =
    business.village ||
    business.location?.village ||
    "—";

  const status =
    String(
      business.status || "active"
    ).toLowerCase();

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <BusinessImage
            business={business}
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {name}
            </p>

            <p className="mt-1 max-w-[240px] truncate text-xs text-gray-500">
              {business.description ||
                "No description"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4 text-sm text-gray-700">
        {owner}
      </td>

      <td className="px-5 py-4">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          {formatLabel(category)}
        </span>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm text-gray-700">
          {phone}
        </p>

        {business.email && (
          <p className="mt-1 text-xs text-gray-500">
            {business.email}
          </p>
        )}
      </td>

      <td className="px-5 py-4 text-sm text-gray-700">
        {village}
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={status} />
      </td>

      <td className="px-5 py-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEdit}
            disabled={disabled}
            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={onToggle}
            disabled={disabled}
            className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            {status === "active"
              ? "Disable"
              : "Activate"}
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={disabled}
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

const BusinessCard = ({
  business,
  onEdit,
  onDelete,
  onToggle,
  disabled,
}) => {
  const name =
    business.name ||
    business.businessName ||
    "Unnamed Business";

  const owner =
    business.ownerName ||
    business.owner?.name ||
    "—";

  const status =
    String(
      business.status || "active"
    ).toLowerCase();

  return (
    <div className="p-5">
      <div className="flex gap-4">
        <BusinessImage
          business={business}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-gray-900">
                {name}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {owner}
              </p>
            </div>

            <StatusBadge
              status={status}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              {formatLabel(
                business.category ||
                  "General"
              )}
            </span>

            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
              {business.village ||
                business.location
                  ?.village ||
                "Village —"}
            </span>
          </div>

          <p className="mt-3 text-sm text-gray-600">
            {business.description ||
              "No description available."}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onEdit}
          disabled={disabled}
          className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 disabled:opacity-50"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 disabled:opacity-50"
        >
          {status === "active"
            ? "Disable"
            : "Activate"}
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Modal */
/* -------------------------------------------------------------------------- */

const BusinessModal = ({
  form,
  editingBusiness,
  saving,
  onChange,
  onSubmit,
  onClose,
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
              Business Management
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              {editingBusiness
                ? "Edit Business"
                : "Add Business"}
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
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Business Name"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="e.g. Kakarcholi General Store"
              required
            />

            <Input
              label="Owner Name"
              name="ownerName"
              value={form.ownerName}
              onChange={onChange}
              placeholder="Business owner name"
            />

            <Input
              label="Category"
              name="category"
              value={form.category}
              onChange={onChange}
              placeholder="e.g. Grocery, Pharmacy"
            />

            <Input
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="Contact number"
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="business@example.com"
            />

            <Input
              label="Village"
              name="village"
              value={form.village}
              onChange={onChange}
              placeholder="Village name"
            />

            <Input
              label="Opening Hours"
              name="openingHours"
              value={form.openingHours}
              onChange={onChange}
              placeholder="e.g. 8:00 AM - 8:00 PM"
            />

            <Input
              label="Image URL"
              name="image"
              value={form.image}
              onChange={onChange}
              placeholder="https://..."
            />

            <div className="md:col-span-2">
              <Input
                label="Address"
                name="address"
                value={form.address}
                onChange={onChange}
                placeholder="Full business address"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows={4}
                placeholder="Describe the business..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={onChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="active">
                  Active
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingBusiness
                ? "Update Business"
                : "Create Business"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Small Components */
/* -------------------------------------------------------------------------- */

const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-gray-700">
      {label}
      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>

    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    />
  </div>
);

const Stat = ({
  icon,
  title,
  value,
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

const Th = ({
  children,
}) => (
  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
    {children}
  </th>
);

const StatusBadge = ({
  status,
}) => {
  const config = {
    active:
      "bg-green-50 text-green-700",
    pending:
      "bg-yellow-50 text-yellow-700",
    inactive:
      "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        config[status] ||
        "bg-gray-100 text-gray-700"
      }`}
    >
      {formatLabel(status)}
    </span>
  );
};

const BusinessImage = ({
  business,
}) => {
  const image =
    business.image ||
    business.imageUrl ||
    business.logo;

  if (image) {
    return (
      <img
        src={image}
        alt={
          business.name ||
          business.businessName ||
          "Business"
        }
        className="h-11 w-11 rounded-xl object-cover"
        onError={(event) => {
          event.currentTarget.style.display =
            "none";
        }}
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
      🏪
    </div>
  );
};

const EmptyState = ({
  filtered,
  onAdd,
}) => (
  <div className="px-6 py-16 text-center">
    <div className="text-5xl">
      🏪
    </div>

    <h3 className="mt-4 text-lg font-bold text-gray-900">
      No businesses found
    </h3>

    <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
      {filtered
        ? "No businesses match the current search or filter."
        : "No businesses have been added yet."}
    </p>

    {!filtered && (
      <button
        type="button"
        onClick={onAdd}
        className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        + Add First Business
      </button>
    )}
  </div>
);

const formatLabel = (value) =>
  String(value || "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

export default Businesses;