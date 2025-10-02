// utils/calcADR.ts


// Kiểu dữ liệu cho 1 nến
export interface Candle {
    time: number;   // UNIX timestamp (giây)
    open: number;
    high: number;
    low: number;
    close: number;
}

// Kiểu dữ liệu ADR kết quả
export interface ADRPoint {
    time: number;   // UNIX timestamp (giây)
    adr: number | null;
}

export function calcADR(data: Candle[], period: number = 14): ADRPoint[] {
    return data.map((candle, i) => {
        if (i < period - 1) {
            return { time: candle.time, adr: NaN };
        }
        const slice = data.slice(i - period + 1, i + 1);
        const avg =
            slice.reduce((sum, s) => sum + (s.high - s.low), 0) / period;
        return { time: candle.time, adr: avg };
    });
}
