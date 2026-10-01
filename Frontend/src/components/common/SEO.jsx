import { useEffect } from "react";

const SITE_URL = "https://smart-village-management.vercel.app";
const SITE_NAME = "Smart Village Management";
const DEFAULT_IMAGE = `${SITE_URL}/village-hero-bg.webp`;

export default function SEO({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
}) {
  useEffect(() => {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const canonicalUrl =
      cleanPath === "/" ? SITE_URL : `${SITE_URL}${cleanPath}`;

    const fullTitle = title
      ? `${title} | ${SITE_NAME}`
      : `${SITE_NAME} | Kakarcholi Village`;

    // ---------------------------------------------------------
    // Document Title
    // ---------------------------------------------------------

    document.title = fullTitle;

    // ---------------------------------------------------------
    // Helper Functions
    // ---------------------------------------------------------

    const setMeta = (attribute, value, content) => {
      if (!content) return;

      let element = document.head.querySelector(
        `meta[${attribute}="${value}"]`
      );

      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, value);
        document.head.appendChild(element);
      }

      element.setAttribute("content", content);
    };

    // ---------------------------------------------------------
    // Primary SEO
    // ---------------------------------------------------------

    setMeta("name", "description", description);

    setMeta(
      "name",
      "robots",
      "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );

    setMeta(
      "name",
      "googlebot",
      "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );

    // ---------------------------------------------------------
    // Canonical
    // ---------------------------------------------------------

    let canonical = document.head.querySelector(
      'link[rel="canonical"]'
    );

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }

    canonical.setAttribute("href", canonicalUrl);

    // ---------------------------------------------------------
    // Open Graph
    // ---------------------------------------------------------

    setMeta("property", "og:type", "website");

    setMeta("property", "og:title", fullTitle);

    setMeta(
      "property",
      "og:description",
      description
    );

    setMeta(
      "property",
      "og:url",
      canonicalUrl
    );

    setMeta(
      "property",
      "og:site_name",
      SITE_NAME
    );

    setMeta(
      "property",
      "og:image",
      image
    );

    setMeta(
      "property",
      "og:image:alt",
      fullTitle
    );

    // ---------------------------------------------------------
    // Twitter / X
    // ---------------------------------------------------------

    setMeta(
      "name",
      "twitter:card",
      "summary_large_image"
    );

    setMeta(
      "name",
      "twitter:title",
      fullTitle
    );

    setMeta(
      "name",
      "twitter:description",
      description
    );

    setMeta(
      "name",
      "twitter:image",
      image
    );

    // ---------------------------------------------------------
    // Cleanup is intentionally not used here.
    //
    // React Router changes pages without reloading the document,
    // so metadata needs to remain available and update on route
    // changes.
    // ---------------------------------------------------------

  }, [title, description, path, image]);

  return null;
}