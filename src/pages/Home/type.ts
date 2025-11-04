import type { UTCTimestamp } from "lightweight-charts";
import i18 from '../../i18n';
import type { Option } from "../History/type";
import { adjustToUTCPlus7, type IinitialDataCand } from "./options";

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
    const textWidth = 70;
    const textHeight = 12;

    ctx.fillStyle = getCssVar("--color-background");
    ctx.fillRect(x - textWidth / 2 , y - textHeight / 2 - paddingY, textWidth + paddingX * 2, textHeight + paddingY);

    ctx.fillStyle = "white";
    ctx.fillText(text, x - 14, y);
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

export interface Iindicator extends Option<string> {
    active: boolean
    period: number
    titleSub: string
    k: number
}

export const dataIndicator: (data: IDataPeriod) => Iindicator[] = (data: IDataPeriod) => {
    return [
        {
            label: "Chỉ báo hội tụ RSI",
            value: "rsi",
            active: false,
            k: 2,
            period: data.periodRSI,
            titleSub: "rsi"
        },
        {
            label: "Khoảng giao động trung bình thực tế ATR",
            value: "atr",
            active: false,
            k: 2,
            period: data.periodATR,
            titleSub: "atr"
        },
        {
            label: "Phạm vi dao động trung bình ADR",
            value: "adr",
            active: false,
            k: 2,
            period: data.periodADR,
            titleSub: "adr"
        },
        {
            label: "Chỉ báo đo sức mạnh trend ADX",
            value: "adx",
            active: false,
            k: 1.5,
            period: data.periodADX,
            titleSub: "Sức mạnh trend"
        },
        {
            label: "Đường trung bình hội tụ – phân kỳ",
            value: "macd",
            active: false,
            k: 1.5,
            period: data.periodMACD,
            titleSub: "macd"
        },
        {
            label: "Tốc độ thay đổi ROC",
            value: "roc",
            active: false,
            k: 2,
            period: data.periodROC,
            titleSub: "roc"
        },
        {
            label: "Độ dốc hồi quy tuyển tính SLOPE",
            value: "slope",
            active: false,
            k: 2,
            period: data.periodSLOPE,
            titleSub: "slope"
        },
        {
            label: "Độ lệch chuẩn cuôn ROLIING",
            value: "rolling",
            active: false,
            k: 2,
            period: data.periodROLLING,
            titleSub: "rolling"
        },
        {
            label: "Điểm chuẩn hóa Z-SCORE",
            value: "zscore",
            active: false,
            k: 2,
            period: data.periodZSCORE,
            titleSub: "z-score"
        }
    ]
}

export const dataIndicatorChart: (data: IDataPeriod) => Iindicator[] = (data: IDataPeriod) => {
    return [
        {
            label: "Chỉ báo bollinger band",
            value: "bb",
            active: false,
            k: 2,
            period: data.periodBB,
            titleSub: "bollinger band"
        },
        {
            label: "Trung bình động đơn giản SMA",
            value: "sma",
            active: false,
            k: 2,
            period: data.periodSMA,
            titleSub: "sma"
        },
        {
            label: "Trung bình động hàm mũ EMA",
            value: "ema",
            active: false,
            k: 2,
            period: data.periodEMA,
            titleSub: "ema"
        },
        {
            label: "Trung bình động có trọng số WMA",
            value: "wma",
            active: false,
            k: 2,
            period: data.periodWMA,
            titleSub: "wma"
        },
        {
            label: "Đường trung bình động của Wilder RMA",
            value: "rma",
            active: false,
            k: 2,
            period: data.periodRMA,
            titleSub: "rma"
        },
        {
            label: "Khối lượng giao dịch theo giá",
            value: "volume",
            active: false,
            k: 2,
            period: data.periodRMA,
            titleSub: "volume profit"
        }
    ]
}

