import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_LABELS } from "@/lib/hotel";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function RoomModal({
  isOpen,
  onClose,
  onSuccess,
  room,
  hotels,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  room?: any;
  hotels: any[];
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    hotel_id: "",
    room_number: "",
    category: "ac_double",
    room_type: "",
    floor: "",
    bed_type: "",
    max_guests: 2,
    price_per_night: 5000,
    description: "",
    amenities: "",
    status: "available",
    images: [] as string[],
  });

  useEffect(() => {
    if (room) {
      setForm({
        ...room,
        amenities: (room.amenities || []).join(", "),
      });
    } else {
      setForm({
        hotel_id: hotels.length > 0 ? hotels[0].id : "",
        room_number: "",
        category: "ac_double",
        room_type: "",
        floor: "",
        bed_type: "",
        max_guests: 2,
        price_per_night: 5000,
        description: "",
        amenities: "WiFi, TV, Hot Water",
        status: "available",
        images: [],
      });
    }
  }, [room, hotels, isOpen]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setLoading(true);
    const uploadedUrls: string[] = [...form.images];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `rooms/${fileName}`;

      try {
        const { error: uploadError, data } = await supabase.storage.from('room-images').upload(filePath, file);
        if (uploadError) {
          toast.error(`Upload failed: ${uploadError.message}. Try creating a "room-images" storage bucket in Supabase.`);
          continue;
        }
        const { data: { publicUrl } } = supabase.storage.from('room-images').getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      } catch (err: any) {
        toast.error(`Error uploading image: ${err.message}`);
      }
    }
    
    setForm(prev => ({ ...prev, images: uploadedUrls }));
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (room?.id) {
        // Edit mode: only price and status can be updated
        const editPayload = {
          price_per_night: form.price_per_night,
          status: form.status,
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabase.from("rooms").update(editPayload).eq("id", room.id);
        if (error) throw error;
        toast.success("Room updated successfully!");
      } else {
        const createPayload = {
          ...form,
          amenities: form.amenities.split(",").map(s => s.trim()).filter(Boolean),
        };
        const { error } = await supabase.from("rooms").insert([createPayload]);
        if (error) throw error;
        toast.success("Room created successfully!");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "An error occurred while saving the room.");
    } finally {
      setLoading(false);
    }
  }

  const isEdit = Boolean(room?.id);
  const readOnlyClass = "w-full bg-muted/50 border border-border rounded-md px-3 py-2 text-sm text-muted-foreground cursor-not-allowed opacity-70";
  const editableClass = "w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card text-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{isEdit ? "Edit Room" : "Add New Room"}</DialogTitle>
        </DialogHeader>

        {isEdit && (
          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/25 rounded-md px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
            <span className="mt-0.5 shrink-0">ℹ️</span>
            <span>Only <strong>Room Price</strong> and <strong>Status</strong> can be changed. All other fields are locked to preserve room configuration.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Hotel */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Hotel</label>
              {isEdit ? (
                <input
                  type="text"
                  value={hotels.find(h => h.id === form.hotel_id)?.name ?? form.hotel_id}
                  disabled
                  className={readOnlyClass}
                />
              ) : hotels.length === 0 ? (
                <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-md px-3 py-2 text-sm text-amber-600">
                  ⚠️ No hotels found in the database. Please add hotels first via the{" "}
                  <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Supabase Dashboard</a>
                  {" "}or run the seed SQL below.
                </div>
              ) : (
                <select
                  required
                  value={form.hotel_id}
                  onChange={e => setForm({...form, hotel_id: e.target.value})}
                  className={editableClass}
                >
                  <option value="" disabled>Select Hotel</option>
                  {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              )}
            </div>

            {/* Room Number */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Room Number {!isEdit && "*"}</label>
              <input
                required={!isEdit}
                type="text"
                value={form.room_number}
                disabled={isEdit}
                onChange={e => setForm({...form, room_number: e.target.value})}
                className={isEdit ? readOnlyClass : editableClass}
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Category {!isEdit && "*"}</label>
              {isEdit ? (
                <input
                  type="text"
                  value={CATEGORY_LABELS[form.category as keyof typeof CATEGORY_LABELS] ?? form.category}
                  disabled
                  className={readOnlyClass}
                />
              ) : (
                <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={editableClass}>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              )}
            </div>

            {/* Room Type */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Room Type</label>
              <input
                type="text"
                value={form.room_type}
                disabled={isEdit}
                onChange={e => setForm({...form, room_type: e.target.value})}
                className={isEdit ? readOnlyClass : editableClass}
              />
            </div>

            {/* Floor */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Floor</label>
              <input
                type="text"
                value={form.floor}
                disabled={isEdit}
                onChange={e => setForm({...form, floor: e.target.value})}
                className={isEdit ? readOnlyClass : editableClass}
              />
            </div>

            {/* Bed Type */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Bed Type</label>
              <input
                type="text"
                value={form.bed_type}
                disabled={isEdit}
                onChange={e => setForm({...form, bed_type: e.target.value})}
                className={isEdit ? readOnlyClass : editableClass}
              />
            </div>

            {/* Capacity */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Capacity (Guests) {!isEdit && "*"}</label>
              <input
                required={!isEdit}
                type="number"
                min={1}
                value={form.max_guests}
                disabled={isEdit}
                onChange={e => setForm({...form, max_guests: parseInt(e.target.value)})}
                className={isEdit ? readOnlyClass : editableClass}
              />
            </div>

            {/* Price — always editable */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Price per Night (₹) *</label>
              <input
                required
                type="number"
                min={0}
                value={form.price_per_night}
                onChange={e => setForm({...form, price_per_night: parseInt(e.target.value)})}
                className={editableClass}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Description</label>
            <textarea
              value={form.description}
              disabled={isEdit}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={3}
              className={`${isEdit ? readOnlyClass : editableClass} resize-none`}
            />
          </div>

          {/* Amenities */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Amenities (Comma separated)</label>
            <input
              type="text"
              value={form.amenities}
              disabled={isEdit}
              onChange={e => setForm({...form, amenities: e.target.value})}
              placeholder="WiFi, TV, AC"
              className={isEdit ? readOnlyClass : editableClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status — always editable */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Status *</label>
              <select required value={form.status} onChange={e => setForm({...form, status: e.target.value})} className={editableClass}>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {/* Upload Images — hidden in edit mode */}
            {!isEdit && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Upload Images</label>
                <input type="file" multiple accept="image/*" onChange={handleFileUpload} disabled={loading} className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
              </div>
            )}
          </div>

          {/* Existing images — read-only preview in edit mode */}
          {form.images.length > 0 && (
            <div>
              {isEdit && (
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Room Images (read-only)</p>
              )}
              <div className="flex gap-2 flex-wrap">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded overflow-hidden border border-border">
                    <img src={img} alt={`Room image ${idx + 1}`} className="object-cover w-full h-full" />
                    {!isEdit && (
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))} className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 text-xs flex items-center justify-center rounded-bl-sm">×</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md border border-border hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-semibold rounded-md bg-primary text-white shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Update Room" : "Save Room"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
