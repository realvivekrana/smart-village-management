import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { formatDate } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";

/*
 * Citizen dashboard ke gaon-focused sections.
 * Sabhi data /dashboard/citizen ek hi API call se aata hai.
 */

const SectionCard = ({ title, action, children }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-4 gap-2">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
      {action}
    </div>
    {children}
  </div>
);

const ViewAll = ({ to, label }) => (
  <Link to={to} className="text-xs font-medium text-primary-600 hover:underline whitespace-nowrap">
    {label} →
  </Link>
);

const Empty = ({ text }) => (
  <p className="text-sm text-gray-500 dark:text-gray-400 py-2">{text}</p>
);

/* ------------------------------------------------------------------ */
/* Quick access: gaon ki saari sevayein ek jagah                        */
/* ------------------------------------------------------------------ */

const QUICK_ITEMS = [
  { to: "/citizen/village-services?category=farmer", icon: "🌾", key: "quick.mandi", fb: "Mandi Bhav & Kheti" },
  { to: "/citizen/village-services?category=scheme", icon: "🏛️", key: "quick.schemes", fb: "Sarkari Yojana" },
  { to: "/citizen/village-services?category=gram-sabha", icon: "🗳️", key: "quick.gramSabha", fb: "Gram Sabha" },
  { to: "/citizen/village-services?category=health-camp", icon: "🩺", key: "quick.health", fb: "Health Camp & Teeka" },
  { to: "/citizen/village-services?category=bill-tax", icon: "🧾", key: "quick.bills", fb: "Kar aur Bill" },
  { to: "/citizen/village-services?category=transport", icon: "🚌", key: "quick.transport", fb: "Bus / Gaadi Time" },
  { to: "/citizen/notices", icon: "📢", key: "quick.notices", fb: "Suchnayein" },
  { to: "/citizen/events", icon: "📅", key: "quick.events", fb: "Karyakram" },
  { to: "/jobs", icon: "💼", key: "quick.jobs", fb: "Rozgar" },
  { to: "/businesses", icon: "🏪", key: "quick.businesses", fb: "Gaon ki Dukaanein" },
  { to: "/government-contacts", icon: "📞", key: "quick.govtContacts", fb: "Sarkari Sampark" },
  { to: "/citizen/sos", icon: "🆘", key: "quick.sos", fb: "Emergency SOS", danger: true },
];

export const QuickAccessGrid = () => {
  const { t } = useLanguage();
  return (
    <SectionCard title={t("citizenDash.quickAccess", "Gaon ki Sevayein")}>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {QUICK_ITEMS.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-md ${
              item.danger
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                : "border-gray-100 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-medium leading-tight">
              {t(`citizenDash.${item.key}`, item.fb)}
            </span>
          </Link>
        ))}
      </div>
    </SectionCard>
  );
};

/* ------------------------------------------------------------------ */
/* Mandi Bhav                                                          */
/* ------------------------------------------------------------------ */

