/**
 * reports-export.ts
 * Analytics PDF — Helvetica for English, Noto Sans Devanagari for Hindi only.
 * Layout mirrors the analytics screens: KPIs, donut charts, question
 * summary, then each question's answers and who responded.
 */
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import type {
  AnalyticsQuestionDetail,
  AnalyticsSurveyDates,
  ReportKpi,
  ReportPieSlice,
} from "@/types/reports";
import { withGlobalLoader } from "@/components/shared/api-loading.store";
import {
  STATUS_HINT_SHORT,
  withPieFills,
} from "@/modules/reports/analytics-theme";

export type AnalyticsPdfData = {
  dateRange: { from: string; to: string };
  surveyName?: string;
  campaignName?: string;
  surveyDates?: AnalyticsSurveyDates | null;
  kpis: ReportKpi[];
  surveyStatusBreakdown: ReportPieSlice[];
  reasonBreakdown: ReportPieSlice[];
  questions: AnalyticsQuestionDetail[];
  totalQuestions?: number;
  totalAnswers?: number;
};

const MARGIN = 12;
const FOOTER = 10;
const NAVY: [number, number, number] = [44, 59, 89];
const INK: [number, number, number] = [26, 34, 51];
const MUTED: [number, number, number] = [107, 119, 140];
const LINE: [number, number, number] = [226, 230, 237];
const ALT: [number, number, number] = [248, 249, 252];
const WHITE: [number, number, number] = [255, 255, 255];

const UI = "helvetica";
const HI = "NotoSansDevanagari";
const HI_FILE = "NotoSansDevanagari-Regular.ttf";
const HI_URL = "/fonts/NotoSansDevanagari-Regular.ttf";

const STATUS_ORDER = [
  "Complete",
  "Partially complete",
  "Incomplete",
  "Missed",
];

const REASON_MEANING: Record<string, string> = {
  "Disconnected by caller": "Caller hung up",
  "Disconnected by agent": "Agent or system ended the call",
  Unknown: "No reason recorded",
};

type PdfDoc = jsPDF & { lastAutoTable?: { finalY: number } };

let hiFontB64: string | null = null;

function toB64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

async function loadHiFont() {
  if (hiFontB64) return hiFontB64;
  const res = await fetch(HI_URL);
  if (!res.ok) throw new Error("Failed to load PDF Hindi font");
  hiFontB64 = toB64(await res.arrayBuffer());
  return hiFontB64;
}

function registerHiFont(doc: jsPDF, b64: string) {
  doc.addFileToVFS(HI_FILE, b64);
  doc.addFont(HI_FILE, HI, "normal");
  doc.addFont(HI_FILE, HI, "bold");
}

function hasHindi(text: string) {
  return /[\u0900-\u097F]/.test(text);
}

function period(from: string, to: string) {
  if (!from && !to) return "All time";
  const fmt = (v: string) => {
    const d = new Date(`${v}T00:00:00`);
    if (Number.isNaN(d.getTime())) return v;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  return `${fmt(from)} – ${fmt(to)}`;
}

function formatMetaDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const day = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${day}, ${time}`;
}

function pct(part: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 1000) / 10}%`;
}

function sliceCount(row: ReportPieSlice) {
  return Number(row.count ?? 0);
}

function sliceShare(row: ReportPieSlice, total: number) {
  const count = sliceCount(row);
  if (
    typeof row.value === "number" &&
    Number.isFinite(row.value) &&
    (row.value > 0 || count === 0)
  ) {
    return `${row.value}%`;
  }
  return pct(count, total);
}

function pw(doc: jsPDF) {
  return doc.internal.pageSize.getWidth();
}
function ph(doc: jsPDF) {
  return doc.internal.pageSize.getHeight();
}
function uw(doc: jsPDF) {
  return pw(doc) - MARGIN * 2;
}
function bottom(doc: jsPDF) {
  return ph(doc) - MARGIN - FOOTER;
}

function ensure(doc: PdfDoc, y: number, need: number) {
  if (y + need > bottom(doc)) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function cols(doc: jsPDF, fracs: number[]) {
  const total = uw(doc);
  const sum = fracs.reduce((a, b) => a + b, 0) || 1;
  return fracs.map((f) => Math.round((f / sum) * total * 100) / 100);
}

function kpiShare(kpi: ReportKpi) {
  if (kpi.id === "total_calls" || kpi.id === "avg_duration") {
    return kpi.changeLabel || "";
  }
  const n = Number(kpi.change);
  if (Number.isFinite(n) && kpi.changeLabel?.includes("%")) {
    return kpi.changeLabel;
  }
  if (Number.isFinite(n) && n > 0) return `${n}% of calls`;
  return kpi.changeLabel || "";
}

function typeLabel(type?: string) {
  const raw = (type || "").trim();
  if (!raw) return "-";
  if (/yes.?no/i.test(raw) || raw.toLowerCase() === "boolean") return "YES/NO";
  if (/text|open/i.test(raw)) return "TEXT";
  return raw.replace(/_/g, " ").toUpperCase();
}

function section(doc: jsPDF, y: number, title: string) {
  doc.setFont(UI, "bold");
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text(title, MARGIN, y);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y + 1.8, pw(doc) - MARGIN, y + 1.8);
  return y + 6;
}

