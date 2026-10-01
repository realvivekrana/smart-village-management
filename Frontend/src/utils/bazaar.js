/*
 * Shared constants / helpers for the Village Bazaar and Gallery
 */
import { formatCurrency } from "./formatCurrency";

export const LISTING_TYPES = [
  { value: "buy-sell", key: "bz.buySell", label: "Buy & Sell", icon: "🛒", closedKey: "bz.buySellClosed", closedLabel: "Sold" },
  { value: "lost-found", key: "bz.lostFound", label: "Lost & Found", icon: "🔍", closedKey: "bz.lostFoundClosed", closedLabel: "Found / Resolved" },
  { value: "equipment-rental", key: "bz.rental", label: "Rent (Farm equipment)", icon: "🚜", closedKey: "bz.rentalClosed", closedLabel: "Rented out" },
];

export const RENTAL_UNITS = [
  { value: "hour", key: "bz.perHour", label: "per hour" },
  { value: "day", key: "bz.perDay", label: "per day" },
  { value: "week", key: "bz.perWeek", label: "per week" },
  { value: "trip", key: "bz.perTrip", label: "per trip" },
  { value: "other", key: "bz.other", label: "Other" },
];

export const GALLERY_CATEGORIES = [
  { value: "village", key: "bz.catVillage", label: "Village" },
  { value: "festival", key: "bz.catFestival", label: "Festival" },
  { value: "farming", key: "bz.catFarming", label: "Farming" },
  { value: "event", key: "bz.catEvent", label: "Event" },
  { value: "nature", key: "bz.catNature", label: "Nature" },
  { value: "other", key: "bz.other", label: "Other" },
];

export const REVIEW_STATUS = {
  pending: { key: "bz.reviewPending", label: "Awaiting review", badge: "badge-yellow" },
  approved: { key: "bz.reviewApproved", label: "Live — visible to everyone", badge: "badge-green" },
  rejected: { key: "bz.reviewRejected", label: "Removed by admin", badge: "badge-red" },
};

export const getTypeMeta = (value) =>
  LISTING_TYPES.find((t) => t.value === value) || LISTING_TYPES[0];

export const formatListingPrice = (listing, t) => {
  if (listing.type === "lost-found" || listing.price == null) return "";
  if (listing.type === "equipment-rental") {
    const u = RENTAL_UNITS.find((x) => x.value === listing.priceUnit);
    const unit = u ? (t ? t(u.key, u.label) : u.label) : "";
    return `${formatCurrency(listing.price)} ${unit}`.trim();
  }
  return formatCurrency(listing.price);
};