import React, { useEffect, useRef, useState } from 'react'
import { calculateRSI } from './type';
import { ColorType, createChart, type BarData, type IChartApi, type UTCTimestamp } from 'lightweight-charts';
import { timeOptions, type IinitialDataCand } from '../../pages/Home/options';
import { formatVietnamTimeSmart, gridColor } from '../line/formatTime';
import { aggregateCandlesByInterval, getColorChart } from '../../utils/timeRange';
import { normalizeChartData } from '../candlestickSeries/options';
import { useTranslation } from 'react-i18next';
import type { IboundaryLine } from '../../pages/Home/type';

export default function Rsi({ chartRefCurentRSI, candleData, chartRefCandl, currentRange, boundaryLine, colors: {
    backgroundColor = 'transparent',
    lineColor = getColorChart('--color-background'),
    textColor = 'black',
} = {} }: { candleData: IinitialDataCand[], currentRange: any, chartRefCandl: any, colors?: any, chartRefCurentRSI: any, boundaryLine: IboundaryLine }) {
    const { t } = useTranslation()
    const chartRef = useRef<any>(null);
    const rsiChartRef = useRef<HTMLDivElement>(null);
    const seriesRef = useRef<any>(null);

    const allData = useRef<BarData[] | null>(null);

    const currentData = useRef<any>(null);

    const currentDataRsi = useRef<any>(null);
    const [currentRsi, setCurrentRsi] = useState<any>(null)

    // refs để lưu priceLine instances
    const priceLinesRef = useRef<{ [key: string]: any[] }>({
        "80_20": [],
        "70_30": [],
        "50": [],
    });

    useEffect(() => {
        if (!rsiChartRef.current) return;

        // === Chart RSI ===
        const rsiChart: IChartApi = createChart(rsiChartRef.current, {
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

        const rsiSeries = rsiChart.addLineSeries({
            color: lineColor,
            lineWidth: 1,
        });

        seriesRef.current = rsiSeries;
        chartRef.current = rsiChart;
        chartRefCurentRSI.current = rsiChart;

        return () => {
            rsiChart.remove();
            chartRef.current = null
            seriesRef.current = null
            chartRefCurentRSI.current = null
        };
    }, []);

    useEffect(() => {
        if (!seriesRef.current) return;

        // Clear trước mỗi lần render lại
        Object.values(priceLinesRef.current).flat().forEach(line => {
            seriesRef.current.removePriceLine(line);
        });
        priceLinesRef.current = { "80_20": [], "70_30": [], "50": [] };

        // 80-20 đỏ
        if (boundaryLine.is80_20) {
            const line80 = seriesRef.current.createPriceLine({
                price: 80,
                color: 'red',
                lineWidth: 1,
                lineStyle: 1,
                axisLabelVisible: true,
            });
            const line20 = seriesRef.current.createPriceLine({
                price: 20,
                color: 'red',
                lineWidth: 1,
                lineStyle: 1,
                axisLabelVisible: true,
            });
            priceLinesRef.current["80_20"].push(line80, line20);
        }

        // 70-30 xanh
        if (boundaryLine.is70_30) {
            const line70 = seriesRef.current.createPriceLine({
                price: 70,
                color: 'green',
                lineWidth: 1,
                lineStyle: 1,
                axisLabelVisible: true,
            });
            const line30 = seriesRef.current.createPriceLine({
                price: 30,
                color: 'green',
                lineWidth: 1,
                lineStyle: 1,
                axisLabelVisible: true,
            });
            priceLinesRef.current["70_30"].push(line70, line30);
        }

        // 50 vàng
        if (boundaryLine.is50) {
            const line50 = seriesRef.current.createPriceLine({
                price: 50,
                color: 'gold',
                lineWidth: 1,
                lineStyle: 1,
                axisLabelVisible: true,
            });
            priceLinesRef.current["50"].push(line50);
        }
    }, [boundaryLine])

    useEffect(() => {
        const candleChart = chartRefCandl.current;
        const rsiChart = chartRef.current;

        if (!candleChart || !rsiChart) return; // tránh null

        const unsubCandle = candleChart.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
            if (range) {
                rsiChart.timeScale().setVisibleLogicalRange(range);
            }
        });

        const unsubRsi = rsiChart.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
            if (range) {
                candleChart.timeScale().setVisibleLogicalRange(range);
            }
        });

        const unsubCrosshair = candleChart.subscribeCrosshairMove((param: any) => {
            if (param.time) {
                const rsiPoint = currentData.current.find((p: any) => p.time === param.time);
                const data = currentDataRsi.current.find((p: any) => p.time === param.time);
                setCurrentRsi(data);

                if (rsiPoint) {
                    rsiChart.setCrosshairPosition(
                        rsiPoint.value,
                        param.time,
                        seriesRef.current
                    );
                }
            } else {
                rsiChart.clearCrosshairPosition();
                setCurrentRsi(currentDataRsi.current[currentDataRsi.current.length - 1])
            }
        });

        // Đồng bộ chiều rộng
        const width = candleChart?.getWidth?.(); // Nếu chart có hàm getWidth, không dùng _private__
        if (width) {
            rsiChart.applyOptions({ width });
        }

        rsiChart.priceScale("right").applyOptions({ minimumWidth: 58 });

        // Cleanup khi component unmount
        return () => {
            unsubCandle?.();
            unsubRsi?.();
            unsubCrosshair?.();
        };
    }, []); // chỉ chạy 1 lần sau mount

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
        const rsiData = calculateRSI(data, 14);

        currentData.current = data
        currentDataRsi.current = rsiData

        seriesRef.current.setData(rsiData);
    }, [candleData, currentRange]);

    return <div ref={rsiChartRef} style={{ position: "relative" }}>
        <div className="absolute w-[calc(100%-58px)] h-[120px] bg-[var(--color-background-opacity-1)] left-0 right-0 bottom-0" />

        <div className="absolute left-4 top-0 text-[12px]">{t("Chỉ báo hội tụ RSI")} <span className='text-gray-400'>14 close</span> <span className='text-[var(--color-background)] ml-2'>{currentRsi && currentRsi.value.toFixed(2)}</span></div>
    </div>
}
