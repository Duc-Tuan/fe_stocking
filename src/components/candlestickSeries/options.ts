import type { BarData, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import { adjustToUTCPlus7 } from "../../pages/Home/options";

export interface IDataSymbols {
    data: any[];
    page: number;
    limit: number;
    total: number;
    is_last_page: boolean;
}

export function normalizeChartData(data: any[], typeTime?: string): BarData[] {
    const result: BarData[] = [];

    for (const d of data) {
        let time = d.time;

        // Nếu là object { year, month, day, hour, ... }
        if (typeof time === 'object' && time !== null && !(time instanceof Date)) {
            const { year, month, day, hour = 0, minute = 0, second = 0 } = time;
            time = new Date(year, month - 1, day, hour, minute, second).getTime();
        }

        // Nếu là Date object
        if (time instanceof Date) {
            time = time.getTime();
        }

        // Bỏ qua nếu time không hợp lệ
        if (typeof time !== 'number' || isNaN(time)) {
            console.warn('❌ Invalid time:', d.time);
            continue;
        }

        if (typeTime === "1W" || typeTime === "MN") {
            time = adjustToUTCPlus7(time)
        }

        result.push({
            time: time as UTCTimestamp,
            open: +d.open,
            high: +d.high,
            low: +d.low,
            close: +d.close,
        });
    }

    return result;
}

export const extendXAxisWithFuture = (series: ISeriesApi<'Candlestick'>, lastTime: number, minutes: number) => {
    for (let i = 1; i <= minutes; i++) {
        const future = lastTime + i * 60; // 60s = 1 phút
        series.update({
            time: future as UTCTimestamp,
            open: NaN,
            high: NaN,
            low: NaN,
            close: NaN,
        });
    }
};

export function floorTimeToResolution(timestamp: number, resolution: string) {
    const date = new Date(timestamp * 1000);
    let floored: number;

    switch (resolution) {
        case "MN":
            // tháng hơi phức tạp → tạm lấy ngày đầu tháng
            const d = new Date(timestamp * 1000);
            const monthStart = new Date(d.getUTCFullYear(), d.getUTCMonth(), 1).getTime() / 1000;
            floored = monthStart;
            break;
        case "W":
            floored = Math.floor(date.getTime() / (3600000 * 24 * 7)) * 3600;
            break;
        case "M1":
            floored = Math.floor(date.getTime() / 60000) * 60; // từng phút
            break;
        case "M5":
            floored = Math.floor(date.getTime() / (60000 * 5)) * (60 * 5);
            break;
        case "M10":
            floored = Math.floor(date.getTime() / (60000 * 10)) * (60 * 5);
            break;
        case "M15":
            floored = Math.floor(date.getTime() / (60000 * 15)) * (60 * 15);
            break;
        case "H1":
            floored = Math.floor(date.getTime() / (3600000)) * 3600;
            break;
        case "H2":
            floored = Math.floor(date.getTime() / (3600000 * 2)) * 3600;
            break;
        case "H4":
            floored = Math.floor(date.getTime() / (3600000 * 4)) * 3600;
            break;
        case "H6":
            floored = Math.floor(date.getTime() / (3600000 * 6)) * 3600;
            break;
        case "H8":
            floored = Math.floor(date.getTime() / (3600000 * 8)) * 3600;
            break;
        case "H12":
            floored = Math.floor(date.getTime() / (3600000 * 12)) * 3600;
            break;
        case "D":
            floored = Math.floor(date.getTime() / (3600000 * 24)) * 3600;
            break;
        default:
            floored = Math.floor(date.getTime() / 60000) * 60; // mặc định M1
    }

    return floored;
}

export function mergeLatestData(
    allData: any[],
    latestData: any[],
    currentRange: string
): any[] {
    if (!latestData || !Array.isArray(latestData) || latestData.length === 0) {
        return allData;
    }

    let updated = [...allData];
    const point = latestData[0]

    const flooredTime = floorTimeToResolution(point.time as number, currentRange);

    const lastCandle = updated[updated.length - 1];

    if (!lastCandle || flooredTime > (lastCandle.time as number)) {
        // 👉 Sang nến mới hoặc dữ liệu rỗng
        updated.unshift({
            time: flooredTime as UTCTimestamp,
            open: point.open,
            high: point.high,
            low: point.low,
            close: point.close,
        });
    } else {
        const idx = updated.length - 1
        updated[idx] = {
            time: updated[idx].time as UTCTimestamp,
            open: updated[idx].open, // open giữ nguyên
            high: Math.max(updated[idx].high, point.high),
            low: Math.min(updated[idx].low, point.low),
            close: point.close, // close = giá mới nhất
        };
    }

    return updated.sort((a: any, b: any) => a.time - b.time);
}

export const calculateBollingerBands = (data: any, period = 20, k = 2) => {
    const bands = [];
    for (let i = period - 1; i < data.length; i++) {
        const slice: any = data.slice(i - period + 1, i + 1).map((d: any) => d.close);

        const mean = slice.reduce((a: any, b: any) => a + b, 0) / period;
        const variance = slice.reduce((a: any, b: any) => a + Math.pow(b - mean, 2), 0) / period;
        const stdDev = Math.sqrt(variance);

        bands.push({
            time: data[i].time,
            ma: mean,
            upper: mean + k * stdDev,
            lower: mean - k * stdDev,
        });
    }
    return bands;
}