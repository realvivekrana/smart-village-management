import React, { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const emptyForm = {
  name: "",
  localName: "",
  description: "",
  history: "",
  population: "",
  area: "",
  pincode: "",
  stdCode: "",
  altitude: "",
  district: "",
  block: "",
  state: "",
  country: "India",

  phone: "",
  email: "",
  address: "",

  sarpanchName: "",
  sarpanchPhone: "",

  languages: "",
  rivers: "",

  road: "",
  rail: "",
  air: "",

  latitude: "",
  longitude: "",
};

const VillageSettings = () => {
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  useEffect(() => {
    loadVillage();
  }, []);

  const loadVillage = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/village`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load village settings (${response.status})`
        );
      }

      const result = await response.json();

      const village =
        result?.data ||
        result?.village ||
        result;

      if (!village) {
        throw new Error(
          "Village information not found."
        );
      }

      setForm(villageToForm(village));
    } catch (err) {
      console.error("Village settings error:", err);

      setError(
        err.message ||
          "Unable to load village settings."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setSuccess("");
      setError("");

      const payload = formToPayload(form);

      /*
       * If your backend uses PUT/PATCH on a different
       * admin endpoint, change this endpoint only.
       */
      const response = await fetch(
        `${API_URL}/village`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            `Failed to save village settings (${response.status})`
        );
      }

      const updatedVillage =
        result?.data ||
        result?.village;

      if (updatedVillage) {
        setForm(
          villageToForm(updatedVillage)
        );
      }

      setSuccess(
        result?.message ||
          "Village settings saved successfully."
      );
    } catch (err) {
      console.error(
        "Save village settings error:",
        err
      );

      setError(
        err.message ||
          "Unable to save village settings."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSuccess("");
    setError("");
    loadVillage();
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />

          <p className="mt-4 text-sm text-gray-500">
            Loading village settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Administration
              </p>

              <h1 className="mt-1 text-2xl font-bold text-gray-900">
                Village Settings
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage the information displayed across
                the village website.
              </p>
            </div>

            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <span>⚠️</span>

            <div>
              <p className="text-sm font-semibold text-red-800">
                Error
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
            <span>✓</span>

            <div>
              <p className="text-sm font-semibold text-green-800">
                Success
              </p>

              <p className="mt-1 text-sm text-green-700">
                {success}
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic Information */}
          <SettingsCard
            title="Basic Information"
            description="Main information about your village."
            icon="🏘️"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Village Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <Input
                label="Local Name"
                name="localName"
                value={form.localName}
                onChange={handleChange}
                placeholder="Local / regional name"
              />

              <Input
                label="State"
                name="state"
                value={form.state}
                onChange={handleChange}
              />

              <Input
                label="Country"
                name="country"
                value={form.country}
                onChange={handleChange}
              />

              <Input
                label="District"
                name="district"
                value={form.district}
                onChange={handleChange}
              />

              <Input
                label="Block"
                name="block"
                value={form.block}
                onChange={handleChange}
              />

              <Input
                label="PIN Code"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
              />

              <Input
                label="STD Code"
                name="stdCode"
                value={form.stdCode}
                onChange={handleChange}
              />
            </div>

            <div className="mt-5">
              <Textarea
                label="Village Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                placeholder="Write a detailed description of the village..."
              />
            </div>

            <div className="mt-5">
              <Textarea
                label="History"
                name="history"
                value={form.history}
                onChange={handleChange}
                rows={6}
                placeholder="Village history..."
              />
            </div>
          </SettingsCard>

          {/* Statistics */}
          <SettingsCard
            title="Village Statistics"
            description="Population, area and geographical information."
            icon="📊"
          >
            <div className="grid gap-5 md:grid-cols-3">
              <Input
                label="Population"
                name="population"
                type="number"
                min="0"
                value={form.population}
                onChange={handleChange}
              />

              <Input
                label="Area (km²)"
                name="area"
                type="number"
                min="0"
                step="0.01"
                value={form.area}
                onChange={handleChange}
              />

              <Input
                label="Altitude (metres)"
                name="altitude"
                type="number"
                min="0"
                step="0.01"
                value={form.altitude}
                onChange={handleChange}
              />
            </div>
          </SettingsCard>

          {/* Contact */}
          <SettingsCard
            title="Contact Information"
            description="Contact details shown to village visitors."
            icon="📞"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="mt-5">
              <Textarea
                label="Full Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={4}
                placeholder="Complete village address..."
              />
            </div>
          </SettingsCard>

          {/* Representative */}
          <SettingsCard
            title="Village Representative"
            description="Sarpanch or village representative details."
            icon="👤"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Sarpanch Name"
                name="sarpanchName"
                value={form.sarpanchName}
                onChange={handleChange}
              />

              <Input
                label="Sarpanch Phone"
                name="sarpanchPhone"
                type="tel"
                value={form.sarpanchPhone}
                onChange={handleChange}
              />
            </div>
          </SettingsCard>

          {/* Culture */}
          <SettingsCard
            title="Culture & Nature"
            description="Languages and rivers associated with the village."
            icon="🌿"
          >
            <Textarea
              label="Languages"
              name="languages"
              value={form.languages}
              onChange={handleChange}
              rows={3}
              placeholder="Hindi, English, Khortha..."
              hint="Separate multiple languages using commas."
            />

            <div className="mt-5">
              <Textarea
                label="Rivers / Water Bodies"
                name="rivers"
                value={form.rivers}
                onChange={handleChange}
                rows={3}
                placeholder="River 1, River 2..."
                hint="Separate multiple entries using commas."
              />
            </div>
          </SettingsCard>

          {/* Connectivity */}
          <SettingsCard
            title="How to Reach"
            description="Transportation and connectivity information."
            icon="🛣️"
          >
            <Textarea
              label="By Road"
              name="road"
              value={form.road}
              onChange={handleChange}
              rows={4}
              placeholder="Road connectivity details..."
            />

            <div className="mt-5">
              <Textarea
                label="By Rail"
                name="rail"
                value={form.rail}
                onChange={handleChange}
                rows={4}
                placeholder="Nearest railway station and distance..."
              />
            </div>

            <div className="mt-5">
              <Textarea
                label="By Air"
                name="air"
                value={form.air}
                onChange={handleChange}
                rows={4}
                placeholder="Nearest airport and distance..."
              />
            </div>
          </SettingsCard>

          {/* Coordinates */}
          <SettingsCard
            title="Map Location"
            description="GPS coordinates used for the village map."
            icon="📍"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Latitude"
                name="latitude"
                type="number"
                step="any"
                value={form.latitude}
                onChange={handleChange}
                placeholder="Example: 24.4321"
              />

              <Input
                label="Longitude"
                name="longitude"
                type="number"
                step="any"
                value={form.longitude}
                onChange={handleChange}
                placeholder="Example: 85.1234"
              />
            </div>

            {form.latitude &&
              form.longitude && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${form.latitude},${form.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  🗺️ Preview location on Google Maps
                </a>
              )}
          </SettingsCard>

          {/* Save */}
          <div className="sticky bottom-0 z-20 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-xl backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">
                Changes will update the village information
                displayed on the website.
              </p>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : "Save Village Settings"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const villageToForm = (village) => {
  const contact =
    village?.contact || {};

  const sarpanch =
    village?.sarpanch || {};

  const howToReach =
    village?.howToReach || {};

  const address =
    village?.address || {};

  const coordinates =
    village?.coordinates ||
    village?.location ||
    {};

  return {
    name: village?.name || "",
    localName: village?.localName || "",
    description: village?.description || "",
    history: village?.history || "",

    population:
      village?.population ??
      "",

    area:
      village?.area ??
      "",

    pincode:
      village?.pincode ||
      village?.pinCode ||
      "",

    stdCode:
      village?.stdCode ||
      "",

    altitude:
      village?.altitude ??
      "",

    district:
      village?.district ||
      "",

    block:
      village?.block ||
      "",

    state:
      village?.state ||
      "",

    country:
      village?.country ||
      "India",

    phone:
      contact.phone ||
      village?.phone ||
      "",

    email:
      contact.email ||
      village?.email ||
      "",

    address:
      contact.address ||
      village?.fullAddress ||
      (typeof address === "string"
        ? address
        : [
            address?.village,
            address?.post,
            address?.block,
            address?.district,
            address?.state,
            address?.pincode,
          ]
            .filter(Boolean)
            .join(", ")) ||
      "",

    sarpanchName:
      sarpanch.name ||
      "",

    sarpanchPhone:
      sarpanch.phone ||
      "",

    languages:
      Array.isArray(village?.languages)
        ? village.languages.join(", ")
        : village?.languages || "",

    rivers:
      Array.isArray(village?.rivers)
        ? village.rivers.join(", ")
        : village?.rivers || "",

    road:
      howToReach.road ||
      "",

    rail:
      howToReach.rail ||
      "",

    air:
      howToReach.air ||
      "",

    latitude:
      coordinates?.lat ??
      coordinates?.latitude ??
      "",

    longitude:
      coordinates?.lng ??
      coordinates?.longitude ??
      "",
  };
};

const formToPayload = (form) => {
  return {
    name: form.name.trim(),
    localName: form.localName.trim(),
    description: form.description.trim(),
    history: form.history.trim(),

    population:
      form.population === ""
        ? undefined
        : Number(form.population),

    area:
      form.area === ""
        ? undefined
        : Number(form.area),

    pincode: form.pincode.trim(),
    stdCode: form.stdCode.trim(),

    altitude:
      form.altitude === ""
        ? undefined
        : Number(form.altitude),

    district: form.district.trim(),
    block: form.block.trim(),
    state: form.state.trim(),
    country: form.country.trim(),

    contact: {
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
    },

    sarpanch: {
      name: form.sarpanchName.trim(),
      phone: form.sarpanchPhone.trim(),
    },

    languages: splitCommaValues(
      form.languages
    ),

    rivers: splitCommaValues(
      form.rivers
    ),

    howToReach: {
      road: form.road.trim(),
      rail: form.rail.trim(),
      air: form.air.trim(),
    },

    coordinates: {
      lat:
        form.latitude === ""
          ? undefined
          : Number(form.latitude),

      lng:
        form.longitude === ""
          ? undefined
          : Number(form.longitude),
    },
  };
};

const splitCommaValues = (value) => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

/*
|--------------------------------------------------------------------------
| UI Components
|--------------------------------------------------------------------------
*/

const SettingsCard = ({
  title,
  description,
  icon,
  children,
}) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-5 sm:px-7">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
            {icon}
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {title}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 sm:px-7">
        {children}
      </div>
    </section>
  );
};

const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  min,
  step,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
};

const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  hint,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

      {hint && (
        <p className="mt-1.5 text-xs text-gray-400">
          {hint}
        </p>
      )}
    </div>
  );
};

export default VillageSettings;