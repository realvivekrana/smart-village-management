/*
|--------------------------------------------------------------------------
| Village Feature Service
|--------------------------------------------------------------------------
| Government schemes, farmer services, Gram Sabha, bills, health,
| education, transport, marketplace, directory etc. ke API calls.
|--------------------------------------------------------------------------
*/

import api from "./api";

/*
|--------------------------------------------------------------------------
| Error Helper
|--------------------------------------------------------------------------
*/

function getErrorMessage(
  error,
  fallback = "Something went wrong."
) {
  return (
    error?.response?.data
      ?.message ||
    error?.response?.data
      ?.error ||
    error?.message ||
    fallback
  );
}

/*
|--------------------------------------------------------------------------
| Generic GET
|--------------------------------------------------------------------------
*/

async function get(
  endpoint,
  params = {}
) {
  try {
    const response =
      await api.get(
        endpoint,
        {
          params,
        }
      );

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error)
    );
  }
}

/*
|--------------------------------------------------------------------------
| Generic POST
|--------------------------------------------------------------------------
*/

async function post(
  endpoint,
  data = {}
) {
  try {
    const response =
      await api.post(
        endpoint,
        data
      );

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error)
    );
  }
}

/*
|--------------------------------------------------------------------------
| Generic PUT
|--------------------------------------------------------------------------
*/

async function put(
  endpoint,
  data = {}
) {
  try {
    const response =
      await api.put(
        endpoint,
        data
      );

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error)
    );
  }
}

/*
|--------------------------------------------------------------------------
| Generic DELETE
|--------------------------------------------------------------------------
*/

