const mongoose = require("mongoose");

const VillageFeature = require("../models/VillageFeature");

require("dotenv").config();

/*
|--------------------------------------------------------------------------
| Village
|--------------------------------------------------------------------------
*/

const VILLAGE_NAME = process.env.VILLAGE_NAME || "Kakarcholi";

/*
|--------------------------------------------------------------------------
| Seed Data
|--------------------------------------------------------------------------
|
| These records are initial data for the village portal.
|
*/

const villageFeatures = [
  // ========================================================================
  // GOVERNMENT SCHEMES
  // ========================================================================

  {
    title: "PM Awas Yojana",
    slug: "pm-awas-yojana",

    category: "scheme",

    description:
      "Government housing assistance scheme for eligible rural families.",

    shortDescription:
      "Check eligibility and apply for housing assistance.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: true,

    priority: 100,

    eligibility:
      "Eligibility depends on government scheme criteria and household status.",

    requiredDocuments: [
      "Aadhaar Card",
      "Bank Account Details",
      "Income/Eligibility Proof",
      "Address Proof",
    ],

    instructions: [
      "Check eligibility.",
      "Keep required documents ready.",
      "Submit the application.",
      "Track application status.",
    ],

    applicationEnabled: true,

    metadata: {
      serviceType: "government-scheme",
      department: "Rural Development",
    },
  },

  {
    title: "PM Ujjwala Yojana",
    slug: "pm-ujjwala-yojana",

    category: "scheme",

    description:
      "Government scheme providing LPG connection support to eligible households.",

    shortDescription:
      "Check LPG scheme eligibility and application information.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: true,

    priority: 95,

    eligibility:
      "Eligibility is determined according to applicable government guidelines.",

    requiredDocuments: [
      "Aadhaar Card",
      "Address Proof",
      "Bank Account Details",
      "Household Details",
    ],

    instructions: [
      "Check eligibility.",
      "Verify household information.",
      "Submit required documents.",
      "Track application status.",
    ],

    applicationEnabled: true,

    metadata: {
      serviceType: "government-scheme",
      department: "LPG / Government Scheme",
    },
  },

  {
    title: "Ayushman Bharat",
    slug: "ayushman-bharat",

    category: "scheme",

    description:
      "Health coverage related information and application assistance for eligible families.",

    shortDescription:
      "Check eligibility and access health scheme information.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: true,

    priority: 90,

    eligibility:
      "Eligibility depends on the applicable government beneficiary criteria.",

    requiredDocuments: [
      "Aadhaar Card",
      "Family Details",
      "Identity Proof",
    ],

    instructions: [
      "Check beneficiary eligibility.",
      "Verify family details.",
      "Submit required information.",
      "Track application or verification status.",
    ],

    applicationEnabled: true,

    metadata: {
      serviceType: "health-scheme",
      department: "Health",
    },
  },

  {
    title: "PM Kisan Samman Nidhi",
    slug: "pm-kisan-samman-nidhi",

    category: "scheme",

    description:
      "Farmer-focused government scheme information and application assistance.",

    shortDescription:
      "Farmers can check scheme information and application status.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: true,

    priority: 88,

    eligibility:
      "Eligibility depends on applicable PM-KISAN rules.",

    requiredDocuments: [
      "Aadhaar Card",
      "Bank Account Details",
      "Land Details",
      "Farmer Information",
    ],

    instructions: [
      "Verify farmer details.",
      "Keep land and bank information ready.",
      "Submit application information.",
      "Track status.",
    ],

    applicationEnabled: true,

    metadata: {
      serviceType: "farmer-scheme",
      department: "Agriculture",
    },
  },

  {
    title: "Pension Assistance",
    slug: "pension-assistance",

    category: "scheme",

    description:
      "Information and application assistance for eligible social security pension schemes.",

    shortDescription:
      "Check pension scheme information and application status.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: true,

    priority: 85,

    eligibility:
      "Eligibility depends on the applicable pension scheme and government guidelines.",

    requiredDocuments: [
      "Aadhaar Card",
      "Bank Account Details",
      "Age/Eligibility Proof",
      "Address Proof",
    ],

    instructions: [
      "Select the applicable pension scheme.",
      "Check eligibility.",
      "Submit required documents.",
      "Track application status.",
    ],

    applicationEnabled: true,

    metadata: {
      serviceType: "social-security",
      department: "Social Welfare",
    },
  },

  // ========================================================================
  // SCHOLARSHIP / EDUCATION
  // ========================================================================

  {
    title: "Scholarship Alerts",
    slug: "scholarship-alerts",

    category: "scholarship",

    description:
      "Village-level scholarship notifications, eligibility information and important deadlines.",

    shortDescription:
      "Find scholarship deadlines and application information.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: true,

    priority: 80,

    eligibility:
      "Eligibility varies according to the scholarship program.",

    requiredDocuments: [
      "Student ID",
      "Academic Marksheet",
      "Aadhaar Card",
      "Bank Account Details",
      "Income/Caste Certificate where applicable",
    ],

    instructions: [
      "Check scholarship eligibility.",
      "Check the last date.",
      "Prepare documents.",
      "Submit the application.",
    ],

    applicationEnabled: true,

    metadata: {
      serviceType: "education",
      department: "Education",
    },
  },

  {
    title: "Exam & Result Alerts",
    slug: "exam-result-alerts",

    category: "education",

    description:
      "Important examination dates, form deadlines and result notifications.",

    shortDescription:
      "Stay updated about exams, forms and results.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: false,

    priority: 70,

    applicationEnabled: false,

    metadata: {
      serviceType: "education",
      department: "Education",
    },
  },

  {
    title: "Skill Training Programs",
    slug: "skill-training-programs",

    category: "skill-training",

    description:
      "Information and enrollment support for skill development programs such as computer training, tailoring and other vocational courses.",

    shortDescription:
      "Find and enroll in available skill training programs.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: true,

    priority: 75,

    eligibility:
      "Eligibility depends on the specific training program.",

    requiredDocuments: [
      "Aadhaar Card",
      "Basic Identity Details",
      "Education Details where required",
    ],

    instructions: [
      "Select a training program.",
      "Check eligibility.",
      "Submit enrollment details.",
      "Wait for confirmation.",
    ],

    applicationEnabled: true,

    metadata: {
      serviceType: "training",
      department: "Skill Development",
    },
  },

  // ========================================================================
  // GRAM SABHA
  // ========================================================================

  {
    title: "Gram Sabha Meeting",
    slug: "gram-sabha-meeting",

    category: "gram-sabha",

    description:
      "View Gram Sabha meeting dates, agenda and attendance information.",

    shortDescription:
      "See meeting details and confirm your attendance.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: true,

    priority: 82,

    eligibility:
      "Village residents can view meeting information and RSVP where applicable.",

    instructions: [
      "Check meeting date.",
      "Read the agenda.",
      "Select attending or not attending.",
      "View meeting minutes after publication.",
    ],

    applicationEnabled: true,

    metadata: {
      serviceType: "community-meeting",
      department: "Gram Panchayat",
    },
  },

  // ========================================================================
  // BILL / TAX STATUS
  // ========================================================================

  {
    title: "House Tax Status",
    slug: "house-tax-status",

    category: "bill-tax",

    description:
      "View household property or house tax status and outstanding information.",

    shortDescription:
      "Check whether your house tax has pending dues.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: false,

    priority: 65,

    instructions: [
      "Open household tax status.",
      "Check current outstanding amount.",
      "Review payment status.",
      "Contact the concerned office for corrections.",
    ],

    applicationEnabled: false,

    metadata: {
      serviceType: "tax-status",
      paymentEnabled: false,
    },
  },

  {
    title: "Water Bill Status",
    slug: "water-bill-status",

    category: "bill-tax",

    description:
      "View water bill and pending dues information.",

    shortDescription:
      "Check your water bill status and outstanding amount.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: false,

    priority: 64,

    applicationEnabled: false,

    metadata: {
      serviceType: "water-bill",
      paymentEnabled: false,
    },
  },

  {
    title: "Electricity Bill Status",
    slug: "electricity-bill-status",

    category: "bill-tax",

    description:
      "View electricity bill status and pending information.",

    shortDescription:
      "Check electricity bill status from the village portal.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: false,

    priority: 63,

    applicationEnabled: false,

    metadata: {
      serviceType: "electricity-bill",
      paymentEnabled: false,
    },
  },

  // ========================================================================
  // FARMER SERVICES
  // ========================================================================

  {
    title: "Mandi Bhav",
    slug: "mandi-bhav",

    category: "farmer",

    description:
      "Daily crop market prices updated by the village administrator.",

    shortDescription:
      "Check the latest crop prices available in the village portal.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: true,

    priority: 78,

    applicationEnabled: false,

    metadata: {
      serviceType: "market-price",
      updateFrequency: "daily",
      adminManaged: true,
    },
  },

  {
    title: "Mausam aur Fasal Salah",
    slug: "weather-crop-advice",

    category: "farmer",

    description:
      "Weather information and practical crop advisory for farmers.",

    shortDescription:
      "View weather information and farming tips.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: true,

    priority: 77,

    applicationEnabled: false,

    metadata: {
      serviceType: "weather-advisory",
    },
  },

  {
    title: "Kheti Saman & Machine Rental",
    slug: "farm-equipment-rental",

    category: "equipment-rental",

    description:
      "Village board for renting and listing tractors, threshers, pumps and other agricultural equipment.",

    shortDescription:
      "Find or list farming equipment available for rent.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: true,

    priority: 76,

    applicationEnabled: true,

    metadata: {
      serviceType: "equipment-rental",
    },
  },

  {
    title: "Khaad & Beej Availability",
    slug: "fertilizer-seed-availability",

    category: "farmer",

    description:
      "Information about fertilizer and seed availability at local shops.",

    shortDescription:
      "Check which shop has required fertilizer or seeds.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: false,

    priority: 72,

    applicationEnabled: false,

    metadata: {
      serviceType: "agri-stock",
      adminManaged: true,
    },
  },

  // ========================================================================
  // HEALTH
  // ========================================================================

  {
    title: "Health Camps",
    slug: "health-camps",

    category: "health-camp",

    description:
      "Upcoming health camps, locations, services and registration information.",

    shortDescription:
      "Check upcoming health camps and registration details.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: true,

    priority: 79,

    applicationEnabled: true,

    metadata: {
      serviceType: "health-camp",
      department: "Health",
    },
  },

  {
    title: "Vaccination Reminders",
    slug: "vaccination-reminders",

    category: "vaccination",

    description:
      "Vaccination schedule and reminder information for children and families.",

    shortDescription:
      "Keep track of vaccination dates and reminders.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: true,

    priority: 74,

    applicationEnabled: true,

    metadata: {
      serviceType: "vaccination",
      department: "Health",
    },
  },

  {
    title: "Pashu Health & Dairy",
    slug: "animal-health-dairy",

    category: "animal-health",

    description:
      "Information about veterinary camps, animal health services and dairy-related records.",

    shortDescription:
      "Find veterinary camps and manage basic dairy information.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: false,

    priority: 68,

    applicationEnabled: true,

    metadata: {
      serviceType: "animal-health",
    },
  },

  // ========================================================================
  // VILLAGE DIRECTORY / DAILY LIFE
  // ========================================================================

  {
    title: "Village Directory",
    slug: "village-directory",

    category: "directory",

    description:
      "Directory of local doctors, teachers, electricians, mechanics, drivers, masons and other service providers.",

    shortDescription:
      "Find useful local service providers in the village.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: true,

    priority: 73,

    applicationEnabled: false,

    metadata: {
      serviceType: "local-directory",
    },
  },

  {
    title: "Transport Timetable",
    slug: "transport-timetable",

    category: "transport",

    description:
      "Bus, tempo and other local transport timing information.",

    shortDescription:
      "Check available village transport timings.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: false,

    priority: 60,

    applicationEnabled: false,

    metadata: {
      serviceType: "transport",
      adminManaged: true,
    },
  },

  {
    title: "Lost & Found",
    slug: "lost-and-found",

    category: "community",

    description:
      "Community board for reporting lost and found items.",

    shortDescription:
      "Post or find lost and found items in the village.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: false,

    priority: 55,

    applicationEnabled: false,

    metadata: {
      serviceType: "lost-found",
    },
  },

  {
    title: "Buy & Sell Board",
    slug: "buy-sell-board",

    category: "community",

    description:
      "Community marketplace for buying and selling used household, farming and other permitted items.",

    shortDescription:
      "Buy or sell useful items within the community.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: false,

    priority: 54,

    applicationEnabled: false,

    metadata: {
      serviceType: "community-marketplace",
    },
  },

  // ========================================================================
  // VOLUNTEER / SHRAMDAAN
  // ========================================================================

  {
    title: "Volunteer & Shramdaan",
    slug: "volunteer-shramdaan",

    category: "volunteer",

    description:
      "Register for village cleanliness drives, plantation programs and community activities.",

    shortDescription:
      "Join village volunteer and community activities.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: true,

    priority: 69,

    applicationEnabled: true,

    metadata: {
      serviceType: "volunteer",
      activities: [
        "Cleanliness Drive",
        "Tree Plantation",
        "Community Work",
        "Village Improvement",
      ],
    },
  },

  // ========================================================================
  // EMERGENCY
  // ========================================================================

  {
    title: "Emergency SOS",
    slug: "emergency-sos",

    category: "emergency",

    description:
      "One-tap emergency alert system for notifying village administrators and accessing emergency contacts.",

    shortDescription:
      "Send an emergency alert and quickly access emergency numbers.",

    villageName: VILLAGE_NAME,

    status: "active",
    isPublished: true,
    featured: true,

    priority: 100,

    applicationEnabled: false,

    metadata: {
      serviceType: "emergency-sos",

      emergencyNumbers: {
        ambulance: "108",
        police: "112",
        fire: "101",
        nationalEmergency: "112",
      },
    },
  },
];


