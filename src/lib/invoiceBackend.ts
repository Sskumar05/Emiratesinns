import { jsPDF } from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_LABELS, formatINR, fmtDateTime, getDurationLabel, getRateLabel } from "@/lib/hotel";

export interface PDFInvoiceResult {
  pdfBase64: string;
  pdfDataUrl: string;
  filename: string;
  invoiceNumber: string;
}

/**
 * Generate a professional, valid A4 PDF invoice document using jsPDF.
 */
export function generatePDFInvoice(data: any): PDFInvoiceResult {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  const isInvoiceRow = !!data.invoice_number;
  const booking = isInvoiceRow ? (data.bookings ?? {}) : data;

  // Resolve customer from every possible location the Supabase query may return it
  const customerFromRoot     = data.customers;                  // invoices.customers (direct FK join)
  const customerFromBookings = (data.bookings ?? {}).customers; // invoices.bookings.customers (nested join)
  const customerFromBooking  = booking.customers;               // bookings.customers (direct query path)
  const customer = customerFromRoot || customerFromBookings || customerFromBooking || {};

  const hotel = booking.hotels ?? data.hotels ?? {};

  const bookingCode = booking.booking_code ?? "REF";
  const invoiceNumber = isInvoiceRow
    ? data.invoice_number
    : `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${bookingCode.slice(-6)}`;

  const now = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const cat = CATEGORY_LABELS[booking.category] ?? booking.category ?? "Standard Room";
  const numDays = Math.max(booking.num_days ?? 1, 1);
  const numRooms = Math.max(booking.num_rooms ?? 1, 1);
  const stayType = booking.stay_type ?? "standard";
  const durationLabel = getDurationLabel(numDays, stayType);
  const rateLabel = getRateLabel(stayType);

  const pricePerNight = booking.price_per_night ?? 0;
  const totalAmount = booking.total_amount ?? 0;
  const taxAmount = isInvoiceRow ? (data.tax_amount ?? 0) : 0;
  const paymentStatus = (booking.payment_status ?? "paid").toUpperCase();

  const checkIn = fmtDateTime(booking.check_in_date, booking.check_in_time);
  const checkOut = fmtDateTime(
    booking.check_out_date,
    stayType === "12_hours"
      ? (() => {
          const d = new Date(`${booking.check_in_date}T${booking.check_in_time || "14:00"}:00`);
          d.setHours(d.getHours() + 12);
          return d.toTimeString().slice(0, 5);
        })()
      : "12:00"
  );

  // ── Palette ──
  const primaryGold = [184, 134, 11]; // #B8860B
  const darkNavy = [26, 26, 46]; // #1A1A2E
  const mutedGray = [107, 114, 128];
  const lightBg = [249, 250, 251];
  const borderGray = [229, 231, 235];

  // ── Top Accent Bar ──
  doc.setFillColor(primaryGold[0], primaryGold[1], primaryGold[2]);
  doc.rect(0, 0, 210, 4, "F");

  // ── Header Branding ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text("EMIRATES GRAND INN", 15, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(primaryGold[0], primaryGold[1], primaryGold[2]);
  doc.text("LUXURY HOTEL & SUITES", 15, 25);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(primaryGold[0], primaryGold[1], primaryGold[2]);
  doc.text("INVOICE", 195, 20, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text(`Invoice No: ${invoiceNumber}`, 195, 26, { align: "right" });
  doc.text(`Issued Date: ${now}`, 195, 31, { align: "right" });

  // ── Divider ──
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.line(15, 36, 195, 36);

  // ── Section 1: Information Cards ──
  let y = 43;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text("GUEST INFORMATION", 15, y);
  doc.text("RESERVATION SUMMARY", 110, y);

  y += 4;

  // Box 1: Guest Info
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(15, y, 85, 32, 2, 2, "F");
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.rect(15, y, 85, 32, "S");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text("Full Name:", 18, y + 8);
  doc.text("Email Address:", 18, y + 16);
  doc.text("Mobile Number:", 18, y + 24);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(String(customer.full_name ?? "Valued Guest"), 44, y + 8);
  doc.text(String(customer.email ?? "—"), 44, y + 16);
  doc.text(String(customer.mobile ?? "—"), 44, y + 24);

  // Box 2: Reservation Summary
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(110, y, 85, 32, 2, 2, "F");
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.rect(110, y, 85, 32, "S");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text("Booking Code:", 113, y + 8);
  doc.text("Hotel Property:", 113, y + 16);
  doc.text("Payment Status:", 113, y + 24);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryGold[0], primaryGold[1], primaryGold[2]);
  doc.text(String(bookingCode), 142, y + 8);

  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(String(hotel.name ?? "Emirates Grand Inn"), 142, y + 16);

  // Status Badge
  doc.setFillColor(220, 252, 231);
  doc.rect(142, y + 20, 22, 5, "F");
  doc.setTextColor(22, 163, 74);
  doc.setFontSize(8);
  doc.text(paymentStatus, 153, y + 23.5, { align: "center" });

  // ── Section 2: Stay Details Table ──
  y += 40;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text("STAY DETAILS", 15, y);

  y += 5;

  doc.setFillColor(243, 244, 246);
  doc.rect(15, y, 180, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text("DESCRIPTION FIELD", 20, y + 4.5);
  doc.text("DETAILS", 100, y + 4.5);

  const stayRows = [
    ["Room Category", cat],
    ["Check-in", checkIn],
    ["Check-out", checkOut],
    ["Duration", durationLabel],
    ["Guests & Rooms", `${booking.num_guests ?? 1} Guest(s), ${numRooms} Room(s)`],
    [rateLabel, formatINR(pricePerNight)],
  ];

  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  stayRows.forEach(([label, val], idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(249, 250, 251);
      doc.rect(15, y, 180, 6.5, "F");
    }
    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
    doc.text(label, 20, y + 4.5);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.setFont("helvetica", "bold");
    doc.text(val, 100, y + 4.5);
    doc.setFont("helvetica", "normal");
    y += 6.5;
  });

  // ── Section 3: Amount Breakdown ──
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text("BILLING & TAX BREAKDOWN", 15, y);

  y += 5;

  doc.setFillColor(243, 244, 246);
  doc.rect(15, y, 180, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text("ITEM DESCRIPTION", 20, y + 4.5);
  doc.text("AMOUNT", 190, y + 4.5, { align: "right" });

  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(`${cat} (${durationLabel}) × ${numRooms} Room(s)`, 20, y + 4.5);
  doc.text(formatINR(totalAmount), 190, y + 4.5, { align: "right" });

  y += 8;
  if (taxAmount > 0) {
    doc.text("Taxes & Service Charges", 20, y + 4.5);
    doc.text(formatINR(taxAmount), 190, y + 4.5, { align: "right" });
    y += 8;
  }

  // Total Paid Accent Box
  doc.setFillColor(254, 249, 240);
  doc.setDrawColor(primaryGold[0], primaryGold[1], primaryGold[2]);
  doc.rect(15, y, 180, 10, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(primaryGold[0], primaryGold[1], primaryGold[2]);
  doc.text("TOTAL AMOUNT PAID", 20, y + 6.5);
  doc.text(formatINR(totalAmount + taxAmount), 190, y + 6.5, { align: "right" });

  // ── Footer ──
  const footerY = 270;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.line(15, footerY, 195, footerY);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text('"Thank you for choosing Emirates Grand Inn. We look forward to welcoming you."', 105, footerY + 6, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(primaryGold[0], primaryGold[1], primaryGold[2]);
  doc.text("Emirates Grand Inn · Luxury Redefined", 105, footerY + 11, { align: "center" });

  const filename = `EmiratesInn-Invoice-${bookingCode}.pdf`;
  const pdfDataUrl = doc.output("datauristring");
  const pdfBase64 = pdfDataUrl.includes(",") ? pdfDataUrl.split(",")[1] : pdfDataUrl;

  return { pdfBase64, pdfDataUrl, filename, invoiceNumber };
}

/**
 * Backend Invoice Service:
 * Retrieves pre-generated PDF invoice from DB if it exists, or generates and saves it once.
 * Prevents duplicate invoice creation for the same booking.
 */
export async function getOrGenerateInvoicePDF(bookingId: string): Promise<PDFInvoiceResult> {
  if (!bookingId) {
    throw new Error("Invalid request: Booking ID is required.");
  }

  // Fetch the invoice or booking data securely via SECURITY DEFINER RPC
  const { data: invoiceData, error: rpcErr } = await (supabase.rpc as any)(
    "get_invoice_data",
    { p_booking_id: bookingId }
  );

  if (rpcErr || !invoiceData) {
    console.error("[invoiceBackend] RPC error:", rpcErr);
    throw new Error("Unable to retrieve booking or invoice record for invoice generation.");
  }

  const isInvoiceRow = !!invoiceData.invoice_number;

  // 1. If an invoice record already exists, regenerate the PDF from the live RPC data
  if (isInvoiceRow) {
    const pdfResult = generatePDFInvoice(invoiceData);

    // Overwrite the stored pdf_url in DB to ensure it has latest customer details.
    await supabase
      .from("invoices")
      .update({ pdf_url: pdfResult.pdfDataUrl })
      .eq("id", invoiceData.id);

    return pdfResult;
  }

  // 2. No invoice record exists yet — generate PDF and insert new invoice record
  const pdfResult = generatePDFInvoice(invoiceData);

  await supabase.from("invoices").insert({
    booking_id: invoiceData.id,
    customer_id: invoiceData.customer_id,
    amount: invoiceData.total_amount ?? 0,
    status: "paid",
    invoice_number: pdfResult.invoiceNumber,
    pdf_url: pdfResult.pdfDataUrl,
  });

  return pdfResult;
}


