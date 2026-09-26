import React, { useEffect, useMemo, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const PLACE_TYPES = [
  { value: "all", label: "All Places" },
  { value: "school", label: "Schools" },
  { value: "college", label: "Colleges" },
  { value: "hospital", label: "Hospitals" },
  { value: "health_center", label: "Health Centers" },
  { value: "temple", label: "Temples" },
  { value: "mosque", label: "Mosques" },
  { value: "church", label: "Churches" },
  { value: "railway_station", label: "Railway Stations" },
  { value: "bus_stop", label: "Bus Stops" },
  { value: "atm", label: "ATMs" },
  { value: "petrol_pump", label: "Petrol Pumps" },
  { value: "market", label: "Markets" },
  { value: "super_market", label: "Super Markets" },
  { value: "restaurant", label: "Restaurants" },
  { value: "hotel", label: "Hotels" },
  { value: "police_station", label: "Police Stations" },
  { value: "government_office", label: "Government Offices" },
  { value: "park", label: "Parks" },
  { value: "cinema", label: "Cinemas" },
  { value: "electronic_shop", label: "Electronic Shops" },
  { value: "water_body", label: "Water Bodies" },
  { value: "tourist_place", label: "Tourist Places" },
  { value: "other", label: "Other" },
];

const initialForm = {
  name: "",
  type: "other",
  description: "",
  address: "",
  distanceKm: "",
  phone: "",
  lat: "",
  lng: "",
  imageUrl: "",
  sourceName: "",
  sourceUrl: "",
  verified: false,
  isActive: true,
};

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
};

const getHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

