import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AuthorizationResult = {
  data: {
    client?: { name?: string; client_name?: string } | null;
    redirect_url?: string;
    redirect_to?: string;
  } | null;
  error: { message: string } | null;
};

// supabase.auth.oauth is beta and not in the published types yet.
const oauthApi = (
  supabase.auth as unknown as {
    oauth: {
      getAuthorizationDetails: (id: string) => Promise<AuthorizationResult>;
      approveAuthorization: (id: string) => Promise<AuthorizationResult>;
      denyAuthorization: (id: string) => Promise<AuthorizationResult>;
    };
  }
).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  // Browser-only: the Supabase client reads its session from localStorage.
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s["authorization_id"] === "string" ? s["authorization_id"] : "",
  }),
  component: Consent,
});

function Consent() {
  const { authorization_id: authorizationId } = Route.useSearch();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [details, setDetails] = useState<AuthorizationResult["data"]>(null);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetails = useCallback(async () => {
    const { data, error: detailsError } = await oauthApi.getAuthorizationDetails(authorizationId);
    if (detailsError) {
      setError(detailsError.message);
      return;
    }
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) {
      window.location.href = immediate;
      return;
    }
    setDetails(data);
  }, [authorizationId]);

  useEffect(() => {
    if (!authorizationId) {
      setError("Missing authorization_id in the request URL.");
      setSignedIn(false);
      return;
    }
    void (async () => {
      const { data } = await supabase.auth.getSession();
      setSignedIn(Boolean(data.session));
      if (data.session) await loadDetails();
    })();
  }, [authorizationId, loadDetails]);

  async function sendMagicLink(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href },
    });
    setBusy(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }
    setSent(true);
  }

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error: decideError } = approve
      ? await oauthApi.approveAuthorization(authorizationId)
      : await oauthApi.denyAuthorization(authorizationId);
    if (decideError) {
      setBusy(false);
      setError(decideError.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "an app";

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col justify-center px-4 py-16">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Connect to Maharashtra CAP Guide
        </h1>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {signedIn === null && <p className="mt-4 text-muted-foreground">Loading…</p>}

        {signedIn === false && (
          <form onSubmit={sendMagicLink} className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Sign in with your email to authorise this connection. We&apos;ll send you a secure
              sign-in link that brings you back here.
            </p>
            {sent ? (
              <p className="rounded-lg bg-primary/10 p-3 text-sm text-foreground">
                Check your inbox for the sign-in link, then return to this page.
              </p>
            ) : (
              <>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                >
                  {busy ? "Sending…" : "Email me a sign-in link"}
                </button>
              </>
            )}
          </form>
        )}

        {signedIn === true && details && (
          <div className="mt-4 space-y-5">
            <p className="text-sm text-muted-foreground">
              This lets <span className="font-medium text-foreground">{clientName}</span> use
              Maharashtra CAP Guide as you — reading colleges, cutoffs and CAP dates on your behalf.
            </p>
            <div className="flex gap-3">
              <button
                disabled={busy}
                onClick={() => void decide(true)}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                Approve
              </button>
              <button
                disabled={busy}
                onClick={() => void decide(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground disabled:opacity-60"
              >
                Deny
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