function statusRowsForPdf(rows: ReportPieSlice[]) {
  const byName = new Map(rows.map((row) => [row.name, row]));
  return STATUS_ORDER.map((name) => {
    const row = byName.get(name);
    return {
      name,
      count: row ? sliceCount(row) : 0,
      value: row?.value ?? 0,
      fill: row?.fill ?? "",
    } satisfies ReportPieSlice;
  });
}

function drawHeader(doc: jsPDF, data: AnalyticsPdfData) {
  const survey = data.surveyName ?? data.campaignName ?? "Survey";
  const totalCalls = Number(
    data.kpis.find((kpi) => kpi.id === "total_calls")?.value ?? 0
  );

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pw(doc), 22, "F");

  doc.setFont(UI, "bold");
  doc.setFontSize(7);
  doc.setTextColor(180, 190, 210);
  doc.text("TECHCALL  |  AI VOICE & SURVEY CRM", MARGIN, 8);

  doc.setFontSize(14);
  doc.setTextColor(...WHITE);
  doc.text("Analytics Report", MARGIN, 16);

  doc.setFont(UI, "normal");
  doc.setFontSize(8);
  doc.setTextColor(210, 218, 230);
  doc.text(period(data.dateRange.from, data.dateRange.to), pw(doc) - MARGIN, 8, {
    align: "right",
  });
  doc.setFont(UI, "bold");
  doc.setFontSize(10);
  doc.setTextColor(...WHITE);
  doc.text(
    `${Number.isFinite(totalCalls) ? totalCalls : 0} calls`,
    pw(doc) - MARGIN,
    16,
    { align: "right" }
  );

  let y = 28;
  if (hasHindi(survey)) {
    doc.setFont(HI, "normal");
  } else {
    doc.setFont(UI, "bold");
  }
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  const lines = doc.splitTextToSize(survey, uw(doc));
  doc.text(lines, MARGIN, y);
  y += lines.length * 5 + 3;

  const dates = data.surveyDates;
  if (dates) {
    const start = dates.startAt
      ? formatMetaDateTime(dates.startAt)
      : dates.scheduledAt
        ? formatMetaDateTime(dates.scheduledAt)
        : "-";
    const end = dates.endAt ? formatMetaDateTime(dates.endAt) : "-";
    const window =
      dates.callWindowStart || dates.callWindowEnd
        ? `${dates.callWindowStart || "-"} - ${dates.callWindowEnd || "-"}`
        : "-";

    const meta = [
      `Created: ${formatMetaDateTime(dates.createdAt)}`,
      `Schedule: ${start} to ${end}`,
      `Call window: ${window}`,
    ];
    doc.setFont(UI, "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    const metaLines = doc.splitTextToSize(meta.join("   |   "), uw(doc));
    doc.text(metaLines, MARGIN, y);
    y += metaLines.length * 3.6 + 1.2;
  }

  return y;
}

