import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useVillage } from "../../context/VillageContext";

const quickLinks = [
  { to: "/", label: "Home", key: "nav.home", icon: "🏠" },
  { to: "/about", label: "About Village", key: "footer.aboutVillage", icon: "🏘️" },
  { to: "/notices", label: "Notices", key: "nav.notices", icon: "📢" },
  { to: "/events", label: "Events", key: "nav.events", icon: "📅" },
  { to: "/gallery", label: "Village Gallery", key: "footer.villageGallery", icon: "🖼️" },
];

const services = [
  { to: "/businesses", label: "Local Businesses", key: "footer.localBusinesses", icon: "🏪" },
  { to: "/jobs", label: "Jobs & Opportunities", key: "footer.jobsOpportunities", icon: "💼" },
  { to: "/services", label: "Government Services", key: "footer.governmentServices", icon: "🏛️" },
  { to: "/emergency", label: "Emergency Contacts", key: "footer.emergencyContacts", icon: "🚨" },
  { to: "/government-contacts", label: "Government Contacts", key: "footer.governmentContacts", icon: "📇" },
  { to: "/special-contacts", label: "Special Contacts", key: "footer.specialContacts", icon: "⭐" },
];

const communityLinks = [
  { to: "/register", label: "Join the Community", key: "footer.joinCommunity", icon: "👥" },
  { to: "/login", label: "Citizen Login", key: "footer.citizenLogin", icon: "🔐" },
  { to: "/citizen/complaints/create", label: "File a Complaint", key: "footer.fileComplaint", icon: "📝" },
  { to: "/village-places", label: "Explore Village", key: "footer.exploreVillage", icon: "📍" },
  { to: "/contact", label: "Contact Us", key: "footer.contactUs", icon: "✉️" },
];

/*
 * Mobile-first footer
 * - base (phone)  : 1 column, link groups are tap-to-open accordions, 44px touch targets
 * - sm  (>=640)   : location + emergency cards sit side by side
 * - md  (>=768)   : link groups become 3 open columns (accordion disabled)
 * - lg  (>=1024)  : brand on the left (4/12), links on the right (8/12)
 */
