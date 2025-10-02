import {
  ColorType,
  createChart,
  type BarData,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { useBollingerBands } from '../../hooks/useBollingerBands';
import { adjustToUTCPlus_7, timeOptions } from '../../pages/Home/options';
import { indicationBB } from '../../pages/Home/type';
import { aggregateCandlesByInterval, getColorChart } from '../../utils/timeRange';
import { calculateEMA, calculateRMA, calculateSMA, calculateWMA } from '../../utils/typeRecipe';
import { formatVietnamTimeSmart, gridColor } from '../line/formatTime';
import { mergeLatestData } from './options';

export const CandlestickSeriesComponent = (props: any) => {
  const {
    chartRef,
    chartContainerRef,
    candleSeriesRef,
    chartRefCurent,
    dataOld,
    setPagination,
    currentRange,
    latestData,
    isOpen,
    indicatorChart,
    setMenu,
    // dataCurrent,
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

  const pLineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const maLine = useRef<ISeriesApi<'Line'> | null>(null);
  const upperLine = useRef<ISeriesApi<'Line'> | null>(null);
  const lowerLine = useRef<ISeriesApi<'Line'> | null>(null);

  const lineSMA = useRef<ISeriesApi<'Line'> | null>(null);
  const lineEMA = useRef<ISeriesApi<'Line'> | null>(null);
  const lineWMA = useRef<ISeriesApi<'Line'> | null>(null);
  const lineRMA = useRef<ISeriesApi<'Line'> | null>(null);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const allData = useRef<BarData[]>([]);
  const hasRequestedNextPage = useRef(false);

  // ✅ Vẽ vạch phân cách ngày bằng overlay div
  const drawDaySeparators = (chart: IChartApi, data: BarData[]) => {
    const timeScale = chart.timeScale();
    const container = chartContainerRef.current;
    if (!container) return;

    // Xóa vạch cũ
    container.querySelectorAll('.day-separator').forEach((el: any) => el.remove());

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
                left: ${x + 8}px;
                width: 0;
                height: 94%;
                border-left: 1px dashed rgba(0, 0, 0, 0.2);
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
      height: 620,
      rightPriceScale: {
        borderColor: '#00000030',
      },
      timeScale: {
        rightOffset: 5,
        barSpacing: 10,
        lockVisibleTimeRangeOnResize: false,
        rightBarStaysOnScroll: true,
        borderVisible: true,
        timeVisible: true,
        secondsVisible: true,
        borderColor: '#00000030',
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

    const candleSeries = chart.addCandlestickSeries({
      upColor,
      downColor,
      borderUpColor,
      borderDownColor,
      wickUpColor,
      wickDownColor,
      // wickColor: "red"
    });
    candleSeriesRef.current = candleSeries;

    const pLineSeries = chart.addLineSeries({
      color: getColorChart(),
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    pLineSeriesRef.current = pLineSeries;

    lineSMA.current = chart.addLineSeries({
      color: getColorChart('--color-background-sma'),
      lineWidth: 1,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    lineEMA.current = chart.addLineSeries({
      color: getColorChart('--color-background-ema'),
      lineWidth: 1,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
    });
    lineWMA.current = chart.addLineSeries({
      color: getColorChart('--color-background-wma'),
      lineWidth: 1,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
    });
    lineRMA.current = chart.addLineSeries({
      color: getColorChart('--color-background-rma'),
      lineWidth: 1,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
    });

    indicationBB(chart, maLine, upperLine, lowerLine);
    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault();
      setMenu({ x: e.clientX, y: e.clientY });
    };

    chartRef.current = chart;
    chartRefCurent.current = chart;

    chart.priceScale('right').applyOptions({ minimumWidth: 70 });

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
        .padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

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
        const time = timeOptions.find((i) => i.label === currentRange)?.seconds;
        const data = aggregateCandlesByInterval(allData.current, time);
        updateSeparators(data);
      }

      if (isAtLeftEdge) {
        setPagination((prev: any) => ({ ...prev, page: prev.page + 1 }));
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
        },
      });
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    window.addEventListener('resize', handleResize);
    chartContainerRef.current.addEventListener('contextmenu', handleRightClick);
    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      chartContainerRef.current?.removeEventListener('contextmenu', handleRightClick);
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      chartRefCurent.current = null;
      candleSeriesRef.current = null;
      pLineSeriesRef.current = null;
      lineSMA.current = null;
      maLine.current = null;
      upperLine.current = null;
      lowerLine.current = null;
      lineEMA.current = null;
      lineWMA.current = null;
      lineRMA.current = null;
    };
  }, []);

  const pLineSeriesRe = (data: BarData[]) => {
    if (!pLineSeriesRef.current) return;

    const pData = data
      .filter((d) => d.high !== undefined && d.low !== undefined && d.close !== undefined)
      .map((d) => ({
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

  const getDataChart = (data: any) => {
    allData.current = data;
    const dataSMA = calculateSMA(data, indicatorChart.find((i: any) => i.value === 'sma').period);
    const dataEMA = calculateEMA(data, indicatorChart.find((i: any) => i.value === 'ema').period);
    const dataWMA = calculateWMA(data, indicatorChart.find((i: any) => i.value === 'wma').period);
    const dataRMA = calculateRMA(data, indicatorChart.find((i: any) => i.value === 'rma').period);

    lineSMA.current?.setData(dataSMA as any);

    lineEMA.current?.setData(dataEMA as any);
    lineWMA.current?.setData(dataWMA as any);
    lineRMA.current?.setData(dataRMA as any);
    candleSeriesRef.current.setData(data);
    pLineSeriesRe(data);
  };

  useEffect(() => {
    getDataChart(dataOld);
  }, [dataOld]);

  useEffect(() => {
    if (!latestData?.length) return;
    allData.current = mergeLatestData(allData.current, latestData, currentRange).sort((a, b) => a.time - b.time);
  }, [latestData, allData, currentRange]);

  useEffect(() => {
    getDataChart(allData.current)
  }, [allData.current])

  useEffect(() => {
    if (pLineSeriesRef.current) {
      pLineSeriesRef.current.applyOptions({ visible: isOpen });
    }
  }, [isOpen]);

  useBollingerBands({
    dataOld: allData.current,
    dataCurrent: indicatorChart.find((i: any) => i.value === 'bb'),
    maLine,
    upperLine,
    lowerLine,
    isVisible: indicatorChart.find((i: any) => i.value === 'bb').active,
  });

  useEffect(() => {
    if (lineSMA.current) {
      lineSMA.current.applyOptions({ visible: indicatorChart.find((i: any) => i.value === 'sma').active });
    }
    if (lineEMA.current) {
      lineEMA.current.applyOptions({ visible: indicatorChart.find((i: any) => i.value === 'ema').active });
    }
    if (lineWMA.current) {
      lineWMA.current.applyOptions({ visible: indicatorChart.find((i: any) => i.value === 'wma').active });
    }
    if (lineRMA.current) {
      lineRMA.current.applyOptions({ visible: indicatorChart.find((i: any) => i.value === 'rma').active });
    }
  }, [indicatorChart]);

  return null;
};
