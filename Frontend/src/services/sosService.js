import api from "./api";

/*
| Emergency SOS service - endpoints match Backend/src/routes/sosRoutes.js
|
| Citizen:
|   POST   /sos                     create
|   GET    /sos/mine                my history
|   GET    /sos/mine/active         my active SOS
|   PATCH  /sos/:id/cancel          cancel
| Admin:
|   GET    /sos/admin               list all
|   GET    /sos/admin/:id           single
|   PATCH  /sos/admin/:id/acknowledge | responding | resolve | false-alarm | response
*/

const requireId = (id) => {
  if (!id) throw new Error("SOS alert ID is required.");
};

// Backend destructures `location` with a {} default, which only applies to
// undefined - so never send null, and accept flat latitude/longitude too.
const normalizePayload = (data = {}) => {
  const { latitude, longitude, accuracy, location, emergencyContacts, ...rest } = data;
  const loc = { ...(location || {}) };
  if (loc.latitude == null && latitude != null) loc.latitude = latitude;
  if (loc.longitude == null && longitude != null) loc.longitude = longitude;
  if (loc.accuracy == null && accuracy != null) loc.accuracy = accuracy;
  return { ...rest, location: loc };
};

export const createSOSAlert = (sosData) => {
  if (!sosData) throw new Error("SOS data is required.");
  return api.post("/sos", normalizePayload(sosData));
};

export const getMySOSAlerts = (params = {}) => api.get("/sos/mine", { params });
export const getMyActiveSOS = () => api.get("/sos/mine/active");

export const cancelSOSAlert = (id, reason = "") => {
  requireId(id);
  return api.patch(`/sos/${id}/cancel`, { reason });
};

// Admin
export const getAllSOSAlerts = (params = {}) => api.get("/sos/admin", { params });

export const getSOSAlertById = (id) => {
  requireId(id);
  return api.get(`/sos/admin/${id}`);
};

export const acknowledgeSOS = (id, responseMessage = "") => {
  requireId(id);
  return api.patch(`/sos/admin/${id}/acknowledge`, { responseMessage });
};

export const markSOSResponding = (id, data = {}) => {
  requireId(id);
  return api.patch(`/sos/admin/${id}/responding`, data);
};

export const updateSOSResponse = (id, data = {}) => {
  requireId(id);
  return api.patch(`/sos/admin/${id}/response`, data);
};

export const resolveSOS = (id, resolutionNote = "") => {
  requireId(id);
  return api.patch(`/sos/admin/${id}/resolve`, { resolutionNote });
};

export const markFalseAlarm = (id, resolutionNote = "") => {
  requireId(id);
  return api.patch(`/sos/admin/${id}/false-alarm`, { resolutionNote });
};

// Browser helpers
export const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation is not supported by this browser."));
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy }),
      (error) => {
        const messages = {
          1: "Location permission denied. Please allow location access.",
          2: "Current location is unavailable.",
          3: "Location request timed out.",
        };
        reject(new Error(messages[error.code] || "Unable to get your current location."));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });

export const callEmergencyNumber = (phoneNumber) => {
  if (!phoneNumber) throw new Error("Emergency phone number is required.");
  window.location.href = `tel:${String(phoneNumber).replace(/[^0-9+]/g, "")}`;
};

export const DEFAULT_EMERGENCY_NUMBERS = {
  police: "112",
  ambulance: "108",
  fire: "101",
  womenHelpline: "181",
  childHelpline: "1098",
};

export default {
  createSOSAlert, getMySOSAlerts, getMyActiveSOS, cancelSOSAlert,
  getAllSOSAlerts, getSOSAlertById, acknowledgeSOS, markSOSResponding,
  updateSOSResponse, resolveSOS, markFalseAlarm,
  getCurrentLocation, callEmergencyNumber, DEFAULT_EMERGENCY_NUMBERS,
};