function drawKpis(doc: PdfDoc, y: number, kpis: ReportKpi[]) {
  if (!kpis.length) return y;
  y = section(doc, y, "Key metrics");
  const gap = 2.5;
  const n = Math.min(3, kpis.length);
  const cardW = (uw(doc) - gap * (n - 1)) / n;
  const cardH = 16;

  kpis.forEach((kpi, i) => {
    const col = i % n;
    const row = Math.floor(i / n);
    const x = MARGIN + col * (cardW + gap);
    const cy = y + row * (cardH + gap);

    doc.setDrawColor(...LINE);
    doc.setFillColor(...WHITE);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, cy, cardW, cardH, 1.2, 1.2, "FD");

    doc.setFont(UI, "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(kpi.label, x + 2.5, cy + 4.5);

    doc.setFont(UI, "bold");
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text(String(kpi.value), x + 2.5, cy + 10);

    doc.setFont(UI, "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...MUTED);
    doc.text(kpiShare(kpi), x + 2.5, cy + 13.8);
  });

  return y + Math.ceil(kpis.length / n) * (cardH + gap) + 2;
}

type Rgb = [number, number, number];

type ChartSlice = {
  name: string;
  count: number;
  share: string;
  fill: string;
  hint?: string;
  detail?: string;
};

const DONUT_R = 15;
const DONUT_INNER = 9.2;
const DONUT_SLOT = 36;

function hexRgb(hex: string): Rgb {
  const h = hex.replace("#", "").trim();
  if (h.length !== 6) return NAVY;
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function paint(
  doc: jsPDF,
  text: string,
  size: number,
  color: Rgb,
  weight: "normal" | "bold" = "normal"
) {
  doc.setFont(hasHindi(text) ? HI : UI, hasHindi(text) ? "normal" : weight);
  doc.setFontSize(size);
  doc.setTextColor(...color);
}

type TextImage = { url: string; w: number; h: number };

/** Browser font stack that already shapes Devanagari. jsPDF cannot. */
let hindiStack = "";
const textImages = new Map<string, TextImage>();
const PX_PER_MM = 96 / 25.4;

async function prepareHindiFace() {
  if (hindiStack || typeof document === "undefined") return;
  const probe = document.createElement("span");
  probe.className = "font-hindi";
  probe.textContent = "हिंदी";
  probe.style.cssText = "position:fixed;left:-9999px;top:0;visibility:hidden";
  document.body.appendChild(probe);
  hindiStack = getComputedStyle(probe).fontFamily || "";
  document.body.removeChild(probe);
  await document.fonts.ready;
}

function shapeText(
  text: string,
  maxWidthMm: number,
  fontPt: number,
  color: Rgb,
  weight: "normal" | "bold",
  bg: Rgb
): TextImage | null {
  if (!hindiStack || typeof document === "undefined") return null;
  const key = [text, maxWidthMm.toFixed(2), fontPt, color.join(","), weight, bg.join(",")].join("|");
  const cached = textImages.get(key);
  if (cached) return cached;

  const scale = 3;
  const fontPx = fontPt * (96 / 72);
  const maxPx = Math.max(12, maxWidthMm * PX_PER_MM);
  const weightCss = weight === "bold" ? 600 : 500;
  const font = `${weightCss} ${fontPx}px ${hindiStack}`;
  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) return null;
  measure.font = font;

  const padX = Math.ceil(fontPx * 0.45);
  const wrapPx = Math.max(8, maxPx - padX * 2);
  const lines: string[] = [];
  let line = "";
  for (const word of text.trim().split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure.measureText(next).width > wrapPx) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  if (!lines.length) lines.push(text);

  const sample = measure.measureText(lines[0] || text);
  const ascent = Math.max(fontPx * 1.05, sample.actualBoundingBoxAscent || 0);
  const descent = Math.max(fontPx * 0.55, sample.actualBoundingBoxDescent || 0);
  const padTop = Math.ceil(ascent * 0.42 + 3);
  const padBottom = Math.ceil(descent * 0.7 + 3);
  const lineH = Math.ceil(ascent + descent + fontPx * 0.22);
  const cssW = Math.ceil(maxPx);
  const cssH = Math.ceil(padTop + lines.length * lineH + padBottom);
  const canvas = document.createElement("canvas");
  canvas.width = cssW * scale;
  canvas.height = cssH * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(scale, scale);
  ctx.fillStyle = `rgb(${bg.join(",")})`;
  ctx.fillRect(0, 0, cssW, cssH);
  ctx.font = font;
  ctx.fillStyle = `rgb(${color.join(",")})`;
  ctx.textBaseline = "alphabetic";
  lines.forEach((row, index) => {
    ctx.fillText(row, padX, padTop + ascent + index * lineH);
  });

  const image = {
    url: canvas.toDataURL("image/png"),
    w: cssW / PX_PER_MM,
    h: cssH / PX_PER_MM,
  };
  textImages.set(key, image);
  return image;
}

/** Draws Hindi with the browser shaper. Returns the block height in mm. `y` is the top. */
function drawMaybeHindi(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontPt: number,
  color: Rgb,
  weight: "normal" | "bold" = "normal",
  bg: Rgb = WHITE
) {
  if (hasHindi(text)) {
    const image = shapeText(text, maxWidth, fontPt, color, weight, bg);
    if (image) {
      doc.addImage(image.url, "PNG", x, y, image.w, image.h);
      return image.h;
    }
  }
  paint(doc, text, fontPt, color, weight);
  const lines = wrap(doc, text, maxWidth, fontPt);
  doc.text(lines, x, y + fontPt * 0.35);
  return lines.length * lineStep(text, fontPt);
}

/** Devanagari draws wider than the font metrics jsPDF measures, so Hindi wraps by character count. */
function wrap(doc: jsPDF, text: string, width: number, size = 8) {
  if (!hasHindi(text)) {
    doc.setFontSize(size);
    return doc.splitTextToSize(text, width) as string[];
  }
  const maxChars = Math.max(16, Math.floor(width / (size * 0.46)));
  const lines: string[] = [];
  let line = "";
  for (const word of text.trim().split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && next.length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [text];
}

function lineStep(text: string, size: number) {
  return hasHindi(text) ? size * 0.52 : size * 0.45;
}

function ringPoint(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.sin(angle),
    y: cy - r * Math.cos(angle),
  };
}

function drawRingSlice(
  doc: jsPDF,
  cx: number,
  cy: number,
  a0: number,
  a1: number,
  color: Rgb
) {
  const steps = Math.max(8, Math.ceil(((a1 - a0) / (Math.PI * 2)) * 180));
  doc.setFillColor(...color);
  for (let i = 0; i < steps; i += 1) {
    const t0 = a0 + ((a1 - a0) * i) / steps;
    const t1 = a0 + ((a1 - a0) * (i + 1)) / steps;
    const o0 = ringPoint(cx, cy, DONUT_R, t0);
    const o1 = ringPoint(cx, cy, DONUT_R, t1);
    const i1 = ringPoint(cx, cy, DONUT_INNER, t1);
    const i0 = ringPoint(cx, cy, DONUT_INNER, t0);
    doc.triangle(o0.x, o0.y, o1.x, o1.y, i1.x, i1.y, "F");
    doc.triangle(o0.x, o0.y, i1.x, i1.y, i0.x, i0.y, "F");
  }
}

function drawDonut(
  doc: jsPDF,
  cx: number,
  cy: number,
  slices: ChartSlice[],
  centerShare: string,
  centerLabel: string,
  centerColor: Rgb
) {
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);
  doc.setFillColor(241, 244, 248);
  doc.circle(cx, cy, DONUT_R, "F");
  if (total > 0) {
    let angle = 0;
    const positive = slices.filter((slice) => slice.count > 0).length;
    const gap = positive > 1 ? 0.045 : 0;
    for (const slice of slices) {
      const sweep = (slice.count / total) * Math.PI * 2;
      if (sweep <= 0) continue;
      const pad = sweep > gap * 3 ? gap : 0;
      drawRingSlice(doc, cx, cy, angle + pad / 2, angle + sweep - pad / 2, hexRgb(slice.fill));
      angle += sweep;
    }
  }
  doc.setFillColor(...WHITE);
  doc.circle(cx, cy, DONUT_INNER + 0.15, "F");

  doc.setFont(UI, "bold");
  doc.setFontSize(9);
  doc.setTextColor(...centerColor);
  doc.text(centerShare, cx, cy - 0.4, { align: "center" });
  const caption = centerLabel.toUpperCase();
  doc.setFont(UI, "bold");
  doc.setTextColor(...MUTED);
  let captionSize = 5.5;
  doc.setFontSize(captionSize);
  while (doc.getTextWidth(caption) > DONUT_INNER * 1.55 && captionSize > 4) {
    captionSize -= 0.3;
    doc.setFontSize(captionSize);
  }
  doc.text(caption, cx, cy + 3.4, { align: "center" });
}

