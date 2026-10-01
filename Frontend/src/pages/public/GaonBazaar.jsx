
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getListings } from "../../services/listingService";
import { LISTING_TYPES } from "../../utils/bazaar";
import useDebounce from "../../hooks/useDebounce";
import { useLanguage } from "../../context/LanguageContext";
import ListingCard from "../../components/bazaar/ListingCard";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";
import Pagination from "../../components/common/Pagination";
import SEO from "../../components/common/SEO";

const PAGE_SIZE = 12;

export default function GaonBazaar() {
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = { page, limit: PAGE_SIZE };
    if (type) params.type = type;
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

    getListings(params)
      .then((res) => {
        setListings(res.data?.data?.listings || []);
        setPagination(res.data?.pagination || null);
      })
      .catch((err) =>
        setError(
          err.response?.data?.message ||
            t("ui.couldNotLoadTheBazaar956", "Could not load the bazaar")
        )
      )
      .finally(() => setLoading(false));
  }, [page, type, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const changeType = (value) => {
    setType(value);
    setPage(1);
  };

  return (
    <>
      <SEO
        title="Village Bazaar"
        description="Explore the village bazaar for buying and selling local items, lost and found listings, farm equipment rentals and useful marketplace opportunities for villagers."
        path="/bazaar"
      />

      <div className="page-container space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="section-title">
              🛒 {t("bazaar.title", "Village Bazaar")}
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {t(
                "bazaar.subtitle",
                t(
                  "ui.buyingSellingLostFoundAndc8a",
                  "Buying & selling, lost & found and farm equipment rental for villagers — all in one place."
                )
              )}
            </p>
          </div>

          <Link to="/citizen/bazaar" className="btn-primary">
            ➕ {t("bazaar.post", "Post your listing")}
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="input sm:max-w-xs"
            placeholder={t(
              "ui.searchEGTrolleyKeysfd7",
              "Search (e.g. trolley, keys, goat)"
            )}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <div className="flex flex-wrap gap-2">
            {[
              { value: "", key: "bz.all", label: "All", icon: "🏘️" },
              ...LISTING_TYPES,
            ].map((tp) => (
              <button
                key={tp.value}
                onClick={() => changeType(tp.value)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium border transition-colors ${
                  type === tp.value
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                }`}
              >
                {tp.icon} {t(tp.key, tp.label)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} onRetry={load} />
        ) : listings.length === 0 ? (
          <EmptyState
            icon="🛒"
            title={t("ui.noListingsYet1bf", "No listings yet")}
            description={t(
              "ui.beTheFirstToPost84e",
              "Be the first to post a listing — it will be visible to everyone after admin approval."
            )}
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((l) => (
                <ListingCard key={l._id} listing={l} />
              ))}
            </div>

            <Pagination
              pagination={pagination}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </>
  );
}
