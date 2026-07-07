import * as XLSX from "xlsx";

/** Format a date string (YYYY-MM-DD or ISO) as "DD MMM YYYY" */
export function fmtExcelDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Download a 2-D array as an .xlsx file */
export function downloadXlsx(
  rows: (string | number)[][],
  sheetName: string,
  fileName: string,
) {
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Auto-size columns based on max cell length
  const colWidths = rows.reduce<number[]>((acc, row) => {
    row.forEach((cell, ci) => {
      const len = String(cell ?? "").length;
      acc[ci] = Math.max(acc[ci] ?? 10, len + 2);
    });
    return acc;
  }, []);
  ws["!cols"] = colWidths.map((w) => ({ wch: Math.min(w, 50) }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}
