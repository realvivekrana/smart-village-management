import { formatDateTime } from "../../utils/formatDate";
import { PRIORITY_COLORS } from "../../utils/constants";

export default function NoticeDetails({ notice }) {
  return (
    <article className="card p-6 lg:p-8">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`${PRIORITY_COLORS[notice.priority]} capitalize`}>{notice.priority}</span>
        <span className="badge badge-blue capitalize">{notice.category?.replace("_", " ")}</span>
      </div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">{notice.title}</h1>
      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
        <span>📅 Published: {formatDateTime(notice.publishedAt)}</span>
        {notice.expiresAt && <span>⏳ Expires: {formatDateTime(notice.expiresAt)}</span>}
        {notice.createdBy?.name && <span>👤 {notice.createdBy.name}</span>}
        <span>👁 {notice.viewCount || 0} views</span>
      </div>
      <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
        {notice.content}
      </div>
    </article>
  );
}
