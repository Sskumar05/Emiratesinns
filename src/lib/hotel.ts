export const CATEGORY_LABELS: Record<string, string> = {
  ac_double: "Deluxe",
  ac_triple: "Triple",
  ac_four: "Four Bed",
};

export const AMENITY_LABELS: Record<string, string> = {
  WiFi: "Complimentary WiFi",
  AC: "Air Conditioning",
  TV: "Smart TV",
  "Hot Water": "Hot Water",
  CCTV: "24/7 CCTV",
  Parking: "Car Parking",
  Kitchen: "Kitchen Facility",
  "Welcome Drink": "Welcome Drink",
};

export function formatINR(n: number | string): string {
  const v = typeof n === "string" ? parseFloat(n) : n;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0);
}

export function addDays(date: string | Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isoDate(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toISOString().slice(0, 10);
}

export function fmtDateTime(dateStr: string, timeStr?: string | null): string {
  if (!dateStr) return "—";
  const ts = timeStr ? timeStr : "14:00"; // default if missing
  const d = new Date(`${dateStr}T${ts}:00`);
  
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const parts = formatter.formatToParts(d);
  const day = parts.find(p => p.type === 'day')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const year = parts.find(p => p.type === 'year')?.value;

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const time = timeFormatter.format(d);

  return `${day} ${month} ${year} | ${time}`;
}

export function getDurationLabel(numDays: number, stayType: string): string {
  if (stayType === "12_hours") return "12 Hours";
  return `${numDays} Night${numDays !== 1 ? "s" : ""}`;
}

export function getRateLabel(stayType: string): string {
  return stayType === "12_hours" ? "Half-Day Rate" : "Nightly Rate";
}
