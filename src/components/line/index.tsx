import { ColorType, createChart, type BarData, type ISeriesApi, type UTCTimestamp } from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import { useBollingerBands } from '../../hooks/useBollingerBands';
import { adjustToUTCPlus_7 } from '../../pages/Home/options';
import { indicationBB } from '../../pages/Home/type';
import { getColorChart } from '../../utils/timeRange';
import { calculateEMA, calculateRMA, calculateSMA, calculateWMA } from '../../utils/typeRecipe';
import { covertDataLine, formatVietnamTimeSmart, gridColor } from './formatTime';
import { mergeLatestData } from '../candlestickSeries/options';

export const ChartComponent = (props: any) => {
  const {
    chartRef,
    chartContainerRef,
    chartRefCurent,
    seriesRef,
    dataOld,
    setPagination,
    latestData,
    setMenu,
    dataCurrent,
    indicatorChart,
    currentRange,
    colors: {
      backgroundColor = 'transparent',
      lineColor = getColorChart(),
      textColor = 'black',
      areaTopColor = getColorChart(),
    } = {},
  } = props;

  const tooltipRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef<any[]>([]);

  const maLine = useRef<ISeriesApi<'Line'> | null>(null);
  const upperLine = useRef<ISeriesApi<'Line'> | null>(null);
  const lowerLine = useRef<ISeriesApi<'Line'> | null>(null);

  const lineSMA = useRef<ISeriesApi<'Line'> | null>(null);
  const lineEMA = useRef<ISeriesApi<'Line'> | null>(null);
  const lineWMA = useRef<ISeriesApi<'Line'> | null>(null);
  const lineRMA = useRef<ISeriesApi<'Line'> | null>(null);

  const allData = useRef<BarData[]>([]);

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

  const addChartLine = (ref: any, chart: any, color: string) => {
    return (ref.current = chart.addLineSeries({
      color: getColorChart(color),
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    }));
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

    const newSeries = chart.addAreaSeries({
      lineColor,
      lineWidth: 1,
      topColor: areaTopColor,
      crosshairMarkerVisible: false,
      bottomColor: getColorChart('--color-background-opacity-01'),
    });

    chartRef.current = chart;
    chartRefCurent.current = chart;

    addChartLine(lineSMA, chart, '--color-background-sma');
    addChartLine(lineEMA, chart, '--color-background-ema');
    addChartLine(lineWMA, chart, '--color-background-wma');
    addChartLine(lineRMA, chart, '--color-background-rma');

    chart.priceScale('right').applyOptions({ minimumWidth: 70 });

    seriesRef.current = newSeries;

    indicationBB(chart, maLine, upperLine, lowerLine);
    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault();
      setMenu({ x: e.clientX, y: e.clientY });
    };

    // const handleRightClick = (e: MouseEvent) =>
    //   handleRightClickBB(
    //     e,
    //     chart,
    //     setMenu,
    //     chartContainerRef,
    //     maLine,
    //     upperLine,
    //     lowerLine,
    //     calculateBollingerBands(allData.current),
    //   );

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

      const date = new Date((adjustToUTCPlus_7(param.time) as number) * 1000);
      const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`;

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
        },
      });
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    chartContainerRef.current.addEventListener('contextmenu', handleRightClick);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      chartContainerRef.current?.removeEventListener('contextmenu', handleRightClick);
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      chartRefCurent.current = null;
      seriesRef.current = null;
      tooltipRef.current = null;
      lineSMA.current = null;
      lineEMA.current = null;
      lineWMA.current = null;
      lineRMA.current = null;
    };
  }, []);

  const getDataChart = (data: any) => {
    allData.current = data;
    const dataNew = covertDataLine(data);

    const dataSMA = calculateSMA(allData.current, indicatorChart.find((i: any) => i.value === 'sma').period);
    const dataEMA = calculateEMA(allData.current, indicatorChart.find((i: any) => i.value === 'ema').period);
    const dataWMA = calculateWMA(allData.current, indicatorChart.find((i: any) => i.value === 'wma').period);
    const dataRMA = calculateRMA(allData.current, indicatorChart.find((i: any) => i.value === 'rma').period);

    lineSMA.current?.setData(dataSMA as any);
    lineEMA.current?.setData(dataEMA as any);
    lineWMA.current?.setData(dataWMA as any);
    lineRMA.current?.setData(dataRMA as any);

    seriesRef.current.setData(dataNew);
  };

  useEffect(() => {
    getDataChart(dataOld);
  }, [dataOld]);

  useEffect(() => {
    if (!latestData?.length) return;
    allData.current = mergeLatestData(allData.current, latestData, currentRange).sort((a, b) => a.time - b.time);
  }, [latestData, allData, currentRange]);

  useEffect(() => {
    getDataChart(allData.current);
  }, [allData.current]);

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
