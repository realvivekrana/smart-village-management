const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Village = require("../models/Village");

dotenv.config();

const SOURCE_NAME = "OneFiveNine";
const SOURCE_URL =
  "https://www.onefivenine.com/india/villages/Koderma/Jainagar/Kakarcholi";

const place = (name, type, address, distanceKm) => ({
  name,
  type,
  address: address || "",
  ...(distanceKm !== undefined ? { distanceKm } : {}),
  sourceName: SOURCE_NAME,
  sourceUrl: SOURCE_URL,
  verified: false,
  isActive: true,
});

const kakarcholiData = {
  name: "Kakarcholi",
  localName: "ककरचोली",

  block: "Jainagar",
  district: "Koderma",
  state: "Jharkhand",
  country: "India",
  pincode: "825109",

  languages: ["Hindi", "Santali"],

  altitude: 352,
  stdCode: "06543",

  description:
    "Kakarcholi is a village in Jainagar Block of Koderma District, Jharkhand. " +
    "It is located 15 KM south of the district headquarters Koderma, 4 KM from Jainagar, " +
    "and 137 KM from the state capital Ranchi. Kakarcholi is surrounded by Koderma Block " +
    "to the north, Chandwara Block to the west, Barkatha Block to the south, and Markacho " +
    "Block to the east.",

  history: "",
  culture: "",

  assemblyConstituency: "Barkatha",
  lokSabhaConstituency: "Kodarma",

  contact: {
    phone: "",
    email: "",
    address: "Kakarcholi, Jainagar, Koderma, Jharkhand - 825109",
  },

  sarpanch: {
    name: "",
    phone: "",
  },

  howToReach: {
    road: "Located on the Koderma - Jainagar - Markacho Road, well connected to Jainagar (4 KM) and Koderma (15 KM).",
    rail: "Nearest railway stations are Sarmatanr (3.8 KM) and Hirodih (5 KM).",
    air: "Nearest airport is Gaya Airport (91 KM), followed by Ranchi Airport (134 KM).",
  },

  rivers: ["Barakar River"],

  // --------------------------------------------------
  // Nearby locations
  // --------------------------------------------------

  nearbyVillages: [
    { name: "Jainagar", distanceKm: 2 },
    { name: "Jainagar West", distanceKm: 2 },
    { name: "Chehal", distanceKm: 3 },
    { name: "Satdiha", distanceKm: 3 },
    { name: "Dandadih", distanceKm: 5 },
  ],

  nearbyCities: [
    { name: "Jhumri Tilaiya", distanceKm: 15 },
    { name: "Hazaribag", distanceKm: 57 },
    { name: "Hisua", distanceKm: 63 },
    { name: "Nawada", distanceKm: 65 },
  ],

  nearbyTaluks: [
    { name: "Jainagar", distanceKm: 4 },
    { name: "Koderma", distanceKm: 11 },
    { name: "Chandwara", distanceKm: 16 },
    { name: "Barkatha", distanceKm: 17 },
  ],

  nearbyDistricts: [
    { name: "Koderma", distanceKm: 14 },
    { name: "Hazaribagh", distanceKm: 54 },
    { name: "Nawada", distanceKm: 65 },
    { name: "Giridih", distanceKm: 78 },
  ],

  nearbyRailwayStations: [
    { name: "Sarmatanr Railway Station", distanceKm: 3.8 },
    { name: "Hirodih Railway Station", distanceKm: 5.0 },
    { name: "Yadudih Railway Station", distanceKm: 8.3 },
    { name: "Parsabad Railway Station", distanceKm: 14 },
    { name: "Koderma Junction Railway Station", distanceKm: 14 },
  ],

  nearbyAirports: [
    { name: "Gaya Airport", distanceKm: 91 },
    { name: "Ranchi Airport", distanceKm: 134 },
    { name: "Patna Airport", distanceKm: 165 },
    { name: "Varanasi Airport", distanceKm: 341 },
  ],

  nearbyTouristPlaces: [
    { name: "Jhumri Telaiya", distanceKm: 13 },
    { name: "Koderma", distanceKm: 14 },
    { name: "Hazaribagh", distanceKm: 39 },
    { name: "Kakolat", distanceKm: 65 },
    { name: "Giridh", distanceKm: 79 },
  ],

  images: [],

  // --------------------------------------------------
  // Places directory
  // --------------------------------------------------

  places: [
    // Schools
    place("Sarvodya High School", "school", "Satdiha, Jainagar, Koderma"),
    place("DAV Public School Alho", "school", "Kailash Nagar Road, Alho"),
    place(
      "Shree Lakshmi Narayan Vidhyapeeth Ghaghdih",
      "school",
      "Ghaghdih"
    ),
    place("Ideal Progressive School", "school", "Pawar House, Jainagar"),
    place(
      "Unique Progressive High School Tarwan",
      "school",
      "Taraun, Jharkhand 825109",
      1.4
    ),
    place("Utkarmit Madhyavidyalya", "school", "Santh, Jharkhand 825109", 1.8),
    place("+2 High School Jainagar", "school", "Pahridih, Jharkhand 825109", 1.9),
    place(
      "Wisdom +2 Education Academy",
      "school",
      "High School Road, Jainagar, Jharkhand 825109",
      2.1
    ),

    // Colleges
    place("Smu", "college", ""),
    place("Kathadih College", "college", "Katahadih, Jharkhand 825410", 3.7),
    place(
      "Vikram Private ITI",
      "college",
      "Kanungobigha, Charadih, Jharkhand 825409",
      13.5
    ),
    place("R.L.S.Y. College", "college", "Jhumri Telaiya, Jharkhand 825409", 13.7),
    place(
      "Ram Lakhan Singh Yadav College",
      "college",
      "Mitco Colony Road, Jhumri Telaiya, Jharkhand 825409",
      13.8
    ),

    // Health Centers / Hospitals
    place("HSC Chehal", "health_center", "Near Panchayat Bhawan, Chehal"),
    place("HSC Satdiha", "health_center", "Near UMS Satdiha"),
    place("HSC Kushahan", "health_center", "Near UMS Kushahan"),
    place("Jainagar Hospital", "hospital", "Bhagandih, Jharkhand 825109", 2.4),
    place("Amjad Clinic", "hospital", "Jainagar, Jharkhand 825109", 2.7),
    place("PKS", "hospital", "Jainagar, Jharkhand 825109", 3.0),

    // Temples
    place("Devi Temple", "temple", "Kakarcholi, Jharkhand 825109", 0.3),
    place(
      "Hanuman Temple Kakarcholi",
      "temple",
      "Kakarcholi, Jharkhand 825109",
      0.4
    ),
    place("Shiv Mandir", "temple", "Bhikhnadih, Jharkhand 825109", 1.1),
    place(
      "Maa Durga Mandir",
      "temple",
      "Koderma - Jainagar - Markacho Road, Gopaldih, Jharkhand 825109",
      1.2
    ),

    // Mosques
    place(
      "Noori Masjid Gopaldih",
      "mosque",
      "Santh, Jharkhand 825109",
      2.0
    ),
    place(
      "Masjid Mohallah Jainagar",
      "mosque",
      "Koderma - Jainagar - Markacho Rd, Jainagar, Jharkhand 825109",
      2.6
    ),
    place("Jama Masjid Jainagar", "mosque", "Jainagar, Jharkhand 825109", 2.7),

    // Bus Stops
    place(
      "Jainagar Bus Stop",
      "bus_stop",
      "Koderma - Jainagar - Markacho Rd, Jainagar, Jharkhand 825109",
      2.5
    ),
    place("Kanko Bus Stop", "bus_stop", "Kanko, Jharkhand 825409", 11.8),
    place(
      "Maharana Pratap Bus Stop",
      "bus_stop",
      "Ranchi Patna Rd, Jhumri Telaiya, Jharkhand 825409",
      14.8
    ),
    place(
      "Tetroun Chowk Bus Stop",
      "bus_stop",
      "Parsabad Road, Tetraun, Jharkhand 825318",
      15.6
    ),

    // ATMs
    place("Bank Of India ATM", "atm", "Jainagar, Jharkhand 825109", 2.5),
    place("State Bank of India ATM", "atm", "Jainagar, Jharkhand 825109", 2.7),
    place("Indicash ATM", "atm", "Jainagar, Jharkhand 825109", 2.8),
    place("BOI ATM", "atm", "Tetariadih, Jharkhand 825410", 4.8),

    // Cinemas
    place(
      "Kheshari Show Ground",
      "cinema",
      "Pipcho, Jharkhand 825318",
      9.1
    ),
    place(
      "Purnima Talkies (Cinema Hall)",
      "cinema",
      "Ranchi Patna Rd, Jhumri Telaiya, Jharkhand 825409",
      14.9
    ),
    place(
      "Amit Enterprises",
      "cinema",
      "Near Jawahar Talkies, Ranchi Patna Rd, Jhumri Telaiya, Jharkhand",
      15.8
    ),

    // Hotels / Lodges
    place(
      "AirAble",
      "hotel",
      "Koderma - Jainagar - Markacho Rd, Jainagar, Jharkhand 825109",
      2.6
    ),
    place(
      "Gokul Sweets",
      "hotel",
      "Koderma - Jainagar - Markacho Rd, Jainagar, Jharkhand 825109",
      2.8
    ),
    place(
      "Jhatka Chikan Center",
      "hotel",
      "Koderma - Jainagar - Markacho Rd, Jainagar, Jharkhand 825109",
      2.9
    ),
    place(
      "Kameshar Singh Hotel",
      "hotel",
      "Latbedhwa, Jharkhand 825109",
      3.3
    ),
    place("Ashok Hotal", "hotel", "Katahadih, Jharkhand 825410", 3.5),

    // Restaurants
    place(
      "Sageer Dhaba",
      "restaurant",
      "Koderma - Jainagar - Markacho Rd, Jainagar, Jharkhand 825109",
      2.6
    ),
    place("Boxer Chay Dukan", "restaurant", "Jainagar, Jharkhand 825109", 2.6),
    place("Punit Tea Stall", "restaurant", "Jainagar, Jharkhand 825109", 2.8),
    place(
      "Minhaj Hotel Chehal",
      "restaurant",
      "Chehal, Jharkhand 825109",
      2.9
    ),
    place(
      "Hotel Samrat",
      "restaurant",
      "Madhubani - Jainagar Road, Belkatri, Jharkhand 825109",
      3.6
    ),

    // Petrol Pumps
    place(
      "Sarkar Filling Station (IOCL)",
      "petrol_pump",
      "Belkatri, Jharkhand 825109",
      3.1
    ),
    place(
      "Bank Of India Pipcho (Jamal Khan)",
      "petrol_pump",
      "Pipcho, Jharkhand 825318",
      8.0
    ),
    place(
      "Hameed and Sons Fuel Point",
      "petrol_pump",
      "Pipcho, Jharkhand 825318",
      8.0
    ),
    place(
      "Hamid and Sons Fuel Point, Pipcho Chowk",
      "petrol_pump",
      "Pipcho, Jharkhand 825318",
      9.0
    ),

    // Electronic Shops
    place("AirAble Fan", "electronic_shop", "Jainagar, Jharkhand 825109", 2.3),
    place(
      "Sony Electronics",
      "electronic_shop",
      "Jainagar, Jharkhand 825109",
      2.4
    ),
    place(
      "Kundan Mobile Care",
      "electronic_shop",
      "Jainagar, Jharkhand 825109",
      2.5
    ),

    // Super Markets
    place(
      "Naveen Trends",
      "super_market",
      "Jainagar Block Road, Koderma District, Jainagar, Jharkhand 825109",
      2.7
    ),
    place("GS Organisation", "super_market", "Jainagar, Jharkhand 825109", 2.7),
    place(
      "NK Radium Point",
      "super_market",
      "Koderma - Jainagar - Markacho Rd, Jainagar, Jharkhand 825109",
      2.8
    ),

    // Police Stations
    place(
      "Jainagar Police Station",
      "police_station",
      "Jainagar, Jharkhand 825109",
      2.6
    ),
    place(
      "Superintendent Police",
      "police_station",
      "NH31, Chechai, Jharkhand 825409",
      13.8
    ),
    place(
      "Koderma Police Station",
      "police_station",
      "NH31, Koderma, Jharkhand 825410",
      14.9
    ),

    // Government Offices
    place(
      "Aanganbadi Kheskari",
      "government_office",
      "Salaia, Jharkhand 825410",
      3.3
    ),
    place(
      "Suresh License Centre",
      "government_office",
      "Jhumri, Jhumri Telaiya, Jharkhand",
      14.3
    ),
    place(
      "Hindu Samshan Ghat",
      "government_office",
      "Koderma, Jharkhand 825410",
      14.4
    ),

    // Local Parks / Grounds
    place(
      "Mahaveer Udyaan",
      "park",
      "Koderma - Jainagar - Markacho Rd, Jhumri Telaiya, Jharkhand 825409",
      14.1
    ),
    place(
      "Dr. Ambedkar Ground",
      "park",
      "Jhumri Telaiya, Jharkhand 825409",
      13.9
    ),

    // Polling Stations
    place(
      "Upgraded Middle School Kandrapdih East Part",
      "government_office",
      "Kandrapdih East"
    ),
    place("Navsrijit Primary School Doy", "government_office", "Doy"),
    place(
      "Primary School Gobarbanda South Part",
      "government_office",
      "Gobarbanda South"
    ),
    place(
      "Upgraded Middle School Rebhnadih",
      "government_office",
      "Rebhnadih"
    ),
    place("Upgraded Middle School Ratanpur", "government_office", "Ratanpur"),
  ],

  facilities: [
    "Schools",
    "Health Sub-Centers",
    "Temples",
    "Mosques",
    "ATMs",
    "Bus Stops",
    "Police Station",
    "Petrol Pumps",
  ],

  isActive: true,
};

async function seedKakarcholi() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const existingVillage = await Village.findOne({
      name: "Kakarcholi",
      block: "Jainagar",
      district: "Koderma",
    });

    if (existingVillage) {
      Object.assign(existingVillage, kakarcholiData);

      await existingVillage.save();

      console.log("Kakarcholi village updated successfully");
      console.log("Village ID:", existingVillage._id);
      console.log("Total places seeded:", kakarcholiData.places.length);
    } else {
      const village = await Village.create(kakarcholiData);

      console.log("Kakarcholi village created successfully");
      console.log("Village ID:", village._id);
      console.log("Total places seeded:", kakarcholiData.places.length);
    }

    await mongoose.disconnect();

    console.log("MongoDB disconnected");
    process.exit(0);
  } catch (error) {
    console.error("Kakarcholi seed failed:");
    console.error(error.message);

    await mongoose.disconnect().catch(() => {});

    process.exit(1);
  }
}

seedKakarcholi();