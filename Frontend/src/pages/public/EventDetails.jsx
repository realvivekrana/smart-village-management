import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getEventById, toggleInterested } from "../../services/eventService";
import EventDetailsView from "../../components/events/EventDetails";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    getEventById(id)
      .then((res) => setEvent(res.data.data.event))
      .catch((err) => setError(err.response?.data?.message || "Failed to load event"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await toggleInterested(id);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error) return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;
  if (!event) return null;

  return (
    <div className="page-container max-w-3xl">
      <EventDetailsView event={event} onToggleInterested={handleToggle} toggling={toggling} />
    </div>
  );
}