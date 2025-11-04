export function calculateEMA(data: any, period: any) {
    const k = 2 / (period + 1);
    const emaArray: any = [];
    data.forEach((price: any, index: any) => {
        if (index === 0) emaArray.push(price);
        else emaArray.push(price * k + emaArray[index - 1] * (1 - k));
    });
    return emaArray;
}

export function calculateMACD(candles: any, period: number = 26, periodEMA: number = 12) {
    const closes = candles.map((c: any) => c.close);
    
    const ema12 = calculateEMA(closes, periodEMA);
    const ema26 = calculateEMA(closes, period);

    const macdLine = ema12.map((v: any, i: any) => (ema26[i] !== undefined ? v - ema26[i] : NaN));

    const rawSignal = calculateEMA(macdLine.slice(period - 1), 9);
    const signalLine = Array(period - 1).fill(NaN).concat(rawSignal);

    const histogram = macdLine.map((v: any, i: any) =>
        i < (period - 1) ? NaN : v - signalLine[i]
    );

    const time = candles.map((c: any) => c.time);

    return time.map((t: any, i: any) => ({
        time: t,
        macd: macdLine[i],
        signal: signalLine[i],
        hist: histogram[i],
    }));
}