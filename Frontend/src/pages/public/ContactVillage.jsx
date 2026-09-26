import React, { useEffect, useMemo, useState } from "react";

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
        const data = result?.data || result?.village || result;

        setVillage(data);
      } catch (err) {
        console.error("Contact village error:", err);
        setError(err.message || "Unable to load contact information.");
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
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSending(true);
      setSuccess("");
      setError("");

      const response = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        let message = "Failed to send your message.";

        try {
          const result = await response.json();
          message = result?.message || result?.error || message;
        } catch {
          // Keep default message.
        }

        throw new Error(message);
      }

      setSuccess("Your message has been submitted successfully.");

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
        err.message || "Unable to send your message. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  const contact = village?.contact || {};
  const sarpanch = village?.sarpanch || {};
  const address = village?.address || {};

  const villagePhone =
    contact.phone || village?.phone || sarpanch.phone || "";

  const villageEmail = contact.email || village?.email || "";

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
    village?.coordinates?.lat ?? village?.location?.lat;

  const longitude =
    village?.coordinates?.lng ?? village?.location?.lng;

  const mapUrl =
    latitude !== undefined && longitude !== undefined
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : villageAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          villageAddress
        )}`
      : "";

  const villageName = village?.name || "Kakarcholi";

  const initials = useMemo(
    () =>
      villageName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase(),
    [villageName]
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <div className="h-72 animate-pulse rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="h-72 animate-pulse rounded-3xl bg-white shadow-sm dark:bg-slate-900" />
            <div className="h-72 animate-pulse rounded-3xl bg-white shadow-sm dark:bg-slate-900 lg:col-span-2" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-800 to-cyan-800" />
        <div className="absolute -left-24 -top-32 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] [background-size:24px_24px]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-emerald-50 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />
              Official Village Connect
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Connect with{" "}
              <span className="text-emerald-200">{villageName}</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-50/90 sm:text-lg">
              Have a question, suggestion, complaint, or community concern?
              Reach out through the details below or send a message directly
              from this page.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {villagePhone && (
                <a
                  href={`tel:${villagePhone}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-50"
                >
                  📞 Call Village
                </a>
              )}

              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                >
                  📍 View Location
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-bold">Something went wrong</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
            <span className="text-lg">✓</span>
            <div>
              <p className="font-bold">Message sent successfully</p>
              <p className="mt-1">{success}</p>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          {/* Contact details */}
          <div>
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                Contact Information
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">
                We are here to help
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                Use the official village contact details or connect with the
                village representative.
              </p>
            </div>

            <div className="space-y-4">
              {villagePhone && (
                <ContactCard
                  icon="📞"
                  title="Phone"
                  value={villagePhone}
                  href={`tel:${villagePhone}`}
                  action="Call now"
                />
              )}

              {villageEmail && (
                <ContactCard
                  icon="✉️"
                  title="Email"
                  value={villageEmail}
                  href={`mailto:${villageEmail}`}
                  action="Send email"
                />
              )}

              {villageAddress && (
                <ContactCard
                  icon="📍"
                  title="Village Address"
                  value={villageAddress}
                  href={mapUrl}
                  action="Open map"
                />
              )}

              {(sarpanch.name || sarpanch.phone) && (
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                  <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 p-6 dark:from-emerald-950/40 dark:to-cyan-950/30">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                      Village Representative
                    </p>

                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-black text-white shadow-lg">
                        {sarpanch.name
                          ? sarpanch.name
                              .split(" ")
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((x) => x[0])
                              .join("")
                              .toUpperCase()
                          : initials}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-lg font-extrabold">
                          {sarpanch.name || "Village Representative"}
                        </h3>

                        {sarpanch.phone && (
                          <a
                            href={`tel:${sarpanch.phone}`}
                            className="mt-1 inline-flex text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                          >
                            📞 {sarpanch.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between rounded-3xl bg-slate-900 p-5 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl">
                      🗺️
                    </div>
                    <div>
                      <p className="font-bold">Find {villageName}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Open the village location in Google Maps
                      </p>
                    </div>
                  </div>
                  <span className="text-xl transition group-hover:translate-x-1">
                    →
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* Contact form */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                  Message Us
                </p>
                <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                  Send a message
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Tell us what you need and we will receive your message.
                </p>
              </div>

              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl sm:flex dark:bg-emerald-950/50">
                💬
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                  label="Email Address"
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
                  label="Phone Number"
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
                  placeholder="What is this about?"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  Message <span className="text-red-500">*</span>
                </label>

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={7}
                  required
                  minLength={5}
                  placeholder="Write your message, suggestion, or concern..."
                  className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                />

                <div className="mt-2 flex justify-end text-xs text-slate-400">
                  {form.message.length} characters
                </div>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending message...
                  </>
                ) : (
                  <>
                    Send Message
                    <span className="text-lg transition group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>

              <p className="text-center text-xs leading-5 text-slate-400">
                Please provide accurate information so the village team can
                respond appropriately.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

const ContactCard = ({ icon, title, value, href, action }) => {
  const content = (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl dark:bg-emerald-950/40">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
          {title}
        </p>

        <p className="mt-1 break-words text-sm font-bold leading-6 text-slate-900 dark:text-white">
          {value}
        </p>

        {action && (
          <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {action} →
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
        className="group block rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
}) => (
  <div>
    <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>

    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
    />
  </div>
);

export default ContactVillage;
