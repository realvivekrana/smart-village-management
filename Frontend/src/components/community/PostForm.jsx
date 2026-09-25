import { useState } from "react";
import Button from "../common/Button";
import { COMMUNITY_CATEGORIES } from "../../utils/constants";

export default function PostForm({ onSubmit, loading, onCancel }) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [images, setImages] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    const fd = new FormData();
    fd.append("content", content);
    fd.append("category", category);
    images.forEach((img) => fd.append("images", img));
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-3">
      <textarea
        className="input min-h-[100px] resize-none"
        placeholder="Share something with your community..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        minLength={5}
        maxLength={2000}
      />
      <div className="flex flex-wrap items-center gap-3">
        <select className="input max-w-[180px]" value={category} onChange={(e) => setCategory(e.target.value)}>
          {COMMUNITY_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <label className="cursor-pointer text-sm text-primary-600 hover:underline">
          📷 Add Photos
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setImages(Array.from(e.target.files).slice(0, 3))} />
        </label>
        {images.length > 0 && <span className="text-xs text-gray-500">{images.length} photo(s)</span>}
        <div className="ml-auto flex gap-2">
          {onCancel && <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>}
          <Button type="submit" loading={loading}>Post</Button>
        </div>
      </div>
    </form>
  );
}
