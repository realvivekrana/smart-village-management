import { useState } from "react";
import { formatRelative } from "../../utils/formatDate";
import { toggleLike } from "../../services/communityService";
import useAuth from "../../hooks/useAuth";

export default function PostCard({ post, onView }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likes?.some((id) => id === user?._id || id?._id === user?._id));
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return;
    try {
      const res = await toggleLike(post._id);
      setLiked(res.data.data.liked);
      setLikeCount(res.data.data.likeCount);
    } catch {}
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-9 w-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
          {post.createdBy?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{post.createdBy?.name}</p>
          <p className="text-xs text-gray-400">{formatRelative(post.createdAt)}</p>
        </div>
        <span className="ml-auto badge badge-blue capitalize text-xs">{post.category?.replace("_"," ")}</span>
      </div>

      <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap line-clamp-4 mb-3">{post.content}</p>

      {post.images?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto mb-3">
          {post.images.map((img) => (
            <img key={img.url} src={img.url} alt="" className="h-32 w-auto rounded-lg object-cover shrink-0" />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 text-sm transition-colors ${liked ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
        >
          {liked ? "❤️" : "🤍"} {likeCount}
        </button>
        <button
          onClick={() => onView?.(post)}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-600"
        >
          💬 {post.commentCount || 0}
        </button>
      </div>
    </div>
  );
}