function legendTextWidth(width: number) {
  return Math.max(18, width - 6);
}

function legendBlockHeight(doc: jsPDF, slice: ChartSlice, textW: number) {
  paint(doc, slice.name, 8, INK, "bold");
  const nameLines = doc.splitTextToSize(slice.name, textW).length;
  const hintLines = slice.hint ? 1 : 0;
  return nameLines * 3.5 + hintLines * 3.1 + 5;
}

function chartCardHeight(doc: jsPDF, subtitle: string, slices: ChartSlice[], cardW: number) {
  const legendW = Math.max(28, cardW - 8 - DONUT_SLOT);
  const textW = legendTextWidth(legendW);
  paint(doc, subtitle, 6.5, MUTED);
  const subLines = doc.splitTextToSize(subtitle, cardW - 8).length;
  const legendH = slices.reduce(
    (sum, slice) => sum + legendBlockHeight(doc, slice, textW),
    0
  );
  return 7 + subLines * 3.1 + 3 + Math.max(DONUT_R * 2 + 2, legendH) + 3;
}

function drawLegend(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  slices: ChartSlice[]
) {
  const textW = legendTextWidth(width);
  let cy = y;
  for (const slice of slices) {
    const color = hexRgb(slice.fill);
    paint(doc, slice.name, 8, INK, "bold");
    const nameLines = doc.splitTextToSize(slice.name, textW) as string[];
    doc.setFillColor(...color);
    doc.circle(x + 1.3, cy - 1.1, 1.15, "F");
    doc.text(nameLines, x + 4.2, cy);
    const meta = `${slice.count}   ${slice.share}`;

    cy += nameLines.length * 3.5;
    if (slice.hint) {
      paint(doc, slice.hint, 6.5, MUTED);
      const hint = doc.splitTextToSize(slice.hint, textW) as string[];
      doc.text(hint[0] ?? "", x + 4.2, cy);
      cy += 3.1;
    }
    const barY = cy - 0.4;
    const barW = Math.max(8, textW - 24);
    doc.setFillColor(232, 236, 242);
    doc.roundedRect(x + 4.2, barY, barW, 1.6, 0.4, 0.4, "F");
    const pctNum = Number(String(slice.share).replace("%", "")) || 0;
    const fillW = barW * (Math.max(0, Math.min(100, pctNum)) / 100);
    if (fillW > 0.4) {
      doc.setFillColor(...color);
      doc.roundedRect(x + 4.2, barY, fillW, 1.6, 0.4, 0.4, "F");
    }
    paint(doc, meta, 7, INK, "bold");
    doc.text(meta, x + width, barY + 1.5, { align: "right" });
    cy = barY + 5;
  }
  return cy;
}

