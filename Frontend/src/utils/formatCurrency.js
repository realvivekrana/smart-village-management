export const formatCurrency = (amount, currency = "INR") => {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatSalaryRange = (salary) => {
  if (!salary) return "Not disclosed";
  if (salary.isFree || salary.amount === 0) return "Free";
  const { min, max, period, isNegotiable } = salary;
  const periodLabel = {
    per_day: "/day",
    per_week: "/week",
    per_month: "/month",
    per_year: "/year",
    fixed: " fixed",
  }[period] || "";

  let str = "";
  if (min && max) str = `${formatCurrency(min)} – ${formatCurrency(max)}`;
  else if (min) str = `From ${formatCurrency(min)}`;
  else if (max) str = `Up to ${formatCurrency(max)}`;
  else return isNegotiable ? "Negotiable" : "Not disclosed";

  return `${str}${periodLabel}${isNegotiable ? " (Negotiable)" : ""}`;
};
