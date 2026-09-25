import { useState } from "react";
import { formatDate } from "../../utils/formatDate";

function Stars({ avg, size = "lg" }) {
  const sz = size === "lg" ? "text-2xl" : "text-base";
  return (
    <span className={`${sz} text-yellow-400`}>
      {"★".repeat(Math.round(avg || 0))}{"☆".repeat(5 - Math.round(avg || 0))}
    </span>
  );
}

export default function BusinessDetails({ business }) {
  const [mainImage, setMainImage] = useState(business.images?.find((i) => i.isMain) || business.images?.[0]);

  const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

  return (
    <div className="space-y-6">
      {/* Images */}
      {business.images?.length > 0 && (
        <div>
          <img src={mainImage?.url} alt={business.name} className="w-full h-72 object-cover rounded-xl mb-2" />
          {business.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {business.images.map((img) => (
                <img
                  key={img.publicId || img.url}
                  src={img.url}
                  alt=""
                  onClick={() => setMainImage(img)}
                  className={`h-16 w-24 object-cover rounded-lg cursor-pointer border-2 shrink-0 ${mainImage?.url === img.url ? "border-primary-500" : "border-transparent"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{business.name}</h1>
            <span className="badge badge-blue capitalize mt-1 inline-block">{business.category}</span>
          </div>
          <div className="text-right">
            <Stars avg={business.rating?.average} />
            <p className="text-sm text-gray-500">{business.rating?.count || 0} reviews</p>
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{business.description}</p>
      </div>

      {/* Contact & Address */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
        <div className="space-y-2 text-sm">
          <p>📞 <a href={`tel:${business.phone}`} className="text-primary-600">{business.phone}</a></p>
          {business.alternatePhone && <p>📞 <a href={`tel:${business.alternatePhone}`} className="text-primary-600">{business.alternatePhone}</a></p>}
          {business.email && <p>✉️ <a href={`mailto:${business.email}`} className="text-primary-600">{business.email}</a></p>}
          {business.website && <p>🌐 <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-primary-600">{business.website}</a></p>}
          {business.address?.street && <p>📍 {[business.address.street, business.address.village, business.address.district].filter(Boolean).join(", ")}</p>}
        </div>
      </div>

      {/* Opening Hours */}
      {business.openingHours && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Opening Hours</h2>
          <div className="space-y-1 text-sm">
            {days.map((day) => {
              const h = business.openingHours[day];
              return (
                <div key={day} className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700 last:border-0">
                  <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{day}</span>
                  <span className="text-gray-500">
                    {h?.isClosed ? "Closed" : h?.open && h?.close ? `${h.open} – ${h.close}` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
