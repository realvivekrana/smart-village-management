import { Link } from "react-router-dom";

export default function ServiceCard({ service }) {
  return (
    <Link to={`/services/${service._id}`} className="card p-5 block hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-12 w-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-2xl">
          {service.icon || "🔧"}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
          <span className="badge badge-blue capitalize text-xs">{service.category?.replace("_"," ")}</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{service.description}</p>
      {service.fees?.isFree === false && (
        <p className="text-xs text-primary-600 mt-2 font-medium">
          Fee: ₹{service.fees.amount}
        </p>
      )}
      {service.processingTime && (
        <p className="text-xs text-gray-400 mt-1">⏱ {service.processingTime}</p>
      )}
    </Link>
  );
}
