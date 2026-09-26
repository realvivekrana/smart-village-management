import { Link } from "react-router-dom";

const quickLinks = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/about", label: "About Kakarcholi", icon: "🏘️" },
  { to: "/notices", label: "Notices", icon: "📢" },
  { to: "/events", label: "Events", icon: "📅" },
];

const services = [
  { to: "/businesses", label: "Local Businesses", icon: "🏪" },
  { to: "/jobs", label: "Jobs & Opportunities", icon: "💼" },
  { to: "/services", label: "Government Services", icon: "🏛️" },
  { to: "/emergency", label: "Emergency Contacts", icon: "🚨" },
];

const communityLinks = [
  { to: "/register", label: "Join the Community", icon: "👥" },
  { to: "/login", label: "Citizen Login", icon: "🔐" },
  { to: "/citizen/complaints/create", label: "File a Complaint", icon: "📝" },
  { to: "/village-places", label: "Explore Village", icon: "📍" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden bg-slate-950 text-gray-300">

      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="
          absolute -top-40 -left-40
          h-80 w-80
          rounded-full
          bg-primary-600/10
          blur-3xl
        " />

        <div className="
          absolute -bottom-40 -right-40
          h-96 w-96
          rounded-full
          bg-blue-600/10
          blur-3xl
        " />

        <div className="
          absolute inset-x-0 top-0 h-px
          bg-gradient-to-r
          from-transparent
          via-primary-500/50
          to-transparent
        " />
      </div>

      <div className="
        relative
        max-w-7xl
        mx-auto
        px-4
        sm:px-6
        lg:px-8
      ">

        {/* Main Footer */}
        <div className="py-14 lg:py-16">

          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-12
            gap-10
            lg:gap-12
          ">

            {/* Brand */}
            <div className="lg:col-span-4">

              <Link
                to="/"
                className="
                  inline-flex
                  items-center
                  gap-3
                  group
                "
              >
                <div className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-gradient-to-br
                  from-primary-500
                  to-blue-600
                  text-2xl
                  shadow-lg
                  shadow-primary-600/20
                  group-hover:scale-105
                  transition-transform
                ">
                  🏘️
                </div>

                <div>
                  <h3 className="
                    text-xl
                    font-bold
                    tracking-tight
                    text-white
                  ">
                    Kakarcholi
                  </h3>

                  <p className="
                    text-xs
                    font-medium
                    uppercase
                    tracking-[0.18em]
                    text-primary-400
                  ">
                    Village Connect
                  </p>
                </div>
              </Link>

              <p className="
                mt-5
                max-w-md
                text-sm
                leading-7
                text-gray-400
              ">
                A digital platform connecting the people of Kakarcholi
                with village information, local services, community
                updates, businesses, jobs and important public resources.
              </p>

              {/* Location */}
              <div className="
                mt-6
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-white/10
                bg-white/[0.03]
                p-4
              ">
                <span className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-primary-500/10
                  text-lg
                ">
                  📍
                </span>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Kakarcholi
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    A connected village community
                  </p>
                </div>
              </div>

              {/* Emergency CTA */}
              <a
                href="tel:112"
                className="
                  mt-5
                  flex
                  items-center
                  justify-between
                  gap-4
                  rounded-2xl
                  border
                  border-red-500/20
                  bg-red-500/[0.07]
                  p-4
                  group
                  hover:border-red-500/40
                  hover:bg-red-500/10
                  transition-all
                "
              >
                <div className="flex items-center gap-3">
                  <div className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-red-500/10
                    text-xl
                    group-hover:scale-105
                    transition-transform
                  ">
                    🚨
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Emergency Helpline
                    </p>

                    <p className="
                      mt-0.5
                      font-bold
                      text-red-400
                    ">
                      112
                    </p>
                  </div>
                </div>

                <span className="
                  text-gray-500
                  group-hover:text-red-400
                  transition-colors
                ">
                  →
                </span>
              </a>
            </div>

            {/* Quick Links */}
            <FooterColumn
              title="Explore"
              links={quickLinks}
            />

            {/* Services */}
            <FooterColumn
              title="Services"
              links={services}
            />

            {/* Community */}
            <FooterColumn
              title="Community"
              links={communityLinks}
            />
          </div>
        </div>

        {/* Bottom section */}
        <div className="
          border-t
          border-white/10
          py-6
        ">

          <div className="
            flex
            flex-col
            gap-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          ">

            <div>
              <p className="
                text-sm
                text-gray-500
              ">
                © {year}{" "}
                <span className="font-semibold text-gray-400">
                  Kakarcholi Village Connect
                </span>
                . All rights reserved.
              </p>

              <p className="
                mt-1
                text-xs
                text-gray-600
              ">
                Built to connect, inform and empower the village community.
              </p>
            </div>

            {/* Quick bottom links */}
            <div className="
              flex
              flex-wrap
              items-center
              gap-x-5
              gap-y-2
              text-xs
            ">
              <Link
                to="/"
                className="
                  text-gray-500
                  hover:text-primary-400
                  transition-colors
                "
              >
                Home
              </Link>

              <Link
                to="/about"
                className="
                  text-gray-500
                  hover:text-primary-400
                  transition-colors
                "
              >
                About
              </Link>

              <Link
                to="/notices"
                className="
                  text-gray-500
                  hover:text-primary-400
                  transition-colors
                "
              >
                Notices
              </Link>

              <Link
                to="/emergency"
                className="
                  text-gray-500
                  hover:text-red-400
                  transition-colors
                "
              >
                Emergency
              </Link>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

/* Reusable footer column */
function FooterColumn({ title, links }) {
  return (
    <div className="lg:col-span-2">

      <h4 className="
        mb-5
        text-sm
        font-bold
        uppercase
        tracking-wider
        text-white
      ">
        {title}
      </h4>

      <ul className="space-y-3.5">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="
                group
                flex
                items-center
                gap-2.5
                text-sm
                text-gray-500
                hover:text-white
                transition-colors
              "
            >
              <span className="
                text-sm
                opacity-70
                group-hover:opacity-100
                group-hover:scale-110
                transition-all
              ">
                {link.icon}
              </span>

              <span>
                {link.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}