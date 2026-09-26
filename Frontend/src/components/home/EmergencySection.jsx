import { Link } from "react-router-dom";

const quickContacts = [
  {
    name: "Police",
    phone: "100",
    icon: "👮",
    description: "For police assistance",
  },
  {
    name: "Fire",
    phone: "101",
    icon: "🚒",
    description: "Fire & rescue service",
  },
  {
    name: "Ambulance",
    phone: "102",
    icon: "🚑",
    description: "Medical emergency",
  },
  {
    name: "Emergency",
    phone: "112",
    icon: "🆘",
    description: "All emergency services",
  },
];

export default function EmergencySection() {
  return (
    <section className="relative overflow-hidden border-y border-red-100 bg-gradient-to-br from-red-50 via-white to-orange-50 py-16 dark:border-red-900/30 dark:from-red-950/30 dark:via-gray-900 dark:to-orange-950/20">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-red-200/30 blur-3xl dark:bg-red-900/20" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-orange-200/30 blur-3xl dark:bg-orange-900/20" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              Emergency Help
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Emergency Contacts
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400 sm:text-base">
              Important emergency numbers for residents of Kakarcholi.
              Tap any contact to call directly.
            </p>
          </div>

          <Link
            to="/emergency"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:shadow-md dark:border-red-800 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            View all
            <span className="text-base">→</span>
          </Link>
        </div>

        {/* Emergency Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {quickContacts.map((contact) => (
            <a
              key={contact.name}
              href={`tel:${contact.phone}`}
              aria-label={`Call ${contact.name} at ${contact.phone}`}
              className="group relative overflow-hidden rounded-2xl border border-red-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl dark:border-red-900/40 dark:bg-gray-800/80 dark:hover:border-red-800"
            >
              {/* Hover Glow */}
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-100 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-red-900/40" />

              <div className="relative">
                {/* Icon */}
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-3xl transition-transform duration-300 group-hover:scale-110 dark:bg-red-900/30">
                  {contact.icon}
                </div>

                {/* Content */}
                <h3 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                  {contact.name}
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  {contact.description}
                </p>

                {/* Phone */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-extrabold tracking-wide text-red-600 dark:text-red-400 sm:text-2xl">
                    {contact.phone}
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all duration-300 group-hover:bg-red-600 group-hover:text-white dark:bg-red-900/30 dark:text-red-400 dark:group-hover:bg-red-500 dark:group-hover:text-white">
                    ☎
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Bottom Safety Note */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-white/70 p-4 backdrop-blur-sm dark:border-red-900/30 dark:bg-gray-800/50">
          <span className="mt-0.5 text-lg">⚠️</span>

          <p className="text-xs leading-5 text-gray-600 dark:text-gray-400 sm:text-sm">
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              Emergency Notice:
            </span>{" "}
            Use emergency numbers only when immediate assistance is required.
            For additional local contacts and services, visit the Emergency
            page.
          </p>
        </div>
      </div>
    </section>
  );
}