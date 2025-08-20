import { ColorType, createChart, type BarData, type IChartApi } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react'
import { calculateATR } from './type';
import { timeOptions, type IinitialDataCand } from '../../pages/Home/options';
import { aggregateCandlesByInterval, getColorChart } from '../../utils/timeRange';
import { formatVietnamTimeSmart, gridColor } from '../line/formatTime';
import { normalizeChartData } from '../candlestickSeries/options';

export default function Atr({
    candleData,
    chartRefCandl,
    currentRange,
    colors: {
        backgroundColor = 'transparent',
        lineColor = getColorChart('--color-background'),
        textColor = 'black',
    } = {}
}: { candleData: IinitialDataCand[], currentRange: any, chartRefCandl: any, colors?: any }) {
    const chartAtrRef = useRef<HTMLDivElement>(null);
    const chartAtr = useRef<any>(null);

    const seriesRef = useRef<any>(null);
    const allData = useRef<BarData[]>([]);

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
                horzLine: { labelBackgroundColor: getColorChart() },
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
        };
    }, []);

    useEffect(() => {
        if (!chartRefCandl.current && !chartAtr.current) return;
        chartRefCandl.current.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
            if (range) {
                chartAtr.current?.timeScale().setVisibleLogicalRange(range);
            }
        });
        chartAtr.current.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
            if (range) {
                chartRefCandl.current?.timeScale().setVisibleLogicalRange(range);
            }
        });

        chartRefCandl.current?.subscribeCrosshairMove((param: any) => {
            if (param.time && chartAtr.current) {

                // Lấy RSI value tại đúng time
                const rsiPoint = currentData.current.find((p: any) => p.time === param.time);
                
                const data = currentDataAtr.current.find((p: any) => p.time === param.time);
                setCurrentAtr(data);

                if (rsiPoint) {
                    chartAtr.current.setCrosshairPosition(
                        rsiPoint.value,   // Y position
                        param.time,       // X (time)
                        seriesRef.current // RSI series
                    );
                }
            } else {
                chartAtr.current && chartAtr.current?.clearCrosshairPosition();
                currentDataAtr.current && setCurrentAtr(currentDataAtr.current[currentDataAtr.current.length - 1])
            }
        });
    }, [chartRefCandl.current, chartAtr.current])

    useEffect(() => {
        if (!chartRefCandl.current._private__chartWidget._private__width && !chartRefCandl.current && !chartAtr.current) return;
        chartAtr.current.applyOptions({ width: chartRefCandl.current._private__chartWidget._private__width });
        chartAtr.current.priceScale("right").applyOptions({ minimumWidth: 58 });
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
        const rsiData = calculateATR(data, 14);

        currentData.current = data
        currentDataAtr.current = rsiData

        setCurrentAtr(rsiData[rsiData.length - 1])

        seriesRef.current.setData(rsiData);
    }, [candleData, currentRange]);

    return <div ref={chartAtrRef} style={{ position: "relative" }}>
        <div className="absolute left-4 top-0 text-[12px]">ATR 14 <span className='text-gray-400'>RMA</span> <span className='text-[var(--color-background)] ml-2'>{currentAtr && currentAtr.value.toFixed(2)}</span></div>
    </div>
}