function drawChartCard(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  subtitle: string,
  totalLabel: string,
  slices: ChartSlice[],
  centerMode: "survey" | "reason"
) {
  doc.setDrawColor(...LINE);
  doc.setFillColor(...WHITE);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 1.6, 1.6, "FD");

  paint(doc, title, 10, NAVY, "bold");
  doc.text(title, x + 3.5, y + 5.2);
  paint(doc, totalLabel, 7.5, MUTED);
  doc.text(totalLabel, x + w - 3.5, y + 5.2, { align: "right" });

  paint(doc, subtitle, 6.5, MUTED);
  const subLines = doc.splitTextToSize(subtitle, w - 8) as string[];
  doc.text(subLines, x + 3.5, y + 9);
  const contentTop = y + 9 + subLines.length * 3.1 + 1.5;

  const top = [...slices].sort((a, b) => b.count - a.count)[0];
  const centerLabel =
    centerMode === "reason"
      ? "Top"
      : top?.name === "Partially complete"
        ? "Partial"
        : (top?.name ?? "Status");
  const cx = x + 3.5 + DONUT_R;
  const cy = contentTop + DONUT_R;
  drawDonut(
    doc,
    cx,
    cy,
    slices,
    top?.share ?? "0%",
    centerLabel,
    top ? hexRgb(top.fill) : NAVY
  );

  drawLegend(doc, x + 3.5 + DONUT_SLOT, contentTop + 1.5, w - 7 - DONUT_SLOT, slices);
}

function causePdfLines(name: string): [string, string] {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const piece = word.length > 12 ? `${word.slice(0, 10)}...` : word;
    const next = current ? `${current} ${piece}` : piece;
    if (next.length > 12 && current) {
      lines.push(current);
      current = piece;
      if (lines.length === 2) break;
    } else {
      current = next;
    }
  }
  if (lines.length < 2 && current) lines.push(current);
  const shown = lines.join(" ");
  if (words.join(" ").length > shown.length && lines[0]) {
    const last = lines.length === 1 ? 0 : 1;
    const base = (lines[last] ?? "").replace(/\.\.\.$/, "");
    lines[last] = `${base.slice(0, 9)}...`;
  }
  return [lines[0] ?? "", lines[1] ?? ""];
}

function drawHangupBars(doc: PdfDoc, y: number, slices: ChartSlice[], totalLabel: string) {
  const rows = [...slices]
    .filter((slice) => slice.count > 0)
    .sort((a, b) => b.count - a.count);
  if (!rows.length) return y;

  const maxCount = Math.max(...rows.map((slice) => slice.count), 1);
  const plotH = 62;
  const labelH = 12;
  const headerH = 16;
  const cardH = headerH + plotH + labelH + 4;
  y = ensure(doc, y, Math.min(cardH, bottom(doc) - MARGIN));

  const cardW = uw(doc);
  doc.setDrawColor(...LINE);
  doc.setFillColor(...WHITE);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y, cardW, cardH, 1.6, 1.6, "FD");

  paint(doc, "Hangup cause", 11, NAVY, "bold");
  doc.text("Hangup cause", MARGIN + 4, y + 6);
  paint(doc, totalLabel, 8, MUTED);
  doc.text(totalLabel, pw(doc) - MARGIN - 4, y + 6, { align: "right" });

  const legendY = y + 12.2;
  doc.setFillColor(...hexRgb(rows[0]?.fill || "#93c5fd"));
  doc.roundedRect(MARGIN + cardW / 2 - 10, legendY - 2, 3.6, 2.2, 0.3, 0.3, "F");
  paint(doc, "Calls", 8, INK);
  doc.text("Calls", MARGIN + cardW / 2 - 5, legendY);

  const plotLeft = MARGIN + 14;
  const plotRight = MARGIN + cardW - 8;
  const plotBottom = y + headerH + 2 + plotH;
  const plotW = plotRight - plotLeft;
  const slot = plotW / rows.length;

  doc.setDrawColor(231, 237, 246);
  doc.setLineWidth(0.2);
  for (let tick = 0; tick <= 4; tick += 1) {
    const gy = plotBottom - (plotH * tick) / 4;
    doc.line(plotLeft, gy, plotRight, gy);
    const countLabel = String(Math.round((maxCount * tick) / 4));
    paint(doc, countLabel, 7.5, MUTED);
    doc.text(countLabel, plotLeft - 1.4, gy + 0.9, { align: "right" });
  }

  rows.forEach((slice, index) => {
    const cx = plotLeft + slot * index + slot / 2;
    const barW = Math.min(7.2, slot * 0.5);
    const barH = (plotH * slice.count) / maxCount;
    doc.setFillColor(...hexRgb(slice.fill));
    doc.roundedRect(
      cx - barW / 2,
      plotBottom - barH,
      barW,
      Math.max(barH, 0.4),
      0.5,
      0.5,
      "F"
    );

    const lines = causePdfLines(slice.name).filter(Boolean);
    lines.forEach((line, lineIndex) => {
      paint(doc, line, 6.5, MUTED);
      doc.text(line, cx, plotBottom + 3.4 + lineIndex * 2.8, { align: "center" });
    });
  });

  doc.setLineWidth(0.3);
  return y + cardH + 5;
}

