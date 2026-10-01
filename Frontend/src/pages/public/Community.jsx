import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getPosts, getPostById, createPost } from "../../services/communityService";
import { COMMUNITY_CATEGORIES } from "../../utils/constants";
import useAuth from "../../hooks/useAuth";
import useDebounce from "../../hooks/useDebounce";
import { useVillage } from "../../context/VillageContext";
import PostCard from "../../components/community/PostCard";
import PostForm from "../../components/community/PostForm";
import PostDetails from "../../components/community/PostDetails";
import Modal from "../../components/common/Modal";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";
import Pagination from "../../components/common/Pagination";

import { useLanguage } from "../../context/LanguageContext";
const PAGE_SIZE = 10;

export default function Community() {
  const { t } = useLanguage();
  const { villageName } = useVillage();
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posting, setPosting] = useState(false);
  const [viewPost, setViewPost] = useState(null);

  // Notification se aaya `?post=<id>`: seedha wahi post (comments ke saath) khol do
  const [searchParams, setSearchParams] = useSearchParams();
  const postParam = searchParams.get("post");

  useEffect(() => {
    if (!postParam) return undefined;
    let active = true;
    getPostById(postParam)
      .then((res) => {
        if (active) setViewPost(res.data?.data?.post || null);
      })
      .catch((err) => {
        if (!active) return;
        toast.error(
          err.response?.status === 404
            ? t("ui.thisPostIsNoLongera3a", "This post is no longer available")
            : t("ui.couldNotOpenThePostf4b", "Could not open the post")
        );
      });
    return () => {
      active = false;
    };
  }, [postParam]);

  const closePost = () => {
    setViewPost(null);
    if (postParam) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("post");
          return next;
        },
        { replace: true }
      );
    }
  };

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = { page, limit: PAGE_SIZE };
    if (category) params.category = category;
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

    getPosts(params)
      .then((res) => {
        setPosts(res.data?.data?.posts || []);
        setPagination(res.data?.pagination || null);
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load community posts")
      )
      .finally(() => setLoading(false));
  }, [page, category, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  // filter badalne par page 1 se shuru
  useEffect(() => {
    setPage(1);
  }, [category, debouncedSearch]);

  const handleCreate = async (formData) => {
    setPosting(true);
    try {
      await createPost(formData);
      toast.success("Post shared!");
      if (page === 1) load();
      else setPage(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create post");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          {villageName} Community
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {t("ui.talkWithFellowVillagersAsk645", "Talk with fellow villagers: ask for help, buy or sell things, report lost & found, or ask a question.")}
        </p>
      </div>

      <div className="mb-6">
        {user ? (
          <PostForm onSubmit={handleCreate} loading={posting} />
        ) : (
          <div className="card p-4 text-sm text-gray-600 dark:text-gray-300">
            {t("ui.postTo", "To post, please")}{" "}
            <Link to="/login" className="font-semibold text-primary-600 hover:underline">
              {t("ui.loginWord", "log in")}
            </Link>{" "}
            {t("ui.orWord", "or")}{" "}
            <Link to="/register" className="font-semibold text-primary-600 hover:underline">
              {t("ui.registerWord", "register")}
            </Link>
            {t("ui.postSuffix", ".")}
          </div>
        )}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts..."
          className="input flex-1"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input sm:w-48"
        >
          <option value="">All categories</option>
          {COMMUNITY_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon="💬"
          title="No posts found"
          description={t("ui.noPostsFoundYouCanb95", "No posts found. You can make the first post!")}
        />
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <PostCard key={p._id} post={p} onView={setViewPost} />
          ))}
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />

      <Modal isOpen={!!viewPost} onClose={closePost} title="Post" size="lg">
        <PostDetails post={viewPost} />
      </Modal>
    </div>
  );
}