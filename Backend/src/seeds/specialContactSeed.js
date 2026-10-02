require("../config/env");

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const SpecialContact = require("../models/SpecialContact");

const KP = "Kakarcholi Gram Panchayat";
const JB = "Jainagar Block";
const KD = "Koderma District";
const ER = "Elected Representatives";
const NOPHONE = "Contact number will be added after verification.";
const PENDING = "Current name is being verified. It will be updated here once confirmed.";

// [group, role, name, displayOrder, extra fields]
const rows = [
  [KP, "Mukhiya", "Raj Kumar Yadav", 10, { about: NOPHONE }],
  [KP, "Panchayat Secretary", "Ranjit Rana", 11, { about: NOPHONE }],
  [KP, "Up-Mukhiya", "", 12, { isPending: true, about: PENDING }],
  [KP, "Ward Representatives", "Arun Kumar Singh", 13, { about: "From the available public listing. " + NOPHONE }],
  [KP, "Panchayat Villages", "Kakarcholi", 14, { kind: "place" }],
  [KP, "Panchayat Villages", "Bhinkudih", 15, { kind: "place" }],
  [KP, "Panchayat Villages", "Gamharbad", 16, { kind: "place" }],
  [KP, "Panchayat Villages", "Godakhar", 17, { kind: "place" }],
  [KP, "Panchayat Villages", "Mahuatand", 18, { kind: "place" }],
  [KP, "Panchayat Villages", "Paharpur", 19, { kind: "place" }],
  [KP, "Panchayat Villages", "Tarwan", 20, { kind: "place" }],

  [JB, "Pramukh", "Anju Devi", 21, { about: "Block Pramukh, Jainagar." }],
  [JB, "BDO", "Gautam Kumar", 22, { phone: "7050313069", email: "bdojainagar@gmail.com", about: "Block Development Officer." }],
  [JB, "CO", "Saransh Jain", 23, { phone: "8178078179", email: "cojainagar@gmail.com", about: "Circle Officer." }],
  [JB, "Jainagar PS", "Jainagar Police Station", 24, { phone: "9431706356", alternatePhone: "06534-263034", about: "Police station for Jainagar block. Office: 06534-263034." }],

  [KD, "DC", "Utkarsh Gupta, IAS", 30, { phone: "9934935997", about: "Deputy Commissioner, Koderma." }],
  [KD, "SP", "Kumar Shivashish, IPS", 31, { phone: "9431706350", about: "Superintendent of Police, Koderma." }],
  [KD, "DDC", "Ravi Jain, IAS", 32, { phone: "9431142461", about: "Deputy Development Commissioner, Koderma." }],
  [KD, "SDO", "Nirmal Soren", 33, { phone: "7992210492", about: "Sub-Divisional Officer." }],
  [KD, "Additional Collector", "Sanjay P. M. Kujur", 34, { phone: "8809292528" }],
  [KD, "District Panchayati Raj Officer", "Ram Ratan Barnwal", 35, { phone: "8709841023" }],

  [ER, "MP", "Smt. Annpurna Devi", 40, { email: "annpurnadevi.koderma@mpls.sansad.in", about: "Member of Parliament, Kodarma (BJP), 18th Lok Sabha." }],
  [ER, "MLA", "Dr. Neera Yadav", 41, { about: "Member of Legislative Assembly, Kodarma AC-19 (BJP)." }],
  [ER, "Zila Parishad Chairman", "Ramdhan Yadav", 42, { about: "Zila Parishad Chairman, Koderma." }],
  [ER, "Panchayat Samiti", "", 43, { isPending: true, about: "Current Kakarcholi-specific member: verify. The ward/constituency process for the 2027 Panchayat election is being updated, so older names are not shown as current." }],
];

const contacts = rows.map(([group, role, name, displayOrder, extra = {}]) => ({
  group,
  role,
  name,
  displayOrder,
  kind: "person",
  isPending: false,
  phone: "",
  alternatePhone: "",
  email: "",
  area: "",
  officeAddress: "",
  about: "",
  ...extra,
}));

const run = async () => {
  try {
    await connectDB();
    let created = 0;
    let skipped = 0;

    for (const data of contacts) {
      // Only ADD what is missing — never overwrite admin edits.
      const filter =
        data.kind === "place"
          ? { group: data.group, role: data.role, kind: "place", name: data.name }
          : { group: data.group, role: data.role, kind: "person" };

      if (await SpecialContact.exists(filter)) {
        skipped++;
        continue;
      }

      await SpecialContact.create({ ...data, isActive: true });
      created++;
    }

    console.log(`Special contacts seeded. Created: ${created}, Already present: ${skipped}, Total: ${contacts.length}`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Special contact seed failed:", error);
    try { await mongoose.connection.close(); } catch (_) {}
    process.exit(1);
  }
};

run();