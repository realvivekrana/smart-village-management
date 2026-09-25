import { formatDate } from "../../utils/formatDate";
import { formatSalaryRange } from "../../utils/formatCurrency";
import { isExpired } from "../../utils/formatDate";
import Button from "../common/Button";
import useAuth from "../../hooks/useAuth";

export default function JobDetails({ job, onApply, applying }) {
  const { user } = useAuth();
  const expired = isExpired(job.applyBy);

  return (
    <article className="card p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{job.title}</h1>
          <p className="text-lg text-primary-600 dark:text-primary-400 font-medium">{job.company}</p>
        </div>
        {expired ? (
          <span className="badge badge-red text-sm py-1 px-3">Applications Closed</span>
        ) : (
          <span className="badge badge-green text-sm py-1 px-3">Now Hiring</span>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl text-sm mb-6">
        <div><span className="text-gray-500">📍</span> <span className="font-medium">{job.location}</span></div>
        <div><span className="text-gray-500">💼</span> <span className="font-medium capitalize">{job.type?.replace("_"," ")}</span></div>
        <div><span className="text-gray-500">🔢</span> <span className="font-medium">{job.openings} opening{job.openings > 1 ? "s" : ""}</span></div>
        <div><span className="text-gray-500">💰</span> <span className="font-medium">{formatSalaryRange(job.salary)}</span></div>
        <div><span className="text-gray-500">🗓</span> Apply by <span className="font-medium">{formatDate(job.applyBy)}</span></div>
        <div><span className="text-gray-500">📊</span> <span className="font-medium">{job.applicationCount || 0} applicants</span></div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h2>
      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-4">{job.description}</p>

      {job.requirements && (
        <>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Requirements</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-6">{job.requirements}</p>
        </>
      )}

      {user && !expired && user.role !== "admin" && user.role !== "super_admin" && (
        <Button onClick={onApply} loading={applying} size="lg">
          Apply Now →
        </Button>
      )}
    </article>
  );
}