export interface IboundaryLine {
    is80_20: boolean,
    is70_30: boolean,
    is50: boolean
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

export const dataChart = [
    { time: 1758340680, open: 0.08, high: 0.15, low: -0.17, close: -0.01 },
    { time: 1758340620, open: -0.16, high: 0.14, low: -0.24, close: 0.07 },
    { time: 1758340560, open: 0, high: 0.19, low: -0.2, close: -0.19 },
    { time: 1758340500, open: -0.09, high: 0.15, low: -0.19, close: 0.07 },
    { time: 1758340440, open: -0.3, high: 0.07, low: -0.37, close: -0.06 },
    { time: 1758340380, open: -0.38, high: -0.03, low: -0.5, close: -0.33 },
    { time: 1758340320, open: -0.16, high: -0.16, low: -0.5, close: -0.38 },
    { time: 1758340260, open: -0.21, high: 0.03, low: -0.25, close: -0.18 },
    { time: 1758340200, open: 0.01, high: 0.05, low: -0.26, close: -0.21 },
    { time: 1758340140, open: -0.17, high: 0.02, low: -0.29, close: 0.02 },
    { time: 1758340080, open: -0.03, high: -0.03, low: -0.27, close: -0.18 },
    { time: 1758340020, open: -0.4, high: 0.02, low: -0.4, close: -0.04 },
    { time: 1758339960, open: -0.67, high: -0.5, low: -0.82, close: -0.5 },
    { time: 1758339900, open: -0.51, high: -0.5, low: -0.7, close: -0.67 },
    { time: 1758339840, open: -0.24, high: -0.19, low: -0.53, close: -0.49 },
    { time: 1758339780, open: -0.2, high: -0.11, low: -0.22, close: -0.21 },
    { time: 1758339720, open: -0.26, high: -0.15, low: -0.33, close: -0.2 },
    { time: 1758339660, open: -0.33, high: -0.21, low: -0.43, close: -0.26 },
    { time: 1758339600, open: -0.39, high: -0.27, low: -0.45, close: -0.32 },
    { time: 1758339540, open: -0.17, high: -0.17, low: -0.44, close: -0.39 },
    { time: 1758339480, open: -0.04, high: 0.06, low: -0.18, close: -0.17 },
    { time: 1758339420, open: 0, high: 0.1, low: -0.1, close: -0.04 },
    { time: 1758339360, open: 0.1, high: 0.14, low: -0.02, close: 0 },
    { time: 1758339300, open: -0.08, high: 0.15, low: -0.1, close: 0.08 },
    { time: 1758339240, open: -0.49, high: -0.04, low: -0.49, close: -0.08 },
    { time: 1758339180, open: -0.59, high: -0.39, low: -0.59, close: -0.5 },
    { time: 1758339120, open: -0.45, high: -0.35, low: -0.7, close: -0.59 },
    { time: 1758339060, open: -0.16, high: -0.07, low: -0.46, close: -0.45 },
    { time: 1758339000, open: -0.29, high: -0.16, low: -0.39, close: -0.16 },
    { time: 1758338940, open: -0.3, high: -0.16, low: -0.36, close: -0.34 },
    { time: 1758338880, open: -0.27, high: -0.25, low: -0.39, close: -0.27 },
    { time: 1758338820, open: -0.13, high: -0.09, low: -0.32, close: -0.27 },
    { time: 1758338760, open: -0.11, high: -0.1, low: -0.21, close: -0.13 },
    { time: 1758338700, open: -0.07, high: -0.05, low: -0.1, close: -0.1 },
    { time: 1758338640, open: 0.08, high: 0.13, low: -0.09, close: -0.09 },
    { time: 1758338580, open: 0.09, high: 0.12, low: 0.06, close: 0.08 },
    { time: 1758338520, open: -0.16, high: 0.2, low: -0.18, close: 0.1 },
    { time: 1758338460, open: -0.29, high: -0.15, low: -0.29, close: -0.15 },
    { time: 1758338400, open: -0.14, high: -0.11, low: -0.3, close: -0.29 },
    { time: 1758338340, open: -0.32, high: -0.14, low: -0.36, close: -0.14 },
    { time: 1758338280, open: -0.44, high: -0.32, low: -0.46, close: -0.32 },
    { time: 1758338220, open: -0.08, high: -0.07, low: -0.44, close: -0.44 },
    { time: 1758338160, open: -0.15, high: -0.03, low: -0.15, close: -0.08 },
    { time: 1758338100, open: 0.17, high: 0.19, low: -0.17, close: -0.16 },
    { time: 1758338040, open: 0.38, high: 0.38, low: 0.11, close: 0.17 },
    { time: 1758337980, open: 0.58, high: 0.59, low: 0.38, close: 0.38 },
    { time: 1758337920, open: 0.54, high: 0.59, low: 0.52, close: 0.58 },
    { time: 1758337860, open: 0.71, high: 0.73, low: 0.53, close: 0.53 },
    { time: 1758337800, open: 0.7, high: 0.73, low: 0.69, close: 0.71 },
    { time: 1758337740, open: 0.72, high: 0.75, low: 0.64, close: 0.7 },
    { time: 1758337680, open: 0.79, high: 0.79, low: 0.69, close: 0.72 },
    { time: 1758337620, open: 0.81, high: 0.84, low: 0.72, close: 0.79 },
    { time: 1758337560, open: 0.67, high: 0.87, low: 0.67, close: 0.83 },
    { time: 1758337500, open: 0.93, high: 0.97, low: 0.66, close: 0.66 },
    { time: 1758337440, open: 0.9, high: 0.93, low: 0.81, close: 0.93 },
    { time: 1758337380, open: 0.79, high: 0.96, low: 0.79, close: 0.9 },
    { time: 1758337320, open: 1.21, high: 1.21, low: 0.68, close: 0.78 },
    { time: 1758337260, open: 1.37, high: 1.38, low: 1.17, close: 1.22 },
    { time: 1758337200, open: 1.02, high: 1.35, low: 0.89, close: 1.34 },
    { time: 1758337140, open: 1.19, high: 1.19, low: 0.88, close: 1.02 },
    { time: 1758337080, open: 0.73, high: 1.22, low: 0.73, close: 1.22 },
    { time: 1758337020, open: 0.61, high: 0.86, low: 0.54, close: 0.73 },
    { time: 1758336960, open: 0.57, high: 0.67, low: 0.43, close: 0.6 },
    { time: 1758336900, open: 0.53, high: 0.67, low: 0.41, close: 0.58 },
    { time: 1758336840, open: 0.59, high: 0.7, low: 0.5, close: 0.54 },
    { time: 1758336780, open: 0.62, high: 0.67, low: 0.52, close: 0.59 },
    { time: 1758336720, open: 0.73, high: 0.78, low: 0.59, close: 0.62 },
    { time: 1758336660, open: 0.76, high: 0.81, low: 0.72, close: 0.73 },
    { time: 1758336600, open: 1, high: 1, low: 0.72, close: 0.76 },
    { time: 1758336540, open: 1.07, high: 1.07, low: 0.96, close: 0.96 },
    { time: 1758336480, open: 0.93, high: 1.07, low: 0.9, close: 1.07 },
    { time: 1758336420, open: 1.33, high: 1.42, low: 0.93, close: 0.95 },
    { time: 1758336360, open: 1.26, high: 1.37, low: 1.26, close: 1.32 },
    { time: 1758336300, open: 1.27, high: 1.33, low: 1.23, close: 1.26 },
    { time: 1758336240, open: 1.17, high: 1.33, low: 1.16, close: 1.27 },
    { time: 1758336180, open: 1.4, high: 1.44, low: 1.16, close: 1.17 },
    { time: 1758336120, open: 1.43, high: 1.43, low: 1.25, close: 1.4 },
    { time: 1758336060, open: 1.5, high: 1.5, low: 1.37, close: 1.42 },
    { time: 1758336000, open: 1.36, high: 1.5, low: 1.34, close: 1.5 },
    { time: 1758335940, open: 1.32, high: 1.4, low: 1.32, close: 1.36 },
    { time: 1758335880, open: 1.35, high: 1.48, low: 1.32, close: 1.33 },
    { time: 1758335820, open: 1.31, high: 1.38, low: 1.29, close: 1.35 },
    { time: 1758335760, open: 1.35, high: 1.37, low: 1.23, close: 1.3 },
    { time: 1758335700, open: 1.39, high: 1.39, low: 1.31, close: 1.35 },
    { time: 1758335640, open: 1.36, high: 1.42, low: 1.34, close: 1.39 },
    { time: 1758335580, open: 1.29, high: 1.43, low: 1.29, close: 1.38 },
    { time: 1758335520, open: 1.29, high: 1.41, low: 1.26, close: 1.31 },
    { time: 1758335460, open: 1.42, high: 1.5, low: 1.27, close: 1.32 },
    { time: 1758335400, open: 1.36, high: 1.49, low: 1.35, close: 1.42 },
    { time: 1758335340, open: 1.42, high: 1.45, low: 1.35, close: 1.36 },
    { time: 1758335280, open: 1.35, high: 1.51, low: 1.35, close: 1.42 },
    { time: 1758335220, open: 1.33, high: 1.39, low: 1.27, close: 1.35 },
    { time: 1758335160, open: 1.34, high: 1.34, low: 1.3, close: 1.33 },
    { time: 1758335100, open: 1.27, high: 1.34, low: 1.23, close: 1.34 },
    { time: 1758335040, open: 1.28, high: 1.35, low: 1.22, close: 1.24 },
    { time: 1758334980, open: 1.33, high: 1.42, low: 1.29, close: 1.29 },
    { time: 1758334920, open: 1.26, high: 1.33, low: 1.2, close: 1.32 },
    { time: 1758334860, open: 1.12, high: 1.26, low: 1.12, close: 1.26 },
    { time: 1758334800, open: 1.1, high: 1.13, low: 1.07, close: 1.12 },
    { time: 1758334740, open: 1.13, high: 1.2, low: 1.1, close: 1.1 }
];

export const indicationBB = (chart: any, maLine: any, upperLine: any, lowerLine: any) => {
    const option = {
        crosshairMarkerVisible: false,
        lastValueVisible: false,
        priceLineVisible: false,
    };

    maLine.current = chart.addLineSeries({
        color: 'blue',
        lineWidth: 1,
        ...option,
    });
    upperLine.current = chart.addLineSeries({
        color: 'red',
        lineWidth: 1,
        ...option,
    });
    lowerLine.current = chart.addLineSeries({
        color: 'green',
        lineWidth: 1,
        ...option,
    });
}

export const handleRightClickBB = (e: MouseEvent, chart: any, setMenu: any, chartContainerRef: any, maLine: any, upperLine: any, lowerLine: any, data: {
    time: any;
    ma: number;
    upper: number;
    lower: number;
}[]) => {
    e.preventDefault(); // chặn context menu mặc định
    if (!maLine.current || !upperLine.current || !lowerLine.current) return;

    // Lấy tọa độ pixel trong container
    const bounding = chartContainerRef.current.getBoundingClientRect();
    const x = e.clientX - bounding.left;
    const y = e.clientY - bounding.top;

    const ma = data.map((p) => ({ time: p.time, value: p.ma }));
    const up = data.map((p) => ({ time: p.time, value: p.upper }));
    const low = data.map((p) => ({ time: p.time, value: p.lower }));

    // Convert pixel -> time, price
    const time = chart.timeScale().coordinateToTime(x);
    const price = maLine.current.coordinateToPrice(y);

    if (!time || !price) return;

    // Tìm giá trị line gần nhất tại time
    const tolerance = 0.1;
    const maValue = ma.find((d) => d.time === time)?.value;
    const upperValue = up.find((d) => d.time === time)?.value;
    const lowerValue = low.find((d) => d.time === time)?.value;

    if (
        (maValue && Math.abs(maValue - price) < tolerance) ||
        (upperValue && Math.abs(upperValue - price) < tolerance) ||
        (lowerValue && Math.abs(lowerValue - price) < tolerance)
    ) {
        setMenu({ x: e.clientX, y: e.clientY });
    }
};

export interface IDataRealTime {
    current_price: number;
    profit: number;
    symbol: string;
    type: "BUY" | "SELL";
}

export interface IDataPeriod {
    periodRSI: number;
    periodATR: number;
    periodADR: number;
    periodROC: number;
    periodSLOPE: number;
    periodROLLING: number;
    periodZSCORE: number;
    periodBB: number;
    periodSMA: number;
    periodEMA: number;
    periodWMA: number;
    periodRMA: number;
    periodADX: number;
    periodMACD: number;
}

export const dataPeriodDefault: IDataPeriod = {
    periodRSI: 14,
    periodATR: 14,
    periodADR: 14,
    periodROC: 12,
    periodSLOPE: 12,
    periodROLLING: 20,
    periodZSCORE: 12,
    periodBB: 20,
    periodSMA: 14,
    periodEMA: 14,
    periodWMA: 14,
    periodRMA: 14,
    periodADX: 14,
    periodMACD: 25,
}

export interface IdataCurrentIndication {
    bb: {
        isOpen: boolean,
        period: number,
        k: number,
    },
    sma: {
        isOpen: boolean,
        period: number,
        k: number,
    },
    ema: {
        isOpen: boolean,
        period: number,
        k: number,
    },
    wma: {
        isOpen: boolean,
        period: number,
        k: number,
    },
    rma: {
        isOpen: boolean,
        period: number,
        k: number,
    },
}

export const dataCurrentIndication: IdataCurrentIndication = {
    bb: {
        isOpen: false,
        period: 20,
        k: 2,
    },
    sma: {
        isOpen: false,
        period: 14,
        k: 2,
    },
    ema: {
        isOpen: false,
        period: 14,
        k: 2,
    },
    wma: {
        isOpen: false,
        period: 14,
        k: 2,
    },
    rma: {
        isOpen: false,
        period: 14,
        k: 2,
    },
}



export type TF = 'M1' | 'M5' | 'M10' | 'M15' | 'M30' | 'H1' | 'H2' | 'H4' | 'W' | 'MN';

interface Item {
  id: number;
  time: string;       // ISO string
  total_pnl: number;
}

// Hàm tính interval (ms) theo TF
const tfToMs = (tf: TF): number => {
  switch (tf) {
    case 'M1': return 60 * 1000;
    case 'M5': return 5 * 60 * 1000;
    case 'M10': return 10 * 60 * 1000;
    case 'M15': return 15 * 60 * 1000;
    case 'M30': return 30 * 60 * 1000;
    case 'H1': return 60 * 60 * 1000;
    case 'H2': return 2 * 60 * 60 * 1000;
    case 'H4': return 4 * 60 * 60 * 1000;
    case 'W': return 7 * 24 * 60 * 60 * 1000;
    case 'MN': return 30 * 24 * 60 * 60 * 1000; // tạm coi 30 ngày
    default: return 60 * 1000;
  }
};

// Gom dữ liệu
export function groupToCandles(data: Item[], tf: TF): IinitialDataCand[] {
  const interval = tfToMs(tf);

  // sort theo time
  const sorted = [...data].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const buckets: Record<string, Item[]> = {};

  for (const d of sorted) {
    const ts = new Date(d.time).getTime();
    const bucket = Math.floor(ts / interval) * interval; // thời gian bắt đầu group
    const bucketKey = new Date(bucket).toISOString();

    if (!buckets[bucketKey]) buckets[bucketKey] = [];
    buckets[bucketKey].push(d);
  }

  const candles: IinitialDataCand[] = Object.entries(buckets).map(([time, items]) => {
    const open = items[0].total_pnl;
    const close = items[items.length - 1].total_pnl;
    const high = Math.max(...items.map(i => i.total_pnl));
    const low = Math.min(...items.map(i => i.total_pnl));
    const P = (low + high + close) / 3;
    const t = adjustToUTCPlus7(Math.floor((new Date(time)).getTime() / 1000))
    return { time: t, open, high, low, close, P };
  });

  return candles;
}

export const colorLineCompare: string[] = ["#4FC3F7", "#FF6F61", "#2ECC71", "#8E44AD", "#F1C40F", "#2C3E50","#ECF0F1", "#E67E22", "#C0392B", "#1ABC9C"]