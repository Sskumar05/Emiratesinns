import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_LABELS, formatINR } from "@/lib/hotel";
import { toast } from "sonner";
import { Loader2, Trash2, Plus, Pencil, Check, X, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

/**
 * RoomNumbersModal
 *
 * Allows the admin to:
 *   • Add a new room number (with validation — no duplicates per hotel)
 *   • Inline-edit a room number
 *   • Change room status for permanent states (Maintenance / Available)
 *   • Delete a room number
 *   • See real-time occupancy derived from active bookings
 */

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryGroup: any; // the group object from AdminRooms
}

type RoomStatus = "available" | "occupied" | "maintenance";

const STATUS_STYLES: Record<RoomStatus, string> = {
  available:   "bg-emerald-500/15 text-emerald-700 border-emerald-500/25",
  occupied:    "bg-red-500/15 text-red-700 border-red-500/25",
  maintenance: "bg-amber-500/15 text-amber-700 border-amber-500/25",
};

export function RoomNumbersModal({ isOpen, onClose, onSuccess, categoryGroup }: Props) {
  const [addNumber, setAddNumber] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Inline edit state: roomId → edited number string
  const [editId, setEditId] = useState<string | null>(null);
  const [editNumber, setEditNumber] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Which occupied room's booking details are expanded
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);

  if (!categoryGroup) return null;

  const categoryLabel =
    CATEGORY_LABELS[categoryGroup.category as keyof typeof CATEGORY_LABELS] ??
    categoryGroup.category;

  // ── Fetch active bookings for this hotel+category ────────────────────────
  const { data: activeBookings = [] } = useQuery({
    queryKey: ["room-modal-occupancy", categoryGroup.hotel_id, categoryGroup.category],
    enabled: isOpen && !!categoryGroup,
    queryFn: async () =>
      (
        await supabase
          .from("bookings")
          .select("id, booking_code, assigned_room_ids, check_in_date, check_out_date, status, customers(full_name)")
          .eq("hotel_id", categoryGroup.hotel_id)
          .eq("category", categoryGroup.category)
          .in("status", ["confirmed", "checked_in"])
      ).data ?? [],
  });

  // Map: room_id → booking details
  const occupiedMap = useMemo(() => {
    const map: Record<string, any> = {};
    activeBookings.forEach((b: any) => {
      (b.assigned_room_ids ?? []).forEach((roomId: string) => {
        map[roomId] = b;
      });
    });
    return map;
  }, [activeBookings]);

  // Derive live status per room
  function liveStatus(r: any): RoomStatus {
    if (r.status === "maintenance") return "maintenance";
    if (occupiedMap[r.id]) return "occupied";
    return "available";
  }

  // ── Add room number ───────────────────────────────────────────────────────
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const num = addNumber.trim();
    if (!num) return;

    setAddLoading(true);
    try {
      const { data: dup } = await supabase
        .from("rooms")
        .select("id")
        .eq("hotel_id", categoryGroup.hotel_id)
        .eq("room_number", num)
        .limit(1);

      if (dup && dup.length > 0) throw new Error("Room number already exists for this hotel.");

      const tpl = categoryGroup.template;
      const { error } = await supabase.from("rooms").insert([
        {
          hotel_id: tpl.hotel_id,
          category: tpl.category,
          room_number: num,
          status: "available",
          room_type: tpl.room_type ?? null,
          floor: tpl.floor ?? null,
          bed_type: tpl.bed_type ?? null,
          max_guests: tpl.max_guests,
          price_per_night: tpl.price_per_night,
          description: tpl.description ?? null,
          amenities: Array.isArray(tpl.amenities) ? tpl.amenities : [],
          images: Array.isArray(tpl.images) ? tpl.images : [],
        },
      ]);

      if (error) throw error;
      toast.success(`Room ${num} added!`);
      setAddNumber("");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to add room.");
    } finally {
      setAddLoading(false);
    }
  }

  // ── Toggle Maintenance status (only permanent state changeable manually) ──
  async function toggleMaintenance(r: any) {
    const live = liveStatus(r);
    if (live === "occupied") {
      toast.error("Cannot change status of an occupied room. The room has an active booking.");
      return;
    }
    const newStatus = r.status === "maintenance" ? "available" : "maintenance";
    const { error } = await supabase
      .from("rooms")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", r.id);

    if (error) toast.error(error.message);
    else { toast.success(`Room ${r.room_number} → ${newStatus}`); onSuccess(); }
  }

  // ── Save inline edit ──────────────────────────────────────────────────────
  async function handleSaveEdit(room: any) {
    const num = editNumber.trim();
    if (!num) { toast.error("Room number cannot be empty."); return; }
    if (num === room.room_number) { setEditId(null); return; }

    setEditLoading(true);
    try {
      const { data: dup } = await supabase
        .from("rooms")
        .select("id")
        .eq("hotel_id", categoryGroup.hotel_id)
        .eq("room_number", num)
        .neq("id", room.id)
        .limit(1);

      if (dup && dup.length > 0) throw new Error("Room number already exists for this hotel.");

      const { error } = await supabase
        .from("rooms")
        .update({ room_number: num, updated_at: new Date().toISOString() })
        .eq("id", room.id);

      if (error) throw error;
      toast.success(`Room renamed to ${num}`);
      setEditId(null);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to update room number.");
    } finally {
      setEditLoading(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(r: any) {
    const live = liveStatus(r);
    if (live === "occupied") {
      toast.error(`Room ${r.room_number} is currently occupied. Cancel or check out the booking first.`);
      return;
    }
    if (!confirm(`Delete Room ${r.room_number}? This cannot be undone.`)) return;

    const { error } = await supabase.from("rooms").delete().eq("id", r.id);
    if (error) toast.error(error.message);
    else { toast.success(`Room ${r.room_number} deleted`); onSuccess(); }
  }

  const rw = "bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors";

  // Summary counts
  const summary = useMemo(() => {
    const rooms = categoryGroup.rooms ?? [];
    const maint = rooms.filter((r: any) => r.status === "maintenance").length;
    const occ = rooms.filter((r: any) => r.status !== "maintenance" && occupiedMap[r.id]).length;
    const avail = rooms.filter((r: any) => r.status !== "maintenance" && !occupiedMap[r.id]).length;
    return { avail, occ, maint, total: rooms.length };
  }, [categoryGroup.rooms, occupiedMap]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto bg-card text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Manage Room Numbers</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {categoryGroup.hotel_name} — {categoryLabel}
          </p>
        </DialogHeader>

        <div className="mt-4 space-y-6">

          {/* ── Add room form ─────────────────────────────────────────────── */}
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-end gap-3 bg-muted/30 p-4 rounded-lg border border-border">
            <div className="flex-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                New Room Number
              </label>
              <input
                required
                type="text"
                value={addNumber}
                onChange={(e) => setAddNumber(e.target.value)}
                placeholder="e.g. 104"
                className={`${rw} w-full`}
              />
            </div>
            <button
              type="submit"
              disabled={addLoading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              {addLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Room
            </button>
          </form>

          {/* ── Room list ─────────────────────────────────────────────────── */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4">Room Number</th>
                  <th className="text-left py-3 px-4">Live Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categoryGroup.rooms.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-muted-foreground text-sm">
                      No rooms yet. Add one above.
                    </td>
                  </tr>
                ) : (
                  categoryGroup.rooms.map((r: any) => {
                    const live = liveStatus(r);
                    const booking = occupiedMap[r.id];
                    const isExpanded = expandedRoomId === r.id;

                    return (
                      <>
                        <tr key={r.id} className="hover:bg-muted/20 transition-colors">

                          {/* Room number — inline editable */}
                          <td className="py-3 px-4">
                            {editId === r.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  autoFocus
                                  type="text"
                                  value={editNumber}
                                  onChange={(e) => setEditNumber(e.target.value)}
                                  className={`${rw} w-28`}
                                />
                                <button
                                  type="button"
                                  disabled={editLoading}
                                  onClick={() => handleSaveEdit(r)}
                                  className="text-emerald-600 hover:text-emerald-700 transition-colors"
                                  title="Save"
                                >
                                  {editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditId(null)}
                                  className="text-muted-foreground hover:text-red-500 transition-colors"
                                  title="Cancel"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="font-bold text-primary">{r.room_number}</span>
                            )}
                          </td>

                          {/* Live Status Badge */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {live === "occupied" ? (
                                <button
                                  onClick={() => setExpandedRoomId(isExpanded ? null : r.id)}
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer hover:opacity-80 transition-opacity ${STATUS_STYLES.occupied}`}
                                  title="Click to view booking details"
                                >
                                  Occupied ↗
                                </button>
                              ) : live === "maintenance" ? (
                                <button
                                  onClick={() => toggleMaintenance(r)}
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer hover:opacity-80 transition-opacity ${STATUS_STYLES.maintenance}`}
                                  title="Click to mark as Available"
                                >
                                  Maintenance
                                </button>
                              ) : (
                                <button
                                  onClick={() => toggleMaintenance(r)}
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer hover:opacity-80 transition-opacity ${STATUS_STYLES.available}`}
                                  title="Click to mark as Maintenance"
                                >
                                  Available
                                </button>
                              )}
                              {live !== "occupied" && (
                                <span className="text-[10px] text-muted-foreground">
                                  {live === "maintenance" ? "→ click to unset" : "→ click to set maintenance"}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Edit / Delete */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                type="button"
                                onClick={() => { setEditId(r.id); setEditNumber(r.room_number); }}
                                className="text-muted-foreground hover:text-primary transition-colors"
                                title="Edit Room Number"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(r)}
                                className="text-muted-foreground hover:text-red-500 transition-colors"
                                title="Delete Room"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Booking detail panel — shown when occupied room is clicked */}
                        {isExpanded && booking && (
                          <tr key={`${r.id}-detail`}>
                            <td colSpan={3} className="px-4 pb-3 pt-0 bg-red-500/5">
                              <div className="rounded-lg border border-red-500/20 bg-card p-4 space-y-3">
                                <p className="text-xs font-bold uppercase tracking-wider text-red-600">Active Booking</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                                  <div>
                                    <p className="text-xs text-muted-foreground font-semibold">Booking ID</p>
                                    <p className="font-bold text-gold">{booking.booking_code}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground font-semibold">Guest</p>
                                    <p className="font-medium">{booking.customers?.full_name ?? "—"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground font-semibold">Status</p>
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${booking.status === "checked_in" ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/25" : "bg-blue-500/15 text-blue-700 border-blue-500/25"}`}>
                                      {booking.status === "checked_in" ? "Checked In" : "Confirmed"}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground font-semibold">Check-In</p>
                                    <p className="font-medium">{booking.check_in_date}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground font-semibold">Check-Out</p>
                                    <p className="font-medium">{booking.check_out_date}</p>
                                  </div>
                                </div>
                                <a
                                  href="/admin/bookings"
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  View in Bookings
                                </a>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Summary row */}
          {categoryGroup.rooms.length > 0 && (
            <div className="flex flex-wrap gap-3 text-xs font-semibold">
              {summary.avail > 0 && (
                <span className={`px-3 py-1 rounded-full border ${STATUS_STYLES.available}`}>
                  {summary.avail} Available
                </span>
              )}
              {summary.occ > 0 && (
                <span className={`px-3 py-1 rounded-full border ${STATUS_STYLES.occupied}`}>
                  {summary.occ} Occupied
                </span>
              )}
              {summary.maint > 0 && (
                <span className={`px-3 py-1 rounded-full border ${STATUS_STYLES.maintenance}`}>
                  {summary.maint} Maintenance
                </span>
              )}
              <span className="px-3 py-1 rounded-full border border-border text-muted-foreground">
                {summary.total} Total
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
