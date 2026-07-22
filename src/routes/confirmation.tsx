import { createFileRoute, Navigate } from "@tanstack/react-router";

type Search = { bookingId?: string };

export const Route = createFileRoute("/confirmation")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    bookingId: typeof s.bookingId === "string" ? s.bookingId : undefined,
  }),
  component: Confirmation,
});

function Confirmation() {
  const { bookingId } = Route.useSearch();
  return <Navigate to="/payment" search={{ bookingId }} replace />;
}


