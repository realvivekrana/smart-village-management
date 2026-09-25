import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getMyPosts, createPost } from "../../services/communityService";
import PostForm from "../../components/community/PostForm";
import PostCard from "../../components/community/PostCard";
import PostDetails from "../../components/community/PostDetails";
import Modal from "../../components/common/Modal";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posting, setPosting] = useState(false);
  const [viewPost, setViewPost] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getMyPosts({ page: 1, limit: 20 })
      .then((res) => setPosts(res.data.data.posts))
      .catch((err) => setError(err.response?.data?.message || "Failed to load posts"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (formData) => {
    setPosting(true);
    try {
      await createPost(formData);
      toast.success("Post shared!");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create post");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <h1 className="section-title mb-6">💬 My Community Posts</h1>

      <div className="mb-6">
        <PostForm onSubmit={handleCreate} loading={posting} />
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : posts.length === 0 ? (
        <EmptyState icon="💬" title="No posts yet" description="Share something with your community above." />
      ) : (
        <div className="space-y-4">
          {posts.map((p) => <PostCard key={p._id} post={p} onView={setViewPost} />)}
        </div>
      )}

      <Modal isOpen={!!viewPost} onClose={() => setViewPost(null)} title="Post" size="lg">
        <PostDetails post={viewPost} />
      </Modal>
    </div>
  );
}