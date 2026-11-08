import sanitizeHtml from "sanitize-html";

export type LegalDocumentKind = "about" | "terms" | "privacy";

const LEGAL_ENDPOINTS: Record<LegalDocumentKind, string> = {
  about: "/manage/get-about-us",
  terms: "/manage/get-terms-conditions",
  privacy: "/manage/get-privacy-policy",
};

// The API mounts at the root; `NEXT_PUBLIC_API_BASE_URL` already carries
// `/api/v1`, which the backend does not serve, so it is deliberately not used.
const BACKEND_URL = (process.env.BACKEND_API_URL ?? "http://localhost:5000").replace(
  /\/+$/,
  ""
);

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr",
  "ul", "ol", "li",
  "a", "strong", "b", "em", "i", "u", "s",
  "blockquote", "div", "span", "small", "sub", "sup",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
];

const sanitizeLegalHtml = (html: string): string =>
  sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      "*": ["id"],
      a: ["href", "name", "target", "rel"],
      ol: ["start"],
      th: ["colspan", "rowspan", "scope"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesAppliedToAttributes: ["href"],
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const external = /^https?:\/\//i.test(href);
        return {
          tagName,
          attribs: {
            ...attribs,
            rel: "nofollow noopener noreferrer",
            ...(external ? { target: "_blank" } : {}),
          },
        };
      },
    },
  });

/** Admin-managed legal HTML, sanitized. `null` when the backend is unreachable,
 *  returns an error, or has no document saved yet. */
export async function getLegalDocument(
  kind: LegalDocumentKind
): Promise<string | null> {
  try {
    const response = await fetch(`${BACKEND_URL}${LEGAL_ENDPOINTS[kind]}`, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;

    const body = (await response.json()) as {
      data?: { description?: unknown } | null;
    };
    const description = body?.data?.description;
    if (typeof description !== "string" || !description.trim()) return null;

    return sanitizeLegalHtml(description);
  } catch (error) {
    console.error(`[legal-content] could not load "${kind}"`, error);
    return null;
  }
}
