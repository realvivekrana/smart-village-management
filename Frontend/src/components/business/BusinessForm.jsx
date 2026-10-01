import { useState } from "react";
import Button from "../common/Button";
import { BUSINESS_CATEGORIES } from "../../utils/constants";

export default function BusinessForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    name: initial.name || "",
    description: initial.description || "",
    category: initial.category || "other",
    phone: initial.phone || "",
    alternatePhone: initial.alternatePhone || "",
    email: initial.email || "",
    website: initial.website || "",
    "address.street": initial.address?.street || "",
    "address.village": initial.address?.village || "",
    "address.district": initial.address?.district || "",
    "address.state": initial.address?.state || "",
    "address.pincode": initial.address?.pincode || "",
  });
  const [images, setImages] = useState([]);
  const [removed, setRemoved] = useState([]);
  const existing = (initial.images || []).filter((img) => !removed.includes(String(img._id || img.publicId)));
  const maxNew = Math.max(0, 5 - existing.length);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("category", form.category);
    fd.append("phone", form.phone);
    fd.append("alternatePhone", form.alternatePhone);
    fd.append("email", form.email);
    fd.append("website", form.website);
    fd.append("address[street]", form["address.street"]);
    fd.append("address[village]", form["address.village"]);
    fd.append("address[district]", form["address.district"]);
    fd.append("address[state]", form["address.state"]);
    fd.append("address[pincode]", form["address.pincode"]);
    removed.forEach((id) => fd.append("removeImages", id));
    images.forEach((img) => fd.append("images", img));
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="label">Business Name *</label>
          <input className="input" value={form.name} onChange={set("name")} required />
        </div>
        <div className="form-group">
          <label className="label">Category *</label>
          <select className="input" value={form.category} onChange={set("category")}>
            {BUSINESS_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="label">Description *</label>
        <textarea className="input min-h-[120px]" value={form.description} onChange={set("description")} required minLength={20} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="label">Phone *</label>
          <input className="input" value={form.phone} onChange={set("phone")} required />
        </div>
        <div className="form-group">
          <label className="label">Alternate Phone</label>
          <input className="input" value={form.alternatePhone} onChange={set("alternatePhone")} />
        </div>
        <div className="form-group">
          <label className="label">Email</label>
          <input type="email" className="input" value={form.email} onChange={set("email")} />
        </div>
        <div className="form-group">
          <label className="label">Website</label>
          <input className="input" value={form.website} onChange={set("website")} placeholder="https://" />
        </div>
      </div>
      <fieldset className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
        <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">Address</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: "address.street", label: "Street" },
            { key: "address.village", label: "Village" },
            { key: "address.district", label: "District" },
            { key: "address.state", label: "State" },
            { key: "address.pincode", label: "Pincode" },
          ].map((f) => (
            <div key={f.key} className="form-group">
              <label className="label">{f.label}</label>
              <input className="input" value={form[f.key]} onChange={set(f.key)} />
            </div>
          ))}
        </div>
      </fieldset>
      <div className="form-group">
        <label className="label">Photos (max 5, JPG / PNG / WEBP, har photo 5MB tak)</label>
        {existing.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {existing.map((img) => (
              <div key={img._id || img.publicId || img.url} className="relative">
                <img src={img.url} alt="" className="h-16 w-24 object-cover rounded-lg" />
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => setRemoved((p) => [...p, String(img._id || img.publicId)])}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-600 text-white text-xs leading-none"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="input"
          disabled={maxNew === 0}
          onChange={(e) => {
            const picked = Array.from(e.target.files).slice(0, maxNew);
            const tooBig = picked.find((f) => f.size > 5 * 1024 * 1024);
            if (tooBig) {
              alert(`"${tooBig.name}" 5MB se badi hai. Chhoti photo chunein.`);
              e.target.value = "";
              setImages([]);
              return;
            }
            setImages(picked);
          }}
        />
        {maxNew === 0 && <p className="text-xs text-gray-500 mt-1">5 photos ho chuki hain. Nayi add karne ke liye pehle koi hatayein.</p>}
        {images.length > 0 && <p className="text-xs text-gray-500 mt-1">{images.length} image(s) selected</p>}
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>{initial._id ? "Update Business" : "Register Business"}</Button>
      </div>
    </form>
  );
}