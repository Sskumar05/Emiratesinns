import { createClient } from "@supabase/supabase-js";
import fs from 'fs';

// Parse .env
const envStr = fs.readFileSync('.env', 'utf-8');
let VITE_SUPABASE_URL = "";
let VITE_SUPABASE_ANON_KEY = "";

envStr.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) {
    VITE_SUPABASE_URL = line.split('=')[1].replace(/["']/g, "").trim();
  }
  if (line.startsWith('VITE_SUPABASE_PUBLISHABLE_KEY=')) {
    VITE_SUPABASE_ANON_KEY = line.split('=')[1].replace(/["']/g, "").trim();
  }
});

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from("hotels").select("*").limit(1);
  if (data && data.length > 0) {
    console.log("Hotels keys:", Object.keys(data[0]));
  } else {
    console.log("No data", error);
  }
}
run();
