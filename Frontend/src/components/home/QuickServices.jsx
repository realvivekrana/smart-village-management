import { Link } from "react-router-dom";

const services = [
  {
    to: "/notices",
    icon: "📢",
    title: "Village Notices",
    desc: "Official announcements & important updates",
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    to: "/events",
    icon: "📅",
    title: "Events",
    desc: "Cultural, religious & community events",
    gradient: "from-purple-500 to-pink-500",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    to: "/jobs",
    icon: "💼",
    title: "Local Jobs",
    desc: "Explore employment opportunities nearby",
    gradient: "from-emerald-500 to-green-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    to: "/businesses",
    icon: "🏪",
    title: "Local Businesses",
    desc: "Discover shops, services & businesses",
    gradient: "from-orange-500 to-amber-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    to: "/services",
    icon: "🏛️",
    title: "Government Services",
    desc: "Access useful government services",
    gradient: "from-teal-500 to-cyan-600",
    bg: "bg-teal-50 dark:bg-teal-900/20",
  },
  {
    to: "/citizen/complaints/create",
    icon: "📝",
    title: "Report an Issue",
    desc: "Submit complaints about village issues",
    gradient: "from-rose-500 to-red-500",
    bg: "bg-rose-50 dark:bg-rose-900/20",
  },
  {
    to: "/emergency",
    icon: "🚨",
    title: "Emergency Help",
    desc: "Quick access to important helplines",
    gradient: "from-red-500 to-orange-500",
    bg: "bg-red-50 dark:bg-red-900/20",
  },
  {
    to: "/village-places",
    icon: "🗺️",
    title: "Explore Kakarcholi",
    desc: "Important places & village attractions",
    gradient: "from-indigo-500 to-violet-500",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
  },
];

export default function QuickServices() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-16 dark:bg-slate-950">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            Kakarcholi Digital Services
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            Everything You Need,
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              All in One Place
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
            Access important village services, local information and
            community resources from one simple platform.
          </p>
        </div>

        {/* Services */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {services.map((service) => (
            <Link
              key={service.to}
              to={service.to}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-transparent hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-6"
            >
              {/* Hover gradient */}
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${service.gradient} transition-all duration-300 group-hover:h-1.5`}
              />

              {/* Icon */}
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-2 ${service.bg}`}
              >
                {service.icon}
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 sm:text-lg">
                {service.title}
              </h3>

              {/* Description */}
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
                {service.desc}
              </p>

              {/* Bottom action */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-400 transition-colors group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-blue-400">
                  Explore
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm text-slate-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg dark:bg-slate-800 dark:text-slate-300">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom info */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
          <div className="flex -space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-100 text-sm dark:border-slate-950">
              👨
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-green-100 text-sm dark:border-slate-950">
              👩
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-purple-100 text-sm dark:border-slate-950">
              👨‍🌾
            </div>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Built for the people and community of{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Kakarcholi
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}