/*
 * Public site navigation — Navbar aur MobileMenu dono yahin se padhte hain.
 * primary  : hamesha dikhte hain
 * more     : desktop pe "More" dropdown me, mobile pe list me
 */
export const primaryNavLinks = [
  { to: "/", label: "Home", key: "nav.home", end: true },
  { to: "/notices", label: "Notices", key: "nav.notices" },
  { to: "/village-services", label: "Village Services", key: "nav.villageServices" },
  { to: "/events", label: "Events", key: "nav.events" },
  { to: "/emergency", label: "Emergency", key: "nav.emergency" },
];

export const moreNavLinks = [
  { to: "/community", label: "Community", key: "nav.community" },
  { to: "/jobs", label: "Jobs", key: "nav.jobs" },
  { to: "/businesses", label: "Businesses", key: "nav.businesses" },
  { to: "/services", label: "Services", key: "nav.services" },
  { to: "/government-contacts", label: "Govt. Contacts", key: "nav.govtContacts" },
  { to: "/gallery", label: "Gallery", key: "nav.gallery" },
  { to: "/about", label: "About Village", key: "nav.about" },
  { to: "/contact", label: "Contact", key: "nav.contact" },
];

export const allNavLinks = [...primaryNavLinks, ...moreNavLinks];