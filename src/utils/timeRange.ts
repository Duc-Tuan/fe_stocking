import { type IChartApi, type Time, type UTCTimestamp } from 'lightweight-charts';
import { normalizeChartData } from '../components/candlestickSeries/options';

export function toTime(unixTimestamp: number): Time {
    return unixTimestamp as Time;
}

export function aggregateCandlesByInterval(dataOld: any[], intervalSeconds: any = 60): any[] {
    if (!dataOld || !dataOld.length) return [];

    const grouped: Record<number, any[]> = {};

    const data: any[] = normalizeChartData(dataOld).sort((a: any, b: any) => a.time - b.time);

    for (const d of data) {
        // Gom nến theo mốc thời gian: 10h00, 11h00, ...
        const bucket = (Math.floor(d.time / intervalSeconds) * intervalSeconds);
        if (!grouped[bucket]) grouped[bucket] = [];
        grouped[bucket].push(d);
    }

    const result: any[] = [];

    for (const bucket in grouped) {
        const candles = grouped[bucket];
        const open = candles[0].open;
        const close = candles[candles.length - 1].close;
        const high = Math.max(...candles.map(c => c.high));
        const low = Math.min(...candles.map(c => c.low));
        const time = Number(bucket) as UTCTimestamp;

        result.push({ time, open, high, low, close });
    }

    return result.sort((a, b) => a.time - b.time);
}

export function handleTimeRangeChange(
    chartRef: React.MutableRefObject<IChartApi | null>,
    data: any[],
    seconds: number | null,
    typeChar?: string
) {
    if (!chartRef.current || !data.length) return;

    const sorted = [...data]
        .map(d => ({
            ...d,
            time: d.time, // cần đảm bảo time là UNIX timestamp (giây, không phải mili giây)
        }))
        .sort((a, b) => a.time - b.time);

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (!first || !last) return;

    if (seconds === null) {
        // ✅ Hiển thị toàn bộ
        chartRef.current.timeScale().setVisibleRange({
            from: first.time,
            to: last.time,
        });
    } else {
        // ✅ Hiển thị phần dữ liệu trong khoảng `seconds` cuối cùng
        const to = last.time;
        const from = Math.max(first.time, to - seconds);
        if (typeChar) {
            chartRef.current.timeScale().setVisibleRange({ from: from as UTCTimestamp, to });
        }
    }


}