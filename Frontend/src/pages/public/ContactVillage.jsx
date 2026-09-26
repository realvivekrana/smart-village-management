import React, { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const ContactVillage = () => {
  const [village, setVillage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchVillage = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/village`);

        if (!response.ok) {
          throw new Error("Failed to load village information");
        }

        const result = await response.json();

        const data =
          result?.data ||
          result?.village ||
          result;

        setVillage(data);
      } catch (err) {
        console.error("Contact village error:", err);

        setError(
          err.message ||
            "Unable to load contact information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVillage();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSending(true);
      setSuccess("");
      setError("");

      /*
       * This endpoint is intentionally configurable.
       * If your backend already has a contact/feedback endpoint,
       * change only this URL.
       */
      const response = await fetch(
        `${API_URL}/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        let message = "Failed to send your message.";

        try {
          const result = await response.json();

          message =
            result?.message ||
            result?.error ||
            message;
        } catch {
          // Keep default error message.
        }

        throw new Error(message);
      }

      setSuccess(
        "Your message has been submitted successfully."
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error("Contact form error:", err);

      setError(
        err.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  const contact = village?.contact || {};
  const sarpanch = village?.sarpanch || {};
  const address = village?.address || {};

  const villagePhone =
    contact.phone ||
    village?.phone ||
    sarpanch.phone ||
    "";

  const villageEmail =
    contact.email ||
    village?.email ||
    "";

  const villageAddress =
    contact.address ||
    village?.fullAddress ||
    village?.addressText ||
    [
      address.village,
      address.post,
      address.block,
      village?.district,
      village?.state,
      village?.pincode,
    ]
      .filter(Boolean)
      .join(", ");

  const latitude =
    village?.coordinates?.lat ??
    village?.location?.lat;

  const longitude =
    village?.coordinates?.lng ??
    village?.location?.lng;

  const mapUrl =
    latitude !== undefined &&
    longitude !== undefined
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : villageAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          villageAddress
        )}`
      : "";

  if (loading) {
    return (
      <main className="min-h-[500px] bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />

          <p className="mt-4 text-sm text-gray-500">
            Loading contact information...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-100">
            Get in Touch
          </p>

          <h1 className="mt-2 text-4xl font-bold text-white sm:text-5xl">
            Contact {village?.name || "Our Village"}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-blue-50">
            Have a question, suggestion or issue related to
            the village? Send us a message and we will try
            to help.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Contact Information */}
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Contact Information
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                How can we help?
              </h2>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                Use the available contact details below or
                send a message through the form.
              </p>
            </div>

            {/* Phone */}
            {villagePhone && (
              <ContactCard
                icon="📞"
                title="Phone"
                value={villagePhone}
                href={`tel:${villagePhone}`}
              />
            )}

            {/* Email */}
            {villageEmail && (
              <ContactCard
                icon="✉️"
                title="Email"
                value={villageEmail}
                href={`mailto:${villageEmail}`}
              />
            )}

            {/* Address */}
            {villageAddress && (
              <ContactCard
                icon="📍"
                title="Address"
                value={villageAddress}
              />
            )}

            {/* Sarpanch */}
            {(sarpanch.name ||
              sarpanch.phone) && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Village Representative
                </p>

                {sarpanch.name && (
                  <h3 className="mt-2 text-lg font-bold text-gray-900">
                    {sarpanch.name}
                  </h3>
                )}

                {sarpanch.phone && (
                  <a
                    href={`tel:${sarpanch.phone}`}
                    className="mt-2 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    📞 {sarpanch.phone}
                  </a>
                )}
              </div>
            )}

            {/* Map */}
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                🗺️ Open Village Location in Google Maps
              </a>
            )}
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-gray-900">
              Send a Message
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Fill in the details below and submit your
              message.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <FormInput
                  label="Your Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />

                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormInput
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />

                <FormInput
                  label="Subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Message subject"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Message
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={7}
                  required
                  placeholder="Write your message..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending
                  ? "Sending..."
                  : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

/*
|--------------------------------------------------------------------------
| Reusable Components
|--------------------------------------------------------------------------
*/

const ContactCard = ({
  icon,
  title,
  value,
  href,
}) => {
  const content = (
    <div className="flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {title}
        </p>

        <p className="mt-1 break-words text-sm font-medium leading-6 text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {content}
    </div>
  );
};

const FormInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
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
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
};

export default ContactVillage;