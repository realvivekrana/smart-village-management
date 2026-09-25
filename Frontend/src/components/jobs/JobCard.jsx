import { Link } from "react-router-dom";
import { formatDate } from "../../utils/formatDate";
import { formatSalaryRange } from "../../utils/formatCurrency";
import { isExpired } from "../../utils/formatDate";

export default function JobCard({ job }) {
  const expired = isExpired(job.applyBy);
  return (
    <Link to={`/jobs/${job._id}`} className={`card p-5 block hover:shadow-md transition-shadow ${expired ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{job.title}</h3>
        {expired ? (
          <span className="badge badge-gray shrink-0">Closed</span>
        ) : (
          <span className="badge badge-green shrink-0">Open</span>
        )}
      </div>
      <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-1">{job.company}</p>
      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{job.description}</p>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="badge badge-blue capitalize">{job.category}</span>
        <span className="badge badge-gray capitalize">{job.type?.replace("_", " ")}</span>
        <span className="text-gray-500">📍 {job.location}</span>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>💰 {formatSalaryRange(job.salary)}</span>
        <span>🗓 Apply by {formatDate(job.applyBy)}</span>
      </div>
    </Link>
  );
}
