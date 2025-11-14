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
            label: "Chỉ báo bollinger band 1",
            value: "bb",
            active: false,
            k: 2,
            period: data.periodBB,
            titleSub: "bollinger band"
        },
        {
            label: "Chỉ báo bollinger band 2",
            value: "bb1",
            active: false,
            k: 3,
            period: data.periodBB1,
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

export const indicationBB = (chart: any, maLine: any, upperLine: any, lowerLine: any, color: string) => {
    const option = {
        crosshairMarkerVisible: false,
        lastValueVisible: false,
        priceLineVisible: false,
    };

    maLine.current = chart.addLineSeries({
        color: color,
        lineWidth: 1,
        ...option,
    });
    upperLine.current = chart.addLineSeries({
        color: color,
        lineWidth: 1,
        ...option,
    });
    lowerLine.current = chart.addLineSeries({
        color: color,
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
    periodBB1: number;
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
    periodBB1: 20,
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