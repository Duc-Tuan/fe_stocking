import React, { useEffect, useRef } from "react";
import {
    createChart,
    ColorType,
    type IChartApi,
    type UTCTimestamp,
} from "lightweight-charts";

// === RSI function ===
function calculateRSI(data: any[], period = 14) {
    if (!data || data.length === 0) return [];
    let gains: number[] = [];
    let losses: number[] = [];
    let rsi: any[] = [];

    for (let i = 1; i < data.length; i++) {
        const change = data[i].close - data[i - 1].close;
        gains.push(change > 0 ? change : 0);
        losses.push(change < 0 ? -change : 0);

        const avgGain =
            gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
        const avgLoss =
            losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const rsiValue = 100 - 100 / (1 + rs);

        rsi.push({ time: data[i].time, value: rsiValue });
    }
    return rsi;
}

// === Fake data (5 phút 1 nến) ===
const candleData = Array.from({ length: 100 }, (_, i) => {
    const base = 1.35 + i * 0.0005;
    return {
        time: (1723708800 + i * 300) as UTCTimestamp,
        open: base,
        high: base + 0.002,
        low: base - 0.002,
        close: base + (Math.random() - 0.5) * 0.004,
    };
});

const ChartWithRSIPane = () => {
    const candleChartRef = useRef<HTMLDivElement>(null);
    const rsiChartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!candleChartRef.current || !rsiChartRef.current) return;

        // === Chart chính: Candle + Volume ===
        const candleChart: IChartApi = createChart(candleChartRef.current, {
            height: 400,
            layout: {
                background: { type: ColorType.Solid, color: "white" },
                textColor: "black",
            },
            rightPriceScale: { borderColor: "#00000030" },
            timeScale: {
                borderColor: "#00000030",
                timeVisible: true,
                secondsVisible: true,
            },
        });

        const candleSeries = candleChart.addCandlestickSeries({
            upColor: "#4bffb5",
            borderUpColor: "#4bffb5",
            wickUpColor: "#4bffb5",
            downColor: "#ff4976",
            borderDownColor: "#ff4976",
            wickDownColor: "#ff4976",
        });
        candleSeries.setData(candleData);

        // === Chart RSI ===
        const rsiChart: IChartApi = createChart(rsiChartRef.current, {
            height: 200,
            layout: {
                background: { type: ColorType.Solid, color: "white" },
                textColor: "black",
            },
            rightPriceScale: { borderColor: "#00000030" },
            timeScale: { borderColor: "#00000030", timeVisible: true },
        });

        const rsiSeries = rsiChart.addLineSeries({
            color: "blue",
            lineWidth: 1,
        });
        const rsiData = calculateRSI(candleData, candleData.length);
        rsiSeries.setData(rsiData);

        // Fix trục RSI 0–100
        (rsiSeries as any).autoscaleInfoProvider = () => ({
            priceRange: { minValue: 0, maxValue: 100 },
        });

        // === Đồng bộ timeScale ===
        candleChart.timeScale().subscribeVisibleTimeRangeChange((range: any) => {
            rsiChart.timeScale().setVisibleRange(range);
        });

        candleChart.priceScale("right").applyOptions({ minimumWidth: 60 });
        rsiChart.priceScale("right").applyOptions({ minimumWidth: 60 });

        return () => {
            candleChart.remove();
            rsiChart.remove();
        };
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <div ref={candleChartRef} style={{ width: "100%", height: 400 }} />
            <div ref={rsiChartRef} style={{ width: "100%", height: 200 }} />
        </div>
    );
};

export default ChartWithRSIPane;
