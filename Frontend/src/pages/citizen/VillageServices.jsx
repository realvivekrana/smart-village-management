import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
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
  ExternalLink,
  Phone,
  MapPin,
  Clock,
  Mail,
  Building2,
  Link2,
  CheckCircle2,
  Share2,
  Smartphone,
  BadgeCheck,
  Wheat,
  Milk,
  Sprout,
  Package,
} from "lucide-react";

import {
  getVillageFeatures,
  applyForFeature,
} from "../../services/villageFeatureService";
import { useVillage } from "../../context/VillageContext";
import useAuth from "../../hooks/useAuth";
import { formatDate } from "../../utils/formatDate";

/*
|--------------------------------------------------------------------------
| Feature Icons  (backend ke saare categories covered)
|--------------------------------------------------------------------------
*/

const FEATURE_ICONS = {
  scheme: FileText,
  scholarship: GraduationCap,
  education: GraduationCap,
  "exam-alert": GraduationCap,
  "skill-training": GraduationCap,
  farmer: Tractor,
  mandi: Wheat,
  weather: CloudSun,
  "crop-advice": Sprout,
  "equipment-rental": Wrench,
  "fertilizer-seed": Package,
  "gram-sabha": Users,
  "bill-tax": ReceiptText,
  "health-camp": Stethoscope,
  vaccination: HeartPulse,
  "animal-health": HeartPulse,
  dairy: Milk,
  directory: Users,
  transport: Bus,
  community: ShoppingBag,
  "buy-sell": ShoppingBag,
  "lost-found": Search,
  volunteer: HandHeart,
  notice: FileText,
  emergency: AlertTriangle,
  default: Landmark,
};

const CATEGORY_LABELS = {
  scheme: "Government Scheme",
  scholarship: "Scholarship",
  education: "Education",
  "exam-alert": "Exam Alert",
  "skill-training": "Skill Training",
  farmer: "Farmer",
  mandi: "Mandi Bhav",
  weather: "Weather",
  "crop-advice": "Crop Advice",
  "equipment-rental": "Equipment Rental",
  "fertilizer-seed": "Khaad & Beej",
  "gram-sabha": "Gram Sabha",
  "bill-tax": "Bills & Tax",
  "health-camp": "Health",
  vaccination: "Vaccination",
  "animal-health": "Animal Health",
  dairy: "Dairy",
  directory: "Village Directory",
  transport: "Transport",
  community: "Community",
  "buy-sell": "Buy & Sell",
  "lost-found": "Lost & Found",
  volunteer: "Volunteer",
  notice: "Notice",
  emergency: "Emergency",
  other: "Other",
};

/*
|--------------------------------------------------------------------------
| Link helpers
|--------------------------------------------------------------------------
| Admin se aane wale URLs par bharosa nahi karte: sirf http(s), tel,
| mailto aur internal ("/...") links allowed hain (javascript: blocked).
|--------------------------------------------------------------------------
*/

const isInternal = (url) =>
  typeof url === "string" &&
  url.startsWith("/") &&
  !url.startsWith("//");

const isSafeUrl = (url) => {
  if (typeof url !== "string" || !url.trim()) return false;
  const value = url.trim();
  return (
    isInternal(value) ||
    /^https?:\/\//i.test(value) ||
    /^tel:/i.test(value) ||
    /^mailto:/i.test(value)
  );
};

const phoneHref = (number) =>
  `tel:${String(number).replace(/[^\d+]/g, "")}`;

const LINK_TYPE_META = {
  official: { icon: Building2, label: "Official" },
  apply: { icon: BadgeCheck, label: "Apply" },
  guideline: { icon: FileText, label: "Guideline" },
  status: { icon: Search, label: "Status" },
  app: { icon: Smartphone, label: "App" },
  helpline: { icon: Phone, label: "Helpline" },
  internal: { icon: Link2, label: "Portal" },
  other: { icon: ExternalLink, label: "Link" },
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const getFeatureIcon = (category) =>
  FEATURE_ICONS[category] || FEATURE_ICONS.default;

const getCategoryLabel = (category) =>
  CATEGORY_LABELS[category] ||
  category
    ?.replace(/-/g, " ")
    ?.replace(/\b\w/g, (letter) => letter.toUpperCase()) ||
  "Village Service";

const featureKey = (feature) =>
  feature?._id || feature?.id || feature?.slug;

const normalizeFeatures = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.features)) return response.features;
  return [];
};

