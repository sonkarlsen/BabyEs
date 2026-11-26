/* BabyEs card loader.
 * Home Assistant registers this small file once at startup. On every page
 * load it asks the server which version of babyes-card.js is on disk (a HEAD
 * request; only headers, no download) and imports the card with that version
 * in its URL. A card-only update therefore shows after a page reload, without
 * restarting Home Assistant. An unchanged card is still served from the
 * browser cache.
 */
(async () => {
  if (customElements.get("babyes-card")) return;
  const url = new URL("./babyes-card.js", import.meta.url);
  url.search = "";
  let version = "";
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    version = res.headers.get("etag") || res.headers.get("last-modified") || "";
  } catch (_) { /* offline or blocked: fall back below */ }
  version = version.replace(/[^\w.-]/g, "");
  // Without a server version, fall back to the version in this file's own URL.
  url.searchParams.set("v", version || new URL(import.meta.url).searchParams.get("v") || "0");
  await import(url.href);
})();
