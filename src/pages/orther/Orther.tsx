// ChartWithATR.tsx
import React, { useEffect, useRef } from "react";
import {
    createChart,
    type IChartApi,
    type ISeriesApi,
    type LineData,
    type UTCTimestamp,
    ColorType,
} from "lightweight-charts";

interface Candle {
    time: number; // timestamp in seconds
    open: number;
    high: number;
    low: number;
    close: number;
}

// --- Dữ liệu mẫu ---
export const sampleCandles: any[] = (() => {
    const candles: Candle[] = [];
    let time = Math.floor(Date.now() / 1000) - 3600 * 24;
    let price = 100;
    for (let i = 0; i < 50; i++) {
        const open = price;
        const close = price + (Math.random() - 0.5) * 2;
        const high = Math.max(open, close) + Math.random();
        const low = Math.min(open, close) - Math.random();
        candles.push({ time, open, high, low, close });
        price = close;
        time += 60 * 60;
    }
    return candles;
})();

// --- Tính ATR ---
export function calculateATR(
    candles: Candle[],
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

export const ChartWithATR = () => {
    const chartCandleRef = useRef<HTMLDivElement>(null);
    const chartAtrRef = useRef<HTMLDivElement>(null);

    const chartCandle = useRef<IChartApi | null>(null);
    const chartAtr = useRef<IChartApi | null>(null);

    useEffect(() => {
        if (!chartCandleRef.current || !chartAtrRef.current) return;

        // Chart nến
        const candleChart = createChart(chartCandleRef.current, {
            width: chartCandleRef.current.clientWidth,
            height: 300,
            layout: { background: { type: ColorType.Solid, color: "white" }, textColor: "#333" },
            timeScale: { timeVisible: true, secondsVisible: false },
        });
        const candleSeries = candleChart.addCandlestickSeries();
        candleSeries.setData(sampleCandles);
        chartCandle.current = candleChart;

        // Chart ATR
        const atrChart = createChart(chartAtrRef.current, {
            width: chartAtrRef.current.clientWidth,
            height: 150,
            layout: { background: { type: ColorType.Solid, color: "white" }, textColor: "#333" },
            timeScale: { timeVisible: true, secondsVisible: false },
        });
        const atrSeries = atrChart.addLineSeries({ color: "orange", lineWidth: 2 });
        console.log(calculateATR(sampleCandles, 14), sampleCandles);
        
        atrSeries.setData(calculateATR(sampleCandles, 14));
        chartAtr.current = atrChart;

        // Đồng bộ timeScale
        candleChart.timeScale().subscribeVisibleTimeRangeChange((range) => {
            if (range) atrChart.timeScale().setVisibleRange(range);
        });
        atrChart.timeScale().subscribeVisibleTimeRangeChange((range) => {
            if (range) candleChart.timeScale().setVisibleRange(range);
        });

        // Resize
        const handleResize = () => {
            const width = chartCandleRef.current?.clientWidth ?? 800;
            candleChart.applyOptions({ width });
            atrChart.applyOptions({ width });
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            candleChart.remove();
            atrChart.remove();
        };
    }, []);

    return (
        <div>
            <div ref={chartCandleRef} style={{ width: "100%", height: 300 }} />
            <div ref={chartAtrRef} style={{ width: "100%", height: 150 }} />
        </div>
    );
};
