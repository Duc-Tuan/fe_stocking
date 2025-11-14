import { ColorType, createChart, type BarData, type ISeriesApi, type UTCTimestamp } from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import { useBollingerBands } from '../../hooks/useBollingerBands';
import { adjustToUTCPlus_7, convertDataCandline, timeOptions, type IDataCandCompare } from '../../pages/Home/options';
import { indicationBB } from '../../pages/Home/type';
import { aggregateCandlesByInterval, getColorChart } from '../../utils/timeRange';
import { calculateEMA, calculateRMA, calculateSMA, calculateWMA } from '../../utils/typeRecipe';
import { mergeLatestData } from '../candlestickSeries/options';
import { covertDataLine, formatVietnamTimeSmart, gridColor } from './formatTime';

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
    indicatorChart,
    currentRange,
    symbolsCandCompare,
    serverId,
    symbolsCandCompareSocket,
    applyNumberCandle,
    colors: {
      backgroundColor = 'transparent',
      lineColor = getColorChart(),
      textColor = 'black',
      areaTopColor = getColorChart(),
    } = {},
  } = props;

  const tooltipRef = useRef<HTMLDivElement>(null);

  const maLine = useRef<ISeriesApi<'Line'> | null>(null);
  const upperLine = useRef<ISeriesApi<'Line'> | null>(null);
  const lowerLine = useRef<ISeriesApi<'Line'> | null>(null);

  const maLine1 = useRef<ISeriesApi<'Line'> | null>(null);
  const upperLine1 = useRef<ISeriesApi<'Line'> | null>(null);
  const lowerLine1 = useRef<ISeriesApi<'Line'> | null>(null);

  const lineSMA = useRef<ISeriesApi<'Line'> | null>(null);
  const lineEMA = useRef<ISeriesApi<'Line'> | null>(null);
  const lineWMA = useRef<ISeriesApi<'Line'> | null>(null);
  const lineRMA = useRef<ISeriesApi<'Line'> | null>(null);

  const lineCompare1 = useRef<ISeriesApi<'Line'> | null>(null);
  const lineCompare2 = useRef<ISeriesApi<'Line'> | null>(null);
  const lineCompare3 = useRef<ISeriesApi<'Line'> | null>(null);
  const lineCompare4 = useRef<ISeriesApi<'Line'> | null>(null);

  const allData = useRef<BarData[]>([]);
  const allDataCompare = useRef<IDataCandCompare[]>([]);

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

    const widthScreen = container!.clientWidth - 70;

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

  const updateSeparators = (data: any[]) => {
    if (!chartRef.current || !data.length) return;

    requestAnimationFrame(() => {
      setTimeout(() => {
        drawDaySeparators(chartRef.current, data);
      }, 80); // Delay để đợi chart render xong
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

    const chart = createChart(chartContainerRef.current!, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      grid: gridColor,
      width: chartContainerRef.current!.clientWidth,
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
    addChartLine(lineSMA, chart, '--color-background-sma');

    addChartLine(lineCompare1, chart, '--color-background-lineCompare1', true);
    addChartLine(lineCompare2, chart, '--color-background-lineCompare2', true);
    addChartLine(lineCompare3, chart, '--color-background-lineCompare3', true);
    addChartLine(lineCompare4, chart, '--color-background-lineCompare4', true);

    chart.priceScale('right').applyOptions({ minimumWidth: 70 });

    seriesRef.current = newSeries;

    indicationBB(chart, maLine, upperLine, lowerLine, 'green');
    indicationBB(chart, maLine1, upperLine1, lowerLine1, '#ff9000');

    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault();
      setMenu({ x: e.clientX, y: e.clientY });
    };

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

      if (allData.current.length) {
        const time = timeOptions.find((i) => i.label === currentRange)?.seconds;
        const data = aggregateCandlesByInterval(allData.current, time);
        updateSeparators(data);
      }

      if (range.from <= 5) {
        setPagination((prev: any) => prev + 1);
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
      maLine.current = null;
      upperLine.current = null;
      lowerLine.current = null;
      maLine1.current = null;
      upperLine1.current = null;
      lowerLine1.current = null;
      lineCompare1.current = null;
      lineCompare2.current = null;
      lineCompare3.current = null;
      lineCompare4.current = null;
      allData.current = [];
      allDataCompare.current = [];
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

  const getDataCompare = (data: any, originalData: any) => {
    allDataCompare.current = data;
    if (allDataCompare.current.filter((i) => i.sever !== serverId).length === 0) {
      [lineCompare1, lineCompare2, lineCompare3, lineCompare4].map((i) => {
        i.current?.setData([]);
        i.current?.applyOptions({ visible: false });
      });
      seriesRef.current.setData(covertDataLine(originalData));
      seriesRef.current.applyOptions({
        title: '',
        priceFormat: { type: 'price' },
      });
    } else {
      const baseEur = originalData[0]?.close;
      const priceFormatter = (price: number) => `${price.toFixed(2)}%`; // vì giờ đã là % rồi

      seriesRef.current.setData(
        originalData.map((i: any) => {
          const close = ((i.close - baseEur) / baseEur) * 100;
          return {
            time: i.time,
            value: Object.is(close, -0) ? 0 : close,
            // close === -0 ? 0 : close, // % thay đổi
          };
        }),
      );

      seriesRef.current.applyOptions({
        title: serverId,
        priceFormat: { type: 'custom', formatter: priceFormatter },
      });

      // So sánh các cặp khác
      allDataCompare.current
        .filter((i: any) => Number(i.sever) !== Number(serverId))
        .map((i: IDataCandCompare, idx: number) => {
          const dataNew = i.data.slice(-applyNumberCandle);
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
        const data = mergeLatestData(i.data, convertDataCandline(dataCheck), currentRange).sort(
          (a, b) => a.time - b.time,
        );
        return {
          ...i,
          data,
        };
      }
      return i;
    });
  }, [symbolsCandCompareSocket, allDataCompare, currentRange]);

  useEffect(() => {
    getDataChart(dataOld);
  }, [dataOld]);

  useEffect(() => {
    getDataCompare(symbolsCandCompare, allData.current);
  }, [symbolsCandCompare, allData.current, serverId]);

  useEffect(() => {
    if (latestData?.length !== 0) {
      allData.current = mergeLatestData(allData.current, latestData, currentRange).sort((a, b) => a.time - b.time);
    }
  }, [latestData, allData, currentRange]);

  useEffect(() => {
    if (allData.current?.length !== 0) {
      getDataChart(allData.current);
    }
  }, [allData.current]);

  useEffect(() => {
    getDataCompare(allDataCompare.current, allData.current);
  }, [allDataCompare.current, allData.current]);

  useBollingerBands({
    dataOld: allData.current.length === 0 ? dataOld : allData.current,
    dataCurrent: indicatorChart.find((i: any) => i.value === 'bb'),
    maLine,
    upperLine,
    lowerLine,
    isVisible: indicatorChart.find((i: any) => i.value === 'bb').active,
  });

  useBollingerBands({
    dataOld: allData.current.length === 0 ? dataOld : allData.current,
    dataCurrent: indicatorChart.find((i: any) => i.value === 'bb1'),
    maLine: maLine1,
    upperLine: upperLine1,
    lowerLine: lowerLine1,
    isVisible: indicatorChart.find((i: any) => i.value === 'bb1').active,
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