const money = (value, suffix = "") =>
  value === null || value === undefined || value === ""
    ? null
    : `₹${Number(value).toLocaleString("en-IN")}${suffix}`;

/*
 * Category-wise "Important details" (sirf jo fields bhari hain wahi dikhengi).
 */
const getDetailRows = (f) => {
  const rows = [];
  const add = (icon, label, value) => {
    if (value !== null && value !== undefined && value !== "" && value !== "—") {
      rows.push({ icon, label, value });
    }
  };

  add(Building2, "Department", f.department || f.metadata?.department);
  add(CalendarDays, "Last Date", f.lastDate && formatDate(f.lastDate));
  add(CalendarDays, "Exam Date", f.examDate && formatDate(f.examDate));
  add(CalendarDays, "Result Date", f.resultDate && formatDate(f.resultDate));
  add(CalendarDays, "Meeting Date", f.meetingDate && formatDate(f.meetingDate));
  add(MapPin, "Meeting Location", f.meetingLocation);
  add(CalendarDays, "Camp Date", f.campDate && formatDate(f.campDate));
  add(Clock, "Camp Time", f.campTime);
  add(MapPin, "Camp Location", f.campLocation);
  add(Stethoscope, "Doctor", f.doctorName);
  add(CalendarDays, "Event Date", f.eventDate && formatDate(f.eventDate));
  add(Clock, "Event Time", f.eventTime);
  add(MapPin, "Event Location", f.eventLocation);
  add(Users, "Volunteer Limit", f.volunteerLimit);
  add(GraduationCap, "Course", f.courseName);
  add(Building2, "Provider", f.provider || f.trainingProvider);
  add(Clock, "Duration", f.trainingDuration);
  add(Users, "Seats", f.seats);
  add(Wheat, "Crop", f.cropName);
  add(Building2, "Mandi", f.mandiName);
  add(ReceiptText, "Modal Price", money(f.modalPrice, f.cropUnit ? ` / ${f.cropUnit}` : ""));
  add(ReceiptText, "Min – Max", f.minPrice != null && f.maxPrice != null ? `${money(f.minPrice)} – ${money(f.maxPrice)}` : null);
  add(CalendarDays, "Price Date", f.priceDate && formatDate(f.priceDate));
  add(Wrench, "Equipment", f.equipmentName);
  add(ReceiptText, "Rental Rate", money(f.rentalRate, f.rentalUnit ? ` / ${f.rentalUnit}` : ""));
  add(Users, "Owner", f.ownerName);
  add(Package, "Shop", f.shopName);
  add(MapPin, "Shop Address", f.shopAddress);
  add(Package, "Product", f.productName);
  add(Milk, "Dairy", f.dairyName);
  add(ReceiptText, "Milk Rate", money(f.milkRate, f.milkUnit ? ` / ${f.milkUnit}` : ""));
  add(Clock, "Collection Time", f.collectionTime);
  add(Bus, "Vehicle", [f.vehicleType, f.vehicleNumber].filter(Boolean).join(" · "));
  add(MapPin, "Route", f.route);
  add(Clock, "Departure", f.departureTime);
  add(Clock, "Arrival", f.arrivalTime);
  add(ReceiptText, "Fare", money(f.fare));
  add(MapPin, "Office Address", f.officeAddress);
  add(Clock, "Office Timings", f.officeTimings);

  return rows;
};

/* Saare phone numbers jo feature me ho sakte hain */
const getPhones = (f) => {
  const list = [
    { label: "Helpline", number: f.helplineNumber },
    { label: f.doctorName ? `Dr. ${f.doctorName}` : "Doctor", number: f.doctorPhone },
    { label: f.ownerName ? `Owner (${f.ownerName})` : "Owner", number: f.ownerPhone },
    { label: f.contactName || "Contact", number: f.contactPhone },
  ];
  return list.filter((item) => item.number);
};

/* Saare links: applicationUrl / registrationUrl / minutesUrl + links[] (duplicates hata ke) */
const getAllLinks = (f) => {
  const result = [];
  const seen = new Set();

  const push = (label, url, type) => {
    if (!isSafeUrl(url)) return;
    const key = url.trim();
    if (seen.has(key)) return;
    seen.add(key);
    result.push({ label, url: key, type: type || "other" });
  };

  (Array.isArray(f.links) ? f.links : []).forEach((item) =>
    push(item?.label || item?.url, item?.url, item?.type)
  );

  push("Official Website / Apply", f.applicationUrl, "official");
  push("Registration Link", f.registrationUrl, "apply");
  push("Meeting Minutes", f.minutesUrl, "guideline");

  (Array.isArray(f.attachments) ? f.attachments : []).forEach((url, i) =>
    push(`Attachment ${i + 1}`, url, "guideline")
  );

  return result;
};