async function patch(
  endpoint,
  data = {}
) {
  try {
    const response = await api.patch(endpoint, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

async function remove(
  endpoint
) {
  try {
    const response =
      await api.delete(
        endpoint
      );

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error)
    );
  }
}

/*
|--------------------------------------------------------------------------
| Village Features
|--------------------------------------------------------------------------
*/

/**
 * Get all village features.
 *
 * Example:
 * Government schemes
 * Farmer services
 * Health
 * Education
 * Transport
 * etc.
 */
export async function getVillageFeatures(
  params = {}
) {
  return get(
    "/village-features",
    params
  );
}

/**
 * Get feature by ID.
 */
export async function getVillageFeatureById(
  id
) {
  if (!id) {
    throw new Error(
      "Feature ID is required."
    );
  }

  return get(
    `/village-features/${id}`
  );
}

/**
 * Create feature.
 * Admin only.
 */
export async function createVillageFeature(
  featureData
) {
  return post(
    "/village-features",
    featureData
  );
}

/**
 * Update feature.
 * Admin only.
 */
export async function updateVillageFeature(
  id,
  featureData
) {
  if (!id) {
    throw new Error(
      "Feature ID is required."
    );
  }

  return put(
    `/village-features/${id}`,
    featureData
  );
}

/**
 * Delete feature.
 * Admin only.
 */
export async function deleteVillageFeature(
  id
) {
  if (!id) {
    throw new Error(
      "Feature ID is required."
    );
  }

  return remove(
    `/village-features/${id}`
  );
}

/*
|--------------------------------------------------------------------------
| Feature Categories
|--------------------------------------------------------------------------
*/

export async function getFeaturesByCategory(
  category
) {
  if (!category) {
    throw new Error(
      "Feature category is required."
    );
  }

  return get(
    "/village-features",
    {
      category,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Government Schemes
|--------------------------------------------------------------------------
*/

export async function getGovernmentSchemes(
  params = {}
) {
  return get(
    "/village-features",
    {
      ...params,
      category:
        "government-scheme",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Farmer Services
|--------------------------------------------------------------------------
*/

export async function getFarmerServices(
  params = {}
) {
  return get(
    "/village-features",
    {
      ...params,
      category:
        "farmer",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Health Services
|--------------------------------------------------------------------------
*/

export async function getHealthServices(
  params = {}
) {
  return get(
    "/village-features",
    {
      ...params,
      category:
        "health",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Education Services
|--------------------------------------------------------------------------
*/

export async function getEducationServices(
  params = {}
) {
  return get(
    "/village-features",
    {
      ...params,
      category:
        "education",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Employment / Skill Training
|--------------------------------------------------------------------------
*/

export async function getSkillTrainingPrograms(
  params = {}
) {
  return get(
    "/village-features",
    {
      ...params,
      category:
        "skill-training",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Village Directory
|--------------------------------------------------------------------------
*/

export async function getVillageDirectory(
  params = {}
) {
  return get(
    "/village-features",
    {
      ...params,
      category:
        "directory",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Transport
|--------------------------------------------------------------------------
*/

export async function getTransportTimetable(
  params = {}
) {
  return get(
    "/village-features",
    {
      ...params,
      category:
        "transport",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Marketplace
|--------------------------------------------------------------------------
*/

export async function getMarketplaceItems(
  params = {}
) {
  return get(
    "/village-features",
    {
      ...params,
      category:
        "marketplace",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Lost & Found
|--------------------------------------------------------------------------
*/

export async function getLostAndFoundItems(
  params = {}
) {
  return get(
    "/village-features",
    {
      ...params,
      category:
        "lost-found",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Gram Sabha
|--------------------------------------------------------------------------
*/

export async function getGramSabhaMeetings(
  params = {}
) {
  return get(
    "/village-features",
    {
      ...params,
      category:
        "gram-sabha",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Bills & Taxes
|--------------------------------------------------------------------------
*/

export async function getBillStatuses(
  params = {}
) {
  return get(
    "/village-features",
    {
      ...params,
      category:
        "bill-tax",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Health Camps
|--------------------------------------------------------------------------
*/

export async function getHealthCamps(
  params = {}
) {
  return get(
    "/village-features",
    {
      ...params,
      category:
        "health-camp",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Vaccination
|--------------------------------------------------------------------------
*/

export async function getVaccinationPrograms(
  params = {}
) {
  return get(
    "/village-features",
    {
      ...params,
      category:
        "vaccination",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Animal Health
|--------------------------------------------------------------------------
*/

export async function getAnimalHealthServices(
  params = {}
) {
  return get(
    "/village-features",
    {
      ...params,
      category:
        "animal-health",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Volunteer / Shramdaan
|--------------------------------------------------------------------------
*/

export async function getVolunteerActivities(
  params = {}
) {
  return get(
    "/village-features",
    {
      ...params,
      category:
        "volunteer",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Complaint Support
|--------------------------------------------------------------------------
|
| Ek complaint par citizens support/vote kar sakte hain.
|--------------------------------------------------------------------------
*/

export async function supportComplaint(
  complaintId
) {
  if (!complaintId) {
    throw new Error(
      "Complaint ID is required."
    );
  }

  /*
   * Existing complaint API ke according
   * endpoint change kiya ja sakta hai.
   */
  return post(
    `/complaints/${complaintId}/support`
  );
}

/*
|--------------------------------------------------------------------------
| Scheme Application
|--------------------------------------------------------------------------
*/

export async function applyForFeature(
  featureId,
  applicationData = {}
) {
  if (!featureId) {
    throw new Error(
      "Feature ID is required."
    );
  }

  return post(
    `/village-features/${featureId}/apply`,
    applicationData
  );
}

/*
|--------------------------------------------------------------------------
| Get My Applications
|--------------------------------------------------------------------------
*/

export async function getMyFeatureApplications(
  params = {}
) {
  return get(
    "/village-features/applications/mine",
    params
  );
}

/*
|--------------------------------------------------------------------------
| Get Application By ID
|--------------------------------------------------------------------------
*/

export async function getFeatureApplicationById(
  id
) {
  if (!id) {
    throw new Error(
      "Application ID is required."
    );
  }

  return get(
    `/village-features/applications/track/${id}`
  );
}

/*
|--------------------------------------------------------------------------
| Cancel Application
|--------------------------------------------------------------------------
*/

export async function cancelFeatureApplication(
  id
) {
  if (!id) {
    throw new Error(
      "Application ID is required."
    );
  }

  // Backend has no citizen-side cancel endpoint; only admins can delete.
  throw new Error(
    "Cancelling an application is not supported. Please contact the Gram Panchayat."
  );
}

/*
|--------------------------------------------------------------------------
| Admin Application Management
|--------------------------------------------------------------------------
*/

export async function getAllFeatureApplications(
  params = {}
) {
  return get(
    "/village-features/admin/applications",
    params
  );
}

export async function updateFeatureApplicationStatus(
  id,
  statusData
) {
  if (!id) {
    throw new Error(
      "Application ID is required."
    );
  }

  return patch(
    `/village-features/admin/applications/${id}`,
    statusData
  );
}

/*
|--------------------------------------------------------------------------
| Mandi Prices
|--------------------------------------------------------------------------
*/

export async function getMandiPrices(
  params = {}
) {
  return get(
    "/village-features",
    {
      ...params,
      category:
        "mandi-bhav",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Crop Advice
|--------------------------------------------------------------------------
*/

export async function getCropAdvice(
  params = {}
) {
  return get(
    "/village-features",
    {
      ...params,
      category:
        "crop-advice",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Equipment Rental
|--------------------------------------------------------------------------
*/

export async function getEquipmentRentals(
  params = {}
) {
  return get(
    "/village-features",
    {
      ...params,
      category:
        "equipment-rental",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Fertilizer / Seed Availability
|--------------------------------------------------------------------------
*/

export async function getFertilizerSeedAvailability(
  params = {}
) {
  return get(
    "/village-features",
    {
      ...params,
      category:
        "fertilizer-seed",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Search Village Features
|--------------------------------------------------------------------------
*/

export async function searchVillageFeatures(
  searchTerm,
  params = {}
) {
  if (
    !searchTerm ||
    !searchTerm.trim()
  ) {
    return getVillageFeatures(
      params
    );
  }

  return get(
    "/village-features",
    {
      ...params,
      search:
        searchTerm.trim(),
    }
  );
}

/*
|--------------------------------------------------------------------------
| Export API Object
|--------------------------------------------------------------------------
|
| Named functions ke saath default object bhi export kiya gaya hai
| taaki existing project mein dono styles use kiye ja saken.
|--------------------------------------------------------------------------
*/

const villageFeatureService = {
  getVillageFeatures,
  getVillageFeatureById,

  createVillageFeature,
  updateVillageFeature,
  deleteVillageFeature,

  getFeaturesByCategory,

  getGovernmentSchemes,
  getFarmerServices,
  getHealthServices,
  getEducationServices,
  getSkillTrainingPrograms,

  getVillageDirectory,
  getTransportTimetable,

  getMarketplaceItems,
  getLostAndFoundItems,

  getGramSabhaMeetings,
  getBillStatuses,

  getHealthCamps,
  getVaccinationPrograms,
  getAnimalHealthServices,

  getVolunteerActivities,

  supportComplaint,

  applyForFeature,
  getMyFeatureApplications,
  getFeatureApplicationById,
  cancelFeatureApplication,

  getAllFeatureApplications,
  updateFeatureApplicationStatus,

  getMandiPrices,
  getCropAdvice,
  getEquipmentRentals,
  getFertilizerSeedAvailability,

  searchVillageFeatures,
};

export default villageFeatureService;