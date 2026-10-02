import { useEffect } from "react";

export default function BreadcrumbSchema({ items = [] }) {
  useEffect(() => {
    if (!Array.isArray(items) || items.length === 0) {
      return;
    }

    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };

    const scriptId = "breadcrumb-structured-data";

    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(schema);

    return () => {
      const existingScript =
        document.getElementById(scriptId);

      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [items]);

  return null;
}