export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
export const APP_NAME = import.meta.env.VITE_APP_NAME || "Smart Village Management";

export const ROLES = {
  CITIZEN: "citizen",
  BUSINESS_OWNER: "business_owner",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};

export const COMPLAINT_STATUSES = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  REJECTED: "rejected",
  CLOSED: "closed",
};

export const COMPLAINT_CATEGORIES = [
  { value: "road", label: "Road" },
  { value: "water", label: "Water Supply" },
  { value: "electricity", label: "Electricity" },
  { value: "sanitation", label: "Sanitation" },
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "agriculture", label: "Agriculture" },
  { value: "security", label: "Security" },
  { value: "noise", label: "Noise" },
  { value: "environment", label: "Environment" },
  { value: "other", label: "Other" },
];

export const BUSINESS_CATEGORIES = [
  { value: "grocery", label: "Grocery" },
  { value: "restaurant", label: "Restaurant / Dhaba" },
  { value: "medical", label: "Medical / Pharmacy" },
  { value: "hardware", label: "Hardware" },
  { value: "clothing", label: "Clothing" },
  { value: "electronics", label: "Electronics" },
  { value: "agriculture", label: "Agriculture" },
  { value: "dairy", label: "Dairy" },
  { value: "transport", label: "Transport" },
  { value: "education", label: "Education / Tuition" },
  { value: "beauty", label: "Beauty / Salon" },
  { value: "repair", label: "Repair / Service" },
  { value: "other", label: "Other" },
];

export const JOB_CATEGORIES = [
  { value: "agriculture", label: "Agriculture" },
  { value: "construction", label: "Construction" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail" },
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "it", label: "IT / Tech" },
  { value: "government", label: "Government" },
  { value: "domestic", label: "Domestic" },
  { value: "transportation", label: "Transportation" },
  { value: "other", label: "Other" },
];

export const JOB_TYPES = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "seasonal", label: "Seasonal" },
  { value: "internship", label: "Internship" },
];

export const EVENT_CATEGORIES = [
  { value: "cultural", label: "Cultural" },
  { value: "religious", label: "Religious" },
  { value: "sports", label: "Sports" },
  { value: "health", label: "Health Camp" },
  { value: "education", label: "Education" },
  { value: "agriculture", label: "Agriculture" },
  { value: "government", label: "Government" },
  { value: "environment", label: "Environment" },
  { value: "social", label: "Social" },
  { value: "other", label: "Other" },
];

export const NOTICE_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "agriculture", label: "Agriculture" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "water", label: "Water" },
  { value: "electricity", label: "Electricity" },
  { value: "sanitation", label: "Sanitation" },
  { value: "disaster", label: "Disaster Alert" },
  { value: "government_scheme", label: "Government Scheme" },
  { value: "other", label: "Other" },
];

export const SERVICE_CATEGORIES = [
  { value: "certificate", label: "Certificate" },
  { value: "license", label: "License" },
  { value: "utility", label: "Utility" },
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "social_welfare", label: "Social Welfare" },
  { value: "agriculture", label: "Agriculture" },
  { value: "land_records", label: "Land Records" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "other", label: "Other" },
];

export const EMERGENCY_CATEGORIES = [
  { value: "police", label: "Police" },
  { value: "fire", label: "Fire" },
  { value: "ambulance", label: "Ambulance" },
  { value: "hospital", label: "Hospital" },
  { value: "electricity", label: "Electricity" },
  { value: "water", label: "Water" },
  { value: "panchayat", label: "Panchayat" },
  { value: "disaster_relief", label: "Disaster Relief" },
  { value: "women_helpline", label: "Women Helpline" },
  { value: "child_helpline", label: "Child Helpline" },
  { value: "other", label: "Other" },
];

export const PRIORITY_COLORS = {
  low: "badge-gray",
  normal: "badge-blue",
  medium: "badge-yellow",
  high: "badge-yellow",
  urgent: "badge-red",
};

export const STATUS_COLORS = {
  pending: "badge-yellow",
  in_progress: "badge-blue",
  resolved: "badge-green",
  approved: "badge-green",
  rejected: "badge-red",
  closed: "badge-gray",
  suspended: "badge-red",
};

export const COMMUNITY_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "help", label: "Need Help" },
  { value: "sell", label: "Sell" },
  { value: "buy", label: "Buy" },
  { value: "lost_found", label: "Lost & Found" },
  { value: "announcement", label: "Announcement" },
  { value: "question", label: "Question" },
  { value: "event", label: "Event" },
  { value: "other", label: "Other" },
];