function drawCauseNotes(doc: PdfDoc, y: number, slices: ChartSlice[]) {
  const notes = slices.filter((slice) => slice.detail && slice.detail !== slice.name);
  if (!notes.length) return y;
  y = ensure(doc, y, 18);
  y = section(doc, y, "Hangup cause notes");
  for (const note of notes) {
    const detail = note.detail ?? "";
    paint(doc, note.name, 8, INK, "bold");
    const nameLines = wrap(doc, note.name, uw(doc), 8);
    paint(doc, detail, 7.5, MUTED);
    const detailLines = wrap(doc, detail, uw(doc), 7.5);
    y = ensure(doc, y, nameLines.length * 3.6 + 4);
    paint(doc, note.name, 8, INK, "bold");
    doc.text(nameLines, MARGIN, y);
    y += nameLines.length * 3.6;
    for (const line of detailLines) {
      y = ensure(doc, y, 4);
      paint(doc, line, 7.5, MUTED);
      doc.text(line, MARGIN, y);
      y += 3.3;
    }
    y += 1.8;
  }
  return y + 1;
}

function drawSplitBar(
  doc: PdfDoc,
  y: number,
  answered: number,
  skipped: number
) {
  const total = answered + skipped;
  const width = uw(doc);
  y = ensure(doc, y, 12);
  doc.setFillColor(232, 236, 242);
  doc.roundedRect(MARGIN, y, width, 3, 1, 1, "F");
  if (total > 0 && answered > 0) {
    doc.setFillColor(...NAVY);
    doc.roundedRect(
      MARGIN,
      y,
      Math.max(1.2, (width * answered) / total),
      3,
      1,
      1,
      "F"
    );
  }
  y += 6.2;
  const answeredPct = pct(answered, total);
  const skippedPct = pct(skipped, total);
  paint(doc, `Answered ${answered} (${answeredPct})`, 7.5, MUTED);
  doc.text(`Answered ${answered} (${answeredPct})`, MARGIN, y);
  paint(doc, `Skipped ${skipped} (${skippedPct})`, 7.5, MUTED);
  doc.text(`Skipped ${skipped} (${skippedPct})`, pw(doc) - MARGIN, y, {
    align: "right",
  });
  return y + 5;
}

function drawTopAnswers(
  doc: PdfDoc,
  y: number,
  answers: { name: string; count: number; percent: number }[]
) {
  const rows = answers.filter((row) => row.count > 0);
  if (!rows.length) return y;
  y = ensure(doc, y, 16);
  paint(doc, "Top answers", 9, NAVY, "bold");
  doc.text("Top answers", MARGIN, y);
  paint(doc, `${rows.length} options`, 7.5, MUTED);
  doc.text(`${rows.length} options`, pw(doc) - MARGIN, y, { align: "right" });
  y += 5;

  const max = Math.max(...rows.map((row) => row.count), 1);
  const labelW = uw(doc) * 0.44;
  const barW = uw(doc) * 0.3;

  for (const [index, row] of rows.entries()) {
    const label = (row.name || "").trim() || "-";
    const labelH = hasHindi(label)
      ? (shapeText(label, labelW - 12, 8.5, INK, "bold", index === 0 ? ALT : WHITE)?.h ?? 6)
      : wrap(doc, label, labelW - 12, 8.5).length * lineStep(label, 8.5);
    const rowH = Math.max(9.5, labelH + 3.2);
    y = ensure(doc, y, rowH + 1);

    if (index === 0) {
      doc.setFillColor(...ALT);
      doc.roundedRect(MARGIN, y - 1.2, uw(doc), rowH, 1.4, 1.4, "F");
    }

    const mid = y - 1.2 + rowH / 2;
    const rankFill: Rgb = index === 0 ? NAVY : [226, 232, 240];
    doc.setFillColor(...rankFill);
    doc.circle(MARGIN + 4.2, mid, 2.7, "F");
    doc.setFont(UI, "bold");
    doc.setFontSize(7);
    doc.setTextColor(...(index === 0 ? WHITE : NAVY));
    doc.text(String(index + 1), MARGIN + 4.2, mid + 0.9, { align: "center" });

    const bg = index === 0 ? ALT : WHITE;
    drawMaybeHindi(doc, label, MARGIN + 8.6, mid - labelH / 2, labelW - 12, 8.5, INK, "bold", bg);

    const barX = MARGIN + labelW;
    const trackH = 3.4;
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(barX, mid - trackH / 2, barW, trackH, 1.5, 1.5, "F");
    const fill = Math.min(barW, Math.max(4, (barW * row.count) / max));
    const barFill: Rgb = index === 0 ? NAVY : [96, 165, 250];
    doc.setFillColor(...barFill);
    doc.roundedRect(barX, mid - trackH / 2, fill, trackH, 1.5, 1.5, "F");

    paint(doc, String(row.count), 9, INK, "bold");
    doc.text(String(row.count), pw(doc) - MARGIN - 18, mid + 1.1, { align: "right" });
    paint(doc, `${row.percent}%`, 8, NAVY, "bold");
    doc.text(`${row.percent}%`, pw(doc) - MARGIN, mid + 1.1, { align: "right" });

    y += rowH + 1.3;
  }
  return y + 2;
}

