import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookingFlow, BookingCreatedPayload } from "@/components/booking/BookingFlow";
import { useCallback } from "react";

export const Route = createFileRoute("/admin/new-booking")({
  component: AdminNewBooking,
});

function AdminNewBooking() {
  const nav = useNavigate();

  const handleBookingSuccess = useCallback(
    (payload: BookingCreatedPayload) => {
      nav({
        to: "/admin/booking-success" as any,
        search: {
          bookingId: payload.bookingId,
          paymentMethod: payload.paymentMethod,
          paymentStatus: payload.paymentStatus,
          amountReceived: payload.amountReceived,
          balanceReturn: payload.balanceReturn,
        } as any,
      });
    },
    [nav]
  );

  return (
    <div className="p-2 sm:p-6 mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-foreground">New Walk-in Booking</h1>
        <p className="text-sm text-muted-foreground mt-1">Create a booking for walk-in guests directly from the counter.</p>
      </div>
      
      <BookingFlow isAdmin={true} onSuccess={handleBookingSuccess} />
    </div>
  );
}