export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useLanguage();
  const { village, villageName } = useVillage();

  /*
   * Map: admin ne Village Settings me lat/lng daale hon to wahi use hote hain,
   * warna gaon ke naam + district + state se search hota hai.
   */
  const lat = village?.location?.lat ?? village?.coordinates?.lat ?? village?.latitude;
  const lng = village?.location?.lng ?? village?.coordinates?.lng ?? village?.longitude;
  const hasCoords = lat != null && lng != null && lat !== "" && lng !== "";

  const placeName = [
    village?.name || "Kakarcholi",
    village?.district || "Koderma",
    village?.state || "Jharkhand",
  ].join(", ");

  const mapQuery = hasCoords ? `${lat},${lng}` : encodeURIComponent(placeName);
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&hl=en&z=14&output=embed`;
  const mapOpenUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const displayName = villageName || "Kakarcholi";

  return (
    <footer className="relative mt-auto overflow-hidden bg-slate-950 text-gray-300">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-primary-600/10 blur-3xl sm:-left-40 sm:-top-40 sm:h-80 sm:w-80" />
        <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl sm:-bottom-40 sm:-right-40 sm:h-96 sm:w-96" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ================= Main ================= */}
        <div className="grid grid-cols-1 gap-8 py-10 sm:py-12 lg:grid-cols-12 lg:gap-12 lg:py-16">
          {/* Brand */}
          <div className="min-w-0 lg:col-span-4">
            <Link to="/" className="group inline-flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-blue-600 text-xl shadow-lg shadow-primary-600/20 transition-transform group-hover:scale-105 sm:h-12 sm:w-12 sm:text-2xl">
                🏘️
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold tracking-tight text-white sm:text-xl">
                  {t("layout.brand")}
                </h3>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary-400 sm:text-xs sm:tracking-[0.18em]">
                  {t("footer.villageConnect")}
                </p>
              </div>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-6 text-gray-400 sm:mt-5 sm:leading-7">
              {t("footer.tagline")}
            </p>

            {/* Location + Emergency: stacked on phone, side by side on sm, stacked again on lg */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-lg">
                  📍
                </span>
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-white">
                    {t("layout.brand")}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {t("footer.connectedVillage")}
                  </p>
                </div>
              </div>

              <a
                href="tel:112"
                className="group flex min-h-[64px] items-center justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/[0.07] p-4 transition-all hover:border-red-500/40 hover:bg-red-500/10 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-xl transition-transform group-hover:scale-105">
                    🚨
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t("footer.emergencyHelpline")}</p>
                    <p className="mt-0.5 font-bold text-red-400">112</p>
                  </div>
                </div>
                <span className="text-gray-500 transition-colors group-hover:text-red-400">→</span>
              </a>
            </div>
          </div>

          {/* Link groups: accordions on phone, 3 open columns from md */}
          <div className="grid grid-cols-1 gap-0 divide-y divide-white/10 border-y border-white/10 md:grid-cols-3 md:gap-8 md:divide-y-0 md:border-0 lg:col-span-8 lg:gap-10">
            <FooterColumn id="explore" title={t("footer.explore")} links={quickLinks} />
            <FooterColumn id="services" title={t("nav.services")} links={services} />
            <FooterColumn id="community" title={t("sidebar.community")} links={communityLinks} />
          </div>
        </div>

        {/* ================= Map ================= */}
        <div className="pb-8 sm:pb-10">
          <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
            <h4 className="min-w-0 text-sm font-bold uppercase tracking-wider text-white">
              📍 {displayName} — Village Map
            </h4>

            <a
              href={mapOpenUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-gray-300 transition-colors hover:border-primary-500/40 hover:text-white sm:w-fit"
            >
              Open in Google Maps ↗
            </a>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 shadow-lg">
            <iframe
              title={`${displayName} village map`}
              src={mapEmbedUrl}
              className="block h-56 w-full sm:h-72 lg:h-80"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>

        {/* ================= Bottom bar ================= */}
        <div
          className="border-t border-white/10 pt-6 sm:pb-6"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 text-center sm:text-left">
              <p className="text-sm text-gray-500">
                © {year}{" "}
                <span className="font-semibold text-gray-400">
                  {t("layout.brand")} {t("footer.villageConnect")}
                </span>
                . {t("footer.rights")}
              </p>
              <p className="mt-1 text-xs text-gray-600">{t("footer.builtFor")}</p>
              <p className="mt-1 text-xs text-gray-600">
                Made with <span className="text-red-400">❤</span> by{" "}
                <span className="font-semibold text-gray-400">Vivek Rana</span>
              </p>
            </div>

            <nav
              aria-label="Footer quick links"
              className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs sm:justify-end"
            >
              <BottomLink to="/">{t("nav.home")}</BottomLink>
              <BottomLink to="/about">{t("footer.about")}</BottomLink>
              <BottomLink to="/notices">{t("nav.notices")}</BottomLink>
              <BottomLink to="/emergency" danger>
                {t("nav.emergency")}
              </BottomLink>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

function BottomLink({ to, danger = false, children }) {
  return (
    <Link
      to={to}
      className={`inline-flex min-h-[44px] items-center text-gray-500 transition-colors ${
        danger ? "hover:text-red-400" : "hover:text-primary-400"
      }`}
    >
      {children}
    </Link>
  );
}

/* Reusable link group: tap-to-open on phones, always open from md */
function FooterColumn({ id, title, links }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-w-0">
      <h4>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={`footer-${id}`}
          className="flex min-h-[52px] w-full items-center justify-between text-left text-sm font-bold uppercase tracking-wider text-white md:pointer-events-none md:mb-5 md:min-h-0 md:cursor-default"
        >
          {title}
          <span
            aria-hidden="true"
            className={`text-gray-500 transition-transform duration-200 md:hidden ${
              open ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </button>
      </h4>

      <ul
        id={`footer-${id}`}
        className={`${open ? "block" : "hidden"} pb-3 md:block md:space-y-1 md:pb-0`}
      >
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="group flex min-h-[44px] items-center gap-2.5 text-sm text-gray-500 transition-colors hover:text-white md:min-h-[36px]"
            >
              <span className="text-sm opacity-70 transition-all group-hover:scale-110 group-hover:opacity-100">
                {link.icon}
              </span>
              <span className="min-w-0 break-words">{t(link.key, link.label)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}