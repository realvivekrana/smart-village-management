
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  FileText,
  Tractor,
  GraduationCap,
  HeartPulse,
  Users,
  Landmark,
  ReceiptText,
  CloudSun,
  Wrench,
  Megaphone,
  CalendarDays,
  Stethoscope,
  ShoppingBag,
  Bus,
  HandHeart,
  AlertTriangle,
  ArrowRight,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";

import {
  getVillageFeatures,
} from "../../services/villageFeatureService";

/*
|--------------------------------------------------------------------------
| Feature Icons
|--------------------------------------------------------------------------
*/

const FEATURE_ICONS = {
  scheme: FileText,
  scholarship: GraduationCap,
  education: GraduationCap,
  farmer: Tractor,
  "equipment-rental": Wrench,
  "gram-sabha": Users,
  "bill-tax": ReceiptText,
  "health-camp": Stethoscope,
  vaccination: HeartPulse,
  "animal-health": HeartPulse,
  directory: Users,
  transport: Bus,
  community: ShoppingBag,
  volunteer: HandHeart,
  emergency: AlertTriangle,
  default: Landmark,
};

/*
|--------------------------------------------------------------------------
| Category Labels
|--------------------------------------------------------------------------
*/

const CATEGORY_LABELS = {
  scheme: "Government Scheme",
  scholarship: "Scholarship",
  education: "Education",
  farmer: "Farmer",
  "equipment-rental": "Equipment Rental",
  "gram-sabha": "Gram Sabha",
  "bill-tax": "Bills & Tax",
  "health-camp": "Health",
  vaccination: "Vaccination",
  "animal-health": "Animal Health",
  directory: "Village Directory",
  transport: "Transport",
  community: "Community",
  volunteer: "Volunteer",
  emergency: "Emergency",
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const getFeatureIcon = (category) => {
  return (
    FEATURE_ICONS[category] ||
    FEATURE_ICONS.default
  );
};

const getCategoryLabel = (category) => {
  return (
    CATEGORY_LABELS[category] ||
    category
      ?.replace(/-/g, " ")
      ?.replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      ) ||
    "Village Service"
  );
};

