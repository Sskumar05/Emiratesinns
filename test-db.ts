import fs from "fs";
import { createClient } from "@supabase/supabase-js";

// Load .env manually
const envFile = fs.readFileSync(".env", "utf-8");
const env: Record<string, string> = {};
envFile.split("\n").forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2].trim();
  }
});

const supabase = createClient(env["VITE_SUPABASE_URL"], env["VITE_SUPABASE_PUBLISHABLE_KEY"]);

async function verify() {
  const { data: inv } = await supabase
    .from("invoices")
    .select(`
      *,
      bookings (
        *,
        customers (
          full_name,
          email,
          mobile
        )
      )
    `)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  
  if (inv && inv.bookings && inv.bookings.customers) {
    const customer = inv.bookings.customers;
    console.log("FINAL CUSTOMER OBJECT:");
    console.log(JSON.stringify(customer, null, 2));
    if (customer.full_name === "Real Test User" && customer.email === "test@example.com" && customer.mobile === "9876543210") {
      console.log("RESULT: PASS");
    } else {
      console.log("RESULT: FAIL");
    }
  } else {
    console.log("RESULT: FAIL - Missing customer relation");
  }
}

verify().catch(console.error);
