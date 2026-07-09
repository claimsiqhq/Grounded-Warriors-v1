import { useEffect } from "react";

interface SeoProps {
  title: string;
  description?: string;
  /** Route path used for the canonical URL and og:url, e.g. "/retreats". */
  path?: string;
  /** Absolute or root-relative image for social previews. */
  image?: string;
  /** Set on private pages (login, member portal, admin). */
  noindex?: boolean;
  /** schema.org structured data, serialized into a JSON-LD script tag. */
  jsonLd?: object | object[];
}

function upsertMeta(attr: "name" | "property", key: string, content: string | null) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (content === null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

const JSON_LD_ID = "seo-json-ld";

/**
 * Per-page head management for this client-rendered SPA. Updates the
 * document title, description, canonical URL, Open Graph/Twitter tags,
 * robots directive, and JSON-LD structured data on route changes.
 */
export function Seo({ title, description, path, image, noindex, jsonLd }: SeoProps) {
  useEffect(() => {
    const origin = window.location.origin;
    const url = `${origin}${path ?? window.location.pathname}`;

    document.title = title;
    upsertMeta("property", "og:title", title);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("property", "og:url", url);
    upsertLink("canonical", url);

    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
      upsertMeta("name", "twitter:description", description);
    }

    if (image) {
      const absoluteImage = image.startsWith("http") ? image : `${origin}${image}`;
      upsertMeta("property", "og:image", absoluteImage);
      upsertMeta("name", "twitter:image", absoluteImage);
    }

    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : null);

    let script = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = JSON_LD_ID;
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    } else {
      script?.remove();
    }
  }, [title, description, path, image, noindex, jsonLd]);

  return null;
}

// Shared structured-data building blocks.
export function organizationJsonLd() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Grounded Warriors",
    description:
      "Wilderness expeditions for men in Ontario, Canada. Cold plunges, fire, backcountry canoe trips, and primal challenge.",
    url: origin,
    logo: `${origin}/favicon.png`,
    address: {
      "@type": "PostalAddress",
      addressRegion: "ON",
      addressCountry: "CA",
    },
  };
}