function drawQuestionDetail(
  doc: PdfDoc,
  y: number,
  question: AnalyticsQuestionDetail,
  index: number,
  heading?: string
) {
  const answered = question.usersAnswered ?? question.answered ?? 0;
  const skipped = question.usersSkipped ?? question.unanswered ?? 0;
  const total = question.totalUsers ?? question.total ?? answered + skipped;
  const rate = Math.round(question.answerRate ?? 0);
  const title = (question.question || "").trim() || `Question ${index + 1}`;
  const description = (question.description || "").trim();
  const answers = (
    question.topAnswers?.length ? question.topAnswers : question.answers ?? []
  ).filter((row) => row.count > 0);

  const titleH = hasHindi(title)
    ? (shapeText(title, uw(doc), 12, INK, "bold", WHITE)?.h ?? 8)
    : wrap(doc, title, uw(doc), 12).length * lineStep(title, 12);
  const descH = description
    ? hasHindi(description)
      ? (shapeText(description, uw(doc), 8, MUTED, "normal", WHITE)?.h ?? 6)
      : wrap(doc, description, uw(doc), 8).length * lineStep(description, 8)
    : 0;
  const headerH = (heading ? 10 : 0) + 12 + titleH + (descH ? descH + 2 : 0) + 16;
  y = ensure(doc, y, Math.min(headerH + 8, 78));
  if (heading) y = section(doc, y, heading);

  doc.setFillColor(...ALT);
  doc.roundedRect(MARGIN, y, uw(doc), 8, 1.2, 1.2, "F");
  doc.setFillColor(...NAVY);
  doc.roundedRect(MARGIN + 1.4, y + 1.3, 12, 5.4, 1, 1, "F");
  doc.setFont(UI, "bold");
  doc.setFontSize(8);
  doc.setTextColor(...WHITE);
  doc.text(`Q${index + 1}`, MARGIN + 7.4, y + 5, { align: "center" });
  paint(doc, typeLabel(question.type), 7, MUTED, "bold");
  doc.text(typeLabel(question.type), MARGIN + 16, y + 5.1);
  paint(doc, `${rate}% answer rate`, 8, NAVY, "bold");
  doc.text(`${rate}% answer rate`, pw(doc) - MARGIN - 1.5, y + 5.2, {
    align: "right",
  });
  y += 12;

  y += drawMaybeHindi(doc, title, MARGIN, y, uw(doc), 12, INK, "bold") + 1.6;
  if (description) {
    y += drawMaybeHindi(doc, description, MARGIN, y, uw(doc), 8, MUTED, "normal") + 2;
  }

  const stats = [
    ["Answered", total ? `${answered}/${total}` : String(answered)],
    ["Skipped", String(skipped)],
    ["Total users", String(total)],
    ["Type", typeLabel(question.type)],
  ];
  y = ensure(doc, y, 14);
  const gap = 2;
  const boxW = (uw(doc) - gap * 3) / 4;
  stats.forEach(([label, value], statIndex) => {
    const sx = MARGIN + statIndex * (boxW + gap);
    doc.setDrawColor(...LINE);
    doc.setFillColor(...WHITE);
    doc.roundedRect(sx, y, boxW, 11, 1, 1, "FD");
    paint(doc, label, 6.5, MUTED, "bold");
    doc.text(label.toUpperCase(), sx + 2, y + 4);
    paint(doc, value, 9, INK, "bold");
    doc.text(value, sx + 2, y + 8.4);
  });
  y += 15;

  y = drawSplitBar(doc, y, answered, skipped);
  return drawTopAnswers(doc, y, answers);
}

