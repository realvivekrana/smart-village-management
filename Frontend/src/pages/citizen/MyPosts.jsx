import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getMyPosts, createPost, updatePost, deletePost } from "../../services/communityService";
import PostForm from "../../components/community/PostForm";
import PostCard from "../../components/community/PostCard";
import PostDetails from "../../components/community/PostDetails";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posting, setPosting] = useState(false);
  const [viewPost, setViewPost] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleUpdate = async (payload) => {
    setUpdating(true);
    try {
      await updatePost(editPost._id, payload);
      toast.success("Post updated!");
      setEditPost(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update post");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePost(deleteTarget._id);
      toast.success("Post deleted");
      setDeleteTarget(null);
      setPosts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete post");
    } finally {
      setDeleting(false);
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
          {posts.map((p) => (
            <PostCard
              key={p._id}
              post={p}
              onView={setViewPost}
              onEdit={setEditPost}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <Modal isOpen={!!viewPost} onClose={() => setViewPost(null)} title="Post" size="lg">
        <PostDetails post={viewPost} />
      </Modal>

      <Modal isOpen={!!editPost} onClose={() => setEditPost(null)} title="Edit Post" size="lg">
        {editPost && (
          <PostForm
            initial={editPost}
            onSubmit={handleUpdate}
            loading={updating}
            onCancel={() => setEditPost(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}