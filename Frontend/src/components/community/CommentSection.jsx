import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createComment, getComments, updateComment, deleteComment } from "../../services/communityService";
import { formatRelative } from "../../utils/formatDate";
import useAuth from "../../hooks/useAuth";
import Button from "../common/Button";
import ConfirmDialog from "../common/ConfirmDialog";

export default function CommentSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    getComments(postId, { limit: 50 })
      .then((r) => setComments(r.data.data.comments))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await createComment(postId, { content: text });
      setComments((prev) => [...prev, res.data.data.comment]);
      setText("");
    } catch {}
    setSubmitting(false);
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setEditText(c.content);
  };

  const handleSaveEdit = async (id) => {
    if (!editText.trim()) return;
    setSavingEdit(true);
    try {
      const res = await updateComment(id, { content: editText });
      setComments((prev) => prev.map((c) => (c._id === id ? res.data.data.comment : c)));
      setEditingId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update comment");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteComment(deleteTarget);
      setComments((prev) => prev.filter((c) => c._id !== deleteTarget));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete comment");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
        💬 Comments ({comments.length})
      </h3>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => {
            const isOwner = user && (c.createdBy?._id === user._id || c.createdBy === user._id);
            const isEditing = editingId === c._id;
            return (
              <div key={c._id} className="flex gap-2">
                <div className="h-7 w-7 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-semibold shrink-0">
                  {c.createdBy?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-gray-800 dark:text-white">{c.createdBy?.name}</p>
                    {isOwner && !isEditing && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="text-[11px] text-gray-500 hover:text-primary-600"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(c._id)}
                          className="text-[11px] text-gray-500 hover:text-red-600"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="mt-1 space-y-2">
                      <input
                        className="input"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        maxLength={1000}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" loading={savingEdit} onClick={() => handleSaveEdit(c._id)}>Save</Button>
                        <Button size="sm" variant="secondary" type="button" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300">{c.content}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{formatRelative(c.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
          />
          <Button type="submit" loading={submitting} size="sm">Post</Button>
        </form>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}