import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read env variables
const envPaths = [".env.local", ".env"];
const env: Record<string, string> = {};
for (const p of envPaths) {
  const envPath = path.join(process.cwd(), p);
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const [key, ...values] = line.split("=");
      if (key && values.length > 0) {
        env[key.trim()] = values.join("=").trim().replace(/['"]/g, "");
      }
    });
  }
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase URL or Key", env);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: customer, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", "6d721178-5286-49b9-bd0b-16d8955f3d04")
    .single();

  console.log("Error:", error);
  console.log("Customer:", JSON.stringify(customer, null, 2));
}

test();
