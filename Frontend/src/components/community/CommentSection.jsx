import { useEffect, useState } from "react";
import { createComment, getComments } from "../../services/communityService";
import { formatRelative } from "../../utils/formatDate";
import useAuth from "../../hooks/useAuth";
import Button from "../common/Button";

export default function CommentSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
          {comments.map((c) => (
            <div key={c._id} className="flex gap-2">
              <div className="h-7 w-7 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-semibold shrink-0">
                {c.createdBy?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 flex-1">
                <p className="text-xs font-semibold text-gray-800 dark:text-white">{c.createdBy?.name}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{c.content}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatRelative(c.createdAt)}</p>
              </div>
            </div>
          ))}
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
    </div>
  );
}
