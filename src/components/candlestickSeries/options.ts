import type { BarData, ISeriesApi, UTCTimestamp } from "lightweight-charts";

export interface IDataSymbols {
    data: any[];
    page: number;
    limit: number;
    total: number;
    next_cursor: string;
    has_more: boolean
}

export function normalizeChartData(data: any[]): BarData[] {
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

        // Convert sang UTCTimestamp (số nguyên giây)
        const unixTime = Math.floor(time / 1000) as UTCTimestamp;

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