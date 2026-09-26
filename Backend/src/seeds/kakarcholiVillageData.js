/**
 * Kakarcholi Village — Seed Data
 * Source: https://www.onefivenine.com/india/villages/Koderma/Jainagar/Kakarcholi
 * Jainagar Block, Koderma District, Jharkhand
 */

const kakarcholiVillageData = {
  name: "Kakarcholi",
  localName: "ककरचोली",
  block: "Jainagar",
  district: "Koderma",
  state: "Jharkhand",
  pincode: "825109",
  stdCode: "06543",
  altitude: 352,

  population: null,
  area: null,

  // Estimated village-centre coordinates. Jainagar (the block HQ, ~4 km
  // away) is confirmed at 24.375833°N, 85.643611°E per Wikipedia; Kakarcholi's
  // point below is an estimate placed a little south-west of Jainagar based
  // on nearby-village bearing data. Adjust in Google Maps and paste the
  // corrected lat/lng here if you want pinpoint accuracy.
  location: { lat: 24.3595, lng: 85.6208 },

  languages: ["Hindi", "Santali"],
  rivers: ["Barakar River"],

  // Administrative constituencies (factual/non-partisan — party names
  // intentionally left out since this is a civic services platform).
  assemblyConstituency: "Barkatha",
  lokSabhaConstituency: "Kodarma",

  description:
    "Kakarcholi is a village in Jainagar Block, Koderma District, Jharkhand, India. It is located about 15 km south of Koderma district headquarters, 4 km from Jainagar, and around 137 km from the state capital Ranchi. Jainagar, Jainagar West, Chehal, Satdiha and Dandadih are the nearby villages.",

  history:
    "Kakarcholi lies in Jainagar Block of Koderma district, a region long known as the \"Mica City\" belt of Jharkhand — for decades this area, along with neighbouring Jhumri Tilaiya, was one of India's major centres of mica mining and processing, and many families in villages around Jainagar have historically been connected to the mica trade. Administratively, the village was part of Bihar until the state of Jharkhand was carved out in November 2000, after which it came under Koderma district. Kakarcholi today functions as its own Gram Panchayat, governing several smaller surrounding hamlets under the Panchayati Raj system.\n\n[Village-specific history — founding, local traditions, notable events, or the origin of the name \"Kakarcholi\" — is best added by village elders/Sarpanch, since no independent published record of this exists yet. Replace or extend this paragraph once that information is collected.]",

  howToReach: {
    road: "Kakarcholi is connected via the Koderma-Jainagar-Markacho Road, which passes through Jainagar, about 4 km away.",
    rail: "Sarmatanr Railway Station (~3.8 km) and Hirodih Railway Station (~5.0 km) are the nearest railway stations. Koderma Junction (~14 km) is the nearest major junction.",
    air: "Gaya Airport (~91 km) is the nearest airport, followed by Ranchi Airport (~134 km), Patna Airport (~165 km) and Varanasi Airport (~341 km).",
  },

  sarpanch: { name: "", phone: "" },

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
    { name: "Giridih", distanceKm: 79 },
  ],

  places: [
    { name: "Devi Temple", type: "temple", address: "Kakarcholi, Jharkhand 825109", distanceKm: 0.3, isActive: true },
    { name: "Hanuman Temple Kakarcholi", type: "temple", address: "Kakarcholi, Jharkhand 825109", distanceKm: 0.4, isActive: true },
    { name: "Shiv Mandir", type: "temple", address: "Bhikhnadih, Jharkhand 825109", distanceKm: 1.1, isActive: true },
    { name: "Maa Durga Mandir", type: "temple", address: "Koderma-Jainagar-Markacho Road, Gopaldih, Jharkhand 825109", distanceKm: 1.2, isActive: true },

    { name: "Noori Masjid Gopaldih", type: "mosque", address: "Santh, Jharkhand 825109", distanceKm: 2.0, isActive: true },
    { name: "Masjid Mohallah Jainagar", type: "mosque", address: "Koderma-Jainagar-Markacho Rd, Jainagar, Jharkhand 825109", distanceKm: 2.6, isActive: true },
    { name: "Jama Masjid Jainagar", type: "mosque", address: "Jainagar, Jharkhand 825109", distanceKm: 2.7, isActive: true },

    { name: "Sarvodya High School", type: "school", address: "Satdiha, Jainagar, Koderma, Jharkhand", isActive: true },
    { name: "DAV Public School Alho", type: "school", address: "Kailash Nagar Road, Alho", isActive: true },
    { name: "Shree Lakshmi Narayan Vidhyapeeth Ghaghdih", type: "school", address: "Ghaghdih", isActive: true },
    { name: "Ideal Progressive School", type: "school", address: "Pawar House, Jainagar", isActive: true },
    { name: "Unique Progressive High School Tarwan", type: "school", address: "Taraun, Jharkhand 825109", distanceKm: 1.4, isActive: true },
    { name: "Utkarmit Madhyavidyalya", type: "school", address: "Santh, Jharkhand 825109", distanceKm: 1.8, isActive: true },
    { name: "+2 High School Jainagar", type: "school", address: "Pahridih, Jharkhand 825109", distanceKm: 1.9, isActive: true },
    { name: "Wisdom +2 Education Academy", type: "school", address: "High School Road, Jainagar, Jharkhand 825109", distanceKm: 2.1, isActive: true },
    { name: "Sharda High School", type: "school", address: "Jhumri Telaiya, Jharkhand 825409", distanceKm: 13.9, isActive: true },

    { name: "SMU", type: "college", address: "", isActive: true },
    { name: "Kathadih College", type: "college", address: "Katahadih, Jharkhand 825410", distanceKm: 3.7, isActive: true },
    { name: "Vikram Private ITI", type: "college", address: "Kanungobigha, Charadih, Jharkhand 825409", distanceKm: 13.5, isActive: true },
    { name: "R.L.S.Y. College", type: "college", address: "Jhumri Telaiya, Jharkhand 825409", distanceKm: 13.7, isActive: true },
    { name: "Ram Lakhan Singh Yadav College", type: "college", address: "Mitco Colony Road, Jhumri Telaiya, Jharkhand 825409", distanceKm: 13.8, isActive: true },

    { name: "New Market Clinic", type: "hospital", address: "Jainagar-Sarmatanr Rd, Jainagar, Jharkhand 825109", distanceKm: 2.3, isActive: true },
    { name: "Jainagar Hospital", type: "hospital", address: "Bhagandih, Jharkhand 825109", distanceKm: 2.4, isActive: true },
    { name: "Amjad Clinic", type: "hospital", address: "Jainagar, Jharkhand 825109", distanceKm: 2.7, isActive: true },
    { name: "PKS Clinic", type: "hospital", address: "Jainagar, Jharkhand 825109", distanceKm: 3.0, isActive: true },

    { name: "HSC Chehal", type: "health_center", address: "Near Panchayat Bhawan, Chehal", isActive: true },
    { name: "HSC Satdiha", type: "health_center", address: "Near UMS Satdiha", isActive: true },
    { name: "HSC Kushahan", type: "health_center", address: "Near UMS Kushahan", isActive: true },

    { name: "Jainagar Bus Stop", type: "bus_stop", address: "Koderma-Jainagar-Markacho Rd, Jainagar, Jharkhand 825109", distanceKm: 2.5, isActive: true },
    { name: "Kanko Bus Stop", type: "bus_stop", address: "Kanko, Jharkhand 825409", distanceKm: 11.8, isActive: true },
    { name: "Maharana Pratap Bus Stop", type: "bus_stop", address: "Ranchi Patna Rd, Jhumri Telaiya, Jharkhand 825409", distanceKm: 14.8, isActive: true },
    { name: "Tetroun Chowk Bus Stop", type: "bus_stop", address: "Parsabad Road, Tetraun, Jharkhand 825318", distanceKm: 15.6, isActive: true },

    { name: "Bank Of India ATM", type: "atm", address: "Jainagar, Jharkhand 825109", distanceKm: 2.5, isActive: true },
    { name: "State Bank of India ATM", type: "atm", address: "Jainagar, Jharkhand 825109", distanceKm: 2.7, isActive: true },
    { name: "Indicash ATM", type: "atm", address: "Jainagar, Jharkhand 825109", distanceKm: 2.8, isActive: true },
    { name: "BOI ATM", type: "atm", address: "Tetariadih, Jharkhand 825410", distanceKm: 4.8, isActive: true },

    { name: "Kheshari Show Ground", type: "cinema", address: "Pipcho, Jharkhand 825318", distanceKm: 9.1, isActive: true },
    { name: "Purnima Talkies (Cinema Hall)", type: "cinema", address: "Ranchi Patna Rd, Jhumri Telaiya, Jharkhand 825409", distanceKm: 14.9, isActive: true },
    { name: "Amit Enterprises", type: "cinema", address: "Near Jawahar Talkies, Ranchi Patna Rd, Jhumri Telaiya, Jharkhand", distanceKm: 15.8, isActive: true },

    { name: "AirAble", type: "hotel", address: "Koderma-Jainagar-Markacho Rd, Jainagar, Jharkhand 825109", distanceKm: 2.6, isActive: true },
    { name: "Gokul Sweets", type: "hotel", address: "Koderma-Jainagar-Markacho Rd, Jainagar, Jharkhand 825109", distanceKm: 2.8, isActive: true },
    { name: "Kameshar Singh Hotel", type: "hotel", address: "Latbedhwa, Jharkhand 825109", distanceKm: 3.3, isActive: true },
    { name: "Ashok Hotel", type: "hotel", address: "Katahadih, Jharkhand 825410", distanceKm: 3.5, isActive: true },

    { name: "Sageer Dhaba", type: "restaurant", address: "Koderma-Jainagar-Markacho Rd, Jainagar, Jharkhand 825109", distanceKm: 2.6, isActive: true },
    { name: "Boxer Chay Dukan", type: "restaurant", address: "Jainagar, Jharkhand 825109", distanceKm: 2.6, isActive: true },
    { name: "Punit Tea Stall", type: "restaurant", address: "Jainagar, Jharkhand 825109", distanceKm: 2.8, isActive: true },
    { name: "Minhaj Hotel Chehal", type: "restaurant", address: "Chehal, Jharkhand 825109", distanceKm: 2.9, isActive: true },
    { name: "Hotel Samrat", type: "restaurant", address: "Madhubani-Jainagar Road, Belkatri, Jharkhand 825109", distanceKm: 3.6, isActive: true },
    { name: "Jhatka Chikan Center", type: "restaurant", address: "Koderma-Jainagar-Markacho Rd, Jainagar, Jharkhand 825109", distanceKm: 2.9, isActive: true },

    { name: "Sarkar Filling Station (IOCL)", type: "petrol_pump", address: "Belkatri, Jharkhand 825109", distanceKm: 3.1, isActive: true },
    { name: "Hameed and Sons Fuel Point", type: "petrol_pump", address: "Pipcho, Jharkhand 825318", distanceKm: 8.0, isActive: true },
    { name: "Hamid and Sons Fuel Point (Pipcho Chowk)", type: "petrol_pump", address: "Chowk, Pipcho, Jharkhand 825318", distanceKm: 9.0, isActive: true },
    { name: "Bank Of India Pipcho (Jamal Khan)", type: "petrol_pump", address: "Pipcho, Jharkhand 825318", distanceKm: 8.0, isActive: true },

    { name: "AirAble Fan", type: "electronic_shop", address: "Jainagar, Jharkhand 825109", distanceKm: 2.3, isActive: true },
    { name: "Sony Electronics", type: "electronic_shop", address: "Jainagar, Jharkhand 825109", distanceKm: 2.4, isActive: true },
    { name: "Kundan Mobile Care", type: "electronic_shop", address: "Jainagar, Jharkhand 825109", distanceKm: 2.5, isActive: true },

    { name: "Naveen Trends", type: "super_market", address: "Jainagar Block Road, Koderma District, Jainagar, Jharkhand 825109", distanceKm: 2.7, isActive: true },
    { name: "GS Organisation", type: "super_market", address: "Jainagar, Jharkhand 825109", distanceKm: 2.7, isActive: true },
    { name: "NK Radium Point", type: "super_market", address: "Koderma-Jainagar-Markacho Rd, Jainagar, Jharkhand 825109", distanceKm: 2.8, isActive: true },

    { name: "Jainagar Police Station", type: "police_station", address: "Jainagar, Jharkhand 825109", distanceKm: 2.6, isActive: true },
    { name: "Koderma Police Station", type: "police_station", address: "NH31, Koderma, Jharkhand 825410", distanceKm: 14.9, isActive: true },
    { name: "Superintendent of Police Office", type: "police_station", address: "NH31, Chechai, Jharkhand 825409", distanceKm: 13.8, isActive: true },

    { name: "Anganwadi Kheskari", type: "government_office", address: "Salaia, Jharkhand 825410", distanceKm: 3.3, isActive: true },
    { name: "Suresh License Centre", type: "government_office", address: "Jhumri Telaiya, Jharkhand", distanceKm: 14.3, isActive: true },
    { name: "Hindu Samshan Ghat", type: "other", address: "Koderma, Jharkhand 825410", distanceKm: 14.4, isActive: true },

    { name: "Dr. Ambedkar Ground", type: "park", address: "Jhumri Telaiya, Jharkhand 825409", distanceKm: 13.9, isActive: true },
    { name: "Mahaveer Udyaan", type: "park", address: "Koderma-Jainagar-Markacho Rd, Jhumri Telaiya, Jharkhand 825409", distanceKm: 14.1, isActive: true },
  ],

  images: [],
};

module.exports = kakarcholiVillageData;