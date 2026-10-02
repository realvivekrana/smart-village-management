/*
| Image helpers
| Cloudinary URL ho to chhoti / optimized copy maangta hai (slow network pe tez),
| baaki URLs ko jaisa hai waisa chhod deta hai.
*/

const isCloudinary = (url) =>
  typeof url === "string" &&
  url.includes("res.cloudinary.com") &&
  url.includes("/upload/");

/**
 * optimizeImage(url, { width, height, crop, gravity })
 * Example: optimizeImage(url, { width: 96, height: 96, crop: "fill", gravity: "face" })
 */
export function optimizeImage(url, { width, height, crop, gravity } = {}) {
  if (!isCloudinary(url)) return url;

  const [head, tail] = url.split("/upload/");

  // Pehle se transformation laga ho (v123/ se pehle kuch ho) to dobara mat lagao
  if (!/^v\d+\//.test(tail)) return url;

  const parts = [];
  if (crop) parts.push(`c_${crop}`);
  if (gravity) parts.push(`g_${gravity}`);
  if (width) parts.push(`w_${Math.round(width)}`);
  if (height) parts.push(`h_${Math.round(height)}`);
  parts.push("q_auto", "f_auto");

  return `${head}/upload/${parts.join(",")}/${tail}`;
}

// Avatar thumbnail (retina ke liye 2x)
export const avatarUrl = (url, px = 64) =>
  optimizeImage(url, { width: px * 2, height: px * 2, crop: "fill", gravity: "face" });

// Lightbox me bada photo (max 1600px)
export const fullImageUrl = (url) =>
  optimizeImage(url, { width: 1600, crop: "limit" });

/**
 * Alag-alag shapes ko ek hi { url, alt } me badalta hai:
 * "https://..."  |  { url }  |  { image: { url } }  |  { imageUrl }
 */
export function toImageItem(input, fallbackAlt = "") {
  if (!input) return null;
  if (typeof input === "string") return { url: input, alt: fallbackAlt };
  const url = input.url || input.image?.url || input.imageUrl || "";
  if (!url) return null;
  return {
    url,
    alt: input.alt || input.title || input.caption || fallbackAlt,
    caption: input.caption || "",
  };
}

export const toImageItems = (list, fallbackAlt = "") =>
  (Array.isArray(list) ? list : [])
    .map((i) => toImageItem(i, fallbackAlt))
    .filter(Boolean);

/**
 * Upload se pehle photo chhoti karta hai (mobile camera ki 5-10 MB photo bhi chal jaye).
 * Chhoti photo ko waise hi chhod deta hai; decode na ho paye to original file hi lautata hai.
 */
export async function compressImage(file, { maxSize = 1200, quality = 0.85 } = {}) {
  try {
    if (!file || !file.type?.startsWith("image/")) return file;

    const bitmap = await createImageBitmap(file);
    const longest = Math.max(bitmap.width, bitmap.height);

    if (longest <= maxSize && file.size <= 800 * 1024) {
      bitmap.close?.();
      return file;
    }

    const scale = Math.min(1, maxSize / longest);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );

    if (!blob || blob.size >= file.size) return file;

    return new File([blob], "photo.jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}