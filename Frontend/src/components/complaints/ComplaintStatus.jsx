import { STATUS_COLORS } from "../../utils/constants";

const statusOrder = ["pending", "in_progress", "resolved"];

export default function ComplaintStatus({ status }) {
  const idx = statusOrder.indexOf(status);
  const isRejected = status === "rejected" || status === "closed";

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[status]} capitalize`}>
      {status === "resolved" && "✅ "}
      {status === "in_progress" && "🔄 "}
      {status === "pending" && "⏳ "}
      {status === "rejected" && "❌ "}
      {status === "closed" && "🔒 "}
      {status.replace("_", " ")}
    </div>
  );
}
