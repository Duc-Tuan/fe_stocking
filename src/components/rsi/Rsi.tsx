import React, { useEffect, useRef } from 'react'
import { calculateRSI } from './type';
import { ColorType, createChart, type BarData, type IChartApi, type UTCTimestamp } from 'lightweight-charts';
import { timeOptions, type IinitialDataCand } from '../../pages/Home/options';
import { formatVietnamTimeSmart, gridColor } from '../line/formatTime';
import { aggregateCandlesByInterval, getColorChart } from '../../utils/timeRange';
import { normalizeChartData } from '../candlestickSeries/options';

export default function Rsi({ candleData, chartRefCandl, currentRange, colors: {
    backgroundColor = 'transparent',
    lineColor = getColorChart('--color-background'),
    textColor = 'black',
} = {} }: { candleData: IinitialDataCand[], currentRange: any, chartRefCandl: any, colors?: any}) {
    const chartRef = useRef<any>(null);
    const rsiChartRef = useRef<HTMLDivElement>(null);
    const seriesRef = useRef<any>(null);

    const allData = useRef<BarData[]>([]);

    const currentData = useRef<any>(null);

    useEffect(() => {
        if (!rsiChartRef.current) return;

        // === Chart RSI ===
        const rsiChart: IChartApi = createChart(rsiChartRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            grid: gridColor,
            height: 150,
            rightPriceScale: {
                borderColor: '#00000030'
            },
            timeScale: {
                rightOffset: 5,
                barSpacing: 10,
                lockVisibleTimeRangeOnResize: false,
                rightBarStaysOnScroll: true,
                borderVisible: true,
                timeVisible: true,
                secondsVisible: true,
                borderColor: '#00000030'
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
                horzTouchDrag: true,
                vertTouchDrag: true,
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
                pinch: true,
            },
            crosshair: {
                vertLine: { labelBackgroundColor: getColorChart() },
                horzLine: { labelBackgroundColor: getColorChart() },
            },
            localization: {
                locale: 'vi-VN',
                timeFormatter: (time: any) => formatVietnamTimeSmart(time, true),
            },
        });

        const rsiSeries = rsiChart.addLineSeries({
            color: lineColor,
            lineWidth: 1,
        });

        seriesRef.current = rsiSeries;
        chartRef.current = rsiChart;

        return () => {
            rsiChart.remove();
        };
    }, []);

    useEffect(() => {
        if (!chartRefCandl.current && !chartRef.current) return;
        chartRefCandl.current.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
            if (range) {
                chartRef.current.timeScale().setVisibleLogicalRange(range);
            }
        });
        chartRef.current.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
            if (range) {
                chartRefCandl.current.timeScale().setVisibleLogicalRange(range);
            }
        });

        chartRefCandl.current.subscribeCrosshairMove((param: any) => {
            if (param.time && seriesRef.current) {
                // Lấy RSI value tại đúng time
                const rsiPoint = currentData.current.find((p: any) => p.time === param.time);

                if (rsiPoint) {
                    chartRef.current.setCrosshairPosition(
                        rsiPoint.value,   // Y position
                        param.time,       // X (time)
                        seriesRef.current // RSI series
                    );
                }
            } else {
                chartRef.current.clearCrosshairPosition();
            }
        });
    }, [chartRefCandl.current, chartRef.current])

    useEffect(() => {
        if (!chartRefCandl.current._private__chartWidget._private__width && !chartRefCandl.current && !chartRef.current) return;
        chartRef.current.applyOptions({ width: chartRefCandl.current._private__chartWidget._private__width });
        chartRef.current.priceScale("right").applyOptions({ minimumWidth: 58 });
    }, [chartRefCandl.current?._private__chartWidget?._private__width])

    const renderData = (data: any) => {
        let time = undefined
        if (currentRange) {
            time = timeOptions.filter((i) => i.label === currentRange)[0].seconds
        }
        return aggregateCandlesByInterval(data, time)
    }

    useEffect(() => {
        if (!seriesRef.current || !candleData?.length) return;

        const fixed = normalizeChartData(candleData).sort((a: any, b: any) => a.time - b.time);
        const existing = allData.current;

        const unique = fixed.filter(d => !existing.some(e => e.time === d.time));
        if (!unique.length) return;

        const merged = [...existing];
        for (const d of unique) {
            const index = merged.findIndex(item => item.time === d.time);
            if (index !== -1) {
                merged[index] = d;
            } else {
                merged.push(d);
            }
        }

        allData.current = merged.sort((a: any, b: any) => a.time - b.time);
        const data = renderData(allData.current)
        const rsiData = calculateRSI(data, 14);

        currentData.current = data

        seriesRef.current.setData(rsiData);
    }, [candleData, currentRange]);

    return <div ref={rsiChartRef} />
}
