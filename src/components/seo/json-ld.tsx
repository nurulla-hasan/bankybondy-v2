/**
 * Renders a schema.org JSON-LD block.
 *
 * The `<` escaping prevents a translated string containing `</script>` from
 * breaking out of the tag, which is the only injection vector here.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default JsonLd;
