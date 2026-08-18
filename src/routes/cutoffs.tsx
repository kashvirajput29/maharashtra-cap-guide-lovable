import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/cutoffs")({
  beforeLoad: () => {
    throw redirect({ to: "/colleges" });
  },
});
