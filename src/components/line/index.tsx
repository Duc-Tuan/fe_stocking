import {
    ColorType,
    createChart,
    type ISeriesApi,
} from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import { formatVietnamTimeSmart, gridColor } from './formatTime';
import { adjustToUTCPlus_7 } from '../../pages/Home/options';

export const ChartComponent = (props: any) => {
    const {
        dataOld,
        setPagination,
        latestData,
        chartRef,
        colors: {
            backgroundColor = 'white',
            lineColor = 'rgba(236, 0, 63, 1)',
            textColor = 'black',
            areaTopColor = 'rgba(236, 0, 63, 1)',
            areaBottomColor = 'rgba(236, 0, 63, 0.1)',
        } = {},
    } = props;

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const dataRef = useRef<any[]>([]);

    const drawDaySeparators = (chart: any, data: any[]) => {
        const timeScale = chart.timeScale();
        const container = chartContainerRef.current;
        if (!container) return;

        // Xóa các vạch cũ
        container.querySelectorAll('.day-separator').forEach(el => el.remove());

        const seenDates = new Set<string>();

        for (const point of data) {
            const date = new Date(point.time * 1000);
            const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            if (seenDates.has(dateKey)) continue;
            seenDates.add(dateKey);

            const x = timeScale.timeToCoordinate(point.time);
            if (x === null) continue;

            const line = document.createElement('div');
            line.className = 'day-separator';
            line.style.cssText = `
                position: absolute;
                top: 20%;
                left: ${x}px;
                width: 0;
                height: 73%;
                border-left: 1px dashed rgba(0, 0, 0, 0.4);
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
        const chart = createChart(chartContainerRef.current!, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            grid: gridColor,
            width: chartContainerRef.current!.clientWidth,
            height: 600,
            timeScale: {
                rightOffset: 5,
                barSpacing: 16,
                minBarSpacing: 0,
                lockVisibleTimeRangeOnResize: false,
                rightBarStaysOnScroll: true,
                borderVisible: false,
                timeVisible: true,
                secondsVisible: true,
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
            bottomColor: areaBottomColor,
        });

        chartRef.current = chart;
        seriesRef.current = newSeries;

        chart.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
            if (!range) return;

            chart.applyOptions({
                crosshair: {
                    vertLine: {
                        labelBackgroundColor: 'rgb(236, 0, 63)',
                    },
                    horzLine: {
                        labelBackgroundColor: 'rgb(236, 0, 63)',
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
                setPagination((prev: any) => {
                    if (prev.totalPage > prev.page) {
                        return { ...prev, page: prev.page + 1 }
                    }
                    return { ...prev };
                });
            }
        });

        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
            position: absolute;
            display: none;
            padding: 6px 8px;
            background: rgba(236, 0, 63, 0.8);
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
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${param.point.y + 10}px`;
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
            deduped.unshift({ time: first.time - spacing, value: null });
            deduped.push({ time: last.time + spacing, value: null });
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

    return <div ref={chartContainerRef} />;
};
