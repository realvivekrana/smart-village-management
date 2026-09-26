require("../config/env");

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const GovernmentContact = require("../models/GovernmentContact");

const governmentContacts = [
  // =====================================================
  // EMERGENCY
  // =====================================================

  {
    name: "Police Emergency",
    designation: "Emergency Police Service",
    department: "Police",
    category: "Emergency",
    office: "Emergency Services",
    phone: "100",
    alternatePhone: "112",
    email: "",
    address: "Koderma District, Jharkhand",
    description:
      "For immediate police assistance and emergency situations.",
    website: "",
    isEmergency: true,
    isFeatured: true,
    isActive: true,
    displayOrder: 1,
    source: "Koderma District Administration",
    lastVerifiedAt: new Date(),
  },

  {
    name: "Women Helpline",
    designation: "Women Emergency Helpline",
    department: "Women & Child Support",
    category: "Emergency",
    office: "Women Helpline",
    phone: "1091",
    alternatePhone: "181",
    email: "",
    address: "Koderma District, Jharkhand",
    description:
      "Helpline for women requiring emergency assistance and support.",
    website: "",
    isEmergency: true,
    isFeatured: true,
    isActive: true,
    displayOrder: 2,
    source: "Koderma District Administration",
    lastVerifiedAt: new Date(),
  },

  {
    name: "Child Helpline",
    designation: "Child Emergency Helpline",
    department: "Child Protection Services",
    category: "Emergency",
    office: "Child Helpline",
    phone: "1098",
    alternatePhone: "",
    email: "",
    address: "Koderma District, Jharkhand",
    description:
      "Emergency support and assistance for children.",
    website: "",
    isEmergency: true,
    isFeatured: true,
    isActive: true,
    displayOrder: 3,
    source: "Koderma District Administration",
    lastVerifiedAt: new Date(),
  },

  {
    name: "Koderma District Control Room",
    designation: "District Control Room",
    department: "District Administration",
    category: "Emergency",
    office: "Koderma District Control Room",
    phone: "06534-252685",
    alternatePhone: "",
    email: "",
    address: "Koderma District, Jharkhand",
    description:
      "District-level control room for public assistance and emergency coordination.",
    website: "",
    isEmergency: true,
    isFeatured: true,
    isActive: true,
    displayOrder: 4,
    source: "Koderma District Administration",
    lastVerifiedAt: new Date(),
  },

  // =====================================================
  // DISTRICT ADMINISTRATION
  // =====================================================

  {
    name: "Utkarsh Gupta",
    designation: "Deputy Commissioner",
    department: "District Administration",
    category: "District Administration",
    office: "Deputy Commissioner Office, Koderma",
    phone: "9934935997",
    alternatePhone: "",
    email: "",
    address: "Collectorate, Koderma, Jharkhand",
    description:
      "District administration and coordination at the district level.",
    website: "",
    isEmergency: false,
    isFeatured: true,
    isActive: true,
    displayOrder: 10,
    source: "Koderma District Administration",
    lastVerifiedAt: new Date(),
  },

  {
    name: "Kumar Shivashish",
    designation: "Superintendent of Police",
    department: "Police",
    category: "District Administration",
    office: "Superintendent of Police Office, Koderma",
    phone: "9431706350",
    alternatePhone: "",
    email: "",
    address: "Koderma, Jharkhand",
    description:
      "District police administration and law-and-order coordination.",
    website: "",
    isEmergency: false,
    isFeatured: true,
    isActive: true,
    displayOrder: 11,
    source: "Koderma District Administration",
    lastVerifiedAt: new Date(),
  },

  {
    name: "Ravi Jain",
    designation: "Deputy Development Commissioner",
    department: "Rural Development",
    category: "District Administration",
    office: "DDC Office, Koderma",
    phone: "9431142461",
    alternatePhone: "",
    email: "",
    address: "Collectorate, Koderma, Jharkhand",
    description:
      "District-level rural development and development programme coordination.",
    website: "",
    isEmergency: false,
    isFeatured: true,
    isActive: true,
    displayOrder: 12,
    source: "Koderma District Administration",
    lastVerifiedAt: new Date(),
  },

  {
    name: "Sanjay P.M. Kujur",
    designation: "Additional Collector",
    department: "District Administration",
    category: "District Administration",
    office: "Additional Collector Office, Koderma",
    phone: "8809292528",
    alternatePhone: "",
    email: "",
    address: "Collectorate, Koderma, Jharkhand",
    description:
      "District-level administrative services and coordination.",
    website: "",
    isEmergency: false,
    isFeatured: false,
    isActive: true,
    displayOrder: 13,
    source: "Koderma District Administration",
    lastVerifiedAt: new Date(),
  },

  {
    name: "Yesmita Singh",
    designation: "Land Reforms Deputy Collector",
    department: "Revenue & Land Reforms",
    category: "District Administration",
    office: "Land Reforms Office, Koderma",
    phone: "8674846002",
    alternatePhone: "",
    email: "",
    address: "Koderma, Jharkhand",
    description:
      "Land revenue and land reforms related administrative services.",
    website: "",
    isEmergency: false,
    isFeatured: false,
    isActive: true,
    displayOrder: 14,
    source: "Koderma District Administration",
    lastVerifiedAt: new Date(),
  },

  // =====================================================
  // JAINAGAR BLOCK
  // =====================================================

  {
    name: "Gautam Kumar",
    designation: "Block Development Officer",
    department: "Rural Development",
    category: "Block Administration",
    office: "Block Development Office, Jainagar",
    phone: "7050313069",
    alternatePhone: "",
    email: "bdojainagar@gmail.com",
    address: "Jainagar, Koderma, Jharkhand - 825109",
    description:
      "Block-level development administration, rural development programmes and public welfare services.",
    website: "",
    isEmergency: false,
    isFeatured: true,
    isActive: true,
    displayOrder: 20,
    source: "Koderma District Administration",
    lastVerifiedAt: new Date(),
  },

  {
    name: "Saransh Jain",
    designation: "Circle Officer",
    department: "Revenue & Land Administration",
    category: "Block Administration",
    office: "Circle Office, Jainagar",
    phone: "8178078179",
    alternatePhone: "",
    email: "cojainagar@gmail.com",
    address: "Jainagar, Koderma, Jharkhand",
    description:
      "Revenue, land records, certificates and circle-level administrative services.",
    website: "",
    isEmergency: false,
    isFeatured: true,
    isActive: true,
    displayOrder: 21,
    source: "Koderma District Administration",
    lastVerifiedAt: new Date(),
  },

  // =====================================================
  // HEALTH
  // =====================================================

  {
    name: "Civil Surgeon, Koderma",
    designation: "Civil Surgeon",
    department: "Health Department",
    category: "Health",
    office: "Civil Surgeon Office, Koderma",
    phone: "06534-255845",
    alternatePhone: "",
    email: "",
    address: "Koderma, Jharkhand",
    description:
      "District-level public health administration and government health services.",
    website: "",
    isEmergency: false,
    isFeatured: true,
    isActive: true,
    displayOrder: 30,
    source: "Koderma District Administration",
    lastVerifiedAt: new Date(),
  },

  {
    name: "Community Health Centre Jainagar",
    designation: "Government Health Facility",
    department: "Health Department",
    category: "Health",
    office: "CHC Jainagar",
    phone: "",
    alternatePhone: "",
    email: "",
    address: "Jainagar, Koderma, Jharkhand",
    description:
      "Government healthcare facility serving residents of Jainagar and surrounding rural areas.",
    website: "",
    isEmergency: false,
    isFeatured: true,
    isActive: true,
    displayOrder: 31,
    source: "Koderma District Administration",
    lastVerifiedAt: new Date(),
  },

  // =====================================================
  // EDUCATION
  // =====================================================

  {
    name: "District Education Officer, Koderma",
    designation: "District Education Officer",
    department: "Education Department",
    category: "Education",
    office: "District Education Office, Koderma",
    phone: "06534-252798",
    alternatePhone: "",
    email: "",
    address: "Koderma, Jharkhand",
    description:
      "District-level school education administration and educational services.",
    website: "",
    isEmergency: false,
    isFeatured: false,
    isActive: true,
    displayOrder: 40,
    source: "Koderma District Administration",
    lastVerifiedAt: new Date(),
  },

  {
    name: "District Superintendent of Education, Koderma",
    designation: "District Superintendent of Education",
    department: "Education Department",
    category: "Education",
    office: "District Education Office, Koderma",
    phone: "06534-252814",
    alternatePhone: "",
    email: "",
    address: "Koderma, Jharkhand",
    description:
      "District-level administration and supervision of elementary education services.",
    website: "",
    isEmergency: false,
    isFeatured: false,
    isActive: true,
    displayOrder: 41,
    source: "Koderma District Administration",
    lastVerifiedAt: new Date(),
  },

  // =====================================================
  // AGRICULTURE
  // =====================================================

  {
    name: "District Agriculture Officer, Koderma",
    designation: "District Agriculture Officer",
    department: "Agriculture Department",
    category: "Agriculture",
    office: "District Agriculture Office, Koderma",
    phone: "9934156377",
    alternatePhone: "",
    email: "",
    address: "Koderma, Jharkhand",
    description:
      "Agricultural schemes, farmer support and district agriculture services.",
    website: "",
    isEmergency: false,
    isFeatured: false,
    isActive: true,
    displayOrder: 50,
    source: "Koderma District Administration",
    lastVerifiedAt: new Date(),
  },

  // =====================================================
  // TRANSPORT
  // =====================================================

  {
    name: "District Transport Officer, Koderma",
    designation: "District Transport Officer",
    department: "Transport Department",
    category: "Transport",
    office: "District Transport Office, Koderma",
    phone: "7782063794",
    alternatePhone: "",
    email: "",
    address: "Koderma, Jharkhand",
    description:
      "Vehicle registration, transport-related administration and district transport services.",
    website: "",
    isEmergency: false,
    isFeatured: false,
    isActive: true,
    displayOrder: 60,
    source: "Koderma District Administration",
    lastVerifiedAt: new Date(),
  },

  // =====================================================
  // GOVERNMENT SERVICES
  // =====================================================

  {
    name: "JharSewa",
    designation: "Citizen Service Portal",
    department: "Government Services",
    category: "Government Services",
    office: "JharSewa",
    phone: "06534-252116",
    alternatePhone: "",
    email: "",
    address: "Jharkhand Government Citizen Services",
    description:
      "Online citizen services and government certificate-related services.",
    website: "https://jharsewa.jharkhand.gov.in/",
    isEmergency: false,
    isFeatured: true,
    isActive: true,
    displayOrder: 70,
    source: "Koderma District Administration",
    lastVerifiedAt: new Date(),
  },

  {
    name: "Jansamvad",
    designation: "Public Grievance Helpline",
    department: "Government Services",
    category: "Government Services",
    office: "Jharkhand Public Grievance Service",
    phone: "181",
    alternatePhone: "",
    email: "",
    address: "Jharkhand Government",
    description:
      "Public grievance and citizen assistance service.",
    website: "",
    isEmergency: false,
    isFeatured: true,
    isActive: true,
    displayOrder: 71,
    source: "Koderma District Administration",
    lastVerifiedAt: new Date(),
  },

  // =====================================================
  // LEGAL
  // =====================================================

  {
    name: "Principal District Judge, Koderma",
    designation: "Principal District Judge",
    department: "District Judiciary",
    category: "Legal",
    office: "District Court, Koderma",
    phone: "06534-252515",
    alternatePhone: "",
    email: "",
    address: "District Court, Koderma, Jharkhand - 825410",
    description:
      "District-level judicial administration and court services.",
    website: "",
    isEmergency: false,
    isFeatured: false,
    isActive: true,
    displayOrder: 80,
    source: "Koderma District Administration",
    lastVerifiedAt: new Date(),
  },
];

