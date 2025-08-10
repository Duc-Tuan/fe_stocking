import {
    ColorType,
    createChart,
    type BarData,
    type IChartApi,
    type ISeriesApi,
    type UTCTimestamp,
} from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import { formatVietnamTimeSmart, gridColor } from '../line/formatTime';
import { normalizeChartData } from './options';
import { adjustToUTCPlus_7, timeOptions } from '../../pages/Home/options';
import { aggregateCandlesByInterval, getColorChart } from '../../utils/timeRange';

export const CandlestickSeriesComponent = (props: any) => {
    const {
        isOpen,
        dataOld,
        latestData,
        setPagination,
        chartRef,
        currentRange,
        colors: {
            backgroundColor = 'transparent',
            textColor = 'black',
            upColor = '#4bffb5',
            borderUpColor = '#4bffb5',
            wickUpColor = '#4bffb5',
            borderDownColor = '#ff4976',
            downColor = '#ff4976',
            wickDownColor = '#ff4976',
        } = {},
    } = props;

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const pLineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const allData = useRef<BarData[]>([]);
    const hasRequestedNextPage = useRef(false);

    // ✅ Vẽ vạch phân cách ngày bằng overlay div
    const drawDaySeparators = (chart: IChartApi, data: BarData[]) => {
        const timeScale = chart.timeScale();
        const container = chartContainerRef.current;
        if (!container) return;

        // Xóa vạch cũ
        container.querySelectorAll('.day-separator').forEach(el => el.remove());

        // ✅ Tìm ngày duy nhất có trong data
        const seenDates = new Set<string>();
        const timestampsAt7UTC: number[] = [];

        for (const candle of data) {
            const date = new Date(Number(candle.time) * 1000);
            const y = date.getUTCFullYear();
            const m = date.getUTCMonth();
            const d = date.getUTCDate();

            const key = `${y}-${m}-${d}`;
            if (seenDates.has(key)) continue;
            seenDates.add(key);

            // Tạo timestamp tại 07:00 UTC của ngày đó
            const t7 = Math.floor(Date.UTC(y, m, d, 0, 0, 0) / 1000);
            timestampsAt7UTC.push(t7);
        }

        // ✅ Vẽ vạch
        for (const timestamp of timestampsAt7UTC) {
            const x = timeScale.timeToCoordinate(timestamp as UTCTimestamp);
            if (x === null) continue;

            const line = document.createElement('div');
            line.className = 'day-separator';
            line.style.cssText = `
            position: absolute;
            top: 0;
            left: ${x}px;
            width: 0;
            height: 96%;
            border-left: 1px dashed rgba(0, 0, 0, 0.4);
            pointer-events: none;
            z-index: 2;
        `;
            container.appendChild(line);
        }
    };

    const updateSeparators = (data: BarData[]) => {
        if (!chartRef.current || !data.length) return;

        requestAnimationFrame(() => {
            setTimeout(() => {
                drawDaySeparators(chartRef.current!, data);
            }, 80); // Delay 80ms để đợi chart render xong
        });
    };

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
            color: getColorChart(),
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
            background: var(--color-background);
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
            tooltip.style.top = `${param.point.y - 50}px`;
        });

        chart.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
            if (!range || hasRequestedNextPage.current) return;
            const threshold = 5;
            const isAtLeftEdge = range.from - threshold <= 0;

            chart.applyOptions({
                crosshair: {
                    vertLine: { labelBackgroundColor: getColorChart() },
                    horzLine: { labelBackgroundColor: getColorChart() },
                },
                localization: {
                    locale: 'vi-VN',
                    timeFormatter: (time: any) => formatVietnamTimeSmart(time, true),
                },
            });

            if (allData.current.length) {
                const time = timeOptions.find(i => i.label === currentRange)?.seconds;
                const data = aggregateCandlesByInterval(allData.current, time);
                updateSeparators(data);
            }

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

        const resizeObserver = new ResizeObserver(() => {
            const container = chartContainerRef.current;
            if (!container) return;

            const width = container.clientWidth;
            const heights = container.clientHeight;
            const isMobile = window.innerWidth < 480;

            chart.applyOptions({
                width,
                height: isMobile ? 540 : heights,
                layout: {
                    fontSize: width < 480 ? 10 : 12, // 👈 nhỏ hơn ở màn hình nhỏ
                }
            });
        });

        if (chartContainerRef.current) {
            resizeObserver.observe(chartContainerRef.current);
        }

        window.addEventListener('resize', handleResize);
        return () => {
            if (resizeObserver) resizeObserver.disconnect();
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    const pLineSeriesRe = (data: BarData[]) => {
        if (!pLineSeriesRef.current) return;

        const pData = data
            .filter(d => d.high !== undefined && d.low !== undefined && d.close !== undefined)
            .map(d => ({
                time: d.time,
                value: (d.high + d.low + d.close) / 3,
            }));

        if (!pData.length) {
            pLineSeriesRef.current.setData([]); // Clear để tránh lỗi vẽ
            return;
        }
        if (pData.length === 0) return;

        pLineSeriesRef.current.setData(pData);
    };

    const renderData = (data: any) => {
        let time = undefined
        if (currentRange) {
            time = timeOptions.filter((i) => i.label === currentRange)[0].seconds
        }
        return aggregateCandlesByInterval(data, time)
    }

    useEffect(() => {
        if (!candleSeriesRef.current || !dataOld?.length) return;

        const fixed = normalizeChartData(dataOld).sort((a: any, b: any) => a.time - b.time);
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

        candleSeriesRef.current.setData(data);
        pLineSeriesRe(data);
        updateSeparators(data);
    }, [dataOld]);

    useEffect(() => {
        if (!candleSeriesRef.current) return;
        const data = renderData(allData.current);
        candleSeriesRef.current.setData(data);
        pLineSeriesRe(data);
        updateSeparators(data);
    }, [currentRange])

    useEffect(() => {
        if (!latestData || !Array.isArray(latestData) || !latestData.length || !candleSeriesRef.current) return;

        const fixed = normalizeChartData(latestData);
        if (!fixed.length) return;

        let updated = [...allData.current];
        let hasNew = false;

        for (const point of fixed) {
            const idx = updated.findIndex(p => Number(p.time) === Number(point.time));
            if (idx !== -1) {
                updated[idx] = point;
            } else {
                updated.push(point);
                hasNew = true;
            }
        }

        if (hasNew) updated.sort((a: any, b: any) => a.time - b.time);
        allData.current = updated;

        const data = renderData(allData.current);

        candleSeriesRef.current.setData(data);

        pLineSeriesRe(data);
        updateSeparators(data);
    }, [latestData]);

    useEffect(() => {
        if (pLineSeriesRef.current) {
            pLineSeriesRef.current.applyOptions({ visible: isOpen });
        }
    }, [isOpen]);

    return <div ref={chartContainerRef} style={{ position: 'relative' }} />;
};