/*
|--------------------------------------------------------------------------
| Links, Helplines & Contact Extras
|--------------------------------------------------------------------------
|
| Slug ke hisaab se har service me official portal, useful links,
| helpline aur department add hota hai. Internal links (/notices,
| /events, ...) is portal ke apne pages hain.
|
| NOTE: External URLs official portals ke hain. Kabhi portal change ho
| jaye to yahin ya Admin > Village Features se update kar sakte hain.
|
*/

const FEATURE_EXTRAS = {
  "pm-awas-yojana": {
    department: "Ministry of Rural Development",
    applicationUrl: "https://pmayg.nrega.nic.in/netiay/home.aspx",
    helplineNumber: "1800-11-6446",
    links: [
      { label: "PMAY-G Official Portal", url: "https://pmayg.nrega.nic.in/netiay/home.aspx", type: "official" },
      { label: "Rural Development Ministry", url: "https://rural.gov.in", type: "guideline" },
      { label: "Apni Gram Panchayat se sampark", url: "/government-contacts", type: "internal" },
      { label: "Meri application status", url: "/citizen/applications", type: "internal" },
    ],
  },

  "pm-ujjwala-yojana": {
    department: "Ministry of Petroleum & Natural Gas",
    applicationUrl: "https://www.pmuy.gov.in",
    helplineNumber: "1800-266-6696",
    links: [
      { label: "PMUY Official Portal", url: "https://www.pmuy.gov.in", type: "official" },
      { label: "LPG Gas Leak Emergency: 1906", url: "tel:1906", type: "helpline" },
      { label: "Meri application status", url: "/citizen/applications", type: "internal" },
    ],
  },

  "ayushman-bharat": {
    department: "National Health Authority",
    applicationUrl: "https://pmjay.gov.in",
    helplineNumber: "14555",
    links: [
      { label: "PM-JAY Official Portal", url: "https://pmjay.gov.in", type: "official" },
      { label: "Am I Eligible? (eligibility check)", url: "https://mera.pmjay.gov.in", type: "status" },
      { label: "Ayushman Card / ABHA (Health ID)", url: "https://abha.abdm.gov.in", type: "apply" },
      { label: "Helpline: 14555", url: "tel:14555", type: "helpline" },
    ],
  },

  "pm-kisan-samman-nidhi": {
    department: "Ministry of Agriculture & Farmers Welfare",
    applicationUrl: "https://pmkisan.gov.in",
    helplineNumber: "155261",
    links: [
      { label: "PM-KISAN Official Portal", url: "https://pmkisan.gov.in", type: "official" },
      { label: "Beneficiary Status", url: "https://pmkisan.gov.in/BeneficiaryStatus_New.aspx", type: "status" },
      { label: "Kisan Call Centre: 1800-180-1551", url: "tel:18001801551", type: "helpline" },
    ],
  },

  "pension-assistance": {
    department: "Social Welfare / NSAP",
    applicationUrl: "https://nsap.nic.in",
    helplineNumber: "",
    links: [
      { label: "NSAP (National Social Assistance Programme)", url: "https://nsap.nic.in", type: "official" },
      { label: "Panchayat se sampark", url: "/government-contacts", type: "internal" },
      { label: "Meri application status", url: "/citizen/applications", type: "internal" },
    ],
  },

  "scholarship-alerts": {
    department: "Ministry of Education",
    applicationUrl: "https://scholarships.gov.in",
    helplineNumber: "0120-6619540",
    links: [
      { label: "National Scholarship Portal (NSP)", url: "https://scholarships.gov.in", type: "apply" },
      { label: "Jharkhand Academic Council (JAC)", url: "https://jac.jharkhand.gov.in", type: "official" },
      { label: "Latest Notices", url: "/notices", type: "internal" },
    ],
  },

  "exam-result-alerts": {
    department: "Education Department",
    applicationUrl: "",
    helplineNumber: "",
    links: [
      { label: "JAC (Class 10th/12th Results)", url: "https://jac.jharkhand.gov.in", type: "official" },
      { label: "JSSC (State Jobs)", url: "https://www.jssc.nic.in", type: "official" },
      { label: "JPSC (State Civil Services)", url: "https://www.jpsc.gov.in", type: "official" },
      { label: "Jobs board (gaon ke liye)", url: "/jobs", type: "internal" },
    ],
  },

  "skill-training-programs": {
    department: "Skill Development",
    applicationUrl: "https://www.skillindiadigital.gov.in",
    helplineNumber: "08800055555",
    links: [
      { label: "Skill India Digital", url: "https://www.skillindiadigital.gov.in", type: "apply" },
      { label: "PMKVY Official", url: "https://www.pmkvyofficial.org", type: "official" },
      { label: "Helpline: 08800055555", url: "tel:08800055555", type: "helpline" },
    ],
  },

  "gram-sabha-meeting": {
    department: "Gram Panchayat",
    applicationUrl: "",
    helplineNumber: "",
    links: [
      { label: "eGramSwaraj (Panchayat planning & accounts)", url: "https://egramswaraj.gov.in", type: "official" },
      { label: "Ministry of Panchayati Raj", url: "https://panchayat.gov.in", type: "guideline" },
      { label: "Notices & Meeting Information", url: "/notices", type: "internal" },
      { label: "Village Events", url: "/events", type: "internal" },
    ],
  },

  "house-tax-status": {
    department: "Gram Panchayat",
    applicationUrl: "",
    helplineNumber: "",
    links: [
      { label: "eGramSwaraj", url: "https://egramswaraj.gov.in", type: "official" },
      { label: "Panchayat Karyalay se sampark", url: "/government-contacts", type: "internal" },
      { label: "Shikayat darj karein", url: "/citizen/complaints/create", type: "internal" },
    ],
  },

  "water-bill-status": {
    department: "Drinking Water & Sanitation",
    applicationUrl: "",
    helplineNumber: "",
    links: [
      { label: "Jal Jeevan Mission", url: "https://jaljeevanmission.gov.in", type: "official" },
      { label: "Paani ki shikayat darj karein", url: "/citizen/complaints/create", type: "internal" },
      { label: "Government Contacts", url: "/government-contacts", type: "internal" },
    ],
  },

  "electricity-bill-status": {
    department: "JBVNL (Jharkhand Bijli Vitran Nigam Ltd)",
    applicationUrl: "https://jbvnl.co.in",
    helplineNumber: "1912",
    links: [
      { label: "JBVNL Official Website (bill pay / complaint)", url: "https://jbvnl.co.in", type: "official" },
      { label: "Bijli complaint: 1912", url: "tel:1912", type: "helpline" },
      { label: "Toll free: 1800-345-6570", url: "tel:18003456570", type: "helpline" },
      { label: "Portal par shikayat darj karein", url: "/citizen/complaints/create", type: "internal" },
    ],
  },

  "mandi-bhav": {
    department: "Agricultural Marketing",
    applicationUrl: "https://enam.gov.in",
    helplineNumber: "1800-270-0224",
    links: [
      { label: "eNAM (National Agriculture Market)", url: "https://enam.gov.in", type: "official" },
      { label: "Agmarknet (daily mandi prices)", url: "https://agmarknet.gov.in", type: "status" },
      { label: "Kisan Call Centre: 1800-180-1551", url: "tel:18001801551", type: "helpline" },
    ],
  },

  "weather-crop-advice": {
    department: "IMD / Agriculture Department",
    applicationUrl: "",
    helplineNumber: "1800-180-1551",
    links: [
      { label: "IMD Mausam (weather forecast)", url: "https://mausam.imd.gov.in", type: "official" },
      { label: "mKisan (farmer advisories)", url: "https://mkisan.gov.in", type: "guideline" },
      { label: "Soil Health Card", url: "https://soilhealth.dac.gov.in", type: "apply" },
      { label: "Kisan Call Centre: 1800-180-1551", url: "tel:18001801551", type: "helpline" },
    ],
  },

  "farm-equipment-rental": {
    department: "Agriculture Department",
    applicationUrl: "https://agrimachinery.nic.in/",
    helplineNumber: "1800-180-1551",
    links: [
      { label: "Farm Machinery (subsidy & CHC)", url: "https://agrimachinery.nic.in/", type: "official" },
      { label: "Gaon Bazaar (kiraye ke liye)", url: "/gaon-bazaar", type: "internal" },
    ],
  },

  "fertilizer-seed-availability": {
    department: "Agriculture Department",
    applicationUrl: "",
    helplineNumber: "1800-180-1551",
    links: [
      { label: "Fertilizer Department", url: "https://fert.nic.in", type: "official" },
      { label: "Soil Health Card", url: "https://soilhealth.dac.gov.in", type: "apply" },
      { label: "Kisan Call Centre: 1800-180-1551", url: "tel:18001801551", type: "helpline" },
    ],
  },

  "health-camps": {
    department: "Health Department",
    applicationUrl: "",
    helplineNumber: "104",
    links: [
      { label: "National Health Mission", url: "https://nhm.gov.in", type: "official" },
      { label: "e-Sanjeevani (free online doctor)", url: "https://esanjeevani.mohfw.gov.in", type: "app" },
      { label: "ABHA Health ID", url: "https://abha.abdm.gov.in", type: "apply" },
      { label: "Health Helpline: 104", url: "tel:104", type: "helpline" },
    ],
  },

  "vaccination-reminders": {
    department: "Health Department",
    applicationUrl: "https://www.uwin.mohfw.gov.in",
    helplineNumber: "1075",
    links: [
      { label: "U-WIN (child vaccination record)", url: "https://www.uwin.mohfw.gov.in", type: "official" },
      { label: "National Health Mission", url: "https://nhm.gov.in", type: "guideline" },
      { label: "Health Helpline: 1075", url: "tel:1075", type: "helpline" },
    ],
  },

  "animal-health-dairy": {
    department: "Animal Husbandry & Dairying",
    applicationUrl: "https://dahd.gov.in",
    helplineNumber: "1962",
    links: [
      { label: "Dept. of Animal Husbandry & Dairying", url: "https://dahd.gov.in", type: "official" },
      { label: "Pashu Health Helpline: 1962", url: "tel:1962", type: "helpline" },
      { label: "Gaon Bazaar (pashu khareed-bikri)", url: "/gaon-bazaar", type: "internal" },
    ],
  },

  "village-directory": {
    department: "Gram Panchayat",
    applicationUrl: "",
    helplineNumber: "",
    links: [
      { label: "Government Contacts", url: "/government-contacts", type: "internal" },
      { label: "Local Businesses", url: "/businesses", type: "internal" },
      { label: "Gaon ke baare me", url: "/about", type: "internal" },
      { label: "Contact Village", url: "/contact", type: "internal" },
    ],
  },

  "transport-timetable": {
    department: "Transport",
    applicationUrl: "",
    helplineNumber: "139",
    links: [
      { label: "Indian Railways Enquiry (NTES)", url: "https://enquiry.indianrail.gov.in", type: "status" },
      { label: "IRCTC (ticket booking)", url: "https://www.irctc.co.in", type: "apply" },
      { label: "Parivahan (licence / vehicle services)", url: "https://parivahan.gov.in", type: "official" },
      { label: "Railway Helpline: 139", url: "tel:139", type: "helpline" },
    ],
  },

  "lost-and-found": {
    department: "Gram Panchayat",
    applicationUrl: "",
    helplineNumber: "112",
    links: [
      { label: "Gaon Bazaar (Lost & Found)", url: "/gaon-bazaar", type: "internal" },
      { label: "Village Community", url: "/community", type: "internal" },
      { label: "Emergency: 112", url: "tel:112", type: "helpline" },
    ],
  },

  "buy-sell-board": {
    department: "Community",
    applicationUrl: "",
    helplineNumber: "",
    links: [
      { label: "Gaon Bazaar (kharido-becho)", url: "/gaon-bazaar", type: "internal" },
      { label: "Meri Bazaar posts", url: "/citizen/bazaar", type: "internal" },
    ],
  },

  "volunteer-shramdaan": {
    department: "Gram Panchayat / Youth Affairs",
    applicationUrl: "https://mybharat.gov.in",
    helplineNumber: "",
    links: [
      { label: "MY Bharat (youth volunteering)", url: "https://mybharat.gov.in", type: "apply" },
      { label: "Village Events", url: "/events", type: "internal" },
      { label: "Community", url: "/community", type: "internal" },
    ],
  },

  "emergency-sos": {
    department: "Emergency Services",
    applicationUrl: "",
    helplineNumber: "112",
    links: [
      { label: "Emergency SOS bhejein", url: "/citizen/sos", type: "internal" },
      { label: "Emergency Contacts", url: "/emergency", type: "internal" },
      { label: "Call 112 (all emergencies)", url: "tel:112", type: "helpline" },
      { label: "Call 108 (ambulance)", url: "tel:108", type: "helpline" },
    ],
  },
};

