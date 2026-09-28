import { formatRelative } from "../../utils/formatDate";
import { STATUS_COLORS, CERTIFICATE_TYPES } from "../../utils/constants";

export const certificateLabel = (type) =>
  CERTIFICATE_TYPES.find((t) => t.value === type)?.label.split(" (")[0] || type;

export default function CertificateCard({ certificate, actions }) {
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{certificateLabel(certificate.type)}</h3>
          <p className="text-xs text-gray-400 mt-0.5">#{certificate.requestNumber}</p>
        </div>
        <span className={`${STATUS_COLORS[certificate.status]} capitalize`}>
          {certificate.status.replace("_", " ")}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        <span className="font-medium">{certificate.applicantName}</span>
        {certificate.fatherName ? ` (S/o, D/o ${certificate.fatherName})` : ""}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{certificate.purpose}</p>
      {certificate.adminNote && (
        <p className="mt-3 text-xs rounded-lg bg-gray-50 dark:bg-gray-800 p-2 text-gray-600 dark:text-gray-300">
          <span className="font-medium">Office note:</span> {certificate.adminNote}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-xs text-gray-400">
        <span>{formatRelative(certificate.createdAt)}</span>
        {actions}
      </div>
    </div>
  );
}