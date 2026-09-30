import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { createEvent, getEventById, updateEvent } from "../../services/eventService";
import BackButton, { useGoBack } from "../../components/common/BackButton";
import VoiceInput from "../../components/common/VoiceInput";
import Loader from "../../components/common/Loader";
import { EVENT_CATEGORIES, isoToLocalInput, localToIso, prettyCategory } from "../../utils/submissionOptions";
import { useLanguage } from "../../context/LanguageContext";

const MAX_IMAGES = 4;
const MAX_IMAGE_MB = 5;

export default function AddEvent() {
  const navigate = useNavigate();
  const goBack = useGoBack("/citizen/dashboard");
  const { t } = useLanguage();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    title: "", description: "", category: "cultural",
    startDate: "", endDate: "", location: "", organizer: "", maxAttendees: "",
  });

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  // edit mode: load the citizen's own event into the form
  useEffect(() => {
    if (!isEdit) return;
    getEventById(id)
      .then((res) => {
        const ev = res.data?.data?.event;
        if (!ev) throw new Error("not found");
        setForm({
          title: ev.title || "",
          description: ev.description || "",
          category: ev.category || "cultural",
          startDate: isoToLocalInput(ev.startDate),
          endDate: isoToLocalInput(ev.endDate),
          location: ev.location || "",
          organizer: ev.organizer || "",
          maxAttendees: ev.maxAttendees ?? "",
        });
      })
      .catch(() => {
        toast.error("Could not load this event");
        navigate("/citizen/my-submissions?tab=events", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const pickImages = (e) => {
    const files = Array.from(e.target.files || []);
    const tooBig = files.find((f) => f.size > MAX_IMAGE_MB * 1024 * 1024);
    if (tooBig) {
      toast.error(`Each photo must be under ${MAX_IMAGE_MB} MB`);
      e.target.value = "";
      return;
    }
    if (files.length > MAX_IMAGES) toast.error(`You can add up to ${MAX_IMAGES} photos`);
    setImages(files.slice(0, MAX_IMAGES));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const title = form.title.trim();
    const description = form.description.trim();
    if (title.length < 5) return toast.error("Title must be at least 5 characters");
    if (description.length < 10) return toast.error("Description must be at least 10 characters");
    if (!form.startDate || !form.endDate) return toast.error("Please choose start and end time");
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      return toast.error("End time must be after the start time");
    }
    if (!isEdit && new Date(form.endDate) < new Date()) return toast.error("The event must not be in the past");

    if (isEdit) {
      setSaving(true);
      try {
        await updateEvent(id, {
          title,
          description,
          category: form.category,
          startDate: localToIso(form.startDate),
          endDate: localToIso(form.endDate),
          location: form.location.trim(),
          organizer: form.organizer.trim(),
          maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : null,
        });
        toast.success("Event updated");
        navigate("/citizen/my-submissions?tab=events", { replace: true });
      } catch (err) {
        toast.error(err.response?.data?.message || "Could not update the event");
      } finally {
        setSaving(false);
      }
      return;
    }

    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("category", form.category);
    fd.append("startDate", localToIso(form.startDate));
    fd.append("endDate", localToIso(form.endDate));
    fd.append("location", form.location.trim());
    if (form.organizer.trim()) fd.append("organizer", form.organizer.trim());
    if (form.maxAttendees) fd.append("maxAttendees", form.maxAttendees);
    images.forEach((img) => fd.append("images", img));

    setSaving(true);
    try {
      await createEvent(fd);
      toast.success("Event published! Everyone can see it now.");
      navigate("/citizen/my-submissions?tab=events", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit the event");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container max-w-2xl">
      <div className="mb-4">
        <BackButton fallback="/citizen/dashboard" label={t("submit.back", "Back")} />
      </div>
      <h1 className="section-title mb-2">🎉 {isEdit ? "Edit Event" : t("submit.addEvent", "Add Event")}</h1>
      <p className="mb-5 rounded-lg bg-primary-50 p-3 text-sm text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
        {t("submit.approvalInfo", "Your post goes live for everyone right away. The village admin can remove anything that breaks the rules.")}
      </p>

      <form onSubmit={handleSubmit} className="card space-y-4 p-4 sm:p-6">
        <div className="form-group">
          <label className="label" htmlFor="event-title">Event name *</label>
          <input id="event-title" className="input" value={form.title} onChange={set("title")}
            minLength={5} maxLength={200} required placeholder="e.g. Village cricket tournament" />
        </div>

        <div className="form-group">
          <label className="label">About the event *</label>
          <VoiceInput
            value={form.description}
            onChange={(text) => setForm((p) => ({ ...p, description: text }))}
            placeholder="What is happening, who can join..."
            rows={5}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="form-group">
            <label className="label" htmlFor="event-start">Starts *</label>
            <input id="event-start" type="datetime-local" className="input" value={form.startDate} onChange={set("startDate")} required />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="event-end">Ends *</label>
            <input id="event-end" type="datetime-local" className="input" value={form.endDate} onChange={set("endDate")} min={form.startDate || undefined} required />
          </div>
        </div>

        <div className="form-group">
          <label className="label" htmlFor="event-location">Place *</label>
          <input id="event-location" className="input" value={form.location} onChange={set("location")}
            maxLength={300} required placeholder="e.g. Panchayat Bhawan ground" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="form-group">
            <label className="label" htmlFor="event-category">Category</label>
            <select id="event-category" className="input" value={form.category} onChange={set("category")}>
              {EVENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{prettyCategory(c)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label" htmlFor="event-organizer">Organizer (optional)</label>
            <input id="event-organizer" className="input" value={form.organizer} onChange={set("organizer")} maxLength={100} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="form-group">
            <label className="label" htmlFor="event-max">Max people (optional)</label>
            <input id="event-max" type="number" inputMode="numeric" min="1" className="input" value={form.maxAttendees} onChange={set("maxAttendees")} />
          </div>
          {!isEdit && (
          <div className="form-group">
            <label className="label" htmlFor="event-photos">Photos (optional, up to {MAX_IMAGES})</label>
            <input id="event-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={pickImages}
              className="block w-full text-sm file:mr-3 file:min-h-[44px] file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:text-primary-700 sm:file:min-h-0 sm:file:py-2" />
            {images.length > 0 && <p className="mt-1 text-xs text-gray-500">{images.length} photo(s) selected</p>}
          </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={goBack} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? t("submit.submitting", "Submitting...") : isEdit ? "Save changes" : t("submit.submitEvent", "Submit Event")}
          </button>
        </div>
      </form>
    </div>
  );
}