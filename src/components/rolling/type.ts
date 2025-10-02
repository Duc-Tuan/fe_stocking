import type { IinitialDataCand } from "../../pages/Home/options";

export function rollingStdDev(
    data: IinitialDataCand[],
    period: number = 14
): { time: number; value: number | null }[] {
    const result: { time: number; value: number | null }[] = [];

    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            result.push({ time: data[i].time, value: NaN });
            continue;
        }

        const window = data.slice(i - period + 1, i + 1).map(d => d.close);
        const mean = window.reduce((a, b) => a + b, 0) / period;
        const variance =
            window.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;

        result.push({ time: data[i].time, value: Math.sqrt(variance) });
    }

    return result.sort((a, b) => a.time - b.time);
}
