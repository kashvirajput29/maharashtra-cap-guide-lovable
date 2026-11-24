import { createFileRoute } from "@tanstack/react-router";

// Same-origin relay to Supabase so visitors on networks that block *.supabase.co
// can still sign in and load data. Forwards method, headers and body unchanged.
async function relay({ request, params }: { request: Request; params: { _splat?: string } }) {
  const base = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
  if (!base) return new Response("Backend not configured", { status: 500 });
  const incoming = new URL(request.url);
  const path = (params._splat ?? "").replace(/^\/+/, "");
  if (!/^(auth|rest|storage|functions)\/v1(\/|$)/.test(path)) {
    return new Response("Not found", { status: 404 });
  }
  const target = `${base.replace(/\/$/, "")}/${path}${incoming.search}`;
  const headers = new Headers(request.headers);
  for (const h of ["host", "cookie", "origin", "referer", "content-length", "connection", "accept-encoding"]) headers.delete(h);
  const hasBody = !["GET", "HEAD"].includes(request.method);
  const res = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : null,
    redirect: "manual",
  });
  const out = new Headers(res.headers);
  out.delete("content-encoding");
  out.delete("content-length");
  out.delete("set-cookie");
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: out });
}

export const Route = createFileRoute("/api/sb/$")({
  server: {
    handlers: { GET: relay, POST: relay, PUT: relay, PATCH: relay, DELETE: relay, HEAD: relay },
  },
});
