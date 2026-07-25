import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const envFile = fs.readFileSync(".env", "utf-8");
const env: Record<string, string> = {};
envFile.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    // strip surrounding double-quotes if present
    const val = match[2].trim().replace(/^"|"$/g, "");
    env[match[1].trim()] = val;
  }
});

console.log("Parsed env keys:", Object.keys(env));

const supabaseUrl = env["VITE_SUPABASE_URL"] || env["SUPABASE_URL"];
const supabaseKey = env["VITE_SUPABASE_PUBLISHABLE_KEY"] || env["SUPABASE_PUBLISHABLE_KEY"];
console.log("supabaseUrl:", supabaseUrl);
console.log("supabaseKey:", supabaseKey ? supabaseKey.slice(0, 20) + "..." : "(missing)");
if (!supabaseUrl) throw new Error("No Supabase URL found in .env");
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // 1. List all hotels
  const { data: hotels, error: hErr } = await supabase
    .from("hotels")
    .select("id, name")
    .order("name");

  if (hErr) { console.error("Hotels error:", hErr); return; }
  console.log("\n=== HOTELS ===");
  console.table(hotels);

  // 2. For every hotel, print every room with all columns
  for (const hotel of hotels ?? []) {
    const { data: rooms, error: rErr } = await supabase
      .from("rooms")
      .select("*")
      .eq("hotel_id", hotel.id)
      .order("room_number");

    if (rErr) { console.error(`Rooms error for ${hotel.name}:`, rErr); continue; }

    console.log(`\n=== ROOMS for hotel: "${hotel.name}" (id: ${hotel.id}) ===`);
    if (!rooms || rooms.length === 0) {
      console.log("  (no rooms found)");
      continue;
    }

    // Print every row in full
    rooms.forEach((r, i) => {
      console.log(`\n--- Room ${i + 1} ---`);
      console.log(JSON.stringify(r, null, 2));
    });

    // Also print a compact table of the most relevant columns
    const cols = ["room_number", "category", "room_type", "status", "price_per_night", "price_12_hours"];
    const compact = rooms.map(r => {
      const row: Record<string, any> = {};
      cols.forEach(c => { row[c] = (r as any)[c] ?? "(n/a)"; });
      return row;
    });
    console.log(`\n--- Compact view for "${hotel.name}" ---`);
    console.table(compact);
  }
}

run().catch(console.error);
