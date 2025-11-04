import type { UTCTimestamp } from "lightweight-charts";

export const calculateSMA = (data: any[], period: number = 14) => {
    if (data.length < period) return [];

    const sma: { time: number; value: number }[] = [];

    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            sma.push({ time: data[i].time as UTCTimestamp, value: NaN });
            continue;
        }

        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
        }
        const value = sum / period;
        sma.push({ time: data[i].time as UTCTimestamp, value });
    }

    return sma;
};

export const calculateEMA = (data: any[], period: number = 14) => {
    if (data.length < period) return [];

    const k = 2 / (period + 1);
    const ema: { time: number; value: number }[] = [];

    // Tính SMA đầu tiên để khởi tạo EMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += data[i].close;
        ema.push({ time: data[i].time, value: NaN });
    }
    let prevEma = sum / period;
    ema[period - 1] = { time: data[period - 1].time, value: prevEma };

    // EMA cho các nến sau
    for (let i = period; i < data.length; i++) {
        const value = data[i].close * k + prevEma * (1 - k);
        ema.push({ time: data[i].time, value });
        prevEma = value;
    }

    return ema;
};

export const calculateWMA = (data: any[], period: number = 14) => {
    if (data.length < period) return [];

    const wma: { time: number; value: number }[] = [];
    const denominator = (period * (period + 1)) / 2; // tổng trọng số

    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            wma.push({ time: data[i].time, value: NaN });
            continue;
        }

        let numerator = 0;
        for (let j = 0; j < period; j++) {
            numerator += data[i - j].close * (period - j);
        }

        const value = numerator / denominator;
        wma.push({ time: data[i].time, value });
    }

    return wma;
};

export const calculateRMA = (data: any[], period: number = 14) => {
    if (data.length < period) return [];

    const rma: { time: number; value: number }[] = [];

    // Bước 1: khởi tạo bằng SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += data[i].close;
        rma.push({ time: data[i].time, value: NaN });
    }
    let prevRma = sum / period;
    rma[period - 1] = { time: data[period - 1].time, value: prevRma };

    // Bước 2: dùng công thức RMA
    for (let i = period; i < data.length; i++) {
        const current = data[i].close;
        const value = (prevRma * (period - 1) + current) / period;
        rma.push({ time: data[i].time, value });
        prevRma = value;
    }

    return rma;
};

export function calculateADX(candles: any, period: number = 14) {
    if (!candles || candles.length < period + 1) return { plusDI: [], minusDI: [], adx: [] };

    const tr = [];
    const plusDM = [];
    const minusDM = [];

    for (let i = 0; i < candles.length; i++) {
        if (i === 0) {
            tr.push(0);
            plusDM.push(0);
            minusDM.push(0);
            continue;
        }

        const high = candles[i].high;
        const low = candles[i].low;
        const prevHigh = candles[i - 1].high;
        const prevLow = candles[i - 1].low;
        const prevClose = candles[i - 1].close;

        // True Range
        const currentTR = Math.max(
            high - low,
            Math.abs(high - prevClose),
            Math.abs(low - prevClose)
        );
        tr.push(currentTR);

        // Directional Movement
        const upMove = high - prevHigh;
        const downMove = prevLow - low;

        plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
        minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
    }

    // Wilders smoothing (RMA)
    const smTR: any = [];
    const smPlusDM: any = [];
    const smMinusDM: any = [];

    for (let i = 0; i < tr.length; i++) {
        if (i === 0) {
            smTR.push(tr[0]);
            smPlusDM.push(plusDM[0]);
            smMinusDM.push(minusDM[0]);
        } else if (i < period) {
            smTR.push(smTR[i - 1] + tr[i]);
            smPlusDM.push(smPlusDM[i - 1] + plusDM[i]);
            smMinusDM.push(smMinusDM[i - 1] + minusDM[i]);
        } else {
            smTR.push(smTR[i - 1] - smTR[i - 1] / period + tr[i]);
            smPlusDM.push(smPlusDM[i - 1] - smPlusDM[i - 1] / period + plusDM[i]);
            smMinusDM.push(smMinusDM[i - 1] - smMinusDM[i - 1] / period + minusDM[i]);
        }
    }

    // Calculate DI
    const plusDI = smTR.map((v: any, i: any) => (v === 0 ? 0 : (smPlusDM[i] / v) * 100));
    const minusDI = smTR.map((v: any, i: any) => (v === 0 ? 0 : (smMinusDM[i] / v) * 100));

    // DX
    const dx = plusDI.map((_iv: any, i: any) =>
        plusDI[i] + minusDI[i] === 0 ? 0 : (Math.abs(plusDI[i] - minusDI[i]) / (plusDI[i] + minusDI[i])) * 100
    );

    // ADX = RMA(DX)
    const adx: any = [];
    for (let i = 0; i < dx.length; i++) {
        if (i === 0) adx.push(dx[0]);
        else if (i < period) adx.push((adx[i - 1] * (i - 1) + dx[i]) / i);
        else adx.push((adx[i - 1] * (period - 1) + dx[i]) / period);
    }

    // Return {time, value} arrays
    const plusDIChart = candles.map((c: any, i: any) => ({ time: c.time, value: plusDI[i] }));
    const minusDIChart = candles.map((c: any, i: any) => ({ time: c.time, value: minusDI[i] }));
    const adxChart = candles.map((c: any, i: any) => ({ time: c.time, value: adx[i] }));

    return { plusDI: plusDIChart, minusDI: minusDIChart, adx: adxChart };
}
