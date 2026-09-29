import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../services/api";

/*
|--------------------------------------------------------------------------
| Village Context
|--------------------------------------------------------------------------
| Gaon ka poora data (naam, local naam, district, state, sarpanch, contact...)
| ek hi baar backend se aata hai (GET /village) aur poori app me use hota hai.
| Admin -> Village Settings me naam badalte hi poori site me badal jata hai.
| Kisi component me gaon ka naam hardcode NAHI karna.
*/

const VillageContext = createContext(null);

const FALLBACK_NAME = "Village";

export function VillageProvider({ children }) {
  const [village, setVillage] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get("/village");
      setVillage(res.data?.data || null);
    } catch (error) {
      // Backend na mile tab bhi site chalni chahiye
      console.error("Failed to load village:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Browser tab title + meta description dynamic
  useEffect(() => {
    if (!village?.name) return;

    const place = [village.name, village.district, village.state]
      .filter(Boolean)
      .join(", ");

    document.title = `${village.name} | Official Village Portal`;

    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        `${village.name} - Official village portal (${place}) connecting residents, services, businesses, events, jobs, notices and community resources.`
      );
    }
  }, [village]);

  const value = useMemo(
    () => ({
      village,
      loading,
      refresh,
      villageName: village?.name || FALLBACK_NAME,
      villageLocalName: village?.localName || village?.name || FALLBACK_NAME,
    }),
    [village, loading, refresh]
  );

  return (
    <VillageContext.Provider value={value}>
      {children}
    </VillageContext.Provider>
  );
}

export function useVillage() {
  const ctx = useContext(VillageContext);

  if (!ctx) {
    throw new Error("useVillage must be used inside <VillageProvider>");
  }

  return ctx;
}

export default VillageContext;