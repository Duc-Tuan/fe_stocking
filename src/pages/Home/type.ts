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
    const textWidth = 50;
    const textHeight = 12;

    ctx.fillStyle = getCssVar("--color-background");
    ctx.fillRect(x - textWidth / 2 - paddingX, y - textHeight / 2 - paddingY, textWidth + paddingX * 2, textHeight + paddingY);

    ctx.fillStyle = "white";
    ctx.fillText(text, x, y);
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

export function findStrokeAt(
    strokes: { time: number; price: number }[][],
    x: number,
    y: number,
    chartRef: any,
    candleSeriesRef: any
): number | null {
    const tolerance = 5;

    for (let i = 0; i < strokes.length; i++) {
        const stroke = strokes[i];

        for (let j = 0; j < stroke.length; j++) {
            const t = stroke[j].time;
            if (t == null) continue; // bỏ qua nếu time chưa có

            const xx = chartRef.current.timeScale().timeToCoordinate(t);
            const yy = candleSeriesRef.current.priceToCoordinate(stroke[j].price);

            if (xx != null && yy != null) {
                if (Math.hypot(xx - x, yy - y) < tolerance) {
                    return i;
                }
            }
        }
    }
    return null;
}


export function drawSmoothLine(ctx: CanvasRenderingContext2D, points: { x: number, y: number }[]) {
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
        const midX = (points[i].x + points[i + 1].x) / 2;
        const midY = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }
    ctx.stroke();
}

export function redraw(
    canvasRef: any,
    allStrokes: { time: number; price: number; x?: number; y?: number }[][],
    chartRef: any,
    candleSeriesRef: any,
    isDrawingBrush: boolean
) {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "blue";
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    allStrokes.forEach((stroke) => {
        const pixelPoints = stroke.map(p => {
            if (p.time) {
                // chỉ skip point null, KHÔNG reset segment
                const x = chartRef.current?.timeScale().timeToCoordinate(p.time);
                const y = candleSeriesRef.current?.priceToCoordinate(p?.price);
                return (x != null && y != null) ? { x, y } : null;
            }
        }).filter(Boolean) as { x: number; y: number }[];


        drawSmoothLine(ctx, pixelPoints);

        if (pixelPoints.length > 1 && isDrawingBrush) {
            ctx.beginPath();
            ctx.arc(pixelPoints[0].x, pixelPoints[0].y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "white";
            ctx.fill();
            ctx.strokeStyle = getCssVar("--color-background-atr");
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(pixelPoints[pixelPoints.length - 1].x, pixelPoints[pixelPoints.length - 1].y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
    });
}