/*
|--------------------------------------------------------------------------
| Merge extras into every feature
|--------------------------------------------------------------------------
*/

villageFeatures.forEach((feature, index) => {
  const extra = FEATURE_EXTRAS[feature.slug];

  if (extra) {
    villageFeatures[index] = {
      ...feature,
      ...extra,
    };
  }
});

/*
|--------------------------------------------------------------------------
| Seed Function
|--------------------------------------------------------------------------
*/

const seedVillageFeatures =
  async () => {
    try {
      /*
       * Make sure MongoDB is connected.
       */

      if (
        mongoose.connection.readyState !==
        1
      ) {
        await mongoose.connect(
          process.env.MONGO_URI
        );
      }

      console.log(
        "MongoDB connected for village feature seed"
      );

      let created = 0;
      let updated = 0;

      /*
       * Upsert every feature using slug.
       *
       * This prevents duplicate records
       * when seed is executed multiple times.
       */

      for (const feature of villageFeatures) {
        /*
         * Match by slug OR title. Purane records me slug save nahi
         * hota tha (schema me field nahi tha), isliye title se bhi
         * match karte hain taaki reseed pe duplicates na bane.
         */
        const existing =
          await VillageFeature.findOne({
            villageName:
              feature.villageName,
            $or: [
              { slug: feature.slug },
              { title: feature.title },
            ],
          });

        if (existing) {
          await VillageFeature.findByIdAndUpdate(
            existing._id,
            {
              $set: feature,
            },
            {
              new: true,
              runValidators: true,
            }
          );

          updated++;

          console.log(
            `Updated: ${feature.title}`
          );
        } else {
          await VillageFeature.create(
            feature
          );

          created++;

          console.log(
            `Created: ${feature.title}`
          );
        }
      }

      console.log(
        "\n----------------------------------------"
      );

      console.log(
        "Village feature seed completed"
      );

      console.log(
        `Created: ${created}`
      );

      console.log(
        `Updated: ${updated}`
      );

      console.log(
        `Total features: ${villageFeatures.length}`
      );

      console.log(
        "----------------------------------------\n"
      );

      return {
        created,
        updated,
        total:
          villageFeatures.length,
      };
    } catch (error) {
      console.error(
        "Village feature seed failed:",
        error.message
      );

      throw error;
    }
  };

/*
|--------------------------------------------------------------------------
| Run Directly
|--------------------------------------------------------------------------
|
| node src/seeds/villageFeaturesSeed.js
|
|--------------------------------------------------------------------------
*/

if (
  require.main === module
) {
  seedVillageFeatures()
    .then(async () => {
      await mongoose.connection.close();

      console.log(
        "Database connection closed."
      );

      process.exit(0);
    })
    .catch(async (error) => {
      console.error(error);

      try {
        await mongoose.connection.close();
      } catch (closeError) {
        console.error(
          "Database close error:",
          closeError.message
        );
      }

      process.exit(1);
    });
}

module.exports = {
  villageFeatures,
  seedVillageFeatures,
};