import { Link } from "react-router-dom";

/*
 * Home page highlights: Community, Gaon Bazaar, Businesses, Jobs.
 * Jab bhi koi naya item dalta hai, yahan sabse upar dikhta hai
 * (3 din ke andar ka item "NEW" badge ke saath).
 */

const NEW_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

const isNew = (date) =>
  date ? Date.now() - new Date(date).getTime() < NEW_WINDOW_MS : false;

const formatDate = (date) => {
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
    }).format(new Date(date));
  } catch {
    return "";
  }
};

const label = (value = "") =>
  String(value).replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const money = (n) =>
  typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : "";

function NewBadge({ date }) {
  if (!isNew(date)) return null;
  return (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
      New
    </span>
  );
}

function Block({ icon, title, to, items, children }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
          <span>{icon}</span>
          {title}
        </h3>
        <Link
          to={to}
          className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          View all →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </div>
  );
}

const cardClass =
  "group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950";

function Thumb({ images, fallback }) {
  const url = images?.find((i) => i?.isMain)?.url || images?.[0]?.url;
  return url ? (
    <img src={url} alt="" loading="lazy" className="h-32 w-full object-cover" />
  ) : (
    <div className="flex h-32 w-full items-center justify-center bg-slate-100 text-4xl dark:bg-slate-800">
      {fallback}
    </div>
  );
}

export default function VillageHighlights({
  community = [],
  bazaar = [],
  businesses = [],
  jobs = [],
  loading = false,
}) {
  const hasAny =
    community.length || bazaar.length || businesses.length || jobs.length;

  if (loading || !hasAny) return null;

  return (
    <section className="bg-slate-50 py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Village Highlights
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            What's New in the Village
          </h2>
        </div>

        {/* Community */}
        <Block icon="💬" title="Community" to="/community" items={community}>
          {community.map((post) => (
            <Link key={post._id} to="/community" className={`${cardClass} p-5`}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {post.isPinned ? "📌 " : ""}
                  {label(post.category || "general")}
                </span>
                <NewBadge date={post.createdAt} />
              </div>
              <p className="line-clamp-4 flex-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                {post.content}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
                <span className="truncate">{post.createdBy?.name || "Villager"}</span>
                <span>
                  ❤️ {post.likeCount || 0} · 💬 {post.commentCount || 0}
                </span>
              </div>
            </Link>
          ))}
        </Block>

        {/* Gaon Bazaar */}
        <Block icon="🛒" title="Village Bazaar" to="/gaon-bazaar" items={bazaar}>
          {bazaar.map((item) => (
            <Link key={item._id} to="/gaon-bazaar" className={cardClass}>
              <Thumb images={item.images} fallback="🛒" />
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {label(item.type)}
                  </span>
                  <NewBadge date={item.createdAt} />
                </div>
                <h4 className="line-clamp-2 font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h4>
                <div className="mt-auto pt-3 text-sm text-slate-600 dark:text-slate-400">
                  {item.price != null && (
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {money(item.price)}
                    </span>
                  )}
                  {item.location && (
                    <span className="block truncate text-xs">📍 {item.location}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </Block>

        {/* Businesses */}
        <Block icon="🏪" title="Local Businesses" to="/businesses" items={businesses}>
          {businesses.map((biz) => (
            <Link key={biz._id} to={`/businesses/${biz._id}`} className={cardClass}>
              <Thumb images={biz.images} fallback="🏪" />
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {label(biz.category)}
                  </span>
                  <NewBadge date={biz.createdAt} />
                </div>
                <h4 className="line-clamp-1 font-bold text-slate-900 dark:text-white">
                  {biz.name}
                </h4>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                  {biz.description}
                </p>
                {biz.address?.village && (
                  <span className="mt-auto pt-3 text-xs text-slate-500">
                    📍 {biz.address.village}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </Block>

        {/* Jobs */}
        <Block icon="💼" title="Jobs" to="/jobs" items={jobs}>
          {jobs.map((job) => (
            <Link key={job._id} to={`/jobs/${job._id}`} className={`${cardClass} p-5`}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {label(job.type || "full_time")}
                </span>
                <NewBadge date={job.createdAt} />
              </div>
              <h4 className="line-clamp-2 font-bold text-slate-900 dark:text-white">
                {job.title}
              </h4>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {job.company}
              </p>
              <div className="mt-auto space-y-1 pt-4 text-xs text-slate-500">
                {job.location && <div>📍 {job.location}</div>}
                {job.salary?.min != null && (
                  <div>
                    💰 {money(job.salary.min)}
                    {job.salary.max ? ` – ${money(job.salary.max)}` : ""}
                  </div>
                )}
                {job.applyBy && <div>⏳ Apply by {formatDate(job.applyBy)}</div>}
              </div>
            </Link>
          ))}
        </Block>
      </div>
    </section>
  );
}