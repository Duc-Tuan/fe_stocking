import {
    ColorType,
    createChart,
    type BarData,
    type IChartApi,
    type ISeriesApi,
} from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import { formatVietnamTimeSmart, gridColor } from '../line/formatTime';
import { normalizeChartData } from './options';
import { adjustToUTCPlus_7, timeOptions } from '../../pages/Home/options';
import { aggregateCandlesByInterval } from '../../utils/timeRange';

export const CandlestickSeriesComponent = (props: any) => {
    const {
        isOpen,
        dataOld,
        latestData,
        setPagination,
        chartRef,
        currentRange,
        colors: {
            backgroundColor = 'white',
            textColor = 'black',
            upColor = '#4bffb5',
            downColor = '#ff4976',
            borderUpColor = '#4bffb5',
            borderDownColor = '#ff4976',
            wickUpColor = '#4bffb5',
            wickDownColor = '#ff4976',
        } = {},
    } = props;

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const pLineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const allData = useRef<BarData[]>([]);
    const hasRequestedNextPage = useRef(false);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart: IChartApi = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            grid: gridColor,
            width: chartContainerRef.current.clientWidth,
            height: 600,
            timeScale: {
                rightOffset: 5,
                barSpacing: 10,
                lockVisibleTimeRangeOnResize: false,
                rightBarStaysOnScroll: true,
                borderVisible: false,
                timeVisible: true,
                secondsVisible: true,
                // tickMarkFormatter: (time: any) => formatVietnamTimeSmart(time),
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
                horzTouchDrag: true,
                vertTouchDrag: false,
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
                pinch: true,
            },
        });

        const candleSeries = chart.addCandlestickSeries({
            upColor,
            downColor,
            borderUpColor,
            borderDownColor,
            wickUpColor,
            wickDownColor,
        });

        candleSeriesRef.current = candleSeries;

        const pLineSeries = chart.addLineSeries({
            color: 'rgb(236, 0, 63)',
            lineWidth: 1,
            priceLineVisible: false,
            lastValueVisible: false,
        });

        pLineSeriesRef.current = pLineSeries;
        chartRef.current = chart;

        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
            position: absolute;
            display: none;
            padding: 6px 8px;
            background: rgb(236, 0, 63);
            color: white;
            border-radius: 4px;
            font-size: 12px;
            pointer-events: none;
            z-index: 10;
        `;
        chartContainerRef.current.appendChild(tooltip);
        tooltipRef.current = tooltip;

        chart.subscribeCrosshairMove((param: any) => {
            if (!param.time || !param.point || !param.seriesData || !candleSeriesRef.current) {
                tooltip.style.display = 'none';
                return;
            }

            const candle = param.seriesData.get(candleSeriesRef.current);
            if (!candle) {
                tooltip.style.display = 'none';
                return;
            }

            const date = new Date((adjustToUTCPlus_7(param.time) as number) * 1000);
            const timeStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
                .toString()
                .padStart(2, '0')}/${date.getFullYear()} ${date
                    .getHours()
                    .toString()
                    .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date
                        .getSeconds()
                        .toString()
                        .padStart(2, '0')}`;

            tooltip.innerHTML = `<strong>O:</strong> ${candle.open.toFixed(2)} 
                <strong>H:</strong> ${candle.high.toFixed(2)} 
                <strong>L:</strong> ${candle.low.toFixed(2)} 
                <strong>C:</strong> ${candle.close.toFixed(2)}<br/>
                <strong>Time:</strong> ${timeStr}`;
            tooltip.style.display = 'block';
            tooltip.style.left = `${param.point.x + 10}px`;
            tooltip.style.top = `${param.point.y + 10}px`;
        });

        chart.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
            if (!range || hasRequestedNextPage.current) return;
            const threshold = 5;
            const isAtLeftEdge = range.from - threshold <= 0;

            chart.applyOptions({
                crosshair: {
                    vertLine: { labelBackgroundColor: 'rgb(236, 0, 63)' },
                    horzLine: { labelBackgroundColor: 'rgb(236, 0, 63)' },
                },
                localization: {
                    locale: 'vi-VN',
                    timeFormatter: (time: any) => formatVietnamTimeSmart(time, true),
                },
            });

            if (isAtLeftEdge) {
                hasRequestedNextPage.current = true;
                setPagination((prev: any) => {
                    if (prev.totalPage > prev.page) {
                        return { ...prev, page: prev.page + 1 };
                    }
                    return prev;
                });

                setTimeout(() => {
                    hasRequestedNextPage.current = false;
                }, 1000);
            }
        });

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    const pLineSeriesRe = (data: BarData[]) => {
        if (!pLineSeriesRef.current) return;
        const pData = data.map(d => ({
            time: d.time,
            value: (d.high + d.low + d.close) / 3,
        }));
        pLineSeriesRef.current.setData(pData);
    }

    useEffect(() => {
        if (!candleSeriesRef.current || !dataOld?.length) return;

        const fixed = normalizeChartData(dataOld).sort((a: any, b: any) => a.time - b.time);
        const existing = allData.current;

        const unique = fixed.filter(d => !existing.some(e => e.time === d.time));
        if (!unique.length) return;

        const merged = [...existing];

        // Cập nhật hoặc thêm mới
        for (const d of unique) {
            const index = merged.findIndex(item => item.time === d.time);
            if (index !== -1) {
                merged[index] = d; // Ghi đè
            } else {
                merged.push(d); // Thêm mới
            }
        }

        allData.current = merged.sort((a: any, b: any) => a.time - b.time);

        let time = undefined
        if (currentRange) {
            time = timeOptions.filter((i) => i.label === currentRange)[0].seconds
        }
        const data = aggregateCandlesByInterval(allData.current, time)

        candleSeriesRef.current.setData(data);

        pLineSeriesRe(data)
    }, [dataOld]);

    useEffect(() => {
        if (!candleSeriesRef.current || !currentRange) return;

        const time = timeOptions.filter((i) => i.label === currentRange)[0].seconds
        const data = aggregateCandlesByInterval(allData.current, time)

        candleSeriesRef.current.setData(data);

        pLineSeriesRe(data)
    }, [currentRange])

    useEffect(() => {
        if (!latestData || !Array.isArray(latestData) || !latestData.length || !candleSeriesRef.current) return;

        const fixed = normalizeChartData(latestData);
        if (!fixed.length) return;

        let updated = [...allData.current];
        let hasNew = false;

        for (const point of fixed) {
            // So sánh bằng số để tránh lỗi '=== string'
            const idx = updated.findIndex(p => Number(p.time) === Number(point.time));
            if (idx !== -1) {
                updated[idx] = point; // Cập nhật bản ghi cũ
            } else {
                updated.push(point); // Thêm bản ghi mới
                hasNew = true;
            }
        }

        if (hasNew) updated.sort((a: any, b: any) => a.time - b.time); // Đảm bảo tăng dần theo time


        candleSeriesRef.current.setData(updated);
        allData.current = updated;

        // Cập nhật đường MA hoặc line khác
        if (pLineSeriesRef.current) {
            const pData = allData.current.map(d => ({
                time: d.time,
                value: (d.high + d.low + d.close) / 3,
            }));
            pLineSeriesRef.current.setData(pData);
        }
    }, [latestData]);

    useEffect(() => {
        if (pLineSeriesRef.current) {
            pLineSeriesRef.current.applyOptions({ visible: isOpen });
        }
    }, [isOpen]);

    return <div ref={chartContainerRef} />;
};
