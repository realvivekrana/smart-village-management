import { useEffect, useState } from "react";
import { getEmergencyContacts } from "../../services/emergencyService";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";

const fallbackContacts = [
  {
    name: "Police",
    phone: "100",
    category: "Police",
    icon: "👮",
  },
  {
    name: "Fire & Rescue",
    phone: "101",
    category: "Fire",
    icon: "🚒",
  },
  {
    name: "Ambulance",
    phone: "102",
    category: "Medical",
    icon: "🚑",
  },
  {
    name: "Emergency Helpline",
    phone: "112",
    category: "Emergency",
    icon: "🆘",
  },
];

const categoryStyles = {
  police: "from-blue-500 to-indigo-600",
  fire: "from-red-500 to-orange-600",
  medical: "from-emerald-500 to-teal-600",
  emergency: "from-red-600 to-rose-700",
  hospital: "from-cyan-500 to-blue-600",
  women: "from-pink-500 to-rose-600",
  other: "from-gray-600 to-gray-800",
};

const getCategoryGradient = (category = "") => {
  const key = String(category).toLowerCase();

  if (key.includes("police")) return categoryStyles.police;
  if (key.includes("fire")) return categoryStyles.fire;
  if (key.includes("medical") || key.includes("ambulance")) {
    return categoryStyles.medical;
  }
  if (key.includes("women")) return categoryStyles.women;
  if (key.includes("hospital")) return categoryStyles.hospital;
  if (key.includes("emergency")) return categoryStyles.emergency;

  return categoryStyles.other;
};

const getIcon = (category = "", name = "") => {
  const value = `${category} ${name}`.toLowerCase();

  if (value.includes("police")) return "👮";
  if (value.includes("fire")) return "🚒";
  if (value.includes("ambulance") || value.includes("medical")) return "🚑";
  if (value.includes("hospital")) return "🏥";
  if (value.includes("women")) return "👩";
  if (value.includes("emergency")) return "🆘";

  return "📞";
};

export default function Emergency() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getEmergencyContacts();

      const data =
        res.data?.data?.contacts ||
        res.data?.data ||
        [];

      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load emergency contacts"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const displayContacts =
    contacts.length > 0 ? contacts : fallbackContacts;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-rose-700 to-orange-600" />

        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-orange-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              🚨 Kakarcholi Emergency Services
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Emergency
              <span className="block text-red-100">
                Contacts
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-red-50 sm:text-lg">
              Important emergency numbers for police, fire, medical
              assistance and other urgent situations.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur">
                📞 Quick Call
              </div>

              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur">
                ⚡ Fast Access
              </div>

              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur">
                🛡️ Emergency Support
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Emergency Alert */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/40 dark:bg-red-900/10 sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-2xl dark:bg-red-900/40">
              ⚠️
            </div>

            <div>
              <h2 className="font-bold text-red-800 dark:text-red-300">
                In case of an emergency
              </h2>

              <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-400">
                Stay calm and contact the appropriate emergency service
                immediately. For general emergencies, use the national
                emergency number <strong>112</strong>.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Contacts */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
              Quick Assistance
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              Important Numbers
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Tap the call button to contact an emergency service.
            </p>
          </div>

          {!loading && displayContacts.length > 0 && (
            <div className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {displayContacts.length} Contacts
            </div>
          )}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white py-12 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <Loader />
          </div>
        ) : error && contacts.length === 0 ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 dark:border-red-900/40 dark:bg-red-900/10">
            <ErrorMessage
              message={error}
              onRetry={loadContacts}
            />
          </div>
        ) : contacts.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white py-12 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <EmptyState
              icon="🚨"
              title="No emergency contacts found"
              description="Emergency contact information is currently unavailable."
            />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {displayContacts.map((contact, index) => {
              const name =
                contact.name ||
                contact.title ||
                contact.service ||
                "Emergency Service";

              const phone =
                contact.phone ||
                contact.phoneNumber ||
                contact.number ||
                "";

              const category =
                contact.category ||
                contact.type ||
                "Emergency";

              const icon =
                contact.icon ||
                getIcon(category, name);

              const gradient =
                getCategoryGradient(category);

              return (
                <EmergencyCard
                  key={contact._id || `${name}-${index}`}
                  name={name}
                  phone={phone}
                  category={category}
                  icon={icon}
                  gradient={gradient}
                  description={contact.description}
                  address={contact.address}
                  available24x7={contact.available24x7}
                />
              );
            })}

          </div>
        )}

        {/* General Emergency */}
        <section className="mt-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 p-6 shadow-xl sm:p-8">

            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur">
                  🆘
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-red-100">
                    National Emergency Number
                  </p>

                  <h2 className="mt-1 text-3xl font-extrabold text-white sm:text-4xl">
                    112
                  </h2>

                  <p className="mt-1 max-w-xl text-sm text-red-100">
                    For police, fire, medical and other emergency
                    assistance.
                  </p>
                </div>

              </div>

              <a
                href="tel:112"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-red-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-red-50"
              >
                📞 Call 112
              </a>

            </div>
          </div>
        </section>

      </main>
    </div>
  );
}


/* -------------------------------------------------------
   Emergency Card
------------------------------------------------------- */

function EmergencyCard({
  name,
  phone,
  category,
  icon,
  gradient,
  description,
  address,
  available24x7,
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">

      {/* Gradient Header */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} p-6`}>

        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-xl" />

        <div className="relative flex items-start justify-between gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-4xl shadow-lg backdrop-blur">
            {icon}
          </div>

          {available24x7 && (
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">
              24 × 7
            </span>
          )}

        </div>

        <div className="relative mt-5">

          <p className="text-xs font-semibold uppercase tracking-wider text-white/75">
            {category}
          </p>

          <h3 className="mt-1 text-xl font-bold text-white">
            {name}
          </h3>

        </div>
      </div>

      {/* Body */}
      <div className="p-6">

        {description && (
          <p className="mb-4 line-clamp-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}

        {address && (
          <div className="mb-4 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span>📍</span>
            <span>{address}</span>
          </div>
        )}

        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">

          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Emergency Number
          </p>

          <p className="mt-1 text-2xl font-extrabold tracking-wide text-gray-900 dark:text-white">
            {phone || "Not available"}
          </p>

        </div>

        {phone ? (
          <a
            href={`tel:${String(phone).replace(/[^\d+]/g, "")}`}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${gradient} px-5 py-3 font-bold text-white shadow-sm transition-all hover:scale-[1.01] hover:shadow-lg`}
          >
            <span>📞</span>
            Call Now
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="mt-4 w-full cursor-not-allowed rounded-xl bg-gray-200 px-5 py-3 font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-400"
          >
            Number unavailable
          </button>
        )}

      </div>
    </div>
  );
}