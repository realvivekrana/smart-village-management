import { useCallback, useEffect, useState } from "react";
import {
  AdminPagination,
  Badge,
  ErrorBox,
  fmtDateTime,
  Loading,
  Modal,
  Page,
  StatCard,
  Table,
  Toolbar,
} from "./AdminUI";
import useDebounce from "../../hooks/useDebounce";
import { formatRelative } from "../../utils/formatDate";
import {
  cleanupActivity,
  getActivityEvents,
  getActivityOverview,
  getActivitySession,
  getActivitySessions,
  getLiveVisitors,
} from "../../services/activityService";

/*
|--------------------------------------------------------------------------
| Admin Activity Monitor
|--------------------------------------------------------------------------
| Live visitors, sessions (guest + logged-in), activity feed, insights.
*/

const REFRESH_MS = 15000;

const TABS = [
  { id: "live", label: "🟢 Live Now" },
  { id: "sessions", label: "🧾 Sessions" },
  { id: "feed", label: "📜 Activity Feed" },
  { id: "insights", label: "📊 Insights" },
];

const EVENT_META = {
  page_view: { icon: "👁️", tone: "gray", text: "Page view" },
  action: { icon: "⚡", tone: "blue", text: "Action" },
  login: { icon: "🔑", tone: "green", text: "Login" },
  login_failed: { icon: "⛔", tone: "red", text: "Failed login" },
  logout: { icon: "🚪", tone: "gray", text: "Logout" },
  register: { icon: "🆕", tone: "green", text: "Register" },
  password_reset: { icon: "🔁", tone: "yellow", text: "Password reset" },
  error: { icon: "⚠️", tone: "red", text: "Error" },
};

const DEVICE_ICON = { mobile: "📱", tablet: "📲", desktop: "💻", bot: "🤖" };

const errMsg = (err, fallback) => err?.response?.data?.message || fallback;

const fmtDuration = (seconds = 0) => {
  const s = Math.round(seconds);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};

const shortId = (id = "") => id.slice(0, 6).toUpperCase();

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function Who({ name, role, visitorId, onClick }) {
  if (name) {
    return (
      <button type="button" onClick={onClick} className="text-left" disabled={!onClick}>
        <span className="font-medium text-gray-900 dark:text-gray-100">{name}</span>{" "}
        <Badge tone={role === "admin" ? "yellow" : "blue"}>{role || "user"}</Badge>
      </button>
    );
  }

  return (
    <span>
      <span className="font-medium text-gray-700 dark:text-gray-300">Guest</span>{" "}
      <span className="text-xs text-gray-400">#{shortId(visitorId)}</span>
    </span>
  );
}

function Device({ device, browser, os }) {
  return (
    <span className="whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">
      {DEVICE_ICON[device] || "💻"} {browser} · {os}
    </span>
  );
}

function StatusBadge({ session }) {
  if (session.isLive) return <Badge tone="green">● Live</Badge>;
  return <Badge>Ended</Badge>;
}

