import { generateInvoiceHTML } from "./src/lib/invoicePdf";
import { generatePDFInvoice } from "./src/lib/invoiceBackend";
import fs from "fs";

const mockBooking = {
  id: "test-booking-id",
  booking_code: "EI-TEST123",
  category: "ac_double",
  num_days: 2,
  num_rooms: 1,
  num_guests: 2,
  check_in_date: "2026-07-25",
  check_in_time: "14:00",
  check_out_date: "2026-07-27",
  stay_type: "standard",
  price_per_night: 2000,
  total_amount: 4000,
  payment_status: "paid",
  customers: {
    full_name: "Test User",
    email: "test@example.com",
    mobile: "9876543210"
  },
  hotels: {
    name: "Emirates Grand Inn"
  }
};

async function main() {
  console.log("Generating HTML invoice (from invoicePdf.ts)...");
  const html = generateInvoiceHTML(mockBooking);
  fs.writeFileSync("test-invoice-preview.html", html);
  
  console.log("Generating PDF invoice (from invoiceBackend.ts)...");
  const pdfResult = generatePDFInvoice(mockBooking);
  
  // pdfBase64 contains the raw base64 data without data URL prefix
  const pdfBuffer = Buffer.from(pdfResult.pdfBase64, "base64");
  fs.writeFileSync("test-invoice-download.pdf", pdfBuffer);
  
  console.log("Done! Created test-invoice-preview.html and test-invoice-download.pdf");
}

main().catch(console.error);