const normalizeFeatures = (response) => {
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
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function VillageServices() {
  const [features, setFeatures] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [selectedFeature, setSelectedFeature] =
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

      const data =
        normalizeFeatures(response);

      setFeatures(data);
    } catch (err) {
      console.error(
        "Failed to load village services:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Village services load nahi ho paayi."
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
   * Categories
   * ----------------------------------------------------------------------
   */

  const categories = useMemo(() => {
    const uniqueCategories =
      new Set();

    features.forEach((feature) => {
      if (feature?.category) {
        uniqueCategories.add(
          feature.category
        );
      }
    });

    return [
      "all",
      ...Array.from(uniqueCategories),
    ];
  }, [features]);

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
          selectedCategory !== "all" &&
          feature?.category !==
            selectedCategory
        ) {
          return false;
        }

        return true;
      })
      .filter((feature) => {
        if (!query) {
          return true;
        }

        const searchableText = [
          feature?.title,
          feature?.description,
          feature?.shortDescription,
          feature?.category,
          feature?.villageName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          query
        );
      })
      .sort(
        (a, b) =>
          Number(b?.priority || 0) -
          Number(a?.priority || 0)
      );
  }, [
    features,
    search,
    selectedCategory,
  ]);

  /*
   * ----------------------------------------------------------------------
   * Stats
   * ----------------------------------------------------------------------
   */

  const stats = useMemo(() => {
    const active = features.filter(
      (feature) =>
        feature?.status === "active"
    ).length;

    const applications = features.filter(
      (feature) =>
        feature?.applicationEnabled
    ).length;

    const emergency = features.filter(
      (feature) =>
        feature?.category ===
        "emergency"
    ).length;

    return {
      total: features.length,
      active,
      applications,
      emergency,
    };
  }, [features]);

  /*
   * ----------------------------------------------------------------------
   * Clear search
   * ----------------------------------------------------------------------
   */

  const clearSearch = () => {
    setSearch("");
    setSelectedCategory("all");
  };

  /*
   * ----------------------------------------------------------------------
   * Loading
   * ----------------------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 text-gray-600">
          <Loader2
            className="h-8 w-8 animate-spin"
          />

          <p className="text-sm">
            Village services load ho rahi hain...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ----------------------------------------------------------------------
   * Main UI
   * ----------------------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================================================================ */}
      {/* HEADER */}
      {/* ================================================================ */}

      <section className="bg-gradient-to-br from-green-700 via-emerald-700 to-teal-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm backdrop-blur">
              <Landmark className="h-4 w-4" />

              Kakarcholi Village Services
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Gaon ki zaroori services,
              ek hi jagah
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">
              Sarkari yojana, farmer services,
              Gram Sabha, health, education,
              bills, local services aur
              community information ko easily
              access karein.
            </p>
          </div>

          {/* ============================================================ */}
          {/* STATS */}
          {/* ============================================================ */}

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              value={stats.total}
              label="Total Services"
            />

            <StatCard
              value={stats.active}
              label="Active Services"
            />

            <StatCard
              value={stats.applications}
              label="Apply Online"
            />

            <StatCard
              value={stats.emergency}
              label="Emergency"
            />
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* CONTENT */}
      {/* ================================================================ */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ============================================================ */}
        {/* ERROR */}
        {/* ============================================================ */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div className="flex-1">
                <p className="font-medium text-red-800">
                  Services load nahi ho paayi
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={loadFeatures}
                className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4" />

                Retry
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SEARCH */}
        {/* ============================================================ */}

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Service, yojana, farmer, scholarship search karein..."
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-10 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={loadFeatures}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />

              Refresh
            </button>
          </div>

          {/* ========================================================== */}
          {/* CATEGORIES */}
          {/* ========================================================== */}

          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="h-4 w-4 shrink-0 text-gray-500" />

            {categories.map((category) => {
              const active =
                selectedCategory ===
                category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(
                      category
                    )
                  }
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-green-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category === "all"
                    ? "All"
                    : getCategoryLabel(
                        category
                      )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* RESULTS INFO */}
        {/* ============================================================ */}

        <div className="mt-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Village Services
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredFeatures.length}{" "}
              service
              {filteredFeatures.length !==
              1
                ? "s"
                : ""}{" "}
              available
            </p>
          </div>

          {(search ||
            selectedCategory !==
              "all") && (
            <button
              type="button"
              onClick={clearSearch}
              className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:self-auto"
            >
              <X className="h-4 w-4" />

              Clear Filters
            </button>
          )}
        </div>

        {/* ============================================================ */}
        {/* EMPTY STATE */}
        {/* ============================================================ */}

        {filteredFeatures.length ===
          0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <Search className="h-6 w-6 text-gray-500" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Koi service nahi mili
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Search ya category filter
              change karke dobara try karein.
            </p>

            <button
              type="button"
              onClick={clearSearch}
              className="mt-5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Show All Services
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* SERVICE GRID */}
        {/* ============================================================ */}

        {filteredFeatures.length >
          0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFeatures.map(
              (feature) => (
                <ServiceCard
                  key={
                    feature._id ||
                    feature.id ||
                    feature.slug
                  }
                  feature={feature}
                  onView={() =>
                    setSelectedFeature(
                      feature
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </main>

      {/* ================================================================ */}
      {/* DETAIL MODAL */}
      {/* ================================================================ */}

      {selectedFeature && (
        <FeatureModal
          feature={selectedFeature}
          onClose={() =>
            setSelectedFeature(null)
          }
        />
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Stat Card
|--------------------------------------------------------------------------
*/

function StatCard({
  value,
  label,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <div className="text-2xl font-bold">
        {value}
      </div>

      <div className="mt-1 text-xs text-white/75 sm:text-sm">
        {label}
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Service Card
|--------------------------------------------------------------------------
*/

function ServiceCard({
  feature,
  onView,
}) {
  const Icon =
    getFeatureIcon(
      feature?.category
    );

  const categoryLabel =
    getCategoryLabel(
      feature?.category
    );

  const isEmergency =
    feature?.category ===
    "emergency";

  return (
    <article
      className={`group flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        isEmergency
          ? "border-red-200"
          : "border-gray-200"
      }`}
    >
      {/* Icon + Category */}
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            isEmergency
              ? "bg-red-100 text-red-600"
              : "bg-green-100 text-green-700"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            isEmergency
              ? "bg-red-50 text-red-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {categoryLabel}
        </span>
      </div>

      {/* Content */}
      <div className="mt-5 flex-1">
        <h3 className="text-lg font-bold text-gray-900">
          {feature?.title ||
            "Village Service"}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
          {feature?.shortDescription ||
            feature?.description ||
            "Service information available here."}
        </p>
      </div>

      {/* Badges */}
      <div className="mt-5 flex flex-wrap gap-2">
        {feature?.applicationEnabled && (
          <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
            Apply Online
          </span>
        )}

        {feature?.featured && (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            Featured
          </span>
        )}

        {feature?.status ===
          "active" && (
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            Active
          </span>
        )}
      </div>

      {/* Action */}
      <button
        type="button"
        onClick={onView}
        className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
          isEmergency
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        View Details

        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
    </article>
  );
}

/*
|--------------------------------------------------------------------------
| Feature Modal
|--------------------------------------------------------------------------
*/

function FeatureModal({
  feature,
  onClose,
}) {
  const Icon =
    getFeatureIcon(
      feature?.category
    );

  const requiredDocuments =
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

  const emergencyNumbers =
    feature?.metadata
      ?.emergencyNumbers;

  const isEmergency =
    feature?.category ===
    "emergency";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
        {/* Header */}
        <div
          className={`sticky top-0 z-10 flex items-start justify-between border-b p-5 ${
            isEmergency
              ? "bg-red-50"
              : "bg-white"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                isEmergency
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-700"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {feature?.title}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {getCategoryLabel(
                  feature?.category
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 p-5">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              About Service
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-700">
              {feature?.description ||
                feature?.shortDescription ||
                "No description available."}
            </p>
          </div>

          {/* Eligibility */}
          {feature?.eligibility && (
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Eligibility
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {feature.eligibility}
              </p>
            </div>
          )}

          {/* Required Documents */}
          {requiredDocuments.length >
            0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Required Documents
              </h3>

              <ul className="mt-2 space-y-2">
                {requiredDocuments.map(
                  (document, index) => (
                    <li
                      key={`${document}-${index}`}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-600" />

                      {document}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {/* Instructions */}
          {instructions.length >
            0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                How It Works
              </h3>

              <ol className="mt-3 space-y-3">
                {instructions.map(
                  (instruction, index) => (
                    <li
                      key={`${instruction}-${index}`}
                      className="flex gap-3"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                        {index + 1}
                      </span>

                      <span className="text-sm leading-6 text-gray-600">
                        {instruction}
                      </span>
                    </li>
                  )
                )}
              </ol>
            </div>
          )}

          {/* Emergency Numbers */}
          {isEmergency &&
            emergencyNumbers && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <h3 className="font-semibold text-red-900">
                  Emergency Numbers
                </h3>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <EmergencyNumber
                    label="Ambulance"
                    number={
                      emergencyNumbers.ambulance
                    }
                  />

                  <EmergencyNumber
                    label="Police"
                    number={
                      emergencyNumbers.police
                    }
                  />

                  <EmergencyNumber
                    label="Fire"
                    number={
                      emergencyNumbers.fire
                    }
                  />

                  <EmergencyNumber
                    label="Emergency"
                    number={
                      emergencyNumbers.nationalEmergency
                    }
                  />
                </div>
              </div>
            )}

          {/* Apply Button */}
          {feature?.applicationEnabled && (
            <button
              type="button"
              onClick={() => {
                /*
                 * Application flow will be
                 * connected with the application
                 * page/modal in the next integration.
                 */

                window.location.href =
                  `/citizen/village-services/${feature._id || feature.id || feature.slug}/apply`;
              }}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white ${
                isEmergency
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Apply / Register

              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {/* Emergency Quick Actions */}
          {isEmergency && (
            <div className="grid gap-3 sm:grid-cols-3">
              {emergencyNumbers?.ambulance && (
                <a
                  href={`tel:${emergencyNumbers.ambulance}`}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Call Ambulance
                </a>
              )}

              {emergencyNumbers?.police && (
                <a
                  href={`tel:${emergencyNumbers.police}`}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Call Police
                </a>
              )}

              {emergencyNumbers?.fire && (
                <a
                  href={`tel:${emergencyNumbers.fire}`}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Call Fire
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Emergency Number
|--------------------------------------------------------------------------
*/

function EmergencyNumber({
  label,
  number,
}) {
  if (!number) {
    return null;
  }

  return (
    <a
      href={`tel:${number}`}
      className="rounded-lg bg-white p-3 text-center shadow-sm transition hover:shadow"
    >
      <div className="text-xs text-gray-500">
        {label}
      </div>

      <div className="mt-1 font-bold text-red-700">
        {number}
      </div>
    </a>
  );
}