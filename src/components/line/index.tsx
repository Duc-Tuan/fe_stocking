import {
    ColorType,
    createChart,
    type IChartApi,
    type UTCTimestamp,
} from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import { formatVietnamTimeSmart, gridColor } from './formatTime';
import { adjustToUTCPlus_7 } from '../../pages/Home/options';
import { getColorChart } from '../../utils/timeRange';

export const ChartComponent = (props: any) => {
    const {
        chartRef,
        chartContainerRef,
        chartRefCurent,
        seriesRef,
        dataOld,
        setPagination,
        latestData,
        colors: {
            backgroundColor = 'transparent',
            lineColor = getColorChart('--color-background'),
            textColor = 'black',
            areaTopColor = getColorChart('--color-background'),
        } = {},
    } = props;

    const tooltipRef = useRef<HTMLDivElement>(null);
    const dataRef = useRef<any[]>([]);

    const drawDaySeparators = (chart: any, data: any[]) => {
        const timeScale = chart.timeScale();
        const container = chartContainerRef.current;
        if (!container) return;

        // Xóa các vạch cũ
        container?.querySelectorAll('.day-separator')?.forEach((el: any) => el.remove());

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
            const t7 = Math.floor(Date.UTC(y, m, d, 7, 0, 0) / 1000);

            // Nhưng cần check: t7 có nằm trong range chart không?
            timestampsAt7UTC.push(t7);
        }

        for (const timestamp of timestampsAt7UTC) {
            const x = timeScale.timeToCoordinate(timestamp as UTCTimestamp);
            if (x === null) continue;

            const line = document.createElement('div');
            line.className = 'day-separator';
            line.style.cssText = `
                    position: absolute;
                    top: 19%;
                    left: ${x + 25}px;
                    width: 0;
                    height: 74%;
                    border-left: 1px dashed rgba(0, 0, 0, 0.2);
                    pointer-events: none;
                    z-index: 2;
                `;
            container.appendChild(line);
        }
    };

    const updateSeparators = (data: any[]) => {
        if (!chartRef.current || !data.length) return;

        requestAnimationFrame(() => {
            setTimeout(() => {
                drawDaySeparators(chartRef.current, data);
            }, 80); // Delay để đợi chart render xong
        });
    };

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current!, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            grid: gridColor,
            width: chartContainerRef.current!.clientWidth,
            height: 600,
            rightPriceScale: {
                borderColor: '#00000030'
            },
            timeScale: {
                rightOffset: 5,
                barSpacing: 16,
                minBarSpacing: 0,
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
        });

        const newSeries = chart.addAreaSeries({
            lineColor,
            lineWidth: 1,
            topColor: areaTopColor,
            bottomColor: getColorChart("--color-background-opacity-01"),
        });

        chartRef.current = chart;
        chartRefCurent.current = chart;

        seriesRef.current = newSeries;

        chart.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
            if (!range) return;

            chart.applyOptions({
                crosshair: {
                    vertLine: {
                        labelBackgroundColor: getColorChart(),
                    },
                    horzLine: {
                        labelBackgroundColor: getColorChart(),
                    },
                },
                localization: {
                    locale: 'vi-VN',
                    timeFormatter: (time: any) => formatVietnamTimeSmart(time, true),
                },
            });

            if (dataRef.current.length) {
                updateSeparators(dataRef.current);
            }

            if (range.from <= 5) {
                setPagination((prev: any) => ({ ...prev, page: prev.page + 1 }));
            }
        });

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
        chartContainerRef.current?.appendChild(tooltip);
        tooltipRef.current = tooltip;

        chart.subscribeCrosshairMove((param: any) => {
            if (!param.time || !param.point || !param.seriesData || !seriesRef.current) {
                tooltip.style.display = 'none';
                return;
            }

            const price = param.seriesData.get(seriesRef.current)?.value;
            if (price === undefined) {
                tooltip.style.display = 'none';
                return;
            }

            const date = new Date((adjustToUTCPlus_7(param.time) as number * 1000));
            const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

            const chartWidth = chartContainerRef.current!.clientWidth;
            const tooltipWidth = 120;
            let left = param.point.x + 10;
            if (left + tooltipWidth > chartWidth) {
                left = param.point.x - tooltipWidth - 10;
            }

            tooltip.innerHTML = `<strong>PNL:</strong> ${price.toFixed(4)}<br/><strong>Time:</strong> ${timeStr}`;
            tooltip.style.display = 'block';
            tooltip.style.left = `${left + 40}px`;
            tooltip.style.top = `${param.point.y + 100}px`;
        });

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
        };

        window.addEventListener('resize', handleResize);

        const resizeObserver = new ResizeObserver(() => {
            const container = chartContainerRef.current;
            if (!container) return;

            const width = container.clientWidth;
            const height = container.clientHeight;

            chart.applyOptions({
                width,
                height,
                layout: {
                    fontSize: width < 480 ? 10 : 12, // 👈 nhỏ hơn ở màn hình nhỏ
                }
            });
        });

        if (chartContainerRef.current) {
            resizeObserver.observe(chartContainerRef.current);
        }

        return () => {
            if (resizeObserver) resizeObserver.disconnect();
            window.removeEventListener('resize', handleResize);
            chart.remove();
            chartRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!seriesRef.current || !dataOld?.length) return;

        const normalized = [...dataOld]
            .map(d => ({
                ...d,
                time: d.time
            }))
            .sort((a, b) => a.time - b.time);

        const deduped = normalized.filter((item, index, arr) => {
            return index === 0 || item.time > arr[index - 1].time;
        });

        if (deduped.length < 10) {
            const first = deduped[0];
            const last = deduped[deduped.length - 1];
            const spacing = 60;
            deduped.unshift({ time: first.time - spacing, value: undefined });
            deduped.push({ time: last.time + spacing, value: undefined });
        }

        const timeScale = chartRef.current?.timeScale();
        const currentRange = timeScale?.getVisibleLogicalRange();

        seriesRef.current.setData(deduped);
        dataRef.current = deduped;

        updateSeparators(deduped); // ✅ Vẽ vạch phân cách

        if (currentRange && currentRange.from !== undefined && currentRange.to !== undefined) {
            const shift = deduped.length - dataRef.current.length;
            timeScale?.setVisibleLogicalRange({
                from: currentRange.from + shift,
                to: currentRange.to + shift,
            });
        }
    }, [dataOld]);

    useEffect(() => {
        if (!seriesRef.current || !latestData || latestData.length === 0) return;

        const fixedLatestData = latestData.map((d: any) => ({
            ...d,
            time: d.time
        }));

        const lastPoint = dataRef.current[dataRef.current.length - 1];

        if (fixedLatestData.length > 1) {
            const filteredNewPoints = fixedLatestData.filter((p: any) => !lastPoint || p.time > lastPoint.time);
            if (filteredNewPoints.length > 0) {
                const updated = [...dataRef.current, ...filteredNewPoints];
                seriesRef.current.setData(updated);
                dataRef.current = updated;

                updateSeparators(updated); // ✅
            }
        } else if (fixedLatestData.length === 1 && lastPoint) {
            const newPoint = fixedLatestData[0];
            if (newPoint.time === lastPoint.time) {
                const updated = [...dataRef.current.slice(0, -1), newPoint];
                seriesRef.current.setData(updated);
                dataRef.current = updated;
            } else if (newPoint.time > lastPoint.time) {
                seriesRef.current.update(newPoint);
                dataRef.current.push(newPoint);
            }
        }
    }, [latestData]);

    return null;
};
