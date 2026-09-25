import { useEffect, useState } from "react";
import { getEmergencyContacts } from "../../services/emergencyService";
import EmergencyList from "../../components/emergency/EmergencyList";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function Emergency() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getEmergencyContacts()
      .then((res) => setContacts(res.data.data.contacts))
      .catch((err) => setError(err.response?.data?.message || "Failed to load emergency contacts"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="page-container">
      <h1 className="section-title mb-6">🚨 Emergency Contacts</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : (
        <EmergencyList contacts={contacts} />
      )}
    </div>
  );
}