export const MandiWidget = ({ prices = [] }) => {
  const { t } = useLanguage();
  return (
    <SectionCard
      title={`🌾 ${t("citizenDash.mandiTitle", "Aaj ka Mandi Bhav")}`}
      action={<ViewAll to="/citizen/village-services" label={t("citizenDash.viewAll", "Sab dekhein")} />}
    >
      {prices.length === 0 ? (
        <Empty text={t("citizenDash.noMandi", "Abhi koi mandi bhav update nahi hua hai.")} />
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th className="px-1 pb-2 font-medium">{t("citizenDash.crop", "Fasal")}</th>
                <th className="px-1 pb-2 font-medium">{t("citizenDash.modalPrice", "Bhav")}</th>
                <th className="px-1 pb-2 font-medium hidden sm:table-cell">
                  {t("citizenDash.range", "Min – Max")}
                </th>
                <th className="px-1 pb-2 font-medium hidden sm:table-cell">
                  {t("citizenDash.updated", "Update")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {prices.map((p) => (
                <tr key={p._id}>
                  <td className="px-1 py-2 font-medium text-gray-900 dark:text-white">
                    {p.cropName}
                    {p.mandiName && <span className="block text-xs font-normal text-gray-500">{p.mandiName}</span>}
                  </td>
                  <td className="px-1 py-2 text-green-700 dark:text-green-400 font-semibold whitespace-nowrap">
                    {formatCurrency(p.modalPrice)}
                    <span className="text-xs font-normal text-gray-500"> / {p.cropUnit || "quintal"}</span>
                  </td>
                  <td className="px-1 py-2 text-gray-600 dark:text-gray-300 hidden sm:table-cell whitespace-nowrap">
                    {formatCurrency(p.minPrice)} – {formatCurrency(p.maxPrice)}
                  </td>
                  <td className="px-1 py-2 text-gray-500 hidden sm:table-cell whitespace-nowrap">
                    {formatDate(p.priceDate, "dd MMM")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
};

/* ------------------------------------------------------------------ */
/* Agli Gram Sabha                                                     */
/* ------------------------------------------------------------------ */

export const GramSabhaCard = ({ meeting }) => {
  const { t } = useLanguage();
  return (
    <SectionCard
      title={`🗳️ ${t("citizenDash.gramSabhaTitle", "Agli Gram Sabha")}`}
      action={<ViewAll to="/citizen/village-services" label={t("citizenDash.details", "Vivaran")} />}
    >
      {!meeting ? (
        <Empty text={t("citizenDash.noGramSabha", "Abhi koi Gram Sabha tay nahi hui hai.")} />
      ) : (
        <div className="space-y-2">
          <p className="font-semibold text-gray-900 dark:text-white">{meeting.title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            📅 {formatDate(meeting.meetingDate, "dd MMM yyyy, hh:mm a")}
          </p>
          {meeting.meetingLocation && (
            <p className="text-sm text-gray-600 dark:text-gray-300">📍 {meeting.meetingLocation}</p>
          )}
          {meeting.agenda?.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-0.5">
              {meeting.agenda.slice(0, 4).map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </SectionCard>
  );
};

/* ------------------------------------------------------------------ */
/* Latest Notices                                                      */
/* ------------------------------------------------------------------ */

const PRIORITY_BADGE = {
  urgent: "badge-red",
  high: "badge-yellow",
  normal: "badge-blue",
  low: "badge-gray",
};

export const NoticesWidget = ({ notices = [] }) => {
  const { t } = useLanguage();
  return (
    <SectionCard
      title={`📢 ${t("citizenDash.noticesTitle", "Taaza Suchnayein")}`}
      action={<ViewAll to="/citizen/notices" label={t("citizenDash.viewAll", "Sab dekhein")} />}
    >
      {notices.length === 0 ? (
        <Empty text={t("citizenDash.noNotices", "Koi nayi suchna nahi hai.")} />
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {notices.map((n) => (
            <li key={n._id}>
              <Link to={`/citizen/notices/${n._id}`} className="flex items-start justify-between gap-3 py-2.5 hover:opacity-80">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{n.title}</p>
                  <p className="text-xs text-gray-500">{formatDate(n.publishedAt)}</p>
                </div>
                {(n.priority === "urgent" || n.priority === "high") && (
                  <span className={PRIORITY_BADGE[n.priority]}>{n.priority}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
};

/* ------------------------------------------------------------------ */
/* Upcoming Events                                                     */
/* ------------------------------------------------------------------ */

export const EventsWidget = ({ events = [] }) => {
  const { t } = useLanguage();
  return (
    <SectionCard
      title={`📅 ${t("citizenDash.eventsTitle", "Aane wale Karyakram")}`}
      action={<ViewAll to="/citizen/events" label={t("citizenDash.viewAll", "Sab dekhein")} />}
    >
      {events.length === 0 ? (
        <Empty text={t("citizenDash.noEvents", "Abhi koi karyakram tay nahi hai.")} />
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {events.map((e) => (
            <li key={e._id}>
              <Link to={`/citizen/events/${e._id}`} className="block py-2.5 hover:opacity-80">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{e.title}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(e.startDate)}
                  {e.location ? ` • ${e.location}` : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
};

/* ------------------------------------------------------------------ */
/* Mera Parivar                                                        */
/* ------------------------------------------------------------------ */

export const FamilyCard = ({ household }) => {
  const { t } = useLanguage();
  return (
    <SectionCard title={`🏠 ${t("citizenDash.familyTitle", "Mera Parivar")}`}>
      {!household?.exists ? (
        <div className="space-y-3">
          <Empty
            text={t(
              "citizenDash.noFamily",
              "Parivar ki jaankari abhi nahi bhari hai. Yojanaon ka labh lene ke liye parivar ka vivaran bharein."
            )}
          />
          <Link to="/citizen/household" className="btn-primary">
            {t("citizenDash.addFamily", "Parivar jodein")}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">{t("citizenDash.head", "Mukhiya")}</p>
            <p className="font-semibold text-gray-900 dark:text-white">{household.headName}</p>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-gray-500">{t("citizenDash.members", "Sadasya")}</p>
              <p className="text-xl font-bold text-primary-600">{household.memberCount}</p>
            </div>
            {household.houseNumber && (
              <div>
                <p className="text-gray-500">{t("citizenDash.house", "Ghar No.")}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{household.houseNumber}</p>
              </div>
            )}
            {household.ward && (
              <div>
                <p className="text-gray-500">{t("citizenDash.ward", "Ward")}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{household.ward}</p>
              </div>
            )}
          </div>
          <Link to="/citizen/household" className="btn-secondary">
            {t("citizenDash.manageFamily", "Parivar dekhein / badlein")}
          </Link>
        </div>
      )}
    </SectionCard>
  );
};

/* ------------------------------------------------------------------ */
/* Zaroori Helpline                                                    */
/* ------------------------------------------------------------------ */

export const HelplineWidget = ({ contacts = [] }) => {
  const { t } = useLanguage();
  return (
    <SectionCard
      title={`📞 ${t("citizenDash.helplineTitle", "Zaroori Helpline")}`}
      action={<ViewAll to="/emergency" label={t("citizenDash.viewAll", "Sab dekhein")} />}
    >
      {contacts.length === 0 ? (
        <Empty text={t("citizenDash.noHelpline", "Helpline numbers abhi jode nahi gaye hain.")} />
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {contacts.map((c) => (
            <li key={c._id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.name}</p>
                {c.designation && <p className="text-xs text-gray-500 truncate">{c.designation}</p>}
              </div>
              <a
                href={`tel:${c.phone}`}
                className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
              >
                📞 {c.phone}
              </a>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
};