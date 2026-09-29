const Village = require("../models/Village");

/*
|--------------------------------------------------------------------------
| Village Helper
|--------------------------------------------------------------------------
| Gaon ka naam ab kahin hardcode nahi hai. Har jagah active Village record
| se aata hai (Admin -> Village Settings me edit hota hai).
| 60 second ka chhota cache hai taaki har request pe DB hit na ho.
*/

const CACHE_TTL_MS = 60 * 1000;
const FALLBACK_NAME = "Village";

let cache = { name: null, expiresAt: 0 };

const getActiveVillageName = async () => {
  if (cache.name && cache.expiresAt > Date.now()) {
    return cache.name;
  }

  try {
    const village = await Village.findOne({ isActive: true })
      .select("name")
      .lean();

    cache = {
      name: village?.name || FALLBACK_NAME,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };
  } catch (error) {
    return cache.name || FALLBACK_NAME;
  }

  return cache.name;
};

// Village update hone par cache turant clear karne ke liye
const clearVillageNameCache = () => {
  cache = { name: null, expiresAt: 0 };
};

module.exports = { getActiveVillageName, clearVillageNameCache };