// Browser-only: rewrite direct Supabase requests to the same-origin relay (/api/sb).
const SUPABASE_URL = (import.meta.env["VITE_SUPABASE_URL"] as string | undefined)?.replace(/\/$/, "");

if (typeof window !== "undefined" && SUPABASE_URL && !(window as unknown as { __sbRelay?: boolean }).__sbRelay) {
  (window as unknown as { __sbRelay?: boolean }).__sbRelay = true;
  const original = window.fetch.bind(window);
  const relayBase = `${window.location.origin}/api/sb`;
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith(SUPABASE_URL + "/")) {
      const rewritten = relayBase + url.slice(SUPABASE_URL.length);
      if (input instanceof Request) return original(new Request(rewritten, input), init);
      return original(rewritten, init);
    }
    return original(input, init);
  };
}
export {};
