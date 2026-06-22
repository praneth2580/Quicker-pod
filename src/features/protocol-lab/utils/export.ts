import { downloadText } from "@/utils/format";

export function exportJson<T>(filename: string, data: T): void {
  downloadText(filename, JSON.stringify(data, null, 2));
}

export function exportCsv(filename: string, headers: string[], rows: string[][]): void {
  const escape = (cell: string) => {
    if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  };
  const lines = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))];
  downloadText(filename, lines.join("\n"));
}
