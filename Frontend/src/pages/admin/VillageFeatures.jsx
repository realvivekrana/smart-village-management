import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
  X,
  Save,
  AlertTriangle,
  CheckCircle2,
  Star,
  FileText,
  Tractor,
  HeartPulse,
  GraduationCap,
  Users,
  ReceiptText,
  Wrench,
  Bus,
  HandHeart,
  Megaphone,
  ShieldAlert,
  Landmark,
} from "lucide-react";

import {
  getVillageFeatures,
  createVillageFeature,
  updateVillageFeature,
  deleteVillageFeature,
} from "../../services/villageFeatureService";
import { useVillage } from "../../context/VillageContext";

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const CATEGORY_OPTIONS = [
  {
    value: "scheme",
    label: "Government Scheme",
  },
  {
    value: "scholarship",
    label: "Scholarship",
  },
  {
    value: "education",
    label: "Education",
  },
  {
    value: "farmer",
    label: "Farmer",
  },
  {
    value: "equipment-rental",
    label: "Equipment Rental",
  },
  {
    value: "gram-sabha",
    label: "Gram Sabha",
  },
  {
    value: "bill-tax",
    label: "Bills & Tax",
  },
  {
    value: "health-camp",
    label: "Health Camp",
  },
  {
    value: "vaccination",
    label: "Vaccination",
  },
  {
    value: "animal-health",
    label: "Animal Health",
  },
  {
    value: "directory",
    label: "Village Directory",
  },
  {
    value: "transport",
    label: "Transport",
  },
  {
    value: "community",
    label: "Community",
  },
  {
    value: "volunteer",
    label: "Volunteer",
  },
  {
    value: "emergency",
    label: "Emergency",
  },
];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const emptyForm = {
  title: "",
  slug: "",
  category: "scheme",
  description: "",
  shortDescription: "",
  villageName: "",
  status: "active",
  isPublished: true,
  featured: false,
  priority: 50,
  eligibility: "",
  requiredDocuments: "",
  instructions: "",
  applicationEnabled: false,
};

/*
|--------------------------------------------------------------------------
| Normalize API response
|--------------------------------------------------------------------------
*/

function normalizeFeatures(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.features)) {
    return response.features;
  }

  return [];
}

/*
|--------------------------------------------------------------------------
| Slug generator
|--------------------------------------------------------------------------
*/

function makeSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/*
|--------------------------------------------------------------------------
| Category label
|--------------------------------------------------------------------------
*/

function getCategoryLabel(category) {
  const item = CATEGORY_OPTIONS.find(
    (option) =>
      option.value === category
  );

  return (
    item?.label ||
    category ||
    "Village Service"
  );
}

/*
|--------------------------------------------------------------------------
| Icon
|--------------------------------------------------------------------------
*/

