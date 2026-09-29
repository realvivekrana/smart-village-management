import { useEffect, useState } from "react";

import Hero from "../../components/home/Hero";
import VillageStats from "../../components/home/VillageStats";
import QuickServices from "../../components/home/QuickServices";
import UpcomingEvents from "../../components/home/UpcomingEvents";
import LatestNotices from "../../components/home/LatestNotices";
import EmergencySection from "../../components/home/EmergencySection";

import { getHomeData } from "../../services/homeService";

export default function Home() {
  const [homeData, setHomeData] = useState({
    events: [],
    notices: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadHomeData = async () => {
      try {
        const response = await getHomeData();

        if (!isMounted) {
          return;
        }

        const data = response?.data?.data;

        setHomeData({
          events: Array.isArray(data?.events)
            ? data.events
            : [],

          notices: Array.isArray(data?.notices)
            ? data.notices
            : [],
        });
      } catch (error) {
        console.error(
          "Failed to load homepage data:",
          error
        );

        if (!isMounted) {
          return;
        }

        setHomeData({
          events: [],
          notices: [],
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      {/* Critical first-screen content */}
      <Hero />

      <VillageStats />

      <QuickServices />

      {/* Optimized Events Data */}
      <UpcomingEvents
        events={homeData.events}
        loading={loading}
      />

      {/* Optimized Notices Data */}
      <LatestNotices
        notices={homeData.notices}
        loading={loading}
      />

      <EmergencySection />
    </div>
  );
}