/*
 * Public site navigation — Navbar aur MobileMenu dono yahin se padhte hain.
 * primary  : hamesha dikhte hain
 * more     : desktop pe "More" dropdown me, mobile pe list me
 */
export const primaryNavLinks = [
  { to: "/", label: "Home", key: "nav.home", end: true },
  { to: "/about", label: "About Village", key: "nav.about" },
  { to: "/notices", label: "Notices", key: "nav.notices" },
  { to: "/events", label: "Events", key: "nav.events" },
  { to: "/community", label: "Community", key: "nav.community" },
  { to: "/special-contacts", label: "Special Contacts", key: "nav.specialContacts" },
];

export const moreNavLinks = [
  { to: "/village-services", label: "Village Services", key: "nav.villageServices" },
  { to: "/emergency", label: "Emergency", key: "nav.emergency" },
  { to: "/gaon-bazaar", label: "Village Bazaar", key: "nav.bazaar" },
  { to: "/jobs", label: "Jobs", key: "nav.jobs" },
  { to: "/businesses", label: "Businesses", key: "nav.businesses" },
  { to: "/services", label: "Services", key: "nav.services" },
  { to: "/government-contacts", label: "Govt. Contacts", key: "nav.govtContacts" },
  { to: "/gallery", label: "Gallery", key: "nav.gallery" },
  { to: "/contact", label: "Contact", key: "nav.contact" },
];

export const allNavLinks = [...primaryNavLinks, ...moreNavLinks];