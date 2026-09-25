import Hero from "../../components/home/Hero";
import VillageStats from "../../components/home/VillageStats";
import QuickServices from "../../components/home/QuickServices";
import UpcomingEvents from "../../components/home/UpcomingEvents";
import LatestNotices from "../../components/home/LatestNotices";
import EmergencySection from "../../components/home/EmergencySection";

export default function Home() {
  return (
    <div>
      <Hero />
      <VillageStats />
      <QuickServices />
      <UpcomingEvents />
      <LatestNotices />
      <EmergencySection />
    </div>
  );
}