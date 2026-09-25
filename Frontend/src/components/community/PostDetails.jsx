import { formatRelative } from "../../utils/formatDate";
import CommentSection from "./CommentSection";

export default function PostDetails({ post, onClose }) {
  if (!post) return null;
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
          {post.createdBy?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{post.createdBy?.name}</p>
          <p className="text-xs text-gray-400">{formatRelative(post.createdAt)}</p>
        </div>
      </div>
      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-4">{post.content}</p>
      {post.images?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto mb-4">
          {post.images.map((img) => (
            <img key={img.url} src={img.url} alt="" className="h-48 w-auto rounded-lg object-cover" />
          ))}
        </div>
      )}
      <CommentSection postId={post._id} />
    </div>
  );
}
