import { useState } from "react";
import { Modal } from "./AdminUI";

// Asks the admin for a reason before rejecting a citizen submission.
export default function RejectModal({ title, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || busy) return;
    setBusy(true);
    try {
      await onConfirm(reason.trim());
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Reject submission" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <strong>{title}</strong>
          <br />
          The citizen will see this reason.
        </p>
        <textarea
          className="input"
          rows={4}
          maxLength={500}
          required
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why is this being rejected?"
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="btn-danger" disabled={busy || !reason.trim()}>
            {busy ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </form>
    </Modal>
  );
}