const getErrorMessage = async (response) => {
  try {
    const data = await response.json();

    return (
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`
    );
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

const getTypeLabel = (type) => {
  const item = PLACE_TYPES.find(
    (placeType) => placeType.value === type
  );

  return item?.label || "Other";
};

const VillageDirectory = () => {
  const [village, setVillage] = useState(null);
  const [places, setPlaces] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const token = getToken();

  const loadVillage = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/village`, {
        headers: {
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const result = await response.json();

      const data = result?.data || result?.village || result;

      if (!data?._id) {
        throw new Error("Village information not found");
      }

      setVillage(data);

      setPlaces(
        Array.isArray(data.places)
          ? data.places
          : []
      );
    } catch (err) {
      console.error("Village directory load error:", err);

      setError(
        err.message || "Failed to load village directory"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVillage();
  }, []);

  const filteredPlaces = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return places.filter((place) => {
      const matchesSearch =
        !keyword ||
        String(place.name || "")
          .toLowerCase()
          .includes(keyword) ||
        String(place.address || "")
          .toLowerCase()
          .includes(keyword) ||
        String(place.description || "")
          .toLowerCase()
          .includes(keyword);

      const matchesType =
        typeFilter === "all" ||
        place.type === typeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && place.isActive !== false) ||
        (statusFilter === "inactive" && place.isActive === false);

      const matchesVerified =
        verifiedFilter === "all" ||
        (verifiedFilter === "verified" &&
          place.verified === true) ||
        (verifiedFilter === "unverified" &&
          place.verified !== true);

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesVerified
      );
    });
  }, [
    places,
    search,
    typeFilter,
    statusFilter,
    verifiedFilter,
  ]);

  const statistics = useMemo(() => {
    return {
      total: places.length,

      active: places.filter(
        (place) => place.isActive !== false
      ).length,

      verified: places.filter(
        (place) => place.verified === true
      ).length,

      inactive: places.filter(
        (place) => place.isActive === false
      ).length,
    };
  }, [places]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingPlace(null);
  };

  const openCreateModal = () => {
    resetForm();
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (place) => {
    setEditingPlace(place);

    setForm({
      name: place.name || "",
      type: place.type || "other",
      description: place.description || "",
      address: place.address || "",
      distanceKm:
        place.distanceKm !== undefined &&
        place.distanceKm !== null
          ? String(place.distanceKm)
          : "",
      phone: place.phone || "",
      lat:
        place.coordinates?.lat !== undefined &&
        place.coordinates?.lat !== null
          ? String(place.coordinates.lat)
          : "",
      lng:
        place.coordinates?.lng !== undefined &&
        place.coordinates?.lng !== null
          ? String(place.coordinates.lng)
          : "",
      imageUrl: place.imageUrl || "",
      sourceName: place.sourceName || "",
      sourceUrl: place.sourceUrl || "",
      verified: place.verified === true,
      isActive: place.isActive !== false,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const buildPayload = () => {
    return {
      name: form.name.trim(),
      type: form.type,
      description: form.description.trim(),
      address: form.address.trim(),

      distanceKm:
        form.distanceKm === ""
          ? undefined
          : Number(form.distanceKm),

      phone: form.phone.trim(),

      coordinates:
        form.lat !== "" || form.lng !== ""
          ? {
              lat:
                form.lat === ""
                  ? undefined
                  : Number(form.lat),

              lng:
                form.lng === ""
                  ? undefined
                  : Number(form.lng),
            }
          : undefined,

      imageUrl: form.imageUrl.trim(),
      sourceName: form.sourceName.trim(),
      sourceUrl: form.sourceUrl.trim(),

      verified: form.verified,
      isActive: form.isActive,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!village?._id) {
      setError("Village ID is missing");
      return;
    }

    if (!form.name.trim()) {
      setError("Place name is required");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = buildPayload();

      let url = `${API_URL}/village/${village._id}/places`;
      let method = "POST";

      if (editingPlace?._id) {
        url = `${API_URL}/village/${village._id}/places/${editingPlace._id}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const result = await response.json();

      const returnedPlace =
        result?.data || result?.place || null;

      if (editingPlace?._id) {
        setPlaces((previous) =>
          previous.map((place) =>
            place._id === editingPlace._id
              ? returnedPlace || {
                  ...place,
                  ...payload,
                }
              : place
          )
        );

        setSuccess(
          "Village place updated successfully."
        );
      } else {
        setPlaces((previous) => [
          ...previous,
          returnedPlace || {
            ...payload,
            _id: `local-${Date.now()}`,
          },
        ]);

        setSuccess(
          "Village place added successfully."
        );
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("Village place save error:", err);

      setError(
        err.message || "Failed to save village place"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?._id || !village?._id) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${API_URL}/village/${village._id}/places/${deleteTarget._id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setPlaces((previous) =>
        previous.filter(
          (place) => place._id !== deleteTarget._id
        )
      );

      setDeleteTarget(null);

      setSuccess(
        "Village place deleted successfully."
      );
    } catch (err) {
      console.error("Village place delete error:", err);

      setError(
        err.message || "Failed to delete village place"
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (place) => {
    if (!village?._id || !place?._id) {
      return;
    }

    try {
      setError("");

      const payload = {
        isActive: place.isActive === false,
      };

      const response = await fetch(
        `${API_URL}/village/${village._id}/places/${place._id}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const result = await response.json();

      const updatedPlace =
        result?.data || result?.place;

      setPlaces((previous) =>
        previous.map((item) =>
          item._id === place._id
            ? updatedPlace || {
                ...item,
                ...payload,
              }
            : item
        )
      );

      setSuccess(
        place.isActive === false
          ? "Place activated."
          : "Place deactivated."
      );
    } catch (err) {
      console.error("Toggle place error:", err);

      setError(
        err.message || "Failed to update place status"
      );
    }
  };

  const toggleVerified = async (place) => {
    if (!village?._id || !place?._id) {
      return;
    }

    try {
      setError("");

      const payload = {
        verified: !place.verified,
      };

      const response = await fetch(
        `${API_URL}/village/${village._id}/places/${place._id}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const result = await response.json();

      const updatedPlace =
        result?.data || result?.place;

      setPlaces((previous) =>
        previous.map((item) =>
          item._id === place._id
            ? updatedPlace || {
                ...item,
                ...payload,
              }
            : item
        )
      );

      setSuccess(
        place.verified
          ? "Place marked as unverified."
          : "Place verified successfully."
      );
    } catch (err) {
      console.error("Verify place error:", err);

      setError(
        err.message || "Failed to update verification"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-gray-300 dark:border-gray-600 border-t-blue-600" />

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading village directory...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Village Directory
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage schools, hospitals, temples, railway
            stations, markets and other village places.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          + Add Place
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-900/20 p-4 text-sm text-green-700 dark:text-green-300">
          {success}
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Places"
          value={statistics.total}
        />

        <StatCard
          title="Active"
          value={statistics.active}
        />

        <StatCard
          title="Verified"
          value={statistics.verified}
        />

        <StatCard
          title="Inactive"
          value={statistics.inactive}
        />
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by place name, address..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <Filter
            label="Category"
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
            options={PLACE_TYPES}
          />

          <Filter
            label="Status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            options={[
              {
                value: "all",
                label: "All Status",
              },
              {
                value: "active",
                label: "Active",
              },
              {
                value: "inactive",
                label: "Inactive",
              },
            ]}
          />

          <Filter
            label="Verification"
            value={verifiedFilter}
            onChange={(event) =>
              setVerifiedFilter(event.target.value)
            }
            options={[
              {
                value: "all",
                label: "All",
              },
              {
                value: "verified",
                label: "Verified",
              },
              {
                value: "unverified",
                label: "Unverified",
              },
            ]}
          />
        </div>
      </div>

      {/* Directory */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-5 py-4">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Places
            </h2>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing {filteredPlaces.length} of{" "}
              {places.length} places
            </p>
          </div>
        </div>

        {filteredPlaces.length === 0 ? (
          <EmptyState onAdd={openCreateModal} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/70">
                <tr>
                  <Th>Place</Th>
                  <Th>Category</Th>
                  <Th>Address</Th>
                  <Th>Distance</Th>
                  <Th>Status</Th>
                  <Th>Verified</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {filteredPlaces.map((place) => (
                  <tr
                    key={place._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-3">
                        {place.imageUrl ? (
                          <img
                            src={place.imageUrl}
                            alt={place.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {place.name
                              ?.charAt(0)
                              ?.toUpperCase() || "P"}
                          </div>
                        )}

                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {place.name}
                          </p>

                          {place.phone && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {place.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                        {getTypeLabel(place.type)}
                      </span>
                    </td>

                    <td className="max-w-xs px-5 py-4">
                      <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                        {place.address || "—"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {place.distanceKm !== undefined &&
                      place.distanceKm !== null
                        ? `${place.distanceKm} km`
                        : "—"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          toggleActive(place)
                        }
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          place.isActive === false
                            ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                            : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                        }`}
                      >
                        {place.isActive === false
                          ? "Inactive"
                          : "Active"}
                      </button>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          toggleVerified(place)
                        }
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          place.verified
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {place.verified
                          ? "Verified"
                          : "Unverified"}
                      </button>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(place)
                          }
                          className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget(place)
                          }
                          className="rounded-md border border-red-200 dark:border-red-900/40 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:bg-red-900/20"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          title={
            editingPlace
              ? "Edit Village Place"
              : "Add Village Place"
          }
          onClose={() => {
            if (!saving) {
              setShowModal(false);
              resetForm();
            }
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Place Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Sarvodya High School"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {PLACE_TYPES.filter(
                    (item) => item.value !== "all"
                  ).map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Full address"
            />

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Distance (KM)"
                name="distanceKm"
                type="number"
                min="0"
                step="0.1"
                value={form.distanceKm}
                onChange={handleChange}
              />

              <Input
                label="Phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Description..."
              />
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Location
              </h3>

              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="Latitude"
                  name="lat"
                  type="number"
                  step="any"
                  value={form.lat}
                  onChange={handleChange}
                />

                <Input
                  label="Longitude"
                  name="lng"
                  type="number"
                  step="any"
                  value={form.lng}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Input
              label="Image URL"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://..."
            />

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Source Name"
                name="sourceName"
                value={form.sourceName}
                onChange={handleChange}
                placeholder="OneFiveNine"
              />

              <Input
                label="Source URL"
                name="sourceUrl"
                value={form.sourceUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-3 rounded-lg bg-gray-50 dark:bg-gray-800/70 p-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="verified"
                  checked={form.verified}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400"
                />

                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Mark as verified
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400"
                />

                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Show this place publicly
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-5">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingPlace
                  ? "Update Place"
                  : "Add Place"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <Modal
          title="Delete Village Place"
          onClose={() => {
            if (!saving) {
              setDeleteTarget(null);
            }
          }}
        >
          <div>
            <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
              Are you sure you want to delete{" "}
              <strong className="text-gray-900 dark:text-white">
                {deleteTarget.name}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  setDeleteTarget(null)
                }
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {saving
                  ? "Deleting..."
                  : "Delete Place"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};


/*
|--------------------------------------------------------------------------
| Components
|--------------------------------------------------------------------------
*/

const StatCard = ({ title, value }) => {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>

      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
};

const Filter = ({
  label,
  value,
  onChange,
  options,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  min,
  step,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && (
          <span className="ml-1 text-red-500 dark:text-red-400">*</span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        min={min}
        step={step}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
};

const Th = ({ children }) => {
  return (
    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {children}
    </th>
  );
};

const EmptyState = ({ onAdd }) => {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-xl">
        📍
      </div>

      <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
        No places found
      </h3>

      <p className="mx-auto mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
        No village places match your current search and
        filters.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Add First Place
      </button>
    </div>
  );
};

const Modal = ({
  title,
  children,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white dark:bg-gray-800 shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-xl leading-none text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:text-gray-300"
          >
            ×
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default VillageDirectory;