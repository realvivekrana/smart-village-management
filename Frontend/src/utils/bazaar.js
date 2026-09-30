/*
 * Gaon Bazaar + Gallery ke shared constants / helpers
 */
import { formatCurrency } from "./formatCurrency";

export const LISTING_TYPES = [
  { value: "buy-sell", label: "Khareed-Bikri", icon: "🛒", closedLabel: "Bik gaya" },
  { value: "lost-found", label: "Khoya-Paya", icon: "🔍", closedLabel: "Mil gaya / Ho gaya" },
  { value: "equipment-rental", label: "Kiraya (Kheti saman)", icon: "🚜", closedLabel: "Kiraye pe chala gaya" },
];

export const RENTAL_UNITS = [
  { value: "hour", label: "per ghanta" },
  { value: "day", label: "per din" },
  { value: "week", label: "per hafta" },
  { value: "trip", label: "per trip" },
  { value: "other", label: "anya" },
];

export const GALLERY_CATEGORIES = [
  { value: "village", label: "Gaon" },
  { value: "festival", label: "Tyohar" },
  { value: "farming", label: "Kheti" },
  { value: "event", label: "Karyakram" },
  { value: "nature", label: "Prakriti" },
  { value: "other", label: "Anya" },
];

export const REVIEW_STATUS = {
  pending: { label: "Review ka intezaar", badge: "badge-yellow" },
  approved: { label: "Live — sabko dikh rahi hai", badge: "badge-green" },
  rejected: { label: "Admin ne hata di", badge: "badge-red" },
};

export const getTypeMeta = (value) =>
  LISTING_TYPES.find((t) => t.value === value) || LISTING_TYPES[0];

export const formatListingPrice = (listing) => {
  if (listing.type === "lost-found" || listing.price == null) return "";
  if (listing.type === "equipment-rental") {
    const unit = RENTAL_UNITS.find((u) => u.value === listing.priceUnit)?.label || "";
    return `${formatCurrency(listing.price)} ${unit}`.trim();
  }
  return formatCurrency(listing.price);
};