function drawQuestionBars(doc: PdfDoc, y: number, questions: AnalyticsQuestionDetail[]) {
  const textX = MARGIN + 9;
  const textW = uw(doc) - 9;

  questions.forEach((question, index) => {
    const title = (question.question || "").trim() || `Question ${index + 1}`;
    const rate = Math.max(0, Math.min(100, Math.round(question.answerRate ?? 0)));
    const answered = question.usersAnswered ?? question.answered ?? 0;
    const skipped = question.usersSkipped ?? question.unanswered ?? 0;
    const titleH = hasHindi(title)
      ? (shapeText(title, textW, 10.5, INK, "bold", WHITE)?.h ?? 6)
      : wrap(doc, title, textW, 10.5).length * lineStep(title, 10.5);
    const blockH = titleH + 11;
    y = ensure(doc, y, blockH + 1);

    doc.setFillColor(...NAVY);
    doc.circle(MARGIN + 3.4, y + 3.2, 3.2, "F");
    doc.setFont(UI, "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...WHITE);
    doc.text(String(index + 1), MARGIN + 3.4, y + 4.1, { align: "center" });

    drawMaybeHindi(doc, title, textX, y, textW, 10.5, INK, "bold");

    const barY = y + titleH + 1.8;
    const metaW = 16;
    const barW = textW - metaW - 2;
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(textX, barY, barW, 3.3, 1.4, 1.4, "F");
    if (rate > 0) {
      doc.setFillColor(...NAVY);
      doc.roundedRect(textX, barY, Math.max(3.2, (barW * rate) / 100), 3.3, 1.4, 1.4, "F");
    }
    paint(doc, `${rate}%`, 8.5, NAVY, "bold");
    doc.text(`${rate}%`, pw(doc) - MARGIN, barY + 2.7, { align: "right" });

    const meta = `${typeLabel(question.type)}    ${answered} answered    ${skipped} skipped`;
    paint(doc, meta, 7, MUTED);
    doc.text(meta, textX, barY + 7.2);
    y = barY + 11;
  });

  return y;
}

function buildPdf(data: AnalyticsPdfData, fontB64: string) {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
  }) as PdfDoc;
  registerHiFont(doc, fontB64);

  let y = drawHeader(doc, data);
  y = drawKpis(doc, y, data.kpis ?? []);

  const statusRows = withPieFills(
    statusRowsForPdf(data.surveyStatusBreakdown ?? []),
    "survey"
  );
  const statusTotal =
    statusRows.reduce((sum, row) => sum + sliceCount(row), 0) ||
    Number(data.kpis.find((kpi) => kpi.id === "total_calls")?.value ?? 0);
  const statusSlices: ChartSlice[] = statusRows.map((row) => ({
    name: row.name,
    count: sliceCount(row),
    share: sliceShare(row, statusTotal),
    fill: row.fill,
    hint: STATUS_HINT_SHORT[row.name] || "Survey status",
  }));

  const reasonRows = withPieFills(
    (data.reasonBreakdown ?? []).filter((row) => sliceCount(row) > 0),
    "reason"
  );
  const reasonTotal = reasonRows.reduce((sum, row) => sum + sliceCount(row), 0);
  const reasonSlices: ChartSlice[] = reasonRows.map((row) => ({
    name: row.name,
    count: sliceCount(row),
    share: sliceShare(row, reasonTotal),
    fill: row.fill,
    detail: row.detail,
    hint: REASON_MEANING[row.name] || STATUS_HINT_SHORT[row.name],
  }));

  if (statusSlices.some((slice) => slice.count > 0)) {
    const cardW = uw(doc);
    const cardH = chartCardHeight(
      doc,
      "Finished, partial, no answers, or not picked up",
      statusSlices,
      cardW
    );
    y = ensure(doc, y, Math.min(cardH, bottom(doc) - MARGIN));
    drawChartCard(
      doc,
      MARGIN,
      y,
      cardW,
      cardH,
      "Survey status",
      "Finished, partial, no answers, or not picked up",
      `${statusTotal} total`,
      statusSlices,
      "survey"
    );
    y += cardH + 4;
  }
  y = drawHangupBars(doc, y, reasonSlices, `${reasonTotal} calls`);
  y = drawCauseNotes(doc, y, reasonSlices);

  const questions = [...(data.questions ?? [])].sort(
    (a, b) =>
      (b.usersAnswered ?? b.answered) - (a.usersAnswered ?? a.answered)
  );
  const avgRate = questions.length
    ? Math.round(
        questions.reduce((s, q) => s + (q.answerRate ?? 0), 0) / questions.length
      )
    : 0;
  const answers =
    data.totalAnswers ??
    questions.reduce((s, q) => s + (q.usersAnswered ?? q.answered ?? 0), 0);
  const questionCount = data.totalQuestions ?? questions.length;

  if (questions.length) {
    y = ensure(doc, y, 24);
    y = section(doc, y, "Question analytics");
    doc.setFont(UI, "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(
      `${questionCount} questions  ·  ${avgRate}% avg answer rate  ·  ${answers} answers`,
      MARGIN,
      y
    );
    y += 4;
    y = drawQuestionBars(doc, y, questions);

    questions.forEach((question, index) => {
      y = drawQuestionDetail(
        doc,
        y,
        question,
        index,
        index === 0 ? "Question details" : undefined
      );
    });
  }

  const when = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  y = ensure(doc, y, 6);
  doc.setFont(UI, "normal");
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(`Generated ${when}`, pw(doc) / 2, y, { align: "center" });

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.25);
    doc.line(MARGIN, ph(doc) - 7.5, pw(doc) - MARGIN, ph(doc) - 7.5);
    doc.setFont(UI, "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text("TechCall CRM", MARGIN, ph(doc) - 4);
    doc.text(`Page ${i} of ${pages}`, pw(doc) - MARGIN, ph(doc) - 4, {
      align: "right",
    });
  }

  return doc;
}

function fileSafe(v: string) {
  return v.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").slice(0, 40);
}

export async function exportReportsPdf(data: AnalyticsPdfData) {
  await withGlobalLoader(
    async () => {
      const font = await loadHiFont();
      await prepareHindiFace();
      const doc = buildPdf(data, font);
      const from = data.dateRange.from || "all";
      const to = data.dateRange.to || "time";
      const survey = fileSafe(data.surveyName || data.campaignName || "survey");
      doc.save(`analytics-${survey}-${from}-${to}.pdf`);
    },
    { label: "Exporting", hint: "Preparing your report" }
  );
}