/**
 * Seed government contacts
 */
const seedGovernmentContacts = async () => {
  try {
    await connectDB();

    console.log(
      "\n🌱 Starting government contacts seed...\n"
    );

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const contactData of governmentContacts) {
      const existing = await GovernmentContact.findOne({
        name: contactData.name,
        designation: contactData.designation,
        office: contactData.office,
      });

      if (existing) {
        Object.assign(existing, contactData);

        await existing.save();

        updated++;

        console.log(
          `🔄 Updated: ${contactData.name} - ${contactData.designation}`
        );
      } else {
        await GovernmentContact.create(contactData);

        created++;

        console.log(
          `✅ Created: ${contactData.name} - ${contactData.designation}`
        );
      }
    }

    console.log("\n========================================");
    console.log("      GOVERNMENT CONTACT SEED");
    console.log("========================================");
    console.log(`Total contacts : ${governmentContacts.length}`);
    console.log(`Created        : ${created}`);
    console.log(`Updated        : ${updated}`);
    console.log(`Skipped        : ${skipped}`);
    console.log("========================================\n");

    await mongoose.connection.close();

    console.log(
      "✅ Government contacts seeded successfully."
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "\n❌ Government contact seed failed:"
    );

    console.error(error);

    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error(
        "MongoDB close error:",
        closeError.message
      );
    }

    process.exit(1);
  }
};

seedGovernmentContacts();