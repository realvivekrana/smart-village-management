
/*
|--------------------------------------------------------------------------
| Household Service
|--------------------------------------------------------------------------
| Citizen ke family / household members manage karne ke liye API service.
|
| Features:
| - Household details
| - Family members list
| - Add member
| - Update member
| - Delete member
| - Household documents
| - Reusable family information
|--------------------------------------------------------------------------
*/

import axios from "axios";

/*
|--------------------------------------------------------------------------
| API Base URL
|--------------------------------------------------------------------------
*/

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

/*
|--------------------------------------------------------------------------
| Axios Client
|--------------------------------------------------------------------------
*/

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type":
      "application/json",
  },
  timeout: 15000,
});

/*
|--------------------------------------------------------------------------
| Authentication Token
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "token"
      ) ||
      localStorage.getItem(
        "accessToken"
      ) ||
      localStorage.getItem(
        "authToken"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) =>
    Promise.reject(error)
);

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
| GET
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
| POST
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
| PUT
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
| DELETE
|--------------------------------------------------------------------------
*/

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
| Get My Household
|--------------------------------------------------------------------------
*/

export async function getMyHousehold() {
  return get(
    "/households/me"
  );
}

/*
|--------------------------------------------------------------------------
| Get Household By ID
|--------------------------------------------------------------------------
*/

export async function getHouseholdById(
  id
) {
  if (!id) {
    throw new Error(
      "Household ID is required."
    );
  }

  return get(
    `/households/${id}`
  );
}

/*
|--------------------------------------------------------------------------
| Create Household
|--------------------------------------------------------------------------
*/

export async function createHousehold(
  householdData = {}
) {
  return post(
    "/households",
    householdData
  );
}

/*
|--------------------------------------------------------------------------
| Update Household
|--------------------------------------------------------------------------
*/

export async function updateHousehold(
  id,
  householdData = {}
) {
  if (!id) {
    throw new Error(
      "Household ID is required."
    );
  }

  return put(
    `/households/${id}`,
    householdData
  );
}

/*
|--------------------------------------------------------------------------
| Delete Household
|--------------------------------------------------------------------------
*/

export async function deleteHousehold(
  id
) {
  if (!id) {
    throw new Error(
      "Household ID is required."
    );
  }

  return remove(
    `/households/${id}`
  );
}

/*
|--------------------------------------------------------------------------
| Add Family Member
|--------------------------------------------------------------------------
*/

export async function addFamilyMember(
  householdId,
  memberData = {}
) {
  if (!householdId) {
    throw new Error(
      "Household ID is required."
    );
  }

  return post(
    `/households/${householdId}/members`,
    memberData
  );
}

/*
|--------------------------------------------------------------------------
| Update Family Member
|--------------------------------------------------------------------------
*/

export async function updateFamilyMember(
  householdId,
  memberId,
  memberData = {}
) {
  if (!householdId) {
    throw new Error(
      "Household ID is required."
    );
  }

  if (!memberId) {
    throw new Error(
      "Member ID is required."
    );
  }

  return put(
    `/households/${householdId}/members/${memberId}`,
    memberData
  );
}

/*
|--------------------------------------------------------------------------
| Delete Family Member
|--------------------------------------------------------------------------
*/

export async function deleteFamilyMember(
  householdId,
  memberId
) {
  if (!householdId) {
    throw new Error(
      "Household ID is required."
    );
  }

  if (!memberId) {
    throw new Error(
      "Member ID is required."
    );
  }

  return remove(
    `/households/${householdId}/members/${memberId}`
  );
}

/*
|--------------------------------------------------------------------------
| Get Family Members
|--------------------------------------------------------------------------
*/

export async function getFamilyMembers(
  householdId
) {
  if (!householdId) {
    throw new Error(
      "Household ID is required."
    );
  }

  return get(
    `/households/${householdId}/members`
  );
}

/*
|--------------------------------------------------------------------------
| Get Single Family Member
|--------------------------------------------------------------------------
*/

export async function getFamilyMemberById(
  householdId,
  memberId
) {
  if (!householdId) {
    throw new Error(
      "Household ID is required."
    );
  }

  if (!memberId) {
    throw new Error(
      "Member ID is required."
    );
  }

  return get(
    `/households/${householdId}/members/${memberId}`
  );
}

/*
|--------------------------------------------------------------------------
| Household Documents
|--------------------------------------------------------------------------
*/

export async function getHouseholdDocuments(
  householdId
) {
  if (!householdId) {
    throw new Error(
      "Household ID is required."
    );
  }

  return get(
    `/households/${householdId}/documents`
  );
}

/*
|--------------------------------------------------------------------------
| Add Household Document
|--------------------------------------------------------------------------
*/

export async function addHouseholdDocument(
  householdId,
  documentData = {}
) {
  if (!householdId) {
    throw new Error(
      "Household ID is required."
    );
  }

  return post(
    `/households/${householdId}/documents`,
    documentData
  );
}

/*
|--------------------------------------------------------------------------
| Delete Household Document
|--------------------------------------------------------------------------
*/

export async function deleteHouseholdDocument(
  householdId,
  documentId
) {
  if (!householdId) {
    throw new Error(
      "Household ID is required."
    );
  }

  if (!documentId) {
    throw new Error(
      "Document ID is required."
    );
  }

  return remove(
    `/households/${householdId}/documents/${documentId}`
  );
}

/*
|--------------------------------------------------------------------------
| Search Household Members
|--------------------------------------------------------------------------
*/

export async function searchFamilyMembers(
  householdId,
  searchTerm
) {
  if (!householdId) {
    throw new Error(
      "Household ID is required."
    );
  }

  return get(
    `/households/${householdId}/members`,
    {
      search:
        searchTerm?.trim() || "",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Reusable Government Form Data
|--------------------------------------------------------------------------
|
| Saved household details ko government scheme/application
| forms mein automatically use karne ke liye.
|--------------------------------------------------------------------------
*/

export async function getHouseholdFormData() {
  return get(
    "/households/me/form-data"
  );
}

/*
|--------------------------------------------------------------------------
| Household Summary
|--------------------------------------------------------------------------
*/

export async function getHouseholdSummary() {
  return get(
    "/households/me/summary"
  );
}

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

const householdService = {
  getMyHousehold,
  getHouseholdById,

  createHousehold,
  updateHousehold,
  deleteHousehold,

  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,

  getFamilyMembers,
  getFamilyMemberById,

  getHouseholdDocuments,
  addHouseholdDocument,
  deleteHouseholdDocument,

  searchFamilyMembers,

  getHouseholdFormData,
  getHouseholdSummary,
};

export default householdService;