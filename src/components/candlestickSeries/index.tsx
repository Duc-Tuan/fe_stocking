import {
  ColorType,
  createChart,
  type BarData,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import { useBollingerBands } from '../../hooks/useBollingerBands';
import { adjustToUTCPlus_7, convertDataCandline, timeOptions, type IDataCandCompare } from '../../pages/Home/options';
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
    symbolsCandCompare,
    serverId,
    symbolsCandCompareSocket,
    applyNumberCandle,
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

  const lineCompare1 = useRef<ISeriesApi<'Line'> | null>(null);
  const lineCompare2 = useRef<ISeriesApi<'Line'> | null>(null);
  const lineCompare3 = useRef<ISeriesApi<'Line'> | null>(null);
  const lineCompare4 = useRef<ISeriesApi<'Line'> | null>(null);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const allData = useRef<BarData[]>([]);
  const hasRequestedNextPage = useRef(false);

  const allDataCompare = useRef<IDataCandCompare[]>([]);

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

    const widthScreen = container!.clientWidth - 70;

    // ✅ Vẽ vạch
    for (const timestamp of timestampsAt7UTC) {
      const x = timeScale.timeToCoordinate(timestamp as UTCTimestamp);
      if (x === null) continue;

      // ✅ Chỉ vẽ nếu vạch nằm trong vùng hiển thị
      if (x < 0 || x > widthScreen) continue;

      const line = document.createElement('div');
      line.className = 'day-separator';
      line.style.cssText = `
                position: absolute;
                top: 10px;
                left: ${x + 8}px;
                width: 0;
                height: ${widthScreen < 500 ? 360 - 28 + 'px' : '93%'};
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

  const addChartLine = (ref: any, chart: any, color: string, lastValueVisible: boolean = false) => {
    return (ref.current = chart.addLineSeries({
      color: getColorChart(color),
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible,
      crosshairMarkerVisible: false,
    }));
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const widthScreen = chartContainerRef.current!.clientWidth;

    const chart: IChartApi = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      grid: gridColor,
      width: chartContainerRef.current.clientWidth,
      height: widthScreen < 700 ? 360 : 630,
      crosshair: { mode: 0 },
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

    addChartLine(lineSMA, chart, '--color-background-sma');
    addChartLine(lineEMA, chart, '--color-background-ema');
    addChartLine(lineWMA, chart, '--color-background-wma');
    addChartLine(lineRMA, chart, '--color-background-rma');
    addChartLine(lineSMA, chart, '--color-background-sma');

    addChartLine(lineCompare1, chart, '--color-background-lineCompare1', true);
    addChartLine(lineCompare2, chart, '--color-background-lineCompare2', true);
    addChartLine(lineCompare3, chart, '--color-background-lineCompare3', true);
    addChartLine(lineCompare4, chart, '--color-background-lineCompare4', true);

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
        setPagination((prev: any) => prev + 1);
      }
    });

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
    };

    const resizeObserver = new ResizeObserver(() => {
      const container = chartContainerRef.current;
      if (!container) return;

      const width = container.clientWidth;
      // const heights = container.clientHeight;
      // const isMobile = window.innerWidth < 480;

      chart.applyOptions({
        width,
        // height: isMobile ? 540 : heights,
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
      maLine.current = null;
      upperLine.current = null;
      lowerLine.current = null;
      lineEMA.current = null;
      lineSMA.current = null;
      lineWMA.current = null;
      lineRMA.current = null;
      lineCompare1.current = null;
      lineCompare2.current = null;
      lineCompare3.current = null;
      lineCompare4.current = null;
      allData.current = [];
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

  const getDataCompare = (data: any, originalData: any) => {
    allDataCompare.current = data;
    if (allDataCompare.current.filter((i) => i.sever !== serverId).length === 0) {
      [lineCompare1, lineCompare2, lineCompare3, lineCompare4].map((i) => {
        i.current?.setData([]);
        i.current?.applyOptions({ visible: false });
      });
      candleSeriesRef.current.applyOptions({
        title: '',
        priceFormat: { type: 'price' },
      });
    } else {
      const priceFormatter = (price: number) => `${price.toFixed(2)}%`; // vì giờ đã là % rồi

      const baseA = originalData[0]?.close;

      const performanceCandlesA = originalData.map((c: any) => {
        const low = ((c.low - baseA) / baseA) * 100;
        const high = ((c.high - baseA) / baseA) * 100;
        const close = ((c.close - baseA) / baseA) * 100;

        return {
          time: c.time,
          open: ((c.open - baseA) / baseA) * 100,
          high,
          low,
          close,
          P: (low + high + close) / 3,
        };
      });

      candleSeriesRef.current.setData(performanceCandlesA);
      pLineSeriesRef.current?.setData(performanceCandlesA.map((i: any) => ({ time: i.time, value: i.P })));

      // Vẽ biểu đồ chính
      candleSeriesRef.current.applyOptions({
        title: serverId,
        priceFormat: { type: 'custom', formatter: priceFormatter },
      });

      // So sánh các cặp khác
      allDataCompare.current
        .filter((i: any) => Number(i.sever) !== Number(serverId))
        .map((i: IDataCandCompare, idx: number) => {
          const dataNew = i.data.slice(-applyNumberCandle)
          const baseB = dataNew[0]?.close; // t0 của B
          const lineData = dataNew.map((c: any) => {
            const value = ((c.close - baseB) / baseB) * 100; // % thay đổi
            return {
              time: c.time,
              value: Object.is(value, -0) ? 0 : value, // % thay đổi
            };
          });

          [lineCompare1, lineCompare2, lineCompare3, lineCompare4][idx].current?.setData(lineData as any);

          [lineCompare1, lineCompare2, lineCompare3, lineCompare4][idx].current?.applyOptions({
            title: String(i.sever),
            visible: true,
          });
        });
    }
  };

  useEffect(() => {
    if (symbolsCandCompareSocket?.length === 0) return;
    allDataCompare.current = allDataCompare.current.map((i) => {
      const dataCheck = symbolsCandCompareSocket.find((d: any) => Number(d.login) === Number(i.sever));
      if (Number(i.sever) === Number(dataCheck?.login)) {
        const aaa = mergeLatestData(i.data, convertDataCandline(dataCheck), currentRange).sort(
          (a, b) => a.time - b.time,
        );
        return {
          ...i,
          data: aaa,
        };
      }
      return i;
    });
  }, [symbolsCandCompareSocket, allDataCompare, currentRange]);

  const getDataChart = (data: any) => {
    allData.current = data;
    candleSeriesRef.current.setData([]);
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
    getDataChart(allData.current);
  }, [allData.current]);

  useEffect(() => {
    getDataCompare(symbolsCandCompare, allData.current);
  }, [symbolsCandCompare, allData, serverId]);

  useEffect(() => {
    getDataCompare(allDataCompare.current, allData.current);
  }, [allDataCompare.current, allData.current]);

  useEffect(() => {
    if (pLineSeriesRef.current) {
      pLineSeriesRef.current.applyOptions({ visible: isOpen });
    }
  }, [isOpen]);

  useBollingerBands({
    dataOld: allData.current.length === 0 ? dataOld : allData.current,
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
