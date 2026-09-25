import { Link } from "react-router-dom";
import { STATUS_COLORS } from "../../utils/constants";

function Stars({ avg }) {
  return (
    <span className="text-yellow-400 text-sm">
      {"★".repeat(Math.round(avg))}{"☆".repeat(5 - Math.round(avg))}
      <span className="text-gray-500 text-xs ml-1">{avg?.toFixed(1)}</span>
    </span>
  );
}

export default function BusinessCard({ business, showStatus = false }) {
  const mainImage = business.images?.find((i) => i.isMain) || business.images?.[0];
  return (
    <Link to={`/businesses/${business._id}`} className="card block hover:shadow-md transition-shadow overflow-hidden">
      {mainImage?.url ? (
        <img src={mainImage.url} alt={business.name} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center text-4xl">🏪</div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{business.name}</h3>
          {showStatus && <span className={`${STATUS_COLORS[business.status]} shrink-0 capitalize`}>{business.status}</span>}
        </div>
        <span className="badge badge-blue capitalize text-xs mb-2 inline-block">{business.category}</span>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{business.description}</p>
        <div className="flex items-center justify-between text-xs">
          <Stars avg={business.rating?.average || 0} />
          <span className="text-gray-400">({business.rating?.count || 0})</span>
        </div>
        {business.address?.village && (
          <p className="text-xs text-gray-400 mt-1">📍 {business.address.village}</p>
        )}
      </div>
    </Link>
  );
}
