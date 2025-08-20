import type { LineData, UTCTimestamp } from "lightweight-charts";

export function calculateATR(
    candles: any[],
    period: number = 14
): (LineData | { time: UTCTimestamp; value: number })[] {
    if (candles.length < period + 1) return [];

    const atrArray: (LineData | { time: UTCTimestamp; value: number })[] = [];
    const trArray: number[] = [];

    for (let i = 1; i < candles.length; i++) {
        const curr = candles[i];
        const prev = candles[i - 1];
        const tr = Math.max(
            curr.high - curr.low,
            Math.abs(curr.high - prev.close),
            Math.abs(curr.low - prev.close)
        );
        trArray.push(tr);
    }

    // pad NaN cho 14 cây đầu
    for (let i = 0; i < period; i++) {
        atrArray.push({ time: candles[i].time as UTCTimestamp, value: NaN });
    }

    let atr = trArray.slice(0, period).reduce((a, b) => a + b, 0) / period;
    atrArray.push({ time: candles[period].time as UTCTimestamp, value: atr });

    for (let i = period; i < trArray.length; i++) {
        atr = (atr * (period - 1) + trArray[i]) / period;
        atrArray.push({ time: candles[i + 1].time as UTCTimestamp, value: atr });
    }
    return atrArray;
}