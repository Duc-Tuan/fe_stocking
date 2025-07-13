import { type IChartApi, type Time, type UTCTimestamp } from 'lightweight-charts';

export function toTime(unixTimestamp: number): Time {
    return unixTimestamp as Time;
}

export function handleTimeRangeChange(
    chartRef: React.MutableRefObject<IChartApi | null>,
    data: any[],
    seconds: number | null
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

        chartRef.current.timeScale().setVisibleRange({ from: from as UTCTimestamp , to });
    }
}