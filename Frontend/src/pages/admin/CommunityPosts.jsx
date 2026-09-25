import { useEffect, useState } from "react";
import api from "../../services/api";
import { AdminPagination, Badge, ErrorBox, fmtDate, Loading, Page, Table, Toolbar } from "./AdminUI";

const categories = ["general", "help", "sell", "buy", "lost_found", "announcement", "question", "event", "other"];

export default function CommunityPosts() {
  const [rows, setRows] = useState([]); const [pagination, setPagination] = useState(null); const [page, setPage] = useState(1); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [search, setSearch] = useState(""); const [category, setCategory] = useState("");
  const load = async () => { setLoading(true); setError(""); try { const response = await api.get("/community", { params: { page, limit: 10, search: search || undefined, category: category || undefined } }); setRows(response.data?.data?.posts || []); setPagination(response.data?.pagination || null); } catch (err) { setError(err.response?.data?.message || "Failed to load posts"); } finally { setLoading(false); } };
  useEffect(() => { setPage(1); }, [search, category]); useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [page, search, category]);
  const pin = async (row) => { try { await api.put(`/community/${row._id}`, { isPinned: !row.isPinned }); await load(); } catch (err) { setError(err.response?.data?.message || "Update failed"); } };
  const remove = async (id) => { if (!window.confirm("Remove this post?")) return; try { await api.delete(`/community/${id}`); await load(); } catch (err) { setError(err.response?.data?.message || "Delete failed"); } };
  return <Page title="Community Posts" subtitle="Live resident posts with category search, pinning and moderation.">
    <Toolbar search={search} setSearch={setSearch} placeholder="Search posts..." filters={<select className="input" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{categories.map((x) => <option key={x} value={x}>{x.replaceAll("_", " ")}</option>)}</select>} onRefresh={load} />
    {error ? <ErrorBox message={error} retry={load} /> : null}
    {loading ? <Loading /> : <Table rows={rows} columns={[{ key: "content", label: "Post", render: (row) => <div className="max-w-xl"><p className="line-clamp-3">{row.content}</p><p className="mt-1 text-xs text-gray-500">{row.createdBy?.name || "Unknown"} · {fmtDate(row.createdAt)}</p></div> }, { key: "category", label: "Category", render: (row) => <Badge>{row.category}</Badge> }, { key: "likeCount", label: "Likes", render: (row) => row.likeCount || 0 }, { key: "commentCount", label: "Comments", render: (row) => row.commentCount || 0 }, { key: "isPinned", label: "Pinned", render: (row) => <Badge tone={row.isPinned ? "green" : "gray"}>{row.isPinned ? "Yes" : "No"}</Badge> }, { key: "actions", label: "Actions", render: (row) => <div className="flex gap-2"><button className="btn-secondary" onClick={() => pin(row)} type="button">{row.isPinned ? "Unpin" : "Pin"}</button><button className="btn-danger" onClick={() => remove(row._id)} type="button">Delete</button></div> }]} />}
    <AdminPagination pagination={pagination} onPageChange={setPage} />
  </Page>;
}