/*
|--------------------------------------------------------------------------
| Smart link (internal / external / tel / mailto)
|--------------------------------------------------------------------------
*/

function SmartLink({ url, className = "", children }) {
  if (isInternal(url)) {
    return (
      <Link to={url} className={className}>
        {children}
      </Link>
    );
  }

  const external = /^https?:\/\//i.test(url);

  return (
    <a
      href={url}
      className={className}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {children}
    </a>
  );
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function VillageServices() {
  const { villageName } = useVillage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams.get("category") || "all"
  );
  const [selectedFeature, setSelectedFeature] = useState(null);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      setError("");

      // limit: 100 -> default 20 se zyada services bhi dikhein
      const response = await getVillageFeatures({ limit: 100 });
      setFeatures(normalizeFeatures(response));
    } catch (err) {
      console.error("Failed to load village services:", err);
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
   * Deep link: /village-services?service=<slug ya id>
   * Share ki hui link se seedha detail modal khulta hai.
   */
  useEffect(() => {
    const wanted = searchParams.get("service");
    if (!wanted || features.length === 0) return;

    const match = features.find(
      (f) => f.slug === wanted || String(f._id || f.id) === wanted
    );
    if (match) setSelectedFeature(match);
  }, [features, searchParams]);

  /*
   * Category deep link: /citizen/village-services?category=scheme
   * (dashboard quick links yahin se seedha filter ke saath khulte hain)
   */
  const categoryParam = searchParams.get("category");

  useEffect(() => {
    setSelectedCategory(categoryParam || "all");
  }, [categoryParam]);

  const openFeature = (feature) => {
    setSelectedFeature(feature);
    const next = new URLSearchParams(searchParams);
    next.set("service", feature.slug || featureKey(feature));
    setSearchParams(next, { replace: true });
  };

  const closeFeature = () => {
    setSelectedFeature(null);
    const next = new URLSearchParams(searchParams);
    next.delete("service");
    setSearchParams(next, { replace: true });
  };

  const categories = useMemo(() => {
    const unique = new Set();
    features.forEach((f) => f?.category && unique.add(f.category));
    return ["all", ...Array.from(unique)];
  }, [features]);

  const filteredFeatures = useMemo(() => {
    const query = search.trim().toLowerCase();

    return features
      .filter((f) => selectedCategory === "all" || f?.category === selectedCategory)
      .filter((f) => {
        if (!query) return true;

        const searchable = [
          f?.title,
          f?.description,
          f?.shortDescription,
          f?.category,
          getCategoryLabel(f?.category),
          f?.department,
          f?.villageName,
          ...(Array.isArray(f?.tags) ? f.tags : []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      })
      .sort((a, b) => Number(b?.priority || 0) - Number(a?.priority || 0));
  }, [features, search, selectedCategory]);

  const stats = useMemo(
    () => ({
      total: features.length,
      active: features.filter((f) => f?.status === "active").length,
      applications: features.filter((f) => f?.applicationEnabled).length,
      links: features.filter((f) => getAllLinks(f).length > 0).length,
    }),
    [features]
  );

  const clearSearch = () => {
    setSearch("");
    setSelectedCategory("all");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 text-gray-600 dark:text-gray-300">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Village services load ho rahi hain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-700/40">
      {/* HEADER */}
      <section className="bg-gradient-to-br from-green-700 via-emerald-700 to-teal-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm backdrop-blur">
              <Landmark className="h-4 w-4" />
              {villageName} Village Services
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Gaon ki zaroori services, ek hi jagah
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">
              Sarkari yojana, farmer services, Gram Sabha, health, education,
              bills, local services aur community information — official
              links, helpline aur apply option ke saath.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard value={stats.total} label="Total Services" />
            <StatCard value={stats.active} label="Active Services" />
            <StatCard value={stats.applications} label="Apply Online" />
            <StatCard value={stats.links} label="With Official Links" />
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

              <div className="flex-1">
                <p className="font-medium text-red-800 dark:text-red-200">
                  Services load nahi ho paayi
                </p>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={loadFeatures}
                className="inline-flex items-center gap-2 rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* SEARCH */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Service, yojana, farmer, scholarship, department search karein..."
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-3 pl-10 pr-10 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900 dark:text-gray-100 dark:placeholder-gray-400"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={loadFeatures}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 transition hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />

            {categories.map((category) => {
              const active = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-green-600 text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {category === "all" ? "All" : getCategoryLabel(category)}
                </button>
              );
            })}
          </div>
        </div>

        {/* RESULTS INFO */}
        <div className="mt-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Village Services
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filteredFeatures.length} service
              {filteredFeatures.length !== 1 ? "s" : ""} available
            </p>
          </div>

          {(search || selectedCategory !== "all") && (
            <button
              type="button"
              onClick={clearSearch}
              className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 sm:self-auto"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </button>
          )}
        </div>

        {/* EMPTY */}
        {filteredFeatures.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <Search className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Koi service nahi mili
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
              Search ya category filter change karke dobara try karein.
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

        {/* GRID */}
        {filteredFeatures.length > 0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFeatures.map((feature) => (
              <ServiceCard
                key={featureKey(feature)}
                feature={feature}
                onView={() => openFeature(feature)}
              />
            ))}
          </div>
        )}
      </main>

      {selectedFeature && (
        <FeatureModal feature={selectedFeature} onClose={closeFeature} />
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Stat Card
|--------------------------------------------------------------------------
*/

function StatCard({ value, label }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-white/75 sm:text-sm">{label}</div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Service Card
|--------------------------------------------------------------------------
*/

function ServiceCard({ feature, onView }) {
  const Icon = getFeatureIcon(feature?.category);
  const isEmergency = feature?.category === "emergency";
  const links = getAllLinks(feature);
  const externalCount = links.filter((l) => /^https?:\/\//i.test(l.url)).length;
  const phones = getPhones(feature);
  const primaryPhone = phones[0];
  const department = feature?.department || feature?.metadata?.department;

  return (
    <article
      className={`group flex h-full flex-col rounded-2xl border bg-white dark:bg-gray-800 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        isEmergency
          ? "border-red-200 dark:border-red-800"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            isEmergency
              ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            isEmergency
              ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          }`}
        >
          {getCategoryLabel(feature?.category)}
        </span>
      </div>

      <div className="mt-5 flex-1">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {feature?.title || "Village Service"}
        </h3>

        {department && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Building2 className="h-3.5 w-3.5" />
            {department}
          </p>
        )}

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
          {feature?.shortDescription ||
            feature?.description ||
            "Service information available here."}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {feature?.applicationEnabled && (
          <span className="rounded-full bg-green-50 dark:bg-green-900/20 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-300">
            Apply Online
          </span>
        )}

        {externalCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
            <ExternalLink className="h-3 w-3" />
            Official Link
          </span>
        )}

        {feature?.featured && (
          <span className="rounded-full bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
            Featured
          </span>
        )}
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={onView}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
            isEmergency
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          View Details
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>

        {primaryPhone && (
          <a
            href={phoneHref(primaryPhone.number)}
            title={`${primaryPhone.label}: ${primaryPhone.number}`}
            aria-label={`Call ${primaryPhone.label}`}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 dark:border-gray-600 px-3.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Phone className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  );
}

/*
|--------------------------------------------------------------------------
| Feature Modal
|--------------------------------------------------------------------------
*/

function FeatureModal({ feature, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const Icon = getFeatureIcon(feature?.category);
  const isEmergency = feature?.category === "emergency";

  const requiredDocuments = Array.isArray(feature?.requiredDocuments)
    ? feature.requiredDocuments
    : [];
  const instructions = Array.isArray(feature?.instructions)
    ? feature.instructions
    : [];
  const agenda = Array.isArray(feature?.agenda) ? feature.agenda : [];
  const cropAdvice = Array.isArray(feature?.cropAdvice) ? feature.cropAdvice : [];
  const includedServices = Array.isArray(feature?.services) ? feature.services : [];
  const emergencyNumbers = feature?.metadata?.emergencyNumbers;

  const detailRows = getDetailRows(feature);
  const phones = getPhones(feature);
  const links = getAllLinks(feature);

  const [showApply, setShowApply] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [submitted, setSubmitted] = useState(null);

  // Esc se modal band
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleShare = async () => {
    const url = `${window.location.origin}/village-services?service=${
      feature.slug || featureKey(feature)
    }`;

    try {
      if (navigator.share) {
        await navigator.share({ title: feature.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copy ho gaya");
      }
    } catch {
      /* user ne share cancel kiya */
    }
  };

  const handleApplyClick = () => {
    if (!user) {
      toast("Apply karne ke liye pehle login karein");
      navigate("/login", {
        state: {
          // Login sirf pathname padhta hai, isliye query yahin jod di
          from: {
            pathname: `${location.pathname}?service=${
              feature.slug || featureKey(feature)
            }`,
          },
        },
      });
      return;
    }
    setShowApply(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setApplyError("");

      const response = await applyForFeature(featureKey(feature), {
        notes: notes.trim(),
      });

      const application = response?.data || response;
      setSubmitted(application);
      toast.success("Application jama ho gayi");
    } catch (err) {
      const message = err?.message || "Application submit nahi ho paayi.";
      setApplyError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const alreadyApplied = /already have an active application/i.test(applyError);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={feature?.title}
    >
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white dark:bg-gray-800 shadow-2xl sm:max-w-2xl sm:rounded-2xl">
        {/* Header */}
        <div
          className={`sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-gray-200 dark:border-gray-700 p-5 ${
            isEmergency
              ? "bg-red-50 dark:bg-red-900/20"
              : "bg-white dark:bg-gray-800"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                isEmergency
                  ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {feature?.title}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {getCategoryLabel(feature?.category)}
                {feature?.department ? ` · ${feature.department}` : ""}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={handleShare}
              className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
              aria-label="Share"
              title="Share link"
            >
              <Share2 className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-6 p-5">
          {/* Quick actions: official site + helpline */}
          {(feature?.applicationUrl || phones.length > 0) && (
            <div className="flex flex-col gap-3 sm:flex-row">
              {isSafeUrl(feature?.applicationUrl) && (
                <SmartLink
                  url={feature.applicationUrl}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  Official Website
                </SmartLink>
              )}

              {feature?.helplineNumber && (
                <a
                  href={phoneHref(feature.helplineNumber)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm font-semibold text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900/40"
                >
                  <Phone className="h-4 w-4" />
                  Helpline: {feature.helplineNumber}
                </a>
              )}
            </div>
          )}

          {/* About */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              About Service
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-200">
              {feature?.description ||
                feature?.shortDescription ||
                "No description available."}
            </p>
          </div>

          {/* Important details */}
          {detailRows.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Important Details
              </h3>

              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                {detailRows.map((row, index) => {
                  const RowIcon = row.icon;
                  return (
                    <div
                      key={`${row.label}-${index}`}
                      className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-3"
                    >
                      <RowIcon className="mt-0.5 h-4 w-4 shrink-0 text-green-700 dark:text-green-300" />
                      <div className="min-w-0">
                        <dt className="text-xs text-gray-500 dark:text-gray-400">
                          {row.label}
                        </dt>
                        <dd className="mt-0.5 break-words text-sm font-medium text-gray-900 dark:text-gray-100">
                          {row.value}
                        </dd>
                      </div>
                    </div>
                  );
                })}
              </dl>
            </div>
          )}

          <ListBlock title="Agenda" items={agenda} />
          <ListBlock title="Fasal Salah (Crop Advice)" items={cropAdvice} />
          <ListBlock title="Services Included" items={includedServices} />

          {/* Eligibility */}
          {feature?.eligibility && (
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Eligibility
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                {feature.eligibility}
              </p>
            </div>
          )}

          <ListBlock title="Required Documents" items={requiredDocuments} />

          {/* How it works */}
          {instructions.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                How It Works
              </h3>

              <ol className="mt-3 space-y-3">
                {instructions.map((instruction, index) => (
                  <li key={`${instruction}-${index}`} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-xs font-bold text-green-700 dark:text-green-300">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                      {instruction}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Contact */}
          {(phones.length > 0 || feature?.contactEmail) && (
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Contact
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {phones.map((item, index) => (
                  <a
                    key={`${item.number}-${index}`}
                    href={phoneHref(item.number)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Phone className="h-4 w-4 text-green-700 dark:text-green-300" />
                    {item.label}: {item.number}
                  </a>
                ))}

                {feature?.contactEmail && (
                  <a
                    href={`mailto:${feature.contactEmail}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Mail className="h-4 w-4 text-green-700 dark:text-green-300" />
                    {feature.contactEmail}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Useful Links */}
          {links.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Useful Links
              </h3>

              <ul className="mt-3 space-y-2">
                {links.map((link, index) => {
                  const meta = LINK_TYPE_META[link.type] || LINK_TYPE_META.other;
                  const LinkIcon = meta.icon;
                  const external = /^https?:\/\//i.test(link.url);

                  return (
                    <li key={`${link.url}-${index}`}>
                      <SmartLink
                        url={link.url}
                        className="group flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 transition hover:border-green-400 hover:bg-green-50/50 dark:hover:bg-green-900/10"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-green-100 group-hover:text-green-700 dark:group-hover:bg-green-900/30">
                          <LinkIcon className="h-4 w-4" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                            {link.label}
                          </span>
                          <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                            {external
                              ? link.url.replace(/^https?:\/\//i, "").replace(/\/$/, "")
                              : meta.label}
                          </span>
                        </span>

                        {external ? (
                          <ExternalLink className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-green-700" />
                        ) : (
                          <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-green-700" />
                        )}
                      </SmartLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Tags */}
          {Array.isArray(feature?.tags) && feature.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {feature.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-1 text-xs text-gray-600 dark:text-gray-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Emergency Numbers */}
          {isEmergency && emergencyNumbers && (
            <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
              <h3 className="font-semibold text-red-900 dark:text-red-200">
                Emergency Numbers
              </h3>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <EmergencyNumber label="Ambulance" number={emergencyNumbers.ambulance} />
                <EmergencyNumber label="Police" number={emergencyNumbers.police} />
                <EmergencyNumber label="Fire" number={emergencyNumbers.fire} />
                <EmergencyNumber label="Emergency" number={emergencyNumbers.nationalEmergency} />
              </div>
            </div>
          )}

          {/* ===================== APPLY ===================== */}
          {feature?.applicationEnabled && (
            <div className="rounded-2xl border border-green-200 dark:border-green-800 bg-green-50/60 dark:bg-green-900/10 p-4">
              {submitted ? (
                <div className="text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
                  <h3 className="mt-2 text-base font-bold text-gray-900 dark:text-gray-100">
                    Application jama ho gayi!
                  </h3>

                  {submitted?.trackingId && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      Tracking ID:{" "}
                      <span className="rounded bg-white dark:bg-gray-800 px-2 py-1 font-mono font-semibold text-green-700 dark:text-green-300">
                        {submitted.trackingId}
                      </span>
                    </p>
                  )}

                  <Link
                    to="/citizen/applications"
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Meri Applications dekhein
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : showApply ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Apply / Register — {feature.title}
                  </h3>

                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Aapka naam, phone aur parivar ki details profile / household se
                    apne aap li jaayengi.
                  </p>

                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={1000}
                    placeholder="Koi extra jaankari ya message (optional)"
                    className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900 dark:text-gray-100"
                  />

                  {applyError && (
                    <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
                      {alreadyApplied
                        ? "Aap is service ke liye pehle hi apply kar chuke hain."
                        : applyError}{" "}
                      {alreadyApplied && (
                        <Link
                          to="/citizen/applications"
                          className="font-semibold underline"
                        >
                          Status dekhein
                        </Link>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowApply(false)}
                      disabled={submitting}
                      className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submit ho raha hai...
                        </>
                      ) : (
                        "Application Submit Karein"
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyClick}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white ${
                    isEmergency
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {user ? "Apply / Register" : "Login karke Apply karein"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Emergency quick actions */}
          {isEmergency && (
            <div className="grid gap-3 sm:grid-cols-3">
              {emergencyNumbers?.ambulance && (
                <QuickCall label="Call Ambulance" number={emergencyNumbers.ambulance} />
              )}
              {emergencyNumbers?.police && (
                <QuickCall label="Call Police" number={emergencyNumbers.police} />
              )}
              {emergencyNumbers?.fire && (
                <QuickCall label="Call Fire" number={emergencyNumbers.fire} />
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
| Small components
|--------------------------------------------------------------------------
*/

function ListBlock({ title, items }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>

      <ul className="mt-2 space-y-2">
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-600" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuickCall({ label, number }) {
  return (
    <a
      href={phoneHref(number)}
      className="inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      {label}
    </a>
  );
}

function EmergencyNumber({ label, number }) {
  if (!number) return null;

  return (
    <a
      href={phoneHref(number)}
      className="rounded-lg bg-white dark:bg-gray-800 p-3 text-center shadow-sm transition hover:shadow"
    >
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-1 font-bold text-red-700 dark:text-red-300">{number}</div>
    </a>
  );
}