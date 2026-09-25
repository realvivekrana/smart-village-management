export default function ServiceDetails({ service }) {
  return (
    <div className="card p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-4xl">
          {service.icon || "🔧"}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{service.name}</h1>
          <span className="badge badge-blue capitalize">{service.category?.replace("_"," ")}</span>
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{service.description}</p>

      {service.howToApply && (
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2">How to Apply</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{service.howToApply}</p>
        </div>
      )}

      {service.requiredDocuments?.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Required Documents</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {service.requiredDocuments.map((doc, i) => <li key={i}>{doc}</li>)}
          </ul>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl text-sm">
        <div>
          <span className="text-gray-500">💰 Fee:</span>
          <span className="font-medium ml-2">{service.fees?.isFree !== false ? "Free" : `₹${service.fees.amount}`}</span>
        </div>
        {service.processingTime && (
          <div>
            <span className="text-gray-500">⏱ Processing Time:</span>
            <span className="font-medium ml-2">{service.processingTime}</span>
          </div>
        )}
      </div>

      {service.contactInfo && (
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Contact</h2>
          <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {service.contactInfo.name && <p>👤 {service.contactInfo.name}</p>}
            {service.contactInfo.phone && <p>📞 <a href={`tel:${service.contactInfo.phone}`} className="text-primary-600">{service.contactInfo.phone}</a></p>}
            {service.contactInfo.email && <p>✉️ {service.contactInfo.email}</p>}
            {service.contactInfo.officeAddress && <p>📍 {service.contactInfo.officeAddress}</p>}
          </div>
        </div>
      )}

      {service.onlineLink && (
        <a href={service.onlineLink} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex">
          Apply Online →
        </a>
      )}
    </div>
  );
}
