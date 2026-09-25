import EmergencyCard from "./EmergencyCard";

export default function EmergencyList({ contacts, groupByCategory = true }) {
  if (!contacts || contacts.length === 0) {
    return <p className="text-gray-500 text-center py-8">No emergency contacts found.</p>;
  }

  if (!groupByCategory) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.map((c) => <EmergencyCard key={c._id} contact={c} />)}
      </div>
    );
  }

  const grouped = contacts.reduce((acc, c) => {
    const cat = c.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white capitalize mb-4">
            {category.replace("_", " ")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => <EmergencyCard key={c._id} contact={c} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
