const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Village = require("../models/Village");

dotenv.config();

const kakarcholiData = {
  name: "Kakarcholi",
  localName: "ककरचोली",

  block: "Jainagar",
  district: "Koderma",
  state: "Jharkhand",
  pincode: "825109",

  languages: ["Hindi", "Santali"],

  altitude: 352,
  stdCode: "06543",

  description:
    "Kakarcholi is a village in Jainagar Block of Koderma District, Jharkhand.",

  history: "",

  howToReach: {
    road: "",
    rail: "",
    air: "",
  },

  rivers: [],

  nearbyVillages: [],

  nearbyCities: [
    {
      name: "Koderma",
      distanceKm: 15,
    },
    {
      name: "Jainagar",
      distanceKm: 4,
    },
  ],

  nearbyTaluks: [],

  nearbyAirports: [],

  nearbyTouristPlaces: [],

  nearbyDistricts: [],

  nearbyRailwayStations: [
    {
      name: "Sarmatanr Railway Station",
      distanceKm: 3.8,
    },
    {
      name: "Hirodih Railway Station",
      distanceKm: 5,
    },
  ],

  images: [],

  places: [
    {
      name: "Sarvodya High School",
      type: "school",
      address: "Kakarcholi / Jainagar",
      sourceName: "OneFiveNine",
      sourceUrl:
        "https://www.onefivenine.com/india/villages/Koderma/Jainagar/Kakarcholi",
      verified: false,
      isActive: true,
    },

    {
      name: "DAV Public School Alho",
      type: "school",
      address: "Alho, Jainagar",
      sourceName: "OneFiveNine",
      sourceUrl:
        "https://www.onefivenine.com/india/villages/Koderma/Jainagar/Kakarcholi",
      verified: false,
      isActive: true,
    },

    {
      name: "Shree Lakshmi Narayan Vidhyapeeth",
      type: "school",
      address: "Ghaghdih",
      sourceName: "OneFiveNine",
      sourceUrl:
        "https://www.onefivenine.com/india/villages/Koderma/Jainagar/Kakarcholi",
      verified: false,
      isActive: true,
    },

    {
      name: "Ideal Progressive School",
      type: "school",
      address: "Jainagar",
      sourceName: "OneFiveNine",
      sourceUrl:
        "https://www.onefivenine.com/india/villages/Koderma/Jainagar/Kakarcholi",
      verified: false,
      isActive: true,
    },

    {
      name: "Devi Temple",
      type: "temple",
      address: "Kakarcholi",
      sourceName: "OneFiveNine",
      sourceUrl:
        "https://www.onefivenine.com/india/villages/Koderma/Jainagar/Kakarcholi",
      verified: false,
      isActive: true,
    },

    {
      name: "Hanuman Temple Kakarcholi",
      type: "temple",
      address: "Kakarcholi",
      sourceName: "OneFiveNine",
      sourceUrl:
        "https://www.onefivenine.com/india/villages/Koderma/Jainagar/Kakarcholi",
      verified: false,
      isActive: true,
    },

    {
      name: "New Market",
      type: "market",
      address: "Jainagar",
      sourceName: "OneFiveNine",
      sourceUrl:
        "https://www.onefivenine.com/india/villages/Koderma/Jainagar/Kakarcholi",
      verified: false,
      isActive: true,
    },

    {
      name: "Jainagar Hospital",
      type: "hospital",
      address: "Jainagar",
      sourceName: "OneFiveNine",
      sourceUrl:
        "https://www.onefivenine.com/india/villages/Koderma/Jainagar/Kakarcholi",
      verified: false,
      isActive: true,
    },

    {
      name: "Amjad Clinic",
      type: "hospital",
      address: "Jainagar",
      sourceName: "OneFiveNine",
      sourceUrl:
        "https://www.onefivenine.com/india/villages/Koderma/Jainagar/Kakarcholi",
      verified: false,
      isActive: true,
    },

    {
      name: "PKS",
      type: "health_center",
      address: "Jainagar",
      sourceName: "OneFiveNine",
      sourceUrl:
        "https://www.onefivenine.com/india/villages/Koderma/Jainagar/Kakarcholi",
      verified: false,
      isActive: true,
    },

    {
      name: "Sarmatanr Railway Station",
      type: "railway_station",
      distanceKm: 3.8,
      sourceName: "OneFiveNine",
      sourceUrl:
        "https://www.onefivenine.com/india/villages/Koderma/Jainagar/Kakarcholi",
      verified: false,
      isActive: true,
    },

    {
      name: "Hirodih Railway Station",
      type: "railway_station",
      distanceKm: 5,
      sourceName: "OneFiveNine",
      sourceUrl:
        "https://www.onefivenine.com/india/villages/Koderma/Jainagar/Kakarcholi",
      verified: false,
      isActive: true,
    },
  ],

  sarpanch: {
    name: "",
    phone: "",
  },

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
    } else {
      const village = await Village.create(kakarcholiData);

      console.log("Kakarcholi village created successfully");
      console.log("Village ID:", village._id);
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