function Select({ value, onChange, options }) {
  return (
    <select className="input sm:w-auto" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function BarList({ rows = [], valueKey, labelKey, empty = "No data yet" }) {
  const max = Math.max(1, ...rows.map((r) => r[valueKey] || 0));

  if (!rows.length) return <p className="text-sm text-gray-500">{empty}</p>;

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row[labelKey]}>
          <div className="mb-1 flex items-center justify-between gap-3 text-xs">
            <span className="truncate font-medium text-gray-700 dark:text-gray-200">{row[labelKey]}</span>
            <span className="shrink-0 text-gray-500">{row[valueKey]}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-primary-600"
              style={{ width: `${Math.max(3, ((row[valueKey] || 0) / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DailyChart({ series = [] }) {
  const max = Math.max(1, ...series.map((d) => d.sessions));

  return (
    <div>
      <div className="flex h-40 items-end gap-1">
        {series.map((d) => (
          <div key={d.date} className="group relative flex h-full flex-1 flex-col justify-end">
            <div className="flex flex-col justify-end" style={{ height: `${(d.sessions / max) * 100}%` }}>
              <div className="w-full rounded-t bg-gray-300 dark:bg-gray-600" style={{ flex: d.guests }} />
              <div className="w-full bg-primary-600" style={{ flex: d.loggedIn }} />
            </div>
            <div className="pointer-events-none absolute -top-14 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
              {d.date}: {d.sessions} visits ({d.loggedIn} logged-in) · {d.pageViews} views
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-gray-500">
        <span>{series[0]?.date}</span>
        <span>{series[series.length - 1]?.date}</span>
      </div>
      <div className="mt-2 flex gap-4 text-xs text-gray-500">
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-primary-600" />
          Logged-in
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
          Guests
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Session detail (poori timeline)                                     */
/* ------------------------------------------------------------------ */

function SessionModal({ sessionId, onClose, onFilterUser }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    getActivitySession(sessionId)
      .then((res) => alive && setData(res.data?.data))
      .catch((err) => alive && setError(errMsg(err, "Failed to load session")));

    return () => {
      alive = false;
    };
  }, [sessionId]);

  const s = data?.session;

  return (
    <Modal title="Session details" onClose={onClose} wide>
      {error ? <ErrorBox message={error} /> : null}
      {!data && !error ? <Loading /> : null}

      {s ? (
        <div className="space-y-5">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">Who</p>
              <Who name={s.userName} role={s.userRole} visitorId={s.visitorId} />
              {s.userEmail ? <p className="text-xs text-gray-500">{s.userEmail}</p> : null}
              {s.user ? (
                <button
                  type="button"
                  className="mt-1 text-xs text-primary-600 hover:underline"
                  onClick={() => onFilterUser(s.user, s.userName)}
                >
                  See all sessions of this user →
                </button>
              ) : null}
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <StatusBadge session={s} />{" "}
              {s.loggedOutAt ? <span className="text-xs text-gray-500">logged out {formatRelative(s.loggedOutAt)}</span> : null}
            </div>
            <div>
              <p className="text-xs text-gray-500">Device</p>
              <Device device={s.device} browser={s.browser} os={s.os} />
              {s.screen ? <span className="ml-2 text-xs text-gray-400">{s.screen}</span> : null}
            </div>
            <div>
              <p className="text-xs text-gray-500">IP address</p>
              <p className="font-mono text-xs">{s.ip || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Started</p>
              <p>{fmtDateTime(s.startedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Last seen</p>
              <p>{fmtDateTime(s.lastSeenAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Came from</p>
              <p className="break-all">{s.referrer || "Direct"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Pages · Actions · Active time</p>
              <p>
                {s.pageViews} · {s.actions} · {fmtDuration(s.activeSeconds)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Timeline ({data.events.length})</h3>
            {data.events.length ? (
              <ol className="space-y-2 border-l-2 border-gray-200 pl-4 dark:border-gray-700">
                {data.events.map((e) => {
                  const meta = EVENT_META[e.type] || EVENT_META.action;
                  return (
                    <li key={e._id} className="relative">
                      <span className="absolute -left-[25px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs dark:bg-gray-900">
                        {meta.icon}
                      </span>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium">{e.type === "page_view" ? e.path : e.label}</span>
                        {e.type !== "page_view" ? <Badge tone={meta.tone}>{meta.text}</Badge> : null}
                        {e.statusCode >= 400 ? <Badge tone="red">{e.statusCode}</Badge> : null}
                      </div>
                      <p className="text-xs text-gray-500">
                        {fmtDateTime(e.createdAt)}
                        {e.type !== "page_view" && e.path ? ` · ${e.method} ${e.path}` : ""}
                        {e.meta?.attemptedEmail ? ` · tried: ${e.meta.attemptedEmail}` : ""}
                      </p>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-sm text-gray-500">No events recorded.</p>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export default function ActivityMonitor() {
  const [tab, setTab] = useState("live");
  const [auto, setAuto] = useState(true);
  const [hideAdmins, setHideAdmins] = useState(false);
  const [days, setDays] = useState(7);
  const [selected, setSelected] = useState(null);

  const [overview, setOverview] = useState(null);
  const [live, setLive] = useState([]);
  const [sessions, setSessions] = useState({ rows: [], pagination: null });
  const [events, setEvents] = useState({ rows: [], pagination: null });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sessions filters
  const [sSearch, setSSearch] = useState("");
  const [sType, setSType] = useState("");
  const [sDevice, setSDevice] = useState("");
  const [sStatus, setSStatus] = useState("");
  const [sFrom, setSFrom] = useState("");
  const [sTo, setSTo] = useState("");
  const [sPage, setSPage] = useState(1);
  const [userFilter, setUserFilter] = useState(null); // { id, name }

  // Feed filters
  const [eSearch, setESearch] = useState("");
  const [eType, setEType] = useState("");
  const [eWho, setEWho] = useState("");
  const [eFrom, setEFrom] = useState("");
  const [eTo, setETo] = useState("");
  const [ePage, setEPage] = useState(1);

  const [cleanupDays, setCleanupDays] = useState(30);

  const dSSearch = useDebounce(sSearch);
  const dESearch = useDebounce(eSearch);

  const adminFlag = hideAdmins ? "true" : undefined;

  const loadOverview = useCallback(async () => {
    const res = await getActivityOverview({ days, hideAdmins: adminFlag });
    setOverview(res.data?.data || null);
  }, [days, adminFlag]);

  const loadLive = useCallback(async () => {
    const res = await getLiveVisitors({ hideAdmins: adminFlag });
    setLive(res.data?.data?.sessions || []);
  }, [adminFlag]);

  const loadSessions = useCallback(async () => {
    const res = await getActivitySessions({
      page: sPage,
      search: dSSearch || undefined,
      type: sType || undefined,
      device: sDevice || undefined,
      status: sStatus || undefined,
      from: sFrom || undefined,
      to: sTo || undefined,
      userId: userFilter?.id,
      hideAdmins: adminFlag,
    });
    setSessions({
      rows: res.data?.data?.sessions || [],
      pagination: res.data?.data?.pagination || null,
    });
  }, [sPage, dSSearch, sType, sDevice, sStatus, sFrom, sTo, userFilter, adminFlag]);

  const loadEvents = useCallback(async () => {
    const res = await getActivityEvents({
      page: ePage,
      search: dESearch || undefined,
      type: eType || undefined,
      who: eWho || undefined,
      from: eFrom || undefined,
      to: eTo || undefined,
      userId: userFilter?.id,
      hideAdmins: adminFlag,
    });
    setEvents({
      rows: res.data?.data?.events || [],
      pagination: res.data?.data?.pagination || null,
    });
  }, [ePage, dESearch, eType, eWho, eFrom, eTo, userFilter, adminFlag]);

  const refresh = useCallback(
    async (showSpinner = false) => {
      try {
        if (showSpinner) setLoading(true);
        setError("");

        const jobs = [loadOverview()];
        if (tab === "live") jobs.push(loadLive());
        if (tab === "sessions") jobs.push(loadSessions());
        if (tab === "feed") jobs.push(loadEvents());

        await Promise.all(jobs);
      } catch (err) {
        setError(errMsg(err, "Failed to load activity"));
      } finally {
        setLoading(false);
      }
    },
    [tab, loadOverview, loadLive, loadSessions, loadEvents]
  );

  // Filter / tab badalne par load
  useEffect(() => {
    refresh(true);
  }, [refresh]);

  // Auto refresh (tab visible ho tabhi)
  useEffect(() => {
    if (!auto) return undefined;

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") refresh(false);
    }, REFRESH_MS);

    return () => clearInterval(timer);
  }, [auto, refresh]);

  const filterByUser = (id, name) => {
    setUserFilter({ id, name });
    setSPage(1);
    setEPage(1);
    setSelected(null);
    setTab("sessions");
  };

  const clearUserFilter = () => {
    setUserFilter(null);
    setSPage(1);
    setEPage(1);
  };

  const runCleanup = async () => {
    const ok = window.confirm(
      `${cleanupDays} din se purana activity data permanently delete hoga. Continue?`
    );
    if (!ok) return;

    try {
      const res = await cleanupActivity(cleanupDays);
      const d = res.data?.data;
      window.alert(`Deleted: ${d?.events ?? 0} events, ${d?.sessions ?? 0} sessions`);
      refresh(true);
    } catch (err) {
      setError(errMsg(err, "Cleanup failed"));
    }
  };

  /* ---------------- table columns ---------------- */

  const liveColumns = [
    {
      key: "who",
      label: "Who",
      render: (r) => (
        <Who
          name={r.userName}
          role={r.userRole}
          visitorId={r.visitorId}
          onClick={r.user ? () => filterByUser(r.user, r.userName) : undefined}
        />
      ),
    },
    { key: "currentPath", label: "Now on", render: (r) => <span className="font-mono text-xs">{r.currentPath}</span> },
    { key: "lastAction", label: "Last action", render: (r) => r.lastAction || "—" },
    { key: "device", label: "Device", render: (r) => <Device {...r} /> },
    { key: "ip", label: "IP", render: (r) => <span className="font-mono text-xs">{r.ip || "—"}</span> },
    { key: "startedAt", label: "On site for", render: (r) => formatRelative(r.startedAt).replace(" ago", "") },
    { key: "lastSeenAt", label: "Last seen", render: (r) => formatRelative(r.lastSeenAt) },
    {
      key: "open",
      label: "",
      render: (r) => (
        <button type="button" className="text-xs text-primary-600 hover:underline" onClick={() => setSelected(r.sessionId)}>
          Details
        </button>
      ),
    },
  ];

  const sessionColumns = [
    {
      key: "who",
      label: "Who",
      render: (r) => (
        <Who
          name={r.userName}
          role={r.userRole}
          visitorId={r.visitorId}
          onClick={r.user ? () => filterByUser(r.user, r.userName) : undefined}
        />
      ),
    },
    { key: "startedAt", label: "Started", render: (r) => fmtDateTime(r.startedAt) },
    {
      key: "dur",
      label: "Duration",
      render: (r) => fmtDuration((new Date(r.lastSeenAt) - new Date(r.startedAt)) / 1000),
    },
    { key: "pageViews", label: "Pages" },
    { key: "actions", label: "Actions" },
    { key: "entryPath", label: "Entry", render: (r) => <span className="font-mono text-xs">{r.entryPath}</span> },
    { key: "device", label: "Device", render: (r) => <Device {...r} /> },
    { key: "ip", label: "IP", render: (r) => <span className="font-mono text-xs">{r.ip || "—"}</span> },
    { key: "status", label: "Status", render: (r) => <StatusBadge session={r} /> },
    {
      key: "open",
      label: "",
      render: (r) => (
        <button type="button" className="text-xs text-primary-600 hover:underline" onClick={() => setSelected(r.sessionId)}>
          Timeline
        </button>
      ),
    },
  ];

  const eventColumns = [
    { key: "createdAt", label: "Time", render: (r) => <span className="whitespace-nowrap">{fmtDateTime(r.createdAt)}</span> },
    {
      key: "who",
      label: "Who",
      render: (r) => (
        <Who
          name={r.userName}
          role={r.userRole}
          visitorId={r.visitorId}
          onClick={r.user ? () => filterByUser(r.user, r.userName) : undefined}
        />
      ),
    },
    {
      key: "type",
      label: "Event",
      render: (r) => {
        const meta = EVENT_META[r.type] || EVENT_META.action;
        return (
          <div>
            <Badge tone={meta.tone}>
              {meta.icon} {meta.text}
            </Badge>
            {r.type !== "page_view" ? <p className="mt-1 text-xs">{r.label}</p> : null}
            {r.meta?.attemptedEmail ? <p className="text-xs text-gray-500">tried: {r.meta.attemptedEmail}</p> : null}
          </div>
        );
      },
    },
    {
      key: "path",
      label: "Page / API",
      render: (r) => (
        <span className="font-mono text-xs">
          {r.method && r.type !== "page_view" ? `${r.method} ` : ""}
          {r.path}
        </span>
      ),
    },
    {
      key: "statusCode",
      label: "Status",
      render: (r) => (r.statusCode ? <Badge tone={r.statusCode >= 400 ? "red" : "green"}>{r.statusCode}</Badge> : "—"),
    },
    { key: "device", label: "Device", render: (r) => <Device {...r} /> },
    { key: "ip", label: "IP", render: (r) => <span className="font-mono text-xs">{r.ip || "—"}</span> },
  ];

  /* ---------------- render ---------------- */

  const today = overview?.today;

  return (
    <Page
      title="Activity Monitor"
      subtitle="Kaun site par hai, kya kar raha hai — guest aur logged-in dono ka real data"
      actions={
        <>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
            Auto-refresh (15s)
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={hideAdmins} onChange={(e) => setHideAdmins(e.target.checked)} />
            Hide admins
          </label>
        </>
      }
    >
      {error ? <ErrorBox message={error} retry={() => refresh(true)} /> : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          icon="🟢"
          label="Live now"
          tone="green"
          value={overview?.live.total}
          hint={overview ? `${overview.live.loggedIn} logged-in · ${overview.live.guests} guests` : ""}
        />
        <StatCard
          icon="👤"
          label="Visitors today"
          tone="blue"
          value={today?.visitors}
          hint={today ? `${today.loggedInUsers} logged-in users` : ""}
        />
        <StatCard icon="👁️" label="Page views today" tone="purple" value={today?.pageViews} hint={today ? `${today.sessions} visits` : ""} />
        <StatCard
          icon="🔑"
          label="Logins today"
          tone="yellow"
          value={today?.logins}
          hint={today ? `${today.registrations} new registrations` : ""}
        />
        <StatCard icon="⛔" label="Failed logins today" tone="red" value={today?.failedLogins} hint="Wrong password / email" />
      </div>

      {userFilter ? (
        <div className="card flex flex-wrap items-center justify-between gap-3 border-primary-200 p-3 text-sm">
          <span>
            Showing activity of <strong>{userFilter.name}</strong>
          </span>
          <button type="button" className="btn-secondary" onClick={clearUserFilter}>
            ✕ Clear user filter
          </button>
        </div>
      ) : null}

      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ${
              tab === t.id
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            {t.label}
            {t.id === "live" && overview ? ` (${overview.live.total})` : ""}
          </button>
        ))}
      </div>

      {loading && !overview ? <Loading text="Loading activity..." /> : null}

      {/* ---------------- LIVE ---------------- */}
      {tab === "live" && (
        <Table
          columns={liveColumns}
          rows={live}
          empty="Abhi koi online nahi hai. (Tracking shuru hone ke baad visitors yahan dikhenge)"
        />
      )}

      {/* ---------------- SESSIONS ---------------- */}
      {tab === "sessions" && (
        <>
          <Toolbar
            search={sSearch}
            setSearch={(v) => {
              setSSearch(v);
              setSPage(1);
            }}
            placeholder="Name, email, IP, page..."
            onRefresh={() => refresh(true)}
            filters={
              <>
                <Select
                  value={sType}
                  onChange={(v) => {
                    setSType(v);
                    setSPage(1);
                  }}
                  options={[
                    { value: "", label: "All visitors" },
                    { value: "user", label: "Logged-in" },
                    { value: "guest", label: "Guests" },
                  ]}
                />
                <Select
                  value={sDevice}
                  onChange={(v) => {
                    setSDevice(v);
                    setSPage(1);
                  }}
                  options={[
                    { value: "", label: "All devices" },
                    { value: "mobile", label: "Mobile" },
                    { value: "desktop", label: "Desktop" },
                    { value: "tablet", label: "Tablet" },
                  ]}
                />
                <Select
                  value={sStatus}
                  onChange={(v) => {
                    setSStatus(v);
                    setSPage(1);
                  }}
                  options={[
                    { value: "", label: "Any status" },
                    { value: "live", label: "Live only" },
                  ]}
                />
                <input
                  type="date"
                  className="input sm:w-auto"
                  value={sFrom}
                  onChange={(e) => {
                    setSFrom(e.target.value);
                    setSPage(1);
                  }}
                  aria-label="From date"
                />
                <input
                  type="date"
                  className="input sm:w-auto"
                  value={sTo}
                  onChange={(e) => {
                    setSTo(e.target.value);
                    setSPage(1);
                  }}
                  aria-label="To date"
                />
              </>
            }
          />
          <Table columns={sessionColumns} rows={sessions.rows} empty="No sessions found" />
          <AdminPagination pagination={sessions.pagination} onPageChange={setSPage} />
        </>
      )}

      {/* ---------------- FEED ---------------- */}
      {tab === "feed" && (
        <>
          <Toolbar
            search={eSearch}
            setSearch={(v) => {
              setESearch(v);
              setEPage(1);
            }}
            placeholder="Name, page, action, IP, email..."
            onRefresh={() => refresh(true)}
            filters={
              <>
                <Select
                  value={eType}
                  onChange={(v) => {
                    setEType(v);
                    setEPage(1);
                  }}
                  options={[
                    { value: "", label: "All events" },
                    ...Object.entries(EVENT_META).map(([value, m]) => ({ value, label: `${m.icon} ${m.text}` })),
                  ]}
                />
                <Select
                  value={eWho}
                  onChange={(v) => {
                    setEWho(v);
                    setEPage(1);
                  }}
                  options={[
                    { value: "", label: "Guests + users" },
                    { value: "user", label: "Logged-in only" },
                    { value: "guest", label: "Guests only" },
                  ]}
                />
                <input
                  type="date"
                  className="input sm:w-auto"
                  value={eFrom}
                  onChange={(e) => {
                    setEFrom(e.target.value);
                    setEPage(1);
                  }}
                  aria-label="From date"
                />
                <input
                  type="date"
                  className="input sm:w-auto"
                  value={eTo}
                  onChange={(e) => {
                    setETo(e.target.value);
                    setEPage(1);
                  }}
                  aria-label="To date"
                />
              </>
            }
          />
          <Table columns={eventColumns} rows={events.rows} empty="No activity found" />
          <AdminPagination pagination={events.pagination} onPageChange={setEPage} />
        </>
      )}

      {/* ---------------- INSIGHTS ---------------- */}
      {tab === "insights" && overview && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Period:</span>
            <Select
              value={String(days)}
              onChange={(v) => setDays(Number(v))}
              options={[
                { value: "7", label: "Last 7 days" },
                { value: "14", label: "Last 14 days" },
                { value: "30", label: "Last 30 days" },
                { value: "90", label: "Last 90 days" },
              ]}
            />
          </div>

          <div className="card p-5">
            <h3 className="mb-4 font-semibold">Daily visits</h3>
            <DailyChart series={overview.series} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-4 font-semibold">Most visited pages</h3>
              <BarList rows={overview.topPages} labelKey="path" valueKey="views" />
            </div>

            <div className="card p-5">
              <h3 className="mb-4 font-semibold">Most active users</h3>
              {overview.topUsers.length ? (
                <ul className="divide-y divide-gray-100 text-sm dark:divide-gray-700">
                  {overview.topUsers.map((u) => (
                    <li key={u.userId} className="flex items-center justify-between gap-3 py-2">
                      <button type="button" className="text-left" onClick={() => filterByUser(u.userId, u.name)}>
                        <span className="font-medium">{u.name}</span>{" "}
                        <Badge tone={u.role === "admin" ? "yellow" : "blue"}>{u.role}</Badge>
                        <p className="text-xs text-gray-500">last active {formatRelative(u.lastActive)}</p>
                      </button>
                      <span className="text-xs text-gray-500">{u.events} events</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No logged-in activity yet</p>
              )}
            </div>

            <div className="card p-5">
              <h3 className="mb-4 font-semibold">Devices</h3>
              <BarList rows={overview.devices} labelKey="name" valueKey="count" />
            </div>

            <div className="card p-5">
              <h3 className="mb-4 font-semibold">Browsers</h3>
              <BarList rows={overview.browsers} labelKey="name" valueKey="count" />
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-1 font-semibold">Clean up old data</h3>
            <p className="mb-3 text-sm text-gray-500">
              Data waise bhi apne aap delete hota hai (default 60 din, .env me ACTIVITY_RETENTION_DAYS). Chaaho to abhi purana data hata sakte ho.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={String(cleanupDays)}
                onChange={(v) => setCleanupDays(Number(v))}
                options={[
                  { value: "7", label: "Older than 7 days" },
                  { value: "30", label: "Older than 30 days" },
                  { value: "60", label: "Older than 60 days" },
                  { value: "90", label: "Older than 90 days" },
                ]}
              />
              <button type="button" className="btn-danger" onClick={runCleanup}>
                🗑️ Delete old activity
              </button>
            </div>
          </div>
        </div>
      )}

      {selected ? (
        <SessionModal sessionId={selected} onClose={() => setSelected(null)} onFilterUser={filterByUser} />
      ) : null}
    </Page>
  );
}