function getCategoryIcon(category) {
  const icons = {
    scheme: FileText,
    scholarship: GraduationCap,
    education: GraduationCap,
    farmer: Tractor,
    "equipment-rental": Wrench,
    "gram-sabha": Users,
    "bill-tax": ReceiptText,
    "health-camp": HeartPulse,
    vaccination: HeartPulse,
    "animal-health": HeartPulse,
    directory: Users,
    transport: Bus,
    community: Megaphone,
    volunteer: HandHeart,
    emergency: ShieldAlert,
  };

  return icons[category] || Landmark;
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function VillageFeatures() {
  const { villageName } = useVillage();
  const [features, setFeatures] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("all");

  const [status, setStatus] =
    useState("all");

  const [showForm, setShowForm] =
    useState(false);

  const [editingFeature, setEditingFeature] =
    useState(null);

  const [viewingFeature, setViewingFeature] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);

  /*
   * ----------------------------------------------------------------------
   * Load features
   * ----------------------------------------------------------------------
   */

  const loadFeatures = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getVillageFeatures();

      setFeatures(
        normalizeFeatures(response)
      );
    } catch (err) {
      console.error(
        "Failed to load village features:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Village features load nahi ho paaye."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  /*
   * ----------------------------------------------------------------------
   * Filter
   * ----------------------------------------------------------------------
   */

  const filteredFeatures = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return features
      .filter((feature) => {
        if (
          category !== "all" &&
          feature?.category !== category
        ) {
          return false;
        }

        return true;
      })
      .filter((feature) => {
        if (status === "all") {
          return true;
        }

        if (status === "active") {
          return (
            feature?.status === "active"
          );
        }

        if (status === "inactive") {
          return (
            feature?.status !== "active"
          );
        }

        if (status === "published") {
          return Boolean(
            feature?.isPublished
          );
        }

        if (status === "draft") {
          return !feature?.isPublished;
        }

        return true;
      })
      .filter((feature) => {
        if (!query) {
          return true;
        }

        const text = [
          feature?.title,
          feature?.slug,
          feature?.description,
          feature?.shortDescription,
          feature?.category,
          feature?.villageName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(query);
      })
      .sort(
        (a, b) =>
          Number(b?.priority || 0) -
          Number(a?.priority || 0)
      );
  }, [
    features,
    search,
    category,
    status,
  ]);

  /*
   * ----------------------------------------------------------------------
   * Stats
   * ----------------------------------------------------------------------
   */

  const stats = useMemo(() => {
    return {
      total: features.length,

      active: features.filter(
        (item) =>
          item?.status === "active"
      ).length,

      published: features.filter(
        (item) =>
          item?.isPublished
      ).length,

      applications: features.filter(
        (item) =>
          item?.applicationEnabled
      ).length,
    };
  }, [features]);

  /*
   * ----------------------------------------------------------------------
   * Open create
   * ----------------------------------------------------------------------
   */

  const openCreate = () => {
    setEditingFeature(null);

    setError("");

    setSuccess("");

    setShowForm(true);
  };

  /*
   * ----------------------------------------------------------------------
   * Open edit
   * ----------------------------------------------------------------------
   */

  const openEdit = (feature) => {
    setEditingFeature(feature);

    setError("");

    setSuccess("");

    setShowForm(true);
  };

  /*
   * ----------------------------------------------------------------------
   * Delete
   * ----------------------------------------------------------------------
   */

  const handleDelete = async (feature) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${feature.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        feature._id || feature.id
      );

      setError("");

      setSuccess("");

      await deleteVillageFeature(
        feature._id || feature.id
      );

      setSuccess(
        "Village feature successfully deleted."
      );

      await loadFeatures();
    } catch (err) {
      console.error(
        "Delete feature error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Feature delete nahi ho paaya."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
   * ----------------------------------------------------------------------
   * Form submit
   * ----------------------------------------------------------------------
   */

  const handleSubmit = async (
    formData
  ) => {
    try {
      setSaving(true);

      setError("");

      setSuccess("");

      /*
       * Convert textarea values to arrays.
       */

      const payload = {
        ...formData,

        priority: Number(
          formData.priority || 0
        ),

        requiredDocuments:
          typeof formData.requiredDocuments ===
          "string"
            ? formData.requiredDocuments
                .split("\n")
                .map((item) =>
                  item.trim()
                )
                .filter(Boolean)
            : formData.requiredDocuments,

        instructions:
          typeof formData.instructions ===
          "string"
            ? formData.instructions
                .split("\n")
                .map((item) =>
                  item.trim()
                )
                .filter(Boolean)
            : formData.instructions,

        slug:
          formData.slug?.trim() ||
          makeSlug(formData.title),
      };

      if (editingFeature) {
        await updateVillageFeature(
          editingFeature._id ||
            editingFeature.id,
          payload
        );

        setSuccess(
          "Village feature successfully updated."
        );
      } else {
        await createVillageFeature(
          payload
        );

        setSuccess(
          "Village feature successfully created."
        );
      }

      setShowForm(false);

      setEditingFeature(null);

      await loadFeatures();
    } catch (err) {
      console.error(
        "Save feature error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Feature save nahi ho paaya."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ----------------------------------------------------------------------
   * Loading
   * ----------------------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-600 dark:text-gray-300">
          <Loader2 className="h-8 w-8 animate-spin" />

          <p className="text-sm">
            Village features load ho rahe hain...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ----------------------------------------------------------------------
   * UI
   * ----------------------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-700/40">
      {/* ================================================================ */}
      {/* HEADER */}
      {/* ================================================================ */}

      <section className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                {villageName} Village Management
              </p>

              <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
                Village Features
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Government schemes, farmer
                services, health, education,
                Gram Sabha, bills, emergency
                aur community services manage
                karein.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={loadFeatures}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4" />

                Refresh
              </button>

              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />

                Add Feature
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* CONTENT */}
      {/* ================================================================ */}

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        {/* Alerts */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError("")}
          />
        )}

        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess("")}
          />
        )}

        {/* ============================================================ */}
        {/* STATS */}
        {/* ============================================================ */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Total Features"
            value={stats.total}
            icon={<Landmark className="h-5 w-5" />}
          />

          <Stat
            label="Active"
            value={stats.active}
            icon={
              <CheckCircle2 className="h-5 w-5" />
            }
          />

          <Stat
            label="Published"
            value={stats.published}
            icon={
              <Eye className="h-5 w-5" />
            }
          />

          <Stat
            label="Online Applications"
            value={stats.applications}
            icon={
              <FileText className="h-5 w-5" />
            }
          />
        </div>

        {/* ============================================================ */}
        {/* FILTERS */}
        {/* ============================================================ */}

        <div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px]">
            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Feature search karein..."
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 py-3 pl-10 pr-4 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900"
              />
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-sm outline-none focus:border-green-500 dark:text-gray-100 dark:placeholder-gray-400"
            >
              <option value="all">
                All Categories
              </option>

              {CATEGORY_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>

            {/* Status */}
            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
              className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-sm outline-none focus:border-green-500 dark:text-gray-100 dark:placeholder-gray-400"
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

              <option value="published">
                Published
              </option>

              <option value="draft">
                Draft
              </option>
            </select>
          </div>
        </div>

        {/* ============================================================ */}
        {/* FEATURE TABLE */}
        {/* ============================================================ */}

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] w-full">
              <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Feature
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Category
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Application
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Priority
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredFeatures.map(
                  (feature) => {
                    const Icon =
                      getCategoryIcon(
                        feature?.category
                      );

                    const id =
                      feature?._id ||
                      feature?.id;

                    return (
                      <tr
                        key={
                          id ||
                          feature?.slug
                        }
                        className="transition hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {/* Feature */}
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                              <Icon className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                  {feature?.title}
                                </p>

                                {feature?.featured && (
                                  <Star className="h-4 w-4 fill-current text-amber-500 dark:text-amber-400" />
                                )}
                              </div>

                              <p className="mt-1 max-w-md truncate text-xs text-gray-500 dark:text-gray-400">
                                {feature?.shortDescription ||
                                  feature?.description ||
                                  "No description"}
                              </p>

                              <p className="mt-1 text-[11px] text-gray-400">
                                /{feature?.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                            {getCategoryLabel(
                              feature?.category
                            )}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1.5">
                            <StatusBadge
                              active={
                                feature?.status ===
                                "active"
                              }
                              activeText="Active"
                              inactiveText="Inactive"
                            />

                            <StatusBadge
                              active={Boolean(
                                feature?.isPublished
                              )}
                              activeText="Published"
                              inactiveText="Draft"
                            />
                          </div>
                        </td>

                        {/* Application */}
                        <td className="px-5 py-4">
                          {feature?.applicationEnabled ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 dark:bg-green-900/20 px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-300">
                              <CheckCircle2 className="h-3.5 w-3.5" />

                              Enabled
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Disabled
                            </span>
                          )}
                        </td>

                        {/* Priority */}
                        <td className="px-5 py-4">
                          <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {feature?.priority ??
                              0}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setViewingFeature(
                                  feature
                                )
                              }
                              title="View"
                              className="rounded-lg border border-gray-200 dark:border-gray-700 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openEdit(
                                  feature
                                )
                              }
                              title="Edit"
                              className="rounded-lg border border-blue-200 dark:border-blue-800 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  feature
                                )
                              }
                              disabled={
                                deletingId ===
                                id
                              }
                              title="Delete"
                              className="rounded-lg border border-red-200 dark:border-red-800 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId ===
                              id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}

                {filteredFeatures.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center"
                    >
                      <Landmark className="mx-auto h-10 w-10 text-gray-300" />

                      <p className="mt-3 font-semibold text-gray-700 dark:text-gray-200">
                        No village features found
                      </p>

                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Search ya filters change
                        karein.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
            Showing{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {filteredFeatures.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {features.length}
            </span>{" "}
            features
          </div>
        </div>
      </main>

      {/* ================================================================ */}
      {/* CREATE / EDIT MODAL */}
      {/* ================================================================ */}

      {showForm && (
        <FeatureFormModal
          feature={editingFeature}
          saving={saving}
          onClose={() => {
            if (!saving) {
              setShowForm(false);
              setEditingFeature(null);
            }
          }}
          onSubmit={handleSubmit}
        />
      )}

      {/* ================================================================ */}
      {/* VIEW MODAL */}
      {/* ================================================================ */}

      {viewingFeature && (
        <FeatureViewModal
          feature={viewingFeature}
          onClose={() =>
            setViewingFeature(null)
          }
        />
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Stats
|--------------------------------------------------------------------------
*/

function Stat({
  label,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
          {icon}
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Alert
|--------------------------------------------------------------------------
*/

function Alert({
  type,
  message,
  onClose,
}) {
  const success =
    type === "success";

  return (
    <div
      className={`mb-5 flex items-start gap-3 rounded-xl border p-4 ${
        success
          ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
          : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
      }`}
    >
      {success ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
      ) : (
        <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
      )}

      <p
        className={`flex-1 text-sm ${
          success
            ? "text-green-800 dark:text-green-200"
            : "text-red-800 dark:text-red-200"
        }`}
      >
        {message}
      </p>

      <button
        type="button"
        onClick={onClose}
        className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Status Badge
|--------------------------------------------------------------------------
*/

function StatusBadge({
  active,
  activeText,
  inactiveText,
}) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
        active
          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
          : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
      }`}
    >
      {active ? (
        <Eye className="h-3 w-3" />
      ) : (
        <EyeOff className="h-3 w-3" />
      )}

      {active
        ? activeText
        : inactiveText}
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| Feature Form Modal
|--------------------------------------------------------------------------
*/

function FeatureFormModal({
  feature,
  saving,
  onClose,
  onSubmit,
}) {
  const [form, setForm] =
    useState(emptyForm);

  const [autoSlug, setAutoSlug] =
    useState(true);

  useEffect(() => {
    if (!feature) {
      setForm(emptyForm);

      setAutoSlug(true);

      return;
    }

    setForm({
      title:
        feature?.title || "",

      slug:
        feature?.slug || "",

      category:
        feature?.category ||
        "scheme",

      description:
        feature?.description ||
        "",

      shortDescription:
        feature?.shortDescription ||
        "",

      villageName:
        feature?.villageName ||
        "",

      status:
        feature?.status ||
        "active",

      isPublished:
        feature?.isPublished ??
        true,

      featured:
        feature?.featured ??
        false,

      priority:
        feature?.priority ??
        50,

      eligibility:
        feature?.eligibility ||
        "",

      requiredDocuments:
        Array.isArray(
          feature?.requiredDocuments
        )
          ? feature.requiredDocuments.join(
              "\n"
            )
          : "",

      instructions:
        Array.isArray(
          feature?.instructions
        )
          ? feature.instructions.join(
              "\n"
            )
          : "",

      applicationEnabled:
        feature?.applicationEnabled ??
        false,
    });

    setAutoSlug(false);
  }, [feature]);

  const updateField = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleTitleChange = (
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      title: value,
      ...(autoSlug
        ? {
            slug: makeSlug(value),
          }
        : {}),
    }));
  };

  const submit = (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      return;
    }

    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white dark:bg-gray-800 shadow-2xl sm:max-w-3xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {feature
                ? "Edit Village Feature"
                : "Add Village Feature"}
            </h2>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Feature information manage karein.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={submit}
          className="overflow-y-auto p-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Title */}
            <Field
              label="Feature Title"
              required
              className="sm:col-span-2"
            >
              <input
                type="text"
                value={form.title}
                onChange={(event) =>
                  handleTitleChange(
                    event.target.value
                  )
                }
                placeholder="Example: PM Awas Yojana"
                required
                className="input"
              />
            </Field>

            {/* Slug */}
            <Field
              label="Slug"
              hint="URL-friendly unique name"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) => {
                    setAutoSlug(false);

                    updateField(
                      "slug",
                      makeSlug(
                        event.target.value
                      )
                    );
                  }}
                  placeholder="pm-awas-yojana"
                  className="input flex-1"
                />

                <button
                  type="button"
                  onClick={() => {
                    setAutoSlug(true);

                    updateField(
                      "slug",
                      makeSlug(form.title)
                    );
                  }}
                  className="rounded-xl border border-gray-300 dark:border-gray-600 px-3 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Auto
                </button>
              </div>
            </Field>

            {/* Category */}
            <Field
              label="Category"
              required
            >
              <select
                value={form.category}
                onChange={(event) =>
                  updateField(
                    "category",
                    event.target.value
                  )
                }
                className="input"
              >
                {CATEGORY_OPTIONS.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </Field>

            {/* Village */}
            <Field label="Village Name">
              <input
                type="text"
                value={
                  form.villageName
                }
                onChange={(event) =>
                  updateField(
                    "villageName",
                    event.target.value
                  )
                }
                className="input"
              />
            </Field>

            {/* Priority */}
            <Field
              label="Priority"
              hint="Higher number = higher priority"
            >
              <input
                type="number"
                min="0"
                max="1000"
                value={
                  form.priority
                }
                onChange={(event) =>
                  updateField(
                    "priority",
                    event.target.value
                  )
                }
                className="input"
              />
            </Field>

            {/* Short description */}
            <Field
              label="Short Description"
              className="sm:col-span-2"
            >
              <input
                type="text"
                value={
                  form.shortDescription
                }
                onChange={(event) =>
                  updateField(
                    "shortDescription",
                    event.target.value
                  )
                }
                placeholder="Short information shown on service card"
                className="input"
              />
            </Field>

            {/* Description */}
            <Field
              label="Description"
              className="sm:col-span-2"
            >
              <textarea
                rows={4}
                value={
                  form.description
                }
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                placeholder="Detailed service information..."
                className="input resize-none"
              />
            </Field>

            {/* Eligibility */}
            <Field
              label="Eligibility"
              className="sm:col-span-2"
            >
              <textarea
                rows={3}
                value={
                  form.eligibility
                }
                onChange={(event) =>
                  updateField(
                    "eligibility",
                    event.target.value
                  )
                }
                placeholder="Who can use/apply for this service?"
                className="input resize-none"
              />
            </Field>

            {/* Documents */}
            <Field
              label="Required Documents"
              hint="One document per line"
              className="sm:col-span-2"
            >
              <textarea
                rows={5}
                value={
                  form.requiredDocuments
                }
                onChange={(event) =>
                  updateField(
                    "requiredDocuments",
                    event.target.value
                  )
                }
                placeholder={`Aadhaar Card
Bank Account Details
Address Proof`}
                className="input resize-none"
              />
            </Field>

            {/* Instructions */}
            <Field
              label="Instructions"
              hint="One instruction per line"
              className="sm:col-span-2"
            >
              <textarea
                rows={5}
                value={
                  form.instructions
                }
                onChange={(event) =>
                  updateField(
                    "instructions",
                    event.target.value
                  )
                }
                placeholder={`Check eligibility
Keep documents ready
Submit application
Track status`}
                className="input resize-none"
              />
            </Field>

            {/* Status */}
            <Field label="Status">
              <select
                value={form.status}
                onChange={(event) =>
                  updateField(
                    "status",
                    event.target.value
                  )
                }
                className="input"
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </Field>

            {/* Toggles */}
            <div className="space-y-3 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <Toggle
                checked={
                  form.isPublished
                }
                onChange={(value) =>
                  updateField(
                    "isPublished",
                    value
                  )
                }
                label="Publish Feature"
                description="Citizen portal par visible hoga."
              />

              <Toggle
                checked={
                  form.featured
                }
                onChange={(value) =>
                  updateField(
                    "featured",
                    value
                  )
                }
                label="Featured"
                description="Important services mein highlight karein."
              />

              <Toggle
                checked={
                  form.applicationEnabled
                }
                onChange={(value) =>
                  updateField(
                    "applicationEnabled",
                    value
                  )
                }
                label="Online Application"
                description="Citizen ko application option dikhega."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-gray-200 dark:border-gray-700 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                !form.title.trim()
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />

                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />

                  {feature
                    ? "Update Feature"
                    : "Create Feature"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Field
|--------------------------------------------------------------------------
*/

function Field({
  label,
  required,
  hint,
  children,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-100">
        {label}

        {required && (
          <span className="ml-1 text-red-500 dark:text-red-400">
            *
          </span>
        )}

        {hint && (
          <span className="ml-2 text-xs font-normal text-gray-400">
            {hint}
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Toggle
|--------------------------------------------------------------------------
*/

function Toggle({
  checked,
  onChange,
  label,
  description,
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() =>
          onChange(!checked)
        }
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-green-600"
            : "bg-gray-300 dark:bg-gray-600"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>

      <span>
        <span className="block text-sm font-medium text-gray-800 dark:text-gray-100">
          {label}
        </span>

        <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
          {description}
        </span>
      </span>
    </label>
  );
}

/*
|--------------------------------------------------------------------------
| Feature View Modal
|--------------------------------------------------------------------------
*/

function FeatureViewModal({
  feature,
  onClose,
}) {
  const Icon =
    getCategoryIcon(
      feature?.category
    );

  const documents =
    Array.isArray(
      feature?.requiredDocuments
    )
      ? feature.requiredDocuments
      : [];

  const instructions =
    Array.isArray(
      feature?.instructions
    )
      ? feature.instructions
      : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white dark:bg-gray-800 shadow-2xl">
        <div className="sticky top-0 flex items-start justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
              <Icon className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {feature?.title}
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {getCategoryLabel(
                  feature?.category
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <Info
            label="Description"
            value={
              feature?.description ||
              "No description"
            }
          />

          <Info
            label="Village"
            value={
              feature?.villageName ||
              "-"
            }
          />

          <Info
            label="Slug"
            value={
              feature?.slug ||
              "-"
            }
          />

          <Info
            label="Eligibility"
            value={
              feature?.eligibility ||
              "Not specified"
            }
          />

          {documents.length >
            0 && (
            <ListSection
              title="Required Documents"
              items={documents}
            />
          )}

          {instructions.length >
            0 && (
            <ListSection
              title="Instructions"
              items={instructions}
            />
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <MiniInfo
              label="Status"
              value={
                feature?.status ||
                "inactive"
              }
            />

            <MiniInfo
              label="Priority"
              value={
                feature?.priority ??
                0
              }
            />

            <MiniInfo
              label="Application"
              value={
                feature?.applicationEnabled
                  ? "Enabled"
                  : "Disabled"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Info
|--------------------------------------------------------------------------
*/

function Info({
  label,
  value,
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {label}
      </h3>

      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600 dark:text-gray-300">
        {value}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| List Section
|--------------------------------------------------------------------------
*/

function ListSection({
  title,
  items,
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>

      <ul className="mt-2 space-y-2">
        {items.map(
          (item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex gap-2 text-sm text-gray-600 dark:text-gray-300"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-600" />

              {item}
            </li>
          )
        )}
      </ul>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Mini Info
|--------------------------------------------------------------------------
*/

function MiniInfo({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-gray-50 dark:bg-gray-700/40 p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {label}
      </p>

      <p className="mt-1 font-semibold capitalize text-gray-900 dark:text-gray-100">
        {String(value)}
      </p>
    </div>
  );
}