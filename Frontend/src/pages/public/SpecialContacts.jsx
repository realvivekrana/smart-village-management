import { useEffect, useMemo, useState } from "react";
import { getSpecialContacts } from "../../services/specialContactService";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useVillage } from "../../context/VillageContext";
import SEO from "../../components/common/SEO";

const cleanPhone = (value = "") => value.replace(/[^\d+]/g, "");

const whatsappUrl = (value = "") => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
};

const byOrder = (a, b) =>
  (a.displayOrder || 0) - (b.displayOrder || 0) ||
  String(a.name || "").localeCompare(String(b.name || ""));

const groupIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("panchayat")) return "🏘️";
  if (n.includes("block")) return "🏢";
  if (n.includes("district")) return "🏛️";
  if (n.includes("elected")) return "🗳️";
  return "📇";
};

const roleIcon = (role = "", kind) => {
  if (kind === "place") return "📍";
  const r = role.toLowerCase();
  if (/secretary|sachiv/.test(r)) return "📝";
  if (/ward|samiti/.test(r)) return "🗳️";
  if (/\bps\b|police|thana|\bsp\b/.test(r)) return "🚓";
  return "👤";
};

function PersonRow({ contact }) {
  const wa = whatsappUrl(contact.whatsapp);
  const hasDetails = Boolean(
    contact.about ||
      contact.area ||
      contact.officeAddress ||
      contact.availability ||
      contact.email ||
      contact.alternatePhone ||
      wa
  );

  const summary = (
    <>
      {contact.isPending ? (
        <span className="rounded-full bg-amber-50 px-3 py-0.5 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          {contact.name || "Verification Pending"}
          {contact.name ? " · verification pending" : ""}
        </span>
      ) : (
        <span className="font-medium text-gray-800 dark:text-gray-100">{contact.name}</span>
      )}

      {contact.wardNumber ? (
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          Ward {contact.wardNumber}
        </span>
      ) : null}

      {contact.phone ? (
        <a
          href={`tel:${cleanPhone(contact.phone)}`}
          onClick={(e) => e.stopPropagation()}
          className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 transition hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300"
        >
          📞 {contact.phone}
        </a>
      ) : null}
    </>
  );

  if (!hasDetails) {
    return <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-1">{summary}</div>;
  }

  return (
    <details className="rounded-xl open:bg-gray-50 open:px-3 open:py-1 dark:open:bg-gray-800/50">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 py-1 [&::-webkit-details-marker]:hidden">
        {summary}
        <span className="ml-auto text-xs text-gray-400">details ▾</span>
      </summary>

      <div className="space-y-1.5 pb-2 pt-1 text-sm text-gray-600 dark:text-gray-400">
        {contact.about ? <p>{contact.about}</p> : null}
        {contact.area ? <p>📍 {contact.area}</p> : null}
        {contact.officeAddress ? <p>🏢 {contact.officeAddress}</p> : null}
        {contact.availability ? <p>🕒 {contact.availability}</p> : null}
        {contact.email ? (
          <p className="break-all">
            ✉️{" "}
            <a className="hover:text-green-600 dark:hover:text-green-400" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
          </p>
        ) : null}
        {contact.alternatePhone || wa ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {contact.alternatePhone ? (
              <a
                href={`tel:${cleanPhone(contact.alternatePhone)}`}
                className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium hover:border-green-500 dark:border-gray-700"
              >
                📞 Alt: {contact.alternatePhone}
              </a>
            ) : null}
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
              >
                💬 WhatsApp
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </details>
  );
}

function Branch({ role, items }) {
  const places = items.filter((c) => c.kind === "place");
  const people = items.filter((c) => c.kind !== "place");

  return (
    <li
      className="relative pb-5 pl-7 last:pb-0
        before:absolute before:bottom-0 before:left-0 before:top-0 before:w-0.5 before:bg-green-200 dark:before:bg-green-800
        last:before:bottom-auto last:before:h-4
        after:absolute after:left-0 after:top-4 after:h-0.5 after:w-5 after:bg-green-200 dark:after:bg-green-800"
    >
      <p className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
        <span aria-hidden="true">{roleIcon(role, items[0]?.kind)}</span>
        {role}
      </p>

      {people.length ? (
        <div className="mt-1 space-y-0.5 pl-1">
          {people.map((contact) => (
            <PersonRow key={contact._id} contact={contact} />
          ))}
        </div>
      ) : null}

      {places.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {places.map((place) => (
            <span
              key={place._id}
              title={place.about || undefined}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {place.name}
            </span>
          ))}
        </div>
      ) : null}
    </li>
  );
}

export default function SpecialContacts() {
  const { villageName } = useVillage();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getSpecialContacts({ limit: 500 });
      setContacts(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Build: group -> branch (role) -> people, all in the admin's display order
  const buildTree = (list) => {
    const groups = new Map();
    [...list].sort(byOrder).forEach((c) => {
      const groupName = c.group || "Other";
      if (!groups.has(groupName)) {
        groups.set(groupName, { name: groupName, order: c.displayOrder || 0, branches: new Map() });
      }
      const group = groups.get(groupName);
      group.order = Math.min(group.order, c.displayOrder || 0);
      if (!group.branches.has(c.role)) group.branches.set(c.role, []);
      group.branches.get(c.role).push(c);
    });

    return [...groups.values()]
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
      .map((g) => ({ ...g, branches: [...g.branches.entries()] }));
  };

  const groupNames = useMemo(() => buildTree(contacts).map((g) => g.name), [contacts]);

  const tree = useMemo(() => {
    const text = search.trim().toLowerCase();
    const visible = contacts.filter((c) => {
      const group = c.group || "Other";
      if (selectedGroup !== "All" && group !== selectedGroup) return false;
      if (!text) return true;
      return [
        c.name,
        c.role,
        group,
        c.area,
        c.wardNumber ? `ward ${c.wardNumber}` : "",
        c.phone,
        c.isPending ? "verification pending" : "",
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(text));
    });
    return buildTree(visible);
  }, [contacts, search, selectedGroup]);

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-950">
      <SEO
        title={`Important People & Contacts of ${villageName}`}
        description={`Contact details of Mukhiya, Panchayat Secretary, Ward Members, Block and District officers, MLA and MP for ${villageName} village.`}
        path="/special-contacts"
      />

      <section className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-white/15 p-3 text-3xl leading-none">📇</div>
              <span className="font-medium text-green-100">{villageName} Village</span>
            </div>
            <h1 className="text-4xl font-bold md:text-5xl">Special Contacts</h1>
            <p className="mt-5 text-lg leading-8 text-green-50">
              Gram Panchayat, Block, District and elected representatives — who is who,
              with their contact numbers. Tap a number to call.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, role, ward number..."
              className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3.5 pl-12 pr-4 text-gray-900 outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {error ? (
          <div className="mb-8">
            <ErrorMessage message={error} onRetry={load} />
          </div>
        ) : null}

        {loading ? (
          <Loader text="Loading contacts..." />
        ) : (
          <>
            {groupNames.length > 1 ? (
              <div className="mb-8 flex gap-3 overflow-x-auto pb-3">
                {["All", ...groupNames].map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setSelectedGroup(group)}
                    className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition ${
                      selectedGroup === group
                        ? "bg-green-600 text-white shadow"
                        : "border border-gray-200 bg-white text-gray-700 hover:border-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            ) : null}

            {tree.length ? (
              <div className="grid items-start gap-6 lg:grid-cols-2">
                {tree.map((group) => (
                  <section
                    key={group.name}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6"
                  >
                    <h2 className="mb-5 flex items-center gap-3 text-lg font-bold uppercase tracking-wide text-gray-900 dark:text-white">
                      <span className="text-2xl" aria-hidden="true">{groupIcon(group.name)}</span>
                      {group.name}
                    </h2>
                    <ul>
                      {group.branches.map(([role, items]) => (
                        <Branch key={role} role={role} items={items} />
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="📇"
                title="No contacts found"
                description={
                  contacts.length === 0
                    ? "The administrator hasn't added any contacts yet."
                    : "Try another search term or group."
                }
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}