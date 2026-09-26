import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getEventById,
  toggleInterested,
} from "../../services/eventService";

import EventDetailsView from "../../components/events/EventDetails";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function EventDetails() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getEventById(id);
      setEvent(res.data.data.event);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load event"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleToggle = async () => {
    if (toggling) return;

    setToggling(true);

    try {
      const res = await toggleInterested(id);

      toast.success(
        res?.data?.message ||
          "Your event interest has been updated"
      );

      await load();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Loading event details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] bg-gray-50 dark:bg-gray-950 flex items-center">
        <div className="page-container w-full">
          <div className="max-w-2xl mx-auto">
            <ErrorMessage message={error} onRetry={load} />

            <div className="text-center mt-6">
              <Link
                to="/events"
                className="
                  inline-flex items-center gap-2
                  rounded-xl
                  border border-gray-200
                  dark:border-gray-700
                  bg-white dark:bg-gray-900
                  px-5 py-3
                  text-sm font-semibold
                  text-gray-700 dark:text-gray-200
                  shadow-sm
                  hover:shadow-md
                  transition-all
                "
              >
                ← Back to Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="text-6xl mb-4">📅</div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Event Not Found
          </h2>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            The event you're looking for may have been removed.
          </p>

          <Link
            to="/events"
            className="
              inline-flex items-center gap-2
              mt-6
              rounded-xl
              bg-primary-600
              px-5 py-3
              text-sm font-semibold
              text-white
              shadow-lg shadow-primary-600/20
              hover:bg-primary-700
              transition-all
            "
          >
            ← Explore Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

      {/* Top decorative background */}
      <div className="relative overflow-hidden">
        <div className="
          absolute -top-32 -left-32
          w-72 h-72
          rounded-full
          bg-primary-500/10
          blur-3xl
          pointer-events-none
        " />

        <div className="
          absolute -top-32 -right-32
          w-72 h-72
          rounded-full
          bg-purple-500/10
          blur-3xl
          pointer-events-none
        " />

        <div className="relative page-container max-w-5xl">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 pt-6 mb-6 text-sm">
            <Link
              to="/"
              className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
            >
              Home
            </Link>

            <span className="text-gray-400">/</span>

            <Link
              to="/events"
              className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
            >
              Events
            </Link>

            <span className="text-gray-400">/</span>

            <span className="text-gray-700 dark:text-gray-200 font-medium truncate">
              Event Details
            </span>
          </div>

          {/* Event container */}
          <div className="
            overflow-hidden
            rounded-3xl
            border border-gray-200/80
            dark:border-gray-700
            bg-white
            dark:bg-gray-900
            shadow-xl
            shadow-gray-900/5
            dark:shadow-black/20
          ">

            {/* Top accent */}
            <div className="
              h-1.5
              bg-gradient-to-r
              from-primary-600
              via-purple-600
              to-indigo-600
            " />

            <div className="p-4 sm:p-6 lg:p-8">
              <EventDetailsView
                event={event}
                onToggleInterested={handleToggle}
                toggling={toggling}
              />
            </div>
          </div>

          {/* Bottom navigation */}
          <div className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-4
            py-8
          ">

            <Link
              to="/events"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-gray-200
                dark:border-gray-700
                bg-white
                dark:bg-gray-900
                px-5 py-3
                text-sm
                font-semibold
                text-gray-700
                dark:text-gray-200
                shadow-sm
                hover:-translate-y-0.5
                hover:shadow-md
                transition-all
              "
            >
              ← All Events
            </Link>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/30">
                📅
              </span>

              <span>
                Discover events in{" "}
                <strong className="text-gray-700 dark:text-gray-200">
                  Kakarcholi
                </strong>
              </span>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}