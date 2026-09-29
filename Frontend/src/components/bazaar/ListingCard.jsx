import { formatDate } from "../../utils/formatDate";
import { formatListingPrice, getTypeMeta, REVIEW_STATUS } from "../../utils/bazaar";

/*
 * Ek listing ka card.
 * - showStatus : citizen/admin ko approval status dikhata hai
 * - children   : neeche action buttons (edit / approve / delete ...)
 */
export default function ListingCard({ listing, showStatus = false, showOwner = false, children }) {
  const meta = getTypeMeta(listing.type);
  const price = formatListingPrice(listing);
  const image = listing.images?.[0]?.url;
  const review = REVIEW_STATUS[listing.status];

  return (
    <div className={`card overflow-hidden flex flex-col ${listing.isClosed ? "opacity-70" : ""}`}>
      {image ? (
        <img src={image} alt={listing.title} className="h-44 w-full object-cover" loading="lazy" />
      ) : (
        <div className="h-32 w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-5xl">
          {meta.icon}
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge-blue">
            {meta.icon} {meta.label}
          </span>
          {listing.type === "lost-found" && (
            <span className={listing.itemStatus === "found" ? "badge-green" : "badge-red"}>
              {listing.itemStatus === "found" ? "Mila hai" : "Kho gaya hai"}
            </span>
          )}
          {listing.isClosed && <span className="badge-gray">{meta.closedLabel}</span>}
          {showStatus && review && <span className={review.badge}>{review.label}</span>}
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-white">{listing.title}</h3>

        {price && <p className="text-lg font-bold text-green-700 dark:text-green-400">{price}</p>}

        {listing.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{listing.description}</p>
        )}

        <div className="text-xs text-gray-500 space-y-0.5 mt-auto pt-2">
          {listing.location && <p>📍 {listing.location}</p>}
          <p>
            🗓️ {formatDate(listing.createdAt)}
            {(showOwner || listing.createdBy?.name) && listing.createdBy?.name
              ? ` • ${listing.createdBy.name}`
              : ""}
          </p>
        </div>

        {listing.status === "rejected" && listing.rejectionReason && (
          <p className="text-sm text-red-700 dark:text-red-300 rounded-lg bg-red-50 dark:bg-red-950/40 p-2">
            Karan: {listing.rejectionReason}
          </p>
        )}

        {listing.contactPhone && (
          <a
            href={`tel:${listing.contactPhone}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            📞 {listing.contactName ? `${listing.contactName} — ` : ""}
            {listing.contactPhone}
          </a>
        )}

        {children && <div className="flex flex-wrap gap-2 pt-1">{children}</div>}
      </div>
    </div>
  );
}