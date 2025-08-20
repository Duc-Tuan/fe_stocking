import type { IinitialDataCand } from "../../pages/Home/options";

export function calculateRSI(data: IinitialDataCand[], period = 14) {
    if (!data || data.length <= period) return [];

    let rsi: { time: number; value: number }[] = [];
    let gains: number[] = [];
    let losses: number[] = [];

    // Bước 1: tính change, gain, loss
    for (let i = 1; i < data.length; i++) {
        const change = data[i].close - data[i - 1].close;
        gains.push(Math.max(change, 0));
        losses.push(Math.max(-change, 0));
    }

    // Pad trước bằng null cho 14 cây đầu tiên
    for (let i = 0; i < period; i++) {
        rsi.push({ time: data[i].time, value: i });
    }

    // Bước 2: SMA lần đầu
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    // RSI đầu tiên tại nến thứ `period`
    let rs = avgLoss === 0 ? Number.POSITIVE_INFINITY : avgGain / avgLoss;
    rsi.push({
        time: data[period].time,
        value: avgLoss === 0 ? 100 : 100 - 100 / (1 + rs),
    });

    // Bước 3: Wilder’s smoothing
    for (let i = period + 1; i < data.length; i++) {
        const change = data[i].close - data[i - 1].close;
        const gain = Math.max(change, 0);
        const loss = Math.max(-change, 0);

        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;

        rs = avgLoss === 0 ? Number.POSITIVE_INFINITY : avgGain / avgLoss;
        const rsiValue = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);

        rsi.push({ time: data[i].time, value: rsiValue });
    }

    return rsi;
}

