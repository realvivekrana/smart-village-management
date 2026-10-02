require("../config/env");

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const SpecialContact = require("../models/SpecialContact");

/*
 * Starter data for the Special Contacts tree.
 * Safe to run again — it only adds what is missing and never overwrites admin edits.
 * After seeding, everything is managed from Admin > Special Contacts.
 *
 * Mobile numbers that are only available in masked form are left blank on
 * purpose (Mukhiya, Secretary, Ward Member). Fill them from the admin panel
 * once verified with the Panchayat.
 */
const contacts = [
  // ---------------- KAKARCHOLI GRAM PANCHAYAT ----------------
  {
    group: "Kakarcholi Gram Panchayat",
    role: "Mukhiya",
    name: "Raj Kumar Yadav",
    kind: "person",
    isPending: false,
    phone: "",
    alternatePhone: "",
    email: "",
    area: "",
    officeAddress: "",
    about: "Contact number will be added after verification.",
    displayOrder: 10,
  },
  {
    group: "Kakarcholi Gram Panchayat",
    role: "Panchayat Secretary",
    name: "Ranjit Rana",
    kind: "person",
    isPending: false,
    phone: "",
    alternatePhone: "",
    email: "",
    area: "",
    officeAddress: "",
    about: "Contact number will be added after verification.",
    displayOrder: 11,
  },
  {
    group: "Kakarcholi Gram Panchayat",
    role: "Up-Mukhiya",
    name: "",
    kind: "person",
    isPending: true,
    phone: "",
    alternatePhone: "",
    email: "",
    area: "",
    officeAddress: "",
    about: "Current name is being verified. It will be updated here once confirmed.",
    displayOrder: 12,
  },
  {
    group: "Kakarcholi Gram Panchayat",
    role: "Ward Representatives",
    name: "Arun Kumar Singh",
    kind: "person",
    isPending: false,
    phone: "",
    alternatePhone: "",
    email: "",
    area: "",
    officeAddress: "",
    about: "From the available public listing. Contact number will be added after verification.",
    displayOrder: 13,
  },
  {
    group: "Kakarcholi Gram Panchayat",
    role: "Panchayat Villages",
    name: "Kakarcholi",
    kind: "place",
    isPending: false,
    phone: "",
    alternatePhone: "",
    email: "",
    area: "",
    officeAddress: "",
    about: "",
    displayOrder: 14,
  },
  {
    group: "Kakarcholi Gram Panchayat",
    role: "Panchayat Villages",
    name: "Bhinkudih",
    kind: "place",
    isPending: false,
    phone: "",
    alternatePhone: "",
    email: "",
    area: "",
    officeAddress: "",
    about: "",
    displayOrder: 15,
  },
  {
    group: "Kakarcholi Gram Panchayat",
    role: "Panchayat Villages",
    name: "Gamharbad",
    kind: "place",
    isPending: false,
    phone: "",
    alternatePhone: "",
    email: "",
    area: "",
    officeAddress: "",
    about: "",
    displayOrder: 16,
  },
  {
    group: "Kakarcholi Gram Panchayat",
    role: "Panchayat Villages",
    name: "Godakhar",
    kind: "place",
    isPending: false,
    phone: "",
    alternatePhone: "",
    email: "",
    area: "",
    officeAddress: "",
    about: "",
    displayOrder: 17,
  },
  {
    group: "Kakarcholi Gram Panchayat",
    role: "Panchayat Villages",
    name: "Mahuatand",
    kind: "place",
    isPending: false,
    phone: "",
    alternatePhone: "",
    email: "",
    area: "",
    officeAddress: "",
    about: "",
    displayOrder: 18,
  },
  {
    group: "Kakarcholi Gram Panchayat",
    role: "Panchayat Villages",
    name: "Paharpur",
    kind: "place",
    isPending: false,
    phone: "",
    alternatePhone: "",
    email: "",
    area: "",
    officeAddress: "",
    about: "",
    displayOrder: 19,
  },
  {
    group: "Kakarcholi Gram Panchayat",
    role: "Panchayat Villages",
    name: "Tarwan",
    kind: "place",
    isPending: false,
    phone: "",
    alternatePhone: "",
    email: "",
    area: "",
    officeAddress: "",
    about: "",
    displayOrder: 20,
  },

  // ---------------- JAINAGAR BLOCK ----------------
  {
    group: "Jainagar Block",
    role: "Pramukh",
    name: "Anju Devi",
    kind: "person",
    isPending: false,
    phone: "",
    alternatePhone: "",
    email: "",
    area: "",
    officeAddress: "",
    about: "Block Pramukh, Jainagar.",
    displayOrder: 21,
  },
  {
    group: "Jainagar Block",
    role: "BDO",
    name: "Gautam Kumar",
    kind: "person",
    isPending: false,
    phone: "7050313069",
    alternatePhone: "",
    email: "bdojainagar@gmail.com",
    area: "",
    officeAddress: "",
    about: "Block Development Officer.",
    displayOrder: 22,
  },
  {
    group: "Jainagar Block",
    role: "CO",
    name: "Saransh Jain",
    kind: "person",
    isPending: false,
    phone: "8178078179",
    alternatePhone: "",
    email: "cojainagar@gmail.com",
    area: "",
    officeAddress: "",
    about: "Circle Officer.",
    displayOrder: 23,
  },
  {
    group: "Jainagar Block",
    role: "Jainagar PS",
    name: "Jainagar Police Station",
    kind: "person",
    isPending: false,
    phone: "9431706356",
    alternatePhone: "06534-263034",
    email: "",
    area: "",
    officeAddress: "",
    about: "Police station for Jainagar block. Office: 06534-263034.",
    displayOrder: 24,
  },

  // ---------------- KODERMA DISTRICT ----------------
  {
    group: "Koderma District",
    role: "DC",
    name: "Utkarsh Gupta, IAS",
    kind: "person",
    isPending: false,
    phone: "9934935997",
    alternatePhone: "",
    email: "",
    area: "",
    officeAddress: "",
    about: "Deputy Commissioner, Koderma.",
    displayOrder: 30,
  },
  {
    group: "Koderma District",
    role: "SP",
    name: "Kumar Shivashish, IPS",
    kind: "person",
    isPending: false,
    phone: "9431706350",
    alternatePhone: "",
    email: "",
    area: "",
    officeAddress: "",
    about: "Superintendent of Police, Koderma.",
    displayOrder: 31,
  },
  {
    group: "Koderma District",
    role: "DDC",
    name: "Ravi Jain, IAS",
    kind: "person",
    isPending: false,
    phone: "9431142461",
    alternatePhone: "",
    email: "",
    area: "",
    officeAddress: "",
    about: "Deputy Development Commissioner, Koderma.",
    displayOrder: 32,
  },
  {
    group: "Koderma District",
    role: "SDO",
    name: "Nirmal Soren",
    kind: "person",
    isPending: false,
    phone: "7992210492",
    alternatePhone: "",
    email: "",
    area: "",
    officeAddress: "",
    about: "Sub-Divisional Officer.",
    displayOrder: 33,
  },
  {
    group: "Koderma District",
    role: "Additional Collector",
    name: "Sanjay P. M. Kujur",
    kind: "person",
    isPending: false,
    phone: "8809292528",
    alternatePhone: "",
    email: "",
    area: "",
    officeAddress: "",
    about: "",
    displayOrder: 34,
  },
  {
    group: "Koderma District",
    role: "District Panchayati Raj Officer",
    name: "Ram Ratan Barnwal",
    kind: "person",
    isPending: false,
    phone: "8709841023",
    alternatePhone: "",
    email: "",
    area: "",
    officeAddress: "",
    about: "",
    displayOrder: 35,
  },

  // ---------------- ELECTED REPRESENTATIVES ----------------
  {
    group: "Elected Representatives",
    role: "MP",
    name: "Smt. Annpurna Devi",
    kind: "person",
    isPending: false,
    phone: "",
    alternatePhone: "",
    email: "annpurnadevi.koderma@mpls.sansad.in",
    area: "",
    officeAddress: "",
    about: "Member of Parliament, Kodarma (BJP), 18th Lok Sabha.",
    displayOrder: 40,
  },
  {
    group: "Elected Representatives",
    role: "MLA",
    name: "Dr. Neera Yadav",
    kind: "person",
    isPending: false,
    phone: "",
    alternatePhone: "",
    email: "",
    area: "",
    officeAddress: "",
    about: "Member of Legislative Assembly, Kodarma AC-19 (BJP).",
    displayOrder: 41,
  },
  {
    group: "Elected Representatives",
    role: "Zila Parishad Chairman",
    name: "Ramdhan Yadav",
    kind: "person",
    isPending: false,
    phone: "",
    alternatePhone: "",
    email: "",
    area: "",
    officeAddress: "",
    about: "Zila Parishad Chairman, Koderma.",
    displayOrder: 42,
  },
  {
    group: "Elected Representatives",
    role: "Panchayat Samiti",
    name: "",
    kind: "person",
    isPending: true,
    phone: "",
    alternatePhone: "",
    email: "",
    area: "",
    officeAddress: "",
    about: "Current Kakarcholi-specific member: verify. The ward/constituency process for the 2027 Panchayat election is being updated, so older names are not shown as current.",
    displayOrder: 43,
  },
];

const run = async () => {
  try {
    await connectDB();
    let created = 0;
    let skipped = 0;

    for (const data of contacts) {
      // Only ADD what is missing — never overwrite what the admin edited.
      // People: skipped if that branch (group + role) already has an entry,
      // so a renamed Mukhiya or a filled-in "pending" row is not duplicated.
      // Places: matched by village name so new villages can still be added.
      const filter =
        data.kind === "place"
          ? { group: data.group, role: data.role, kind: "place", name: data.name }
          : { group: data.group, role: data.role, kind: "person" };

      const exists = await SpecialContact.exists(filter);

      if (exists) {
        skipped++;
        continue;
      }

      await SpecialContact.create({ ...data, isActive: true });
      created++;
    }

    console.log(
      `Special contacts seeded. Created: ${created}, Already present (left untouched): ${skipped}, Total: ${contacts.length}`
    );
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Special contact seed failed:", error);
    try { await mongoose.connection.close(); } catch (_) {}
    process.exit(1);
  }
};

run();