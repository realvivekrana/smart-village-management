import { useEffect } from "react";

const SITE_URL = "https://smart-village-management.vercel.app";
const SITE_NAME = "Smart Village Management";

export default function StructuredData() {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          url: SITE_URL,
          name: SITE_NAME,
          description:
            "Smart Village Management portal for Kakarcholi village with village information, public services, notices, events, government schemes and local resources.",
          inLanguage: "en-IN",
          publisher: {
            "@id": `${SITE_URL}/#organization`,
          },
        },
        {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: SITE_NAME,
          url: SITE_URL,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/village-hero-bg.webp`,
          },
        },
        {
          "@type": "WebPage",
          "@id": `${SITE_URL}/#webpage`,
          url: SITE_URL,
          name: "Kakarcholi Village | Smart Village Management Portal",
          description:
            "Official Smart Village Management portal for Kakarcholi village. Explore village information, public services, government schemes, notices, events and important local resources.",
          isPartOf: {
            "@id": `${SITE_URL}/#website`,
          },
          about: {
            "@id": `${SITE_URL}/#organization`,
          },
          inLanguage: "en-IN",
        },
      ],
    };

    const scriptId = "smart-village-structured-data";

    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(schema);

    return () => {
      const existingScript = document.getElementById(scriptId);

      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null;
}