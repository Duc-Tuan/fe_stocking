import { ColorType, createChart, type BarData } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { timeOptions, type IinitialDataCand } from '../../pages/Home/options';
import { aggregateCandlesByInterval, getColorChart } from '../../utils/timeRange';
import { normalizeChartData } from '../candlestickSeries/options';
import { formatVietnamTimeSmart, gridColor } from '../line/formatTime';
import { calculateATR } from './type';

export default function Atr({
    candleData,
    chartRefCandl,
    currentRange,
    colors: {
        backgroundColor = 'transparent',
        lineColor = getColorChart('--color-background-atr'),
        textColor = 'black',
    } = {}
}: { candleData: IinitialDataCand[], currentRange: any, chartRefCandl: any, colors?: any }) {
    const chartAtrRef = useRef<HTMLDivElement>(null);
    const chartAtr = useRef<any>(null);

    const seriesRef = useRef<any>(null);
    const allData = useRef<BarData[] | null>(null);

    const currentData = useRef<any>(null);

    // const currentAtr = useRef<any>(null);
    const currentDataAtr = useRef<any>(null);
    const [currentAtr, setCurrentAtr] = useState<{ time: any, value: any } | null>(null)

    useEffect(() => {
        if (!chartAtrRef.current) return;

        // Chart ATR
        const atrChart = createChart(chartAtrRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            grid: gridColor,
            height: 120,
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
                horzLine: { labelBackgroundColor: getColorChart("--color-background-atr") },
            },
            localization: {
                locale: 'vi-VN',
                timeFormatter: (time: any) => formatVietnamTimeSmart(time, true),
            },
        });

        const atrSeries = atrChart.addLineSeries({
            color: lineColor,
            lineWidth: 1,
        });

        chartAtr.current = atrChart;
        seriesRef.current = atrSeries;

        const handleResize = () => {
            atrChart.applyOptions({ width: chartAtrRef.current!.clientWidth });
        };

        return () => {
            window.removeEventListener('resize', handleResize);
            atrChart.remove();
            chartAtr.current = null;
            seriesRef.current = null;
        };
    }, []);

    useEffect(() => {
        const candleChart = chartRefCandl.current;
        const atrChart = chartAtr.current;

        if (!candleChart || !atrChart) return;

        // Sync zoom/pan giữa 2 chart
        const unsubCandle = candleChart.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
            if (range) {
                atrChart.timeScale().setVisibleLogicalRange(range);
            }
        });

        const unsubAtr = atrChart.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
            if (range) {
                candleChart.timeScale().setVisibleLogicalRange(range);
            }
        });

        // Sync crosshair
        const unsubCrosshair = candleChart.subscribeCrosshairMove((param: any) => {
            if (param.time) {
                const rsiPoint = currentData.current.find((p: any) => p.time === param.time);
                const data = currentDataAtr.current.find((p: any) => p.time === param.time);
                setCurrentAtr(data);

                if (rsiPoint) {
                    atrChart.setCrosshairPosition(
                        rsiPoint.value,
                        param.time,
                        seriesRef.current
                    );
                }
            } else {
                atrChart.clearCrosshairPosition();
                setCurrentAtr(currentDataAtr.current[currentDataAtr.current.length - 1]);
            }
        });

        // Đồng bộ chiều rộng
        const width = candleChart?.getWidth?.(); // Nếu chart có hàm getWidth, không dùng _private__
        if (width) {
            atrChart.applyOptions({ width });
        }

        atrChart.priceScale("right").applyOptions({ minimumWidth: 58 });

        // Cleanup
        return () => {
            unsubCandle?.();
            unsubAtr?.();
            unsubCrosshair?.();
        };
    }, []); // Chỉ chạy 1 lần sau mount

    const renderData = (data: any) => {
        let time = undefined
        if (currentRange) {
            time = timeOptions.filter((i) => i.label === currentRange)[0].seconds
        }
        return aggregateCandlesByInterval(data, time)
    }

    useEffect(() => {
        if (!seriesRef.current || !candleData?.length) return;

        allData.current = []
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
        const rsiData = calculateATR(data, 14);

        currentData.current = data
        currentDataAtr.current = rsiData

        setCurrentAtr(rsiData[rsiData.length - 1])

        seriesRef.current.setData(rsiData);
    }, [candleData, currentRange]);

    return <div ref={chartAtrRef} style={{ position: "relative" }}>
        <div className="absolute w-[calc(100%-58px)] h-[92px] bg-[var(--color-background-atr-1)] left-0 right-0 top-0" />

        <div className="absolute left-4 top-0 text-[12px]">ATR 14 <span className='text-gray-400'>RMA</span> <span className='text-[var(--color-background)] ml-2'>{currentAtr && currentAtr.value.toFixed(2)}</span></div>
    </div>
}
