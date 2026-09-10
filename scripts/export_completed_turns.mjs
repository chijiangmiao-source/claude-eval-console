import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const [, , inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) {
  throw new Error("Usage: export_completed_turns.mjs <input.json> <output.xlsx>");
}

const payload = JSON.parse(await fs.readFile(inputPath, "utf8"));
const columns = Array.isArray(payload.columns) ? payload.columns : [];
const rows = Array.isArray(payload.rows) ? payload.rows : [];
if (!columns.length || !rows.length) {
  throw new Error("Excel export requires columns and at least one row");
}
if (rows.some((row) => !Array.isArray(row) || row.length !== columns.length)) {
  throw new Error("Excel export row width does not match the header width");
}

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("完成轮次");
sheet.showGridLines = false;
sheet.getRange("A1").values = [[String(payload.title || "已完成轮次")]];
sheet.getRange("A2").values = [[`导出时间：${payload.generated_at || ""}　轮次数：${rows.length}`]];
sheet.getRange("A4").write([columns, ...rows]);

const lastColumn = columnName(columns.length);
const lastRow = rows.length + 4;
const usedRange = sheet.getRange(`A1:${lastColumn}${lastRow}`);
usedRange.format.font = { name: "Arial", size: 10, color: "#24323A" };
usedRange.format.verticalAlignment = "top";

sheet.getRange("A1").format.font = {
  name: "Arial",
  size: 16,
  bold: true,
  color: "#263B35",
};
sheet.getRange("A2").format.font = {
  name: "Arial",
  size: 9,
  italic: true,
  color: "#6F7E78",
};
const header = sheet.getRange(`A4:${lastColumn}4`);
header.format = {
  fill: "#315F55",
  font: { name: "Arial", size: 10, bold: true, color: "#FFFFFF" },
  verticalAlignment: "center",
  horizontalAlignment: "center",
  wrapText: true,
  borders: { preset: "inside", style: "thin", color: "#FFFFFF" },
};
header.format.rowHeight = 30;

const body = sheet.getRange(`A5:${lastColumn}${lastRow}`);
body.format.wrapText = true;
body.format.borders = {
  bottom: { style: "thin", color: "#E3E9E7" },
};
sheet.getRange(`A5:A${lastRow}`).format.horizontalAlignment = "center";
sheet.getRange(`F5:F${lastRow}`).format.horizontalAlignment = "center";
for (const column of ["Q", "S", "U", "W", "Y"]) {
  sheet.getRange(`${column}5:${column}${lastRow}`).format.horizontalAlignment = "center";
  sheet.getRange(`${column}5:${column}${lastRow}`).format.numberFormat = "0";
}

const widths = {
  A: 12, B: 28, C: 52, D: 20, E: 22, F: 12, G: 24, H: 48,
  I: 48, J: 24, K: 14, L: 25, M: 16, N: 18, O: 12, P: 34,
  Q: 12, R: 42, S: 12, T: 42, U: 12, V: 42, W: 12, X: 42,
  Y: 12, Z: 42, AA: 34, AB: 14,
};
for (const [column, width] of Object.entries(widths)) {
  sheet.getRange(`${column}:${column}`).format.columnWidth = width;
}
body.format.autofitRows();

sheet.freezePanes.freezeRows(4);
const table = sheet.tables.add(`A4:${lastColumn}${lastRow}`, true, "CompletedTurns");
table.showFilterButton = true;

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

function columnName(count) {
  let value = count;
  let result = "";
  while (value > 0) {
    value -= 1;
    result = String.fromCharCode(65 + (value % 26)) + result;
    value = Math.floor(value / 26);
  }
  return result;
}
