import { useEffect, useState } from "react";
import {
  Phone,
  MapPin,
  Building2,
  Shield,
  Landmark,
  HeartPulse,
  Siren,
  GraduationCap,
  Users,
  Search,
} from "lucide-react";

const GovernmentContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const governmentContacts = [
      {
        id: 1,
        name: "District Collector",
        designation: "Deputy Commissioner / District Magistrate",
        department: "Koderma District Administration",
        category: "District Administration",
        phone: "",
        location: "Koderma, Jharkhand",
        description:
          "District-level administration, public grievances, disaster management and coordination of government departments.",
        icon: Landmark,
      },
      {
        id: 2,
        name: "Circle Officer",
        designation: "Circle Officer (CO)",
        department: "Jainagar Circle",
        category: "Revenue & Land",
        phone: "",
        location: "Jainagar, Koderma, Jharkhand",
        description:
          "Revenue, land records, certificates and circle-level administrative matters.",
        icon: Building2,
      },
      {
        id: 3,
        name: "Block Development Officer",
        designation: "Block Development Officer (BDO)",
        department: "Jainagar Block",
        category: "Block Administration",
        phone: "",
        location: "Jainagar, Koderma, Jharkhand",
        description:
          "Block-level development programmes, rural development schemes and coordination of local development activities.",
        icon: Users,
      },
      {
        id: 4,
        name: "Police Station",
        designation: "Local Police / Officer In-Charge",
        department: "Jainagar Police Station",
        category: "Police & Security",
        phone: "112",
        location: "Jainagar, Koderma, Jharkhand",
        description:
          "For police assistance, law and order emergencies and reporting incidents.",
        icon: Shield,
      },
      {
        id: 5,
        name: "Emergency Helpline",
        designation: "Emergency Response",
        department: "National Emergency Number",
        category: "Emergency",
        phone: "112",
        location: "India",
        description:
          "Single emergency number for police, fire and medical emergency assistance.",
        icon: Siren,
      },
      {
        id: 6,
        name: "Ambulance",
        designation: "Emergency Medical Service",
        department: "National Ambulance Service",
        category: "Health",
        phone: "108",
        location: "Jharkhand",
        description:
          "Emergency ambulance and medical assistance.",
        icon: HeartPulse,
      },
      {
        id: 7,
        name: "Child Helpline",
        designation: "Child Protection Helpline",
        department: "Child Helpline",
        category: "Social Welfare",
        phone: "1098",
        location: "India",
        description:
          "Help and protection services for children in need or emergency situations.",
        icon: Users,
      },
      {
        id: 8,
        name: "Women Helpline",
        designation: "Women Assistance Helpline",
        department: "Women Helpline",
        category: "Women & Child",
        phone: "181",
        location: "Jharkhand",
        description:
          "Support and assistance for women facing emergency or welfare-related issues.",
        icon: Users,
      },
      {
        id: 9,
        name: "Education Department",
        designation: "Block Education Administration",
        department: "Jainagar Block",
        category: "Education",
        phone: "",
        location: "Jainagar, Koderma, Jharkhand",
        description:
          "For school-related administration, education services and government education schemes.",
        icon: GraduationCap,
      },
      {
        id: 10,
        name: "District Administration Office",
        designation: "District-Level Government Office",
        department: "Koderma District",
        category: "District Administration",
        phone: "",
        location: "Koderma, Jharkhand",
        description:
          "For district-level government services and administrative assistance.",
        icon: Landmark,
      },
    ];

    setContacts(governmentContacts);
  }, []);

  const categories = [
    "All",
    ...new Set(contacts.map((contact) => contact.category)),
  ];

  const filteredContacts = contacts.filter((contact) => {
    const matchesCategory =
      selectedCategory === "All" ||
      contact.category === selectedCategory;

    const searchText = search.toLowerCase();

    const matchesSearch =
      contact.name.toLowerCase().includes(searchText) ||
      contact.designation.toLowerCase().includes(searchText) ||
      contact.department.toLowerCase().includes(searchText) ||
      contact.category.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-white/15">
                <Landmark size={30} />
              </div>

              <span className="text-green-100 font-medium">
                Kakarcholi Village
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold">
              Government & Important Contacts
            </h1>

            <p className="mt-5 text-lg text-green-50 leading-8">
              Important government officers, departments, emergency services
              and public assistance contacts useful for the residents of
              Kakarcholi and nearby areas.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 mb-8">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search officer, department, service..."
              className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3.5 pl-12 pr-4 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
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

        {/* Contact Cards */}
        {filteredContacts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredContacts.map((contact) => {
              const Icon = contact.icon;

              return (
                <article
                  key={contact.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400 flex items-center justify-center">
                        <Icon size={24} />
                      </div>

                      <span className="text-xs font-semibold rounded-full px-3 py-1 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400">
                        {contact.category}
                      </span>
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
                      {contact.name}
                    </h2>

                    <p className="mt-1 text-sm font-medium text-green-600 dark:text-green-400">
                      {contact.designation}
                    </p>

                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      {contact.description}
                    </p>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <Building2
                          size={18}
                          className="mt-0.5 text-gray-400 shrink-0"
                        />

                        <span>{contact.department}</span>
                      </div>

                      <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin
                          size={18}
                          className="mt-0.5 text-gray-400 shrink-0"
                        />

                        <span>{contact.location}</span>
                      </div>

                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="flex items-center justify-center gap-2 w-full rounded-xl bg-green-600 hover:bg-green-700 text-white py-3 font-semibold transition"
                        >
                          <Phone size={18} />
                          Call {contact.phone}
                        </a>
                      )}

                      {!contact.phone && (
                        <div className="rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          Official contact number can be added by the
                          administrator.
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
              <Search className="text-gray-400" />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-gray-900 dark:text-white">
              No contacts found
            </h2>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Try another search term or category.
            </p>
          </div>
        )}

        {/* Important Note */}
        <div className="mt-10 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-5">
          <h3 className="font-bold text-amber-900 dark:text-amber-300">
            Important Information
          </h3>

          <p className="mt-2 text-sm leading-6 text-amber-800 dark:text-amber-400">
            Government officer names and direct contact numbers should be
            verified with the concerned department before publishing. The
            administrator can update the directory whenever official contact
            information changes.
          </p>
        </div>
      </main>
    </div>
  );
};

export default GovernmentContacts;