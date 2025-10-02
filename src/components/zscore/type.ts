import type { IinitialDataCand } from "../../pages/Home/options";

export function rollingZScore(
    data: IinitialDataCand[],
    period: number = 14
): { time: number; value: any }[] {
    const result: { time: number; value: any }[] = [];

    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            result.push({ time: data[i].time, value: NaN });
            continue;
        }

        const window = data.slice(i - period + 1, i + 1).map(d => d.close);
        const mean = window.reduce((a, b) => a + b, 0) / period;
        const variance =
            window.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
        const std = Math.sqrt(variance);

        const value = std === 0 ? 0 : (data[i].close - mean) / std;
        result.push({ time: data[i].time, value });
    }

    return result.sort((a, b) => a.time - b.time);
}
