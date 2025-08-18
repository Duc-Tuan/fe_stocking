import type { UTCTimestamp } from "lightweight-charts";
import i18 from '../../i18n'

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