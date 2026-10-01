import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Ambulance,
  Flame,
  MapPin,
  Phone,
  ShieldAlert,
  Navigation,
  X,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import {
  createSOSAlert,
} from "../../services/sosService";
import VoiceInput from "../../components/common/VoiceInput";
import { useLanguage } from "../../context/LanguageContext";
import BackButton from "../../components/common/BackButton";

/*
|--------------------------------------------------------------------------
| Emergency Numbers
|--------------------------------------------------------------------------
|
| These can later be moved to the database/admin settings.
|
*/

const EMERGENCY_NUMBERS = {
  ambulance: "108",
  police: "112",
  fire: "101",
  emergency: "112",
};

/*
|--------------------------------------------------------------------------
| EmergencySOS
|--------------------------------------------------------------------------
*/

export default function EmergencySOS() {
  const { t } = useLanguage();
  const [location, setLocation] =
    useState(null);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [sosId, setSosId] =
    useState("");

  /*
   * ----------------------------------------------------------------------
   * Get current location
   * ----------------------------------------------------------------------
   */

  const getCurrentLocation = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        t("ui.locationServiceIsNotAvailable1ff", "Location service is not available in your browser.")
      );

      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {
          latitude,
          longitude,
          accuracy,
        } = position.coords;

        setLocation({
          latitude,
          longitude,
          accuracy,
        });

        setLocationLoading(false);
      },
      (geoError) => {
        console.error(
          "Location error:",
          geoError
        );

        let errorMessage =
          t("ui.couldNotGetYourCurrent21d", "Could not get your current location.");

        if (
          geoError.code ===
          geoError.PERMISSION_DENIED
        ) {
          errorMessage =
            t("ui.pleaseAllowLocationPermissionc29", "Please allow location permission.");
        }

        if (
          geoError.code ===
          geoError.POSITION_UNAVAILABLE
        ) {
          errorMessage =
            t("ui.locationIsTemporarilyUnavailablea60", "Location is temporarily unavailable.");
        }

        if (
          geoError.code ===
          geoError.TIMEOUT
        ) {
          errorMessage =
            t("ui.locationRequestTimedOut1be", "Location request timed out.");
        }

        setLocationError(
          errorMessage
        );

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  /*
   * ----------------------------------------------------------------------
   * Get location on page load
   * ----------------------------------------------------------------------
   */

  useEffect(() => {
    getCurrentLocation();
  }, []);

  /*
   * ----------------------------------------------------------------------
   * Open confirmation
   * ----------------------------------------------------------------------
   */

  const handleSOSClick = () => {
    setError("");

    setSuccess(false);

    setShowConfirm(true);
  };

  /*
   * ----------------------------------------------------------------------
   * Send SOS
   * ----------------------------------------------------------------------
   */

  const handleSendSOS = async () => {
    try {
      setSending(true);

      setError("");

      /*
       * Try getting fresh location
       * before sending SOS.
       */

      let currentLocation =
        location;

      if (
        navigator.geolocation &&
        !currentLocation
      ) {
        currentLocation =
          await getLocationPromise();
      }

      const payload = {
        message:
          message.trim() ||
          t("sos.defaultMessage"),

        latitude:
          currentLocation?.latitude ||
          null,

        longitude:
          currentLocation?.longitude ||
          null,

        accuracy:
          currentLocation?.accuracy ||
          null,

        location:
          currentLocation
            ? {
                latitude:
                  currentLocation.latitude,
                longitude:
                  currentLocation.longitude,
                accuracy:
                  currentLocation.accuracy,
              }
            : null,

        emergencyContacts:
          EMERGENCY_NUMBERS,
      };

      const response =
        await createSOSAlert(
          payload
        );

      /*
       * Support common API response shapes.
       */

      const createdSOS =
        response?.data?.data ||
        response?.data ||
        response?.sos ||
        response;

      setSosId(
        createdSOS?._id ||
          createdSOS?.id ||
          ""
      );

      setSuccess(true);

      setShowConfirm(false);
    } catch (err) {
      console.error(
        "SOS error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          t("ui.couldNotSendTheSos650", "Could not send the SOS alert. Please try again.")
      );
    } finally {
      setSending(false);
    }
  };

  /*
   * ----------------------------------------------------------------------
   * Call emergency number
   * ----------------------------------------------------------------------
   */

  const callNumber = (number) => {
    window.location.href =
      `tel:${number}`;
  };

  /*
   * ----------------------------------------------------------------------
   * Open location in map
   * ----------------------------------------------------------------------
   */

  const openMap = () => {
    if (!location) {
      getCurrentLocation();

      return;
    }

    const url =
      `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /*
   * ----------------------------------------------------------------------
   * Success screen
   * ----------------------------------------------------------------------
   */

  if (success) {
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-700/40 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-green-200 dark:border-green-800 bg-white dark:bg-gray-800 p-6 text-center shadow-lg sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
              SOS Alert Sent
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
              {t("ui.theEmergencyAlertHasBeenadc", "The emergency alert has been sent to the village admin. If the situation is serious, please also call an emergency number directly.")}
            </p>

            {sosId && (
              <div className="mt-5 rounded-xl bg-gray-50 dark:bg-gray-700/40 p-3 text-left">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  SOS Reference ID
                </p>

                <p className="mt-1 break-all font-mono text-sm text-gray-800 dark:text-gray-100">
                  {sosId}
                </p>
              </div>
            )}

            {location && (
              <div className="mt-5 rounded-xl border border-green-100 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 text-left">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />

                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-200">
                      Location shared
                    </p>

                    <p className="mt-1 text-xs text-green-700 dark:text-green-300">
                      Latitude:{" "}
                      {location.latitude.toFixed(
                        6
                      )}
                      <br />
                      Longitude:{" "}
                      {location.longitude.toFixed(
                        6
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openMap}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-green-700 dark:text-green-300 shadow-sm hover:bg-green-100 dark:hover:bg-green-900/40"
                >
                  <Navigation className="h-4 w-4" />

                  Open Map
                </button>
              </div>
            )}

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <EmergencyCallButton
                icon={
                  <Ambulance className="h-5 w-5" />
                }
                label="Ambulance"
                number={
                  EMERGENCY_NUMBERS.ambulance
                }
                onClick={() =>
                  callNumber(
                    EMERGENCY_NUMBERS.ambulance
                  )
                }
              />

              <EmergencyCallButton
                icon={
                  <ShieldAlert className="h-5 w-5" />
                }
                label="Police"
                number={
                  EMERGENCY_NUMBERS.police
                }
                onClick={() =>
                  callNumber(
                    EMERGENCY_NUMBERS.police
                  )
                }
              />

              <EmergencyCallButton
                icon={
                  <Flame className="h-5 w-5" />
                }
                label="Fire"
                number={
                  EMERGENCY_NUMBERS.fire
                }
                onClick={() =>
                  callNumber(
                    EMERGENCY_NUMBERS.fire
                  )
                }
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setSosId("");
                setMessage("");
                setError("");
              }}
              className="mt-6 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Back to Emergency Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ----------------------------------------------------------------------
   * Main page
   * ----------------------------------------------------------------------
   */

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-700/40">
      {/* ================================================================ */}
      {/* HEADER */}
      {/* ================================================================ */}

      <section className="bg-gradient-to-br from-red-700 via-red-600 to-orange-600 text-white">
        <div className="mx-auto max-w-5xl px-4 py-10 text-center sm:px-6 sm:py-14">
          <div className="mb-5 text-left">
            <BackButton to="/citizen/dashboard" label="Back to Dashboard" variant="onDark" />
          </div>

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
            Emergency SOS
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/90 sm:text-base">
            {t("ui.inAnEmergencyAlertThe588", "In an emergency, alert the village admin and call an ambulance, police or fire service in one tap.")}
          </p>
        </div>
      </section>

      {/* ================================================================ */}
      {/* MAIN */}
      {/* ================================================================ */}

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

              <div>
                <p className="font-semibold text-red-800 dark:text-red-200">
                  SOS Error
                </p>

                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SOS CARD */}
        {/* ============================================================ */}

        <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm sm:p-8">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Need immediate help?
            </p>

            <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
              Emergency Alert Send Karein
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
              {t("ui.useTheSosButtonOnly178", "Use the SOS button only for genuine emergencies. Your location, if available, may be sent to the admin along with the alert.")}
            </p>

            {/* Big SOS button */}
            <button
              type="button"
              onClick={handleSOSClick}
              disabled={sending}
              className="group relative mx-auto mt-8 flex h-48 w-48 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-200 transition hover:scale-105 hover:bg-red-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:h-56 sm:w-56"
            >
              <span className="absolute inset-3 rounded-full border-2 border-white/20" />

              <span className="relative flex flex-col items-center">
                <AlertTriangle className="h-12 w-12 sm:h-14 sm:w-14" />

                <span className="mt-2 text-3xl font-black tracking-wide">
                  SOS
                </span>

                <span className="mt-1 text-xs font-medium text-white/85">
                  TAP FOR HELP
                </span>
              </span>
            </button>
          </div>

          {/* ========================================================== */}
          {/* LOCATION */}
          {/* ========================================================== */}

          <div className="mt-10 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Current Location
                  </h3>

                  {locationLoading ? (
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Loader2 className="h-4 w-4 animate-spin" />

                      {t("ui.detectingLocation050", "Detecting location...")}
                    </div>
                  ) : location ? (
                    <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                      Location available
                      {location.accuracy
                        ? ` • Accuracy ~${Math.round(
                            location.accuracy
                          )}m`
                        : ""}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {t("ui.locationIsNotAvailableaf9", "Location is not available.")}
                    </p>
                  )}

                  {locationError && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {locationError}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={
                    getCurrentLocation
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <RefreshCw className="h-4 w-4" />

                  Refresh
                </button>

                {location && (
                  <button
                    type="button"
                    onClick={openMap}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Navigation className="h-4 w-4" />

                    Map
                  </button>
                )}
              </div>
            </div>

            {location && (
              <div className="mt-4 grid gap-3 border-t border-gray-200 dark:border-gray-700 pt-4 sm:grid-cols-2">
                <LocationValue
                  label="Latitude"
                  value={location.latitude.toFixed(
                    6
                  )}
                />

                <LocationValue
                  label="Longitude"
                  value={location.longitude.toFixed(
                    6
                  )}
                />
              </div>
            )}
          </div>

          {/* ========================================================== */}
          {/* MESSAGE */}
          {/* ========================================================== */}

          <div className="mt-6">
            <label
              htmlFor="sos-message"
              className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
            >
              Emergency Message{" "}
              <span className="font-normal text-gray-400">
                (optional)
              </span>
            </label>

            <VoiceInput
              id="sos-message"
              value={message}
              onChange={setMessage}
              maxLength={500}
              rows={4}
              placeholder={t("sos.messagePlaceholder")}
              className="mt-2"
            />

            <div className="mt-1 text-right text-xs text-gray-400">
              {message.length}/500
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* EMERGENCY CONTACTS */}
        {/* ============================================================ */}

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Emergency Contacts
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Direct call ke liye neeche diye gaye
              numbers use karein.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <EmergencyContactCard
              icon={
                <Ambulance className="h-6 w-6" />
              }
              title="Ambulance"
              number={
                EMERGENCY_NUMBERS.ambulance
              }
              onCall={() =>
                callNumber(
                  EMERGENCY_NUMBERS.ambulance
                )
              }
            />

            <EmergencyContactCard
              icon={
                <ShieldAlert className="h-6 w-6" />
              }
              title="Police"
              number={
                EMERGENCY_NUMBERS.police
              }
              onCall={() =>
                callNumber(
                  EMERGENCY_NUMBERS.police
                )
              }
            />

            <EmergencyContactCard
              icon={
                <Flame className="h-6 w-6" />
              }
              title="Fire"
              number={
                EMERGENCY_NUMBERS.fire
              }
              onCall={() =>
                callNumber(
                  EMERGENCY_NUMBERS.fire
                )
              }
            />

            <EmergencyContactCard
              icon={
                <Phone className="h-6 w-6" />
              }
              title="Emergency"
              number={
                EMERGENCY_NUMBERS.emergency
              }
              onCall={() =>
                callNumber(
                  EMERGENCY_NUMBERS.emergency
                )
              }
            />
          </div>
        </section>

        {/* ============================================================ */}
        {/* SAFETY NOTICE */}
        {/* ============================================================ */}

        <div className="mt-8 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />

            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-200">
                Important
              </h3>

              <p className="mt-1 text-sm leading-6 text-amber-800 dark:text-amber-200">
                {t("ui.useTheSosAlertOnly6a4", "Use the SOS alert only for genuine emergencies. In a life-threatening situation, it is also important to call local emergency services directly.")}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ================================================================ */}
      {/* CONFIRM MODAL */}
      {/* ================================================================ */}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Send SOS Alert?
                  </h2>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t("ui.thisAlertWillBeSentcf9", "This alert will be sent to the village admin as an emergency notification.")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowConfirm(false)
                }
                disabled={sending}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Location status */}
            <div className="mt-5 rounded-xl bg-gray-50 dark:bg-gray-700/40 p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />

                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Location
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {location
                      ? "Current location available"
                      : "Location unavailable"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <QuickNumber
                label="Ambulance"
                number={
                  EMERGENCY_NUMBERS.ambulance
                }
              />

              <QuickNumber
                label="Police"
                number={
                  EMERGENCY_NUMBERS.police
                }
              />

              <QuickNumber
                label="Fire"
                number={
                  EMERGENCY_NUMBERS.fire
                }
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowConfirm(false)
                }
                disabled={sending}
                className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSendSOS}
                disabled={sending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />

                    Sending...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />

                    Confirm SOS
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Promise based geolocation helper
|--------------------------------------------------------------------------
*/

function getLocationPromise() {
  return new Promise(
    (resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error(
            "Geolocation is not supported."
          )
        );

        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude:
              position.coords.latitude,
            longitude:
              position.coords.longitude,
            accuracy:
              position.coords.accuracy,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  );
}

/*
|--------------------------------------------------------------------------
| Location Value
|--------------------------------------------------------------------------
*/

function LocationValue({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {label}
      </p>

      <p className="mt-1 font-mono text-sm text-gray-800 dark:text-gray-100">
        {value}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Emergency Contact Card
|--------------------------------------------------------------------------
*/

function EmergencyContactCard({
  icon,
  title,
  number,
  onCall,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
          {icon}
        </div>

        <span className="text-xs font-medium text-gray-400">
          24/7
        </span>
      </div>

      <h3 className="mt-4 font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>

      <p className="mt-1 text-xl font-bold text-gray-800 dark:text-gray-100">
        {number}
      </p>

      <button
        type="button"
        onClick={onCall}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
      >
        <Phone className="h-4 w-4" />

        Call Now
      </button>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Emergency Call Button
|--------------------------------------------------------------------------
*/

function EmergencyCallButton({
  icon,
  label,
  number,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-left transition hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
        {icon}

        <span className="text-sm font-semibold">
          {label}
        </span>
      </div>

      <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
        {number}
      </p>
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| Quick Number
|--------------------------------------------------------------------------
*/

function QuickNumber({
  label,
  number,
}) {
  return (
    <a
      href={`tel:${number}`}
      className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-center hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <p className="text-[11px] text-gray-500 dark:text-gray-400">
        {label}
      </p>

      <p className="mt-0.5 text-sm font-bold text-gray-800 dark:text-gray-100">
        {number}
      </p>
    </a>
  );
}