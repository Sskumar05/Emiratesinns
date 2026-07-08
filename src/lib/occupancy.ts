export function getOccupiedRoomStatusMap(bookings: any[]) {
  const map = new Map<string, string>();
  
  // Only consider confirmed and checked-in bookings as taking up room occupancy
  const activeBookings = bookings.filter((b: any) => b.status === "confirmed" || b.status === "checked_in");

  activeBookings.forEach((b: any) => {
    (b.assigned_room_ids ?? []).forEach((roomId: string) => {
      map.set(roomId, b.status);
    });
  });
  
  return map;
}
