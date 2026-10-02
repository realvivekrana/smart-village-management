import { useEffect, useState } from "react";

import Hero from "../../components/home/Hero";
import VillageStats from "../../components/home/VillageStats";
import QuickServices from "../../components/home/QuickServices";
import UpcomingEvents from "../../components/home/UpcomingEvents";
import LatestNotices from "../../components/home/LatestNotices";
import VillageHighlights from "../../components/home/VillageHighlights";

import { getHomeData } from "../../services/homeService";

// SEO
import SEO from "../../components/common/SEO";
import StructuredData from "../../components/common/StructuredData";

export default function Home() {
  const [homeData, setHomeData] = useState({
    events: [],
    notices: [],
    community: [],
    bazaar: [],
    businesses: [],
    jobs: [],
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

          community: Array.isArray(data?.community) ? data.community : [],
          bazaar: Array.isArray(data?.bazaar) ? data.bazaar : [],
          businesses: Array.isArray(data?.businesses) ? data.businesses : [],
          jobs: Array.isArray(data?.jobs) ? data.jobs : [],
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
          community: [],
          bazaar: [],
          businesses: [],
          jobs: [],
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
    <>
      {/* =====================================================
          SEO
      ====================================================== */}

      <SEO
        title="Kakarcholi Village"
        description="Official Smart Village Management portal for Kakarcholi village. Explore village information, government schemes, public services, notices, events, emergency contacts and important local resources."
        path="/"
      />
      <StructuredData />

      {/* =====================================================
          HOMEPAGE
      ====================================================== */}

      <div>
        {/* Critical first-screen content */}
        <Hero />

        {/* Village Stats - Proper spacing below Hero */}
        <div className="pt-12 sm:pt-14">
          <VillageStats />
        </div>

        {/* Quick Village Services */}
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

        {/* Highlights: Community, Bazaar, Businesses, Jobs */}
        <VillageHighlights
          community={homeData.community}
          bazaar={homeData.bazaar}
          businesses={homeData.businesses}
          jobs={homeData.jobs}
          loading={loading}
        />
      </div>
    </>
  );
}