
import api from "../api/axios";

/*
|--------------------------------------------------------------------------
| Emergency SOS Service
|--------------------------------------------------------------------------
| Village emergency system:
|
| - SOS alert create
| - Current location send
| - Admin ko alert
| - Emergency contacts
| - Police / Ambulance / Fire
| - Citizen ke SOS alerts
| - Admin alert management
| - Alert status update
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Create SOS Alert
|--------------------------------------------------------------------------
| Citizen emergency button dabayega.
|
| Example:
|
| createSOSAlert({
|   type: "medical",
|   message: "Medical emergency",
|   latitude: 24.123,
|   longitude: 85.456
| })
|--------------------------------------------------------------------------
*/

export const createSOSAlert = async (
  sosData
) => {
  if (!sosData) {
    throw new Error(
      "SOS data is required."
    );
  }

  const response = await api.post(
    "/sos",
    sosData
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Send SOS using current browser location
|--------------------------------------------------------------------------
*/

export const createSOSWithLocation =
  async ({
    type = "general",
    message = "",
    accuracy = null,
    additionalData = {},
  } = {}) => {
    if (
      !navigator.geolocation
    ) {
      throw new Error(
        "Your device does not support location services."
      );
    }

    const position =
      await new Promise(
        (
          resolve,
          reject
        ) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            }
          );
        }
      );

    const {
      latitude,
      longitude,
      accuracy:
        locationAccuracy,
    } = position.coords;

    const payload = {
      type,
      message,

      location: {
        latitude,
        longitude,
        accuracy:
          accuracy ??
          locationAccuracy,
      },

      latitude,
      longitude,

      ...additionalData,
    };

    const response = await api.post(
      "/sos",
      payload
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Get emergency contacts
|--------------------------------------------------------------------------
| Public/citizen side.
|--------------------------------------------------------------------------
*/

export const getEmergencyContacts =
  async (params = {}) => {
    const response = await api.get(
      "/sos/emergency-contacts",
      {
        params,
      }
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Get all emergency numbers
|--------------------------------------------------------------------------
*/

export const getEmergencyNumbers =
  async () => {
    const response = await api.get(
      "/sos/emergency-numbers"
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Get police contacts
|--------------------------------------------------------------------------
*/

export const getPoliceContacts =
  async (params = {}) => {
    const response = await api.get(
      "/sos/emergency-contacts/police",
      {
        params,
      }
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Get ambulance contacts
|--------------------------------------------------------------------------
*/

export const getAmbulanceContacts =
  async (params = {}) => {
    const response = await api.get(
      "/sos/emergency-contacts/ambulance",
      {
        params,
      }
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Get fire contacts
|--------------------------------------------------------------------------
*/

export const getFireContacts =
  async (params = {}) => {
    const response = await api.get(
      "/sos/emergency-contacts/fire",
      {
        params,
      }
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Get my SOS alerts
|--------------------------------------------------------------------------
*/

export const getMySOSAlerts =
  async (params = {}) => {
    const response = await api.get(
      "/sos/my",
      {
        params,
      }
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Get single SOS alert
|--------------------------------------------------------------------------
*/

export const getSOSAlertById =
  async (id) => {
    if (!id) {
      throw new Error(
        "SOS alert ID is required."
      );
    }

    const response = await api.get(
      `/sos/${id}`
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Cancel SOS
|--------------------------------------------------------------------------
| Citizen apna active alert cancel
| kar sakta hai.
|--------------------------------------------------------------------------
*/

export const cancelSOSAlert =
  async (id, reason = "") => {
    if (!id) {
      throw new Error(
        "SOS alert ID is required."
      );
    }

    const response = await api.put(
      `/sos/${id}/cancel`,
      {
        reason,
      }
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Admin:
| Get all SOS alerts
|--------------------------------------------------------------------------
*/

export const getAllSOSAlerts =
  async (params = {}) => {
    const response = await api.get(
      "/sos",
      {
        params,
      }
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Admin:
| Get active SOS alerts
|--------------------------------------------------------------------------
*/

export const getActiveSOSAlerts =
  async (params = {}) => {
    const response = await api.get(
      "/sos/active",
      {
        params,
      }
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Admin:
| Update SOS status
|--------------------------------------------------------------------------
|
| Possible status:
|
| - active
| - acknowledged
| - responding
| - resolved
| - cancelled
|--------------------------------------------------------------------------
*/

export const updateSOSStatus =
  async (
    id,
    status,
    additionalData = {}
  ) => {
    if (!id) {
      throw new Error(
        "SOS alert ID is required."
      );
    }

    if (!status) {
      throw new Error(
        "SOS status is required."
      );
    }

    const response = await api.put(
      `/sos/${id}/status`,
      {
        status,
        ...additionalData,
      }
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Admin:
| Acknowledge SOS
|--------------------------------------------------------------------------
*/

export const acknowledgeSOS =
  async (
    id,
    message = ""
  ) => {
    return updateSOSStatus(
      id,
      "acknowledged",
      {
        message,
      }
    );
  };

/*
|--------------------------------------------------------------------------
| Admin:
| Mark as responding
|--------------------------------------------------------------------------
*/

export const markSOSResponding =
  async (
    id,
    responseMessage = ""
  ) => {
    return updateSOSStatus(
      id,
      "responding",
      {
        responseMessage,
      }
    );
  };

/*
|--------------------------------------------------------------------------
| Admin:
| Resolve SOS
|--------------------------------------------------------------------------
*/

export const resolveSOS =
  async (
    id,
    resolution = ""
  ) => {
    return updateSOSStatus(
      id,
      "resolved",
      {
        resolution,
      }
    );
  };

/*
|--------------------------------------------------------------------------
| Admin:
| Add response note
|--------------------------------------------------------------------------
*/

export const addSOSResponseNote =
  async (
    id,
    note
  ) => {
    if (!id) {
      throw new Error(
        "SOS alert ID is required."
      );
    }

    if (!note?.trim()) {
      throw new Error(
        "Response note is required."
      );
    }

    const response = await api.post(
      `/sos/${id}/notes`,
      {
        note: note.trim(),
      }
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Get SOS statistics
|--------------------------------------------------------------------------
| Admin dashboard.
|--------------------------------------------------------------------------
*/

export const getSOSStatistics =
  async (params = {}) => {
    const response = await api.get(
      "/sos/statistics",
      {
        params,
      }
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Get SOS history
|--------------------------------------------------------------------------
*/

export const getSOSHistory =
  async (
    params = {}
  ) => {
    const response = await api.get(
      "/sos/history",
      {
        params,
      }
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Delete SOS alert
|--------------------------------------------------------------------------
| Admin only.
|--------------------------------------------------------------------------
*/

export const deleteSOSAlert =
  async (id) => {
    if (!id) {
      throw new Error(
        "SOS alert ID is required."
      );
    }

    const response = await api.delete(
      `/sos/${id}`
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| SOS helper
|--------------------------------------------------------------------------
| Browser se current location safely
| retrieve karne ke liye.
|--------------------------------------------------------------------------
*/

export const getCurrentLocation =
  async () => {
    if (
      !navigator.geolocation
    ) {
      throw new Error(
        "Geolocation is not supported by this browser."
      );
    }

    return new Promise(
      (
        resolve,
        reject
      ) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude:
                position.coords
                  .latitude,

              longitude:
                position.coords
                  .longitude,

              accuracy:
                position.coords
                  .accuracy,
            });
          },
          (error) => {
            let message =
              "Unable to get your location.";

            switch (
              error.code
            ) {
              case error
                .PERMISSION_DENIED:
                message =
                  "Location permission denied. Please allow location access.";
                break;

              case error
                .POSITION_UNAVAILABLE:
                message =
                  "Current location is unavailable.";
                break;

              case error.TIMEOUT:
                message =
                  "Location request timed out.";
                break;

              default:
                message =
                  "Unable to get your current location.";
            }

            reject(
              new Error(message)
            );
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      }
    );
  };

/*
|--------------------------------------------------------------------------
| Emergency call helper
|--------------------------------------------------------------------------
| Browser/device phone dialer open karega.
|--------------------------------------------------------------------------
*/

export const callEmergencyNumber =
  (phoneNumber) => {
    if (!phoneNumber) {
      throw new Error(
        "Emergency phone number is required."
      );
    }

    const cleanNumber =
      String(phoneNumber)
        .replace(
          /[^0-9+]/g,
          ""
        );

    window.location.href = `tel:${cleanNumber}`;
  };

/*
|--------------------------------------------------------------------------
| Quick Emergency Numbers
|--------------------------------------------------------------------------
| India ke standard emergency numbers.
|
| IMPORTANT:
| Local village contacts backend se
| dynamic load honge.
|--------------------------------------------------------------------------
*/

export const DEFAULT_EMERGENCY_NUMBERS =
  {
    police: "112",
    ambulance: "108",
    fire: "101",
    womenHelpline: "181",
    childHelpline: "1098",
  };

/*
|--------------------------------------------------------------------------
| Default export
|--------------------------------------------------------------------------
*/

export default {
  createSOSAlert,
  createSOSWithLocation,

  getEmergencyContacts,
  getEmergencyNumbers,

  getPoliceContacts,
  getAmbulanceContacts,
  getFireContacts,

  getMySOSAlerts,
  getSOSAlertById,

  cancelSOSAlert,

  getAllSOSAlerts,
  getActiveSOSAlerts,

  updateSOSStatus,
  acknowledgeSOS,
  markSOSResponding,
  resolveSOS,

  addSOSResponseNote,

  getSOSStatistics,
  getSOSHistory,

  deleteSOSAlert,

  getCurrentLocation,
  callEmergencyNumber,

  DEFAULT_EMERGENCY_NUMBERS,
};