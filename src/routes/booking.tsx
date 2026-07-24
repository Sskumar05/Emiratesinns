import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { BookingFlow } from "@/components/booking/BookingFlow";

type Search = {
  roomId?: string;
  hotelId?: string;
  checkInDate?: string;
  numDays?: number;
  numGuests?: number;
  numRooms?: number;
};

export const Route = createFileRoute("/booking")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    roomId: typeof s.roomId === "string" ? s.roomId : undefined,
    hotelId: typeof s.hotelId === "string" ? s.hotelId : undefined,
    checkInDate: typeof s.checkInDate === "string" ? s.checkInDate : undefined,
    numDays: typeof s.numDays === "number" ? s.numDays : undefined,
    numGuests: typeof s.numGuests === "number" ? s.numGuests : undefined,
    numRooms: typeof s.numRooms === "number" ? s.numRooms : undefined,
  }),
  component: Booking,
});

function Booking() {
  const search = Route.useSearch();
  const nav = useNavigate();

  if (!search.roomId) {
    return (
      <WebsiteLayout>
        <div className="container-luxe py-32 text-center">
          <p className="text-muted-foreground font-medium mb-4">No room selected.</p>
          <button onClick={() => nav({ to: "/rooms" })} className="border border-gold text-gold hover:bg-gold/10 transition px-6 py-2.5 text-sm font-semibold rounded-md">Browse Rooms</button>
        </div>
      </WebsiteLayout>
    );
  }

  return (
    <WebsiteLayout>
      <BookingFlow 
        isAdmin={false}
        initialRoomId={search.roomId}
        initialSearch={search}
        onSuccess={(payload) => {
          nav({ to: "/payment", search: { bookingId: payload.bookingId } as any });
        }}
      />
    </WebsiteLayout>
  );
}
