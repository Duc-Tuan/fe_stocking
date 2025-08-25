import type { UTCTimestamp } from "lightweight-charts";
import i18 from '../../i18n'
import type { Option } from "../History/type";

export const FIB_TOLERANCE = 5; // px cho phép lệch

export const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618, 2.618, 3.618, 4.236];
export const fibBaseColors = [
    "255, 0, 54",   // đỏ
    "255, 127, 0",   // cam
    "174, 255, 0",   // vàng
    "0, 255, 255",   // xanh ngọc
    "0, 152, 255",   // xanh dương
    "85, 0, 255",  // tím
    "167, 167, 167",  // xám
    "255, 0, 0",      // đỏ extension
    "0, 0, 255",      // xanh extension
    "188, 0, 188",    // tím extension
];

// Hàm lấy biến CSS từ :root (html)
export function getCssVar(varName: any) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
}

// === Hàm format thời gian thành HH:MM:SS MM/DD/YYYY ===
export function formatDateLabel(t: any) {
    let d: Date;
    if (typeof t === "number") {
        d = new Date(t * 1000); // nếu là unix timestamp (s)
    } else if (t instanceof Date) {
        d = t;
    } else {
        d = new Date(t);
    }

    const days = [i18.t("Chủ nhật"), i18.t("Thứ 2"), i18.t("Thứ 3"), i18.t("Thứ 4"), i18.t("Thứ 5"), i18.t("Thứ 6"), i18.t("Thứ 7")];
    const dayName = days[d.getDay()];
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear().toString().slice(-2);

    const pad = (n: number) => n.toString().padStart(2, "0");
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());

    return `${dayName}, ${day} ${i18.t("tháng")} ${month} '${year} ${hh}:${mm}`;
}

export type FibBlock = {
    id: string; // unique id
    anchorA: { time: UTCTimestamp; price: number };
    anchorB: { time: UTCTimestamp; price: number };
    done: boolean;
    moving?: boolean;
    resizing?: "A" | "B" | null;
};

// helper: vẽ text có nền
export function drawLabelWithBackground(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const paddingX = 4;
    const paddingY = 3;
    const textWidth = 52;
    const textHeight = 12;

    ctx.fillStyle = getCssVar("--color-background");
    ctx.fillRect(x - textWidth / 2 - paddingX, y - textHeight / 2 - paddingY, textWidth + paddingX * 2, textHeight + paddingY);

    ctx.fillStyle = "white";
    ctx.fillText(text, x - 3, y);
}

// helper: label thời gian
export function drawTimeLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
    const metrics = ctx.measureText(text);
    const paddingX = 4;
    const paddingY = 6;
    const textWidth = metrics.width + paddingX * 2;
    const textHeight = 20;
    const rectX = x - textWidth / 2;
    const rectY = y;

    ctx.fillStyle = getCssVar("--color-background");
    ctx.fillRect(rectX, rectY, textWidth, textHeight);

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(text, x, rectY + paddingY);
}

export interface Iindicator extends Option<String> {
    active: boolean
}

export const dataIndicator: Iindicator[] = [
    {
        label: "Chỉ báo hội tụ RSI 14",
        value: "rsi",
        active: false
    },
    {
        label: "Khoảng giao động trung bình thực tế ATR 14",
        value: "atr",
        active: false
    }
]

export interface IboundaryLine {
    is80_20: boolean,
    is70_30: boolean,
    is50: boolean
}

export const dataBoundaryLine: IboundaryLine = {
    is50: false,
    is70_30: false,
    is80_20: false
}

export interface Trendline {
    start: { time: number; price: number };
    end: { time: number; price: number };
}

export const isPointNearLine = (x: number, y: number, x1: number, y1: number, x2: number, y2: number, tolerance = 5) => {
    const A = x - x1, B = y - y1, C = x2 - x1, D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;
    let xx, yy;
    if (param < 0) { xx = x1; yy = y1; }
    else if (param > 1) { xx = x2; yy = y2; }
    else { xx = x1 + param * C; yy = y1 + param * D; }
    const dx = x - xx, dy = y - yy;
    return dx * dx + dy * dy <= tolerance * tolerance;
};