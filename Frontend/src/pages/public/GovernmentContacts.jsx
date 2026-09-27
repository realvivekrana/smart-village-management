import { useEffect, useState } from "react";
import { getGovernmentContacts } from "../../services/governmentContactService";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";

const categoryIcons = {
  Emergency: "🆘",
  "District Administration": "🏛️",
  "Block Administration": "👥",
  Panchayat: "🏢",
  Police: "👮",
  Health: "🏥",
  Education: "🎓",
  Agriculture: "🌾",
  Electricity: "⚡",
  "Water Supply": "💧",
  Transport: "🚌",
  Legal: "⚖️",
  "Government Services": "📄",
  Other: "🏢",
};

const getIcon = (category) => categoryIcons[category] || "🏢";

export default function GovernmentContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getGovernmentContacts({ limit: 100 });
      setContacts(response.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load government contacts. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const categories = [
    "All",
    ...new Set(contacts.map((contact) => contact.category)),
  ];

  const searchText = search.trim().toLowerCase();

  const filteredContacts = contacts.filter((contact) => {
    const matchesCategory =
      selectedCategory === "All" || contact.category === selectedCategory;

    const matchesSearch =
      !searchText ||
      [contact.name, contact.designation, contact.department, contact.office]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchText));

    return matchesCategory && matchesSearch;
  });

  // Emergency / featured contacts float to the top of the list
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (a.isEmergency !== b.isEmergency) return a.isEmergency ? -1 : 1;
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    return (a.displayOrder || 0) - (b.displayOrder || 0);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-white/15 text-3xl leading-none">
                🏛️
              </div>

              <span className="text-green-100 font-medium">
                Kakarcholi Village
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold">
              Government &amp; Important Contacts
            </h1>

            <p className="mt-5 text-lg text-green-50 leading-8">
              Important government officers, departments, emergency services
              and public assistance contacts useful for the residents of
              Kakarcholi and nearby areas — including BDO, CO, DC and other
              officials.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 mb-8">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search officer, department, service..."
              className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3.5 pl-12 pr-4 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {error ? (
          <div className="mb-8">
            <ErrorMessage message={error} onRetry={load} />
          </div>
        ) : null}

        {loading ? (
          <Loader text="Loading government contacts..." />
        ) : (
          <>
            {/* Categories */}
            {categories.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-3 mb-8">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    type="button"
                    className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition ${
                      selectedCategory === category
                        ? "bg-green-600 text-white shadow"
                        : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-green-500"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            {/* Contact Cards */}
            {sortedContacts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sortedContacts.map((contact) => (
                  <article
                    key={contact._id}
                    className={`bg-white dark:bg-gray-900 rounded-2xl border shadow-sm hover:shadow-lg transition overflow-hidden ${
                      contact.isEmergency
                        ? "border-red-200 dark:border-red-900/60 ring-1 ring-red-100 dark:ring-red-900/30"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl leading-none ${
                            contact.isEmergency
                              ? "bg-red-100 dark:bg-red-950/50"
                              : "bg-green-100 dark:bg-green-950/50"
                          }`}
                        >
                          {getIcon(contact.category)}
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-xs font-semibold rounded-full px-3 py-1 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400">
                            {contact.category}
                          </span>

                          {contact.isFeatured && (
                            <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                              ⭐ Featured
                            </span>
                          )}
                        </div>
                      </div>

                      <h2 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
                        {contact.name}
                      </h2>

                      <p className="mt-1 text-sm font-medium text-green-600 dark:text-green-400">
                        {contact.designation}
                      </p>

                      {contact.description && (
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                          {contact.description}
                        </p>
                      )}

                      <div className="mt-5 space-y-3">
                        <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className="mt-0.5 text-gray-400 shrink-0">
                            🏢
                          </span>
                          <span>
                            {contact.department}
                            {contact.office ? ` · ${contact.office}` : ""}
                          </span>
                        </div>

                        {contact.address && (
                          <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <span className="mt-0.5 text-gray-400 shrink-0">
                              📍
                            </span>
                            <span>{contact.address}</span>
                          </div>
                        )}

                        {contact.email && (
                          <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <span className="mt-0.5 text-gray-400 shrink-0">
                              ✉️
                            </span>
                            <a
                              href={`mailto:${contact.email}`}
                              className="hover:text-green-600 dark:hover:text-green-400 break-all"
                            >
                              {contact.email}
                            </a>
                          </div>
                        )}

                        {contact.website && (
                          <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <span className="mt-0.5 text-gray-400 shrink-0">
                              🌐
                            </span>
                            <a
                              href={contact.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-green-600 dark:hover:text-green-400 break-all"
                            >
                              {contact.website}
                            </a>
                          </div>
                        )}

                        {contact.lastVerifiedAt && (
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            ✅ Verified{" "}
                            {new Date(
                              contact.lastVerifiedAt
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        )}

                        {contact.phone ? (
                          <a
                            href={`tel:${contact.phone}`}
                            className={`flex items-center justify-center gap-2 w-full rounded-xl text-white py-3 font-semibold transition ${
                              contact.isEmergency
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            📞 Call {contact.phone}
                          </a>
                        ) : (
                          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            Official contact number can be added by the
                            administrator.
                          </div>
                        )}

                        {contact.alternatePhone && (
                          <a
                            href={`tel:${contact.alternatePhone}`}
                            className="flex items-center justify-center gap-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 text-sm font-medium hover:border-green-500 transition"
                          >
                            📞 Alt: {contact.alternatePhone}
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="📇"
                title="No contacts found"
                description={
                  contacts.length === 0
                    ? "The administrator hasn't added any government contacts yet."
                    : "Try another search term or category."
                }
              />
            )}

            {/* Important Note */}
            <div className="mt-10 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-5">
              <h3 className="font-bold text-amber-900 dark:text-amber-300">
                Important Information
              </h3>

              <p className="mt-2 text-sm leading-6 text-amber-800 dark:text-amber-400">
                Government officer names and direct contact numbers should be
                verified with the concerned department before publishing. The
                administrator can update the directory whenever official
                contact information changes.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}