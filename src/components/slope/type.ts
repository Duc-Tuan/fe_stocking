import type { IinitialDataCand } from "../../pages/Home/options";

export const linearRegressionSlopePeriod = (data: IinitialDataCand[], period: number = 14): { time: number; value: number | null }[] => {
    const result: { time: number; value: number | null }[] = [];

    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            // chưa đủ nến để tính slope
            result.push({ time: data[i].time, value: NaN } as any);
            continue;
        }

        // lấy ra cửa sổ "period" nến gần nhất
        const window = data.slice(i - period + 1, i + 1);
        const n = window.length;

        // X = 0..n-1, Y = close
        const x = Array.from({ length: n }, (_, j) => j);
        const y = window.map(c => c.close);

        const meanX = x.reduce((a, b) => a + b, 0) / n;
        const meanY = y.reduce((a, b) => a + b, 0) / n;

        let num = 0;
        let den = 0;
        for (let j = 0; j < n; j++) {
            num += (x[j] - meanX) * (y[j] - meanY);
            den += (x[j] - meanX) ** 2;
        }

        result.push({ time: data[i].time, value: den === 0 ? NaN : num / den } as any);
    }

    return result.sort((a, b) => a.time - b.time);
}
