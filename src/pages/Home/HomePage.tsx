import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import type { IChartApi, UTCTimestamp } from 'lightweight-charts';
import React, { useEffect, useMemo, useRef, useState, type Dispatch, type JSX, type SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { getSwapApi, symbolApi } from '../../api/symbol';
import Icon from '../../assets/icon';
import Adr from '../../components/adr/Adr';
import Adx from '../../components/adx/Adx';
import Atr from '../../components/atr/Atr';
import { Button } from '../../components/button';
import { CandlestickSeriesComponent } from '../../components/candlestickSeries';
import { mergeLatestData, type IDataSymbols } from '../../components/candlestickSeries/options';
import { ChartComponent } from '../../components/line';
import { Loading } from '../../components/loading';
import MenuSetupIndicator from '../../components/menuSetupIndicator';
import type { IMenuSub } from '../../components/menuSetupIndicator/type';
import Roc from '../../components/roc/Roc';
import { calculateROC } from '../../components/roc/type';
import Rolling from '../../components/rolling/Rolling';
import { rollingStdDev } from '../../components/rolling/type';
import Rsi from '../../components/rsi/Rsi';
import SetupIndicatorAll from '../../components/setupIndicatorAll';
import Slope from '../../components/slope/Slope';
import { linearRegressionSlopePeriod } from '../../components/slope/type';
import TooltipCustom from '../../components/tooltip';
import Zscore from '../../components/zscore/Zscore';
import { rollingZScore } from '../../components/zscore/type';
import { useAppInfo } from '../../hooks/useAppInfo';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useCurrentPnl } from '../../hooks/useCurrentPnl';
import { useToggle } from '../../hooks/useToggle';
import type { IDataRequest, IOptionsTabsCharts, IPagination } from '../../types/global';
import { getColorChart } from '../../utils/timeRange';
import { calculateEMA, calculateRMA, calculateSMA, calculateWMA } from '../../utils/typeRecipe';
import { VolumeProfileOverlay } from './VolumeProfileOverlay';
import { convertDataCandline, optionsTabsCharts, timeOptions, type IinitialDataCand } from './options';
import {
  dataIndicator,
  dataIndicatorChart,
  dataPeriodDefault,
  drawLabelWithBackground,
  drawSmoothLine,
  FIB_TOLERANCE,
  fibBaseColors,
  fibLevels,
  findStrokeAt,
  formatDateLabel,
  getCssVar,
  groupToCandles,
  isPointNearLine,
  redraw,
  type FibBlock,
  type IDataPeriod,
  type IDataRealTime,
  type Iindicator,
  type TF,
  type Trendline
} from './type';

// Khoảng thời gian 1 nến (M5 = 300 giây)
const BAR_INTERVAL = 300;

export default function HomePage() {
  const { t } = useTranslation();
  const { serverMonitorActive } = useAppInfo();
  const { currentPnl } = useCurrentPnl();

  const chartRefCurentADR = useRef<any>(null);
  const chartRefCurentRSI = useRef<any>(null);
  const chartRefCurentATR = useRef<any>(null);
  const chartRefCurentROC = useRef<any>(null);
  const chartRefCurentSLOPE = useRef<any>(null);
  const chartRefCurentROLLING = useRef<any>(null);
  const chartRefCurentZSCORE = useRef<any>(null);
  const chartRefCurentADX = useRef<any>(null);

  const chartRefCurent = useRef<any>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const candleSeriesRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  const chartRef: any = useRef<IChartApi | null>(null);

  const [isOpen, toggleOpen] = useToggle(true);

  const [currentRange, setCurrentRange] = useState<TF>('M1');

  const [candleIndicator, setCandleIndicator] = useState<IinitialDataCand[]>([]);

  const [symbolsCand, setSymbolsCand] = useState<IinitialDataCand[]>([]);
  const [symbolsCandSocket, setSymbolsCandSocket] = useState<IinitialDataCand[]>([]);

  const [activeTab, setActiveTab] = useState<IOptionsTabsCharts[]>(optionsTabsCharts);
  const [pagination, setPagination] = useState<IPagination>({
    limit: 10000,
    page: 1,
    total: 100,
    totalPage: 1,
    last_time: undefined,
    has_more: false,
  });
  const [loading, setLoading] = useState<boolean>(false);

  const isFetchingRef = useRef<any>(false);

  const serverId: number = useMemo(() => {
    return Number(serverMonitorActive?.value);
  }, [serverMonitorActive?.value]);

  const canvasRef = useRef<any>(null);
  const dragStart = useRef<{ x: number; y: number; a: any; b: any } | null>(null);

  const [fibMode, setFibMode] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [isCheckFibonacci, setIsCheckFibonacci] = useState(false);

  const widthCharRef = useRef<any>(0);

  const [fibBlocks, setFibBlocks] = useState<FibBlock[]>([]);
  const [activeFibId, setActiveFibId] = useState<string | null>(null);

  const overlayRef = useRef<any>(null);
  const isDraggingRef = useRef(false);
  const dragLineIndexRef = useRef<number | null>(null);
  const [hoverPrice, setHoverPrice] = useState<number | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [linesRef, setlinesRef] = useState<{ price: number; id: number }[]>([]);
  const wasDraggingRef = useRef(false);
  const needsRedrawRef = useRef(false);

  const [drawing, setDrawing] = useState(false);
  const canvasTrendLine = useRef<any>(null);
  const [trendlines, setTrendlines] = useState<Trendline[]>([]);
  const tempStartRef = useRef<{ time: number; price: number } | null>(null);
  const tempEndRef = useRef<{ time: number; price: number } | null>(null);
  const draggingLineIndex = useRef<number | null>(null);
  const draggingHandle = useRef<{ lineIndex: number; point: 'start' | 'end' } | null>(null);
  const dragStartTrandLine = useRef<{
    mouseX: number;
    mouseY: number;
    start: Trendline;
  } | null>(null);

  const needRedraw = useRef(false);

  //strokes
  const canvasStrokes = useRef<any>(null);
  const [strokes, setStrokes] = useState<{ time: number; price: number }[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDrawingBrush, setIsDrawingBrush] = useState(false);
  const [draggingStrokeIndex, setDraggingStrokeIndex] = useState<number | null>(null);
  const dragStartStrokes = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentStrokePixels = useRef<{ x: number; y: number }[]>([]);
  const rafRefStrokes = useRef<any>(null);

  const [showIndicator, setShowIndicator] = useState(true);

  const [utilities, setUtilities] = useState<boolean>(false);

  const [dataRealTime, setDataRealTime] = useState<IDataRealTime[]>([]);

  const [dataPeriod, setDataPeriod] = useState<IDataPeriod>(dataPeriodDefault);

  const [indicator, setIndicator] = useState<Iindicator[]>(dataIndicator(dataPeriodDefault));

  const [indicatorChart, setIndicatorChart] = useState<Iindicator[]>(dataIndicatorChart(dataPeriodDefault));

  const [dataReq, setDataReq] = useState<any>([])

  useEffect(() => {
    setIndicator((prev) =>
      prev.map((i) => ({ ...i, period: dataIndicator(dataPeriod).find((d) => d.value === i.value)?.period || 0 })),
    );
    setIndicatorChart((prev) =>
      prev.map((i) => ({ ...i, period: dataIndicatorChart(dataPeriod).find((d) => d.value === i.value)?.period || 0 })),
    );
  }, [dataPeriod]);

  // Gọi api khi page thay đổi
  const getSymbolApi = async (idServer: number) => {
    try {
      const res: IDataRequest<IDataSymbols> = await symbolApi(
        { last_time: pagination.last_time, limit: pagination.limit },
        idServer,
      );

      setPagination((prev) => ({
        ...prev,
        total: res.data.total,
        totalPage: Math.ceil(res.data.total / res.data.limit),
        last_time: res.data.next_cursor,
        has_more: res.data.has_more,
      }));

      setDataReq((prev: any) => [...res.data.data, ...prev])
    } catch (err) {
      console.error('Failed to fetch symbols:', err);
    }
  };

  // gọi api khi serverId đổi
  const getSymbolApiServerId = async (serverId: number) => {
    setLoading(true);
    try {
      const res: IDataRequest<IDataSymbols> = await symbolApi(
        { last_time: undefined, limit: pagination.limit },
        serverId,
      );

      setPagination((prev) => ({
        ...prev,
        total: res.data.total,
        totalPage: Math.ceil(res.data.total / res.data.limit),
        has_more: res.data.has_more,
        last_time: res.data.next_cursor,
      }));

      setDataReq(res.data.data)
    } catch (error) {
      console.error('Failed to fetch symbols:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dataReq) {
      const dataNew = groupToCandles(dataReq, currentRange)
      setSymbolsCand(dataNew);
      setCandleIndicator(dataNew)
    }
  }, [dataReq, currentRange])
  
  useEffect(() => {
    if (currentPnl) {
      setDataRealTime(currentPnl.by_symbol as IDataRealTime[]);
      setSymbolsCandSocket(convertDataCandline(currentPnl));
    }
  }, [currentPnl]);

  useEffect(() => {
    const dataNew = mergeLatestData(candleIndicator, symbolsCandSocket, currentRange).sort((a, b) => a.time - b.time);
    setCandleIndicator(dataNew);
    setSymbolsCand(dataNew)
  }, [symbolsCandSocket]);

  useEffect(() => {
    let ignore = false;

    if (serverMonitorActive?.value && pagination.has_more && !isFetchingRef.current) {
      (async () => {
        isFetchingRef.current = true; // đánh dấu đang gọi API
        try {
          if (!ignore) {
            await getSymbolApi(Number(serverMonitorActive?.value));
          }
        } finally {
          isFetchingRef.current = false; // gọi xong thì reset lại
        }
      })();
    }

    return () => {
      ignore = true;
    };
  }, [pagination.page]);

  function reset() {
    setlinesRef([]);
    setFibBlocks([]);
    dragStart.current = null;
    isFetchingRef.current = null;
    setFibMode(false);
    setDragging(false);
    setActiveFibId(null);
    setIsDrawingMode(false);
    setIsCheckFibonacci(false);
    // setIndicator(dataIndicator(dataPeriodDefault));
    // setCandleIndicator([]);
    if (canvasRef.current) {
      canvasRef.current.style.pointerEvents = 'none';
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    if (overlayRef.current) {
      const ctx = overlayRef.current.getContext('2d');
      ctx?.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    }

    setDrawing(false);
    setTrendlines([]);
    tempStartRef.current = null;
    tempEndRef.current = null;
    draggingLineIndex.current = null;
    draggingHandle.current = null;
    dragStartTrandLine.current = null;
    needRedraw.current = false;
    if (canvasTrendLine.current) {
      const ctx = canvasTrendLine.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasTrendLine.current.width, canvasTrendLine.current.height);
    }

    setStrokes([]);
    setIsDrawing(false);
    setIsDrawingBrush(false);
    setDraggingStrokeIndex(null);
    currentStrokePixels.current = [];
    rafRefStrokes.current = null;
    if (canvasStrokes.current) {
      const ctx = canvasStrokes.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasStrokes.current.width, canvasStrokes.current.height);
    }

    if (canvasRef.current || overlayRef.current || canvasStrokes.current || canvasTrendLine.current) {
      canvasRef.current.style.pointerEvents = 'none';
      overlayRef.current.style.pointerEvents = 'none';
      canvasStrokes.current.style.pointerEvents = 'none';
      canvasTrendLine.current.style.pointerEvents = 'none';
    }
  }

  useEffect(() => {
    if (serverId) {
      setPagination((prev) => ({ ...prev, last_time: undefined }));
      getSymbolApiServerId(serverId);
      setSymbolsCand([]);
      setSymbolsCandSocket([]);
      setCandleIndicator([]);
      reset();
    }
  }, [serverId]);

  // useEffect(() => {
  //   const dataNew: IinitialDataCand[] = dataChart.map((i) => ({ ...i, P: (i.low + i.high + i.close) / 3 }));
  //   setSymbolsCand(dataNew);
  //   setCandleIndicator(dataNew);
  // }, []);

  const handleClick = (selected: IOptionsTabsCharts) => {
    const updated = activeTab.map((tab) => ({
      ...tab,
      active: tab.tabsName === selected.tabsName,
    }));

    if (canvasRef.current && selected.tabsName === 'Biểu đồ đường') {
      reset();
    }
    setIsCheckFibonacci(selected.tabsName === 'Biểu đồ đường');
    setActiveTab(updated);
  };

  const handleRangeChange = (label: TF) => {
    setCurrentRange(label);
  };

  const drawAllTrendlines = () => {
    const canvas = canvasTrendLine.current;
    if (!canvas || !chartRef.current || !candleSeriesRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const timeScale = chartRef.current.timeScale();

    trendlines.forEach((line) => {
      const x1 = timeScale.timeToCoordinate(line.start.time as any);
      const y1 = candleSeriesRef.current.priceToCoordinate(line.start.price);
      const x2 = timeScale.timeToCoordinate(line.end.time as any);
      const y2 = candleSeriesRef.current.priceToCoordinate(line.end.price);
      if (x1 && x2 && y1 && y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 1;
        ctx.stroke();
        if (drawing) {
          [
            [x1, y1],
            [x2, y2],
          ].forEach(([xx, yy]) => {
            ctx.beginPath();
            ctx.arc(xx, yy, 4, 0, 2 * Math.PI);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.strokeStyle = 'blue';
            ctx.stroke();
          });
        }
      }
    });

    // vẽ tạm line mới
    if (tempStartRef.current && tempEndRef.current) {
      const x1 = timeScale.timeToCoordinate(tempStartRef.current.time as any);
      const y1 = candleSeriesRef.current.priceToCoordinate(tempStartRef.current.price);
      const x2 = timeScale.timeToCoordinate(tempEndRef.current.time as any);
      const y2 = candleSeriesRef.current.priceToCoordinate(tempEndRef.current.price);
      if (x1 && x2 && y1 && y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = getCssVar('--color-background');
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (x1 && y1) {
        ctx.beginPath();
        ctx.arc(x1, y1, 4, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = getCssVar('--color-background');
        ctx.stroke();
      }
    }
  };

  const canvasAdd = () => {
    if (!chartContainerRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '8px';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '10';
    canvas.style.paddingLeft = '8px';
    chartContainerRef.current.appendChild(canvas);
    return canvas;
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Nếu đã có rồi thì không tạo thêm
    if (!canvasRef.current) {
      canvasRef.current = canvasAdd();
    }

    if (!overlayRef.current) {
      overlayRef.current = canvasAdd();
    }

    if (!canvasTrendLine.current) {
      canvasTrendLine.current = canvasAdd();
    }

    if (!canvasStrokes.current) {
      canvasStrokes.current = canvasAdd();
    }

    const resize = () => {
      if (!canvasRef.current || !chartContainerRef.current) return;
      const widthChart = chartContainerRef.current!.clientWidth;
      const height =
        indicator.filter((a) => a.active).length > 1
          ? chartContainerRef.current!.clientHeight + 240
          : chartContainerRef.current!.clientHeight;
      canvasRef.current.width = widthChart;
      canvasRef.current.height = height;

      overlayRef.current.width = widthChart;
      overlayRef.current.height = height;

      canvasTrendLine.current.width = widthChart - 70;
      canvasTrendLine.current.height = height;

      canvasStrokes.current.width = widthChart - 70;
      canvasStrokes.current.height = height;
      triggerDrawFib();
      requestRedraw();
      drawAllTrendlines();
    };
    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      if (overlayRef.current && chartContainerRef.current?.contains(overlayRef.current)) {
        chartContainerRef.current.removeChild(overlayRef.current);
        overlayRef.current = null;
      }
      if (canvasRef.current && chartContainerRef.current?.contains(canvasRef.current)) {
        chartContainerRef.current.removeChild(canvasRef.current);
        canvasRef.current = null;
      }
      if (canvasTrendLine.current && chartContainerRef.current?.contains(canvasTrendLine.current)) {
        chartContainerRef.current.removeChild(canvasTrendLine.current);
        canvasTrendLine.current = null;
      }
      if (canvasStrokes.current && chartContainerRef.current?.contains(canvasStrokes.current)) {
        chartContainerRef.current.removeChild(canvasStrokes.current);
        canvasStrokes.current = null;
      }
    };
  }, [chartContainerRef.current]);

  useEffect(() => {
    if (!chartRef.current) return;
    widthCharRef.current = chartRef.current.timeScale().width();
    getSwapApi();
  }, []);

  const drawFib = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !chartRef.current || !candleSeriesRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

    const canvasW = canvasRef.current.width;
    const canvasH = canvasRef.current.height;

    // 👉 Chart area thực sự
    const chartW = canvasW - 70; // chừa Y-axis bên phải
    const chartH =
      canvasH -
      28 -
      (indicator.filter((a) => a.active).length > 1 ? 238 : indicator.filter((a) => a.active).length === 1 ? 115 : 0); // chừa time-axis bên dưới

    ctx.clearRect(0, 0, canvasW, canvasH);

    // 👉 Giới hạn vùng vẽ chỉ trong chart area
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, chartW, chartH);
    ctx.clip();

    fibBlocks.forEach((block, id) => {
      const { anchorA, anchorB } = block;
      if (!anchorA || !anchorB) return;

      const priceScale = candleSeriesRef.current;
      const timeScale = chartRef.current.timeScale();

      const x1 = timeScale.timeToCoordinate(anchorA.time);
      const x2 = timeScale.timeToCoordinate(anchorB.time);
      if (x1 == null || x2 == null) return;

      // 👉 Tính các biến chung ở đây
      const high = Math.max(anchorA.price, anchorB.price);
      const low = Math.min(anchorA.price, anchorB.price);
      const diff = high - low;
      const up = anchorA.price < anchorB.price;

      // Giờ mới forEach fibLevels
      fibLevels.forEach((l, idx) => {
        const price = up ? high - diff * l : low + diff * l;
        const y = priceScale.priceToCoordinate(price);
        if (y == null) return;

        const baseColor = fibBaseColors[idx % fibBaseColors.length];

        if (idx < fibLevels.length - 1) {
          const nextPrice = up ? high - diff * fibLevels[idx + 1] : low + diff * fibLevels[idx + 1];

          const y2 = priceScale.priceToCoordinate(nextPrice);
          if (y2 != null) {
            ctx.fillStyle = `rgba(${baseColor}, 0.2)`;
            ctx.fillRect(Math.min(x1!, x2!), y, Math.abs(x2! - x1!), y2 - y);

            ctx.strokeStyle = `rgba(${baseColor}, 1)`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(x1!, y);
            ctx.lineTo(x2!, y);
            ctx.stroke();
          }
        }

        // Label bên trái
        ctx.fillStyle = `rgba(${baseColor}, 1)`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${l} (${price.toFixed(2)})`, Math.min(x1!, x2!) - 5, y);
      });

      if (isCheckFibonacci) {
        // === Vẽ đường đứt nối anchorA ↔ anchorB ===
        ctx.beginPath();
        ctx.setLineDash([6, 6]);
        ctx.moveTo(x1, priceScale.priceToCoordinate(anchorA.price)!);
        ctx.lineTo(x2, priceScale.priceToCoordinate(anchorB.price)!);
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]); // reset dash

        // handle tròn
        const drawHandle = (anchor: { time: number; price: number }) => {
          const xx = timeScale.timeToCoordinate(anchor.time);
          const yy = priceScale.priceToCoordinate(anchor.price);
          if (xx == null || yy == null) return;
          ctx.beginPath();
          ctx.arc(xx, yy, 6, 0, 2 * Math.PI);
          ctx.fillStyle = 'white';
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = getCssVar('--color-background');
          ctx.stroke();
        };

        const ts = chartRef.current.timeScale();
        const width = Math.abs(x2 - x1);
        const left = Math.min(x1, x2);

        // Lấy chiều cao canvas
        const h = canvasRef.current!.height;

        // Vẽ 1 dải màu ở cuối (gần trục X)
        ctx.fillStyle = getCssVar('--color-background-opacity-2'); // xanh nhạt
        ctx.fillRect(left, h - 20, width, 20); // cao 20px ở sát đáy chart

        // === Vẽ label thời gian A và B ===
        const timeA = ts.coordinateToTime(x1); // lấy time gốc từ chart
        const timeB = ts.coordinateToTime(x2);

        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        if (timeA) {
          const text = formatDateLabel(timeA);
          ctx.font = '12px Arial';
          const metrics = ctx.measureText(text);
          const paddingX = 4;
          const paddingY = 6;
          const textWidth = metrics.width + paddingX * 4;
          const textHeight = 20; // fix height (12px font + padding)
          const rectX = x1 - textWidth / 2;
          const rectY = h - 20; // đặt cao hơn chút so với fillRect dưới trục

          // Vẽ nền đậm
          ctx.fillStyle = getCssVar('--color-background');
          ctx.fillRect(rectX, rectY, textWidth, textHeight);

          // Vẽ chữ trắng
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(text, x1, rectY + paddingY);
        }
        if (timeB) {
          const text = formatDateLabel(timeB);
          ctx.font = '12px Arial';
          const metrics = ctx.measureText(text);
          const paddingX = 4;
          const paddingY = 6;
          const textWidth = metrics.width + paddingX * 2;
          const textHeight = 20;
          const rectX = x2 - textWidth / 2;
          const rectY = h - 20;

          ctx.fillStyle = getCssVar('--color-background');
          ctx.fillRect(rectX, rectY, textWidth, textHeight);

          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(text, x2, rectY + paddingY);
        }

        drawHandle(anchorA);
        drawHandle(anchorB);
      }
    });

    // 👉 Kết thúc vùng clip
    ctx.restore();

    // ===========================
    // Vẽ phần ngoài chart (time axis, y-axis background…)
    // ===========================

    const heightX = 28;
    // Dải màu trục X (20px dưới)
    if (isCheckFibonacci) {
      fibBlocks.forEach((block) => {
        const { anchorA, anchorB } = block;
        if (!anchorA || !anchorB) return;

        const ts = chartRef.current.timeScale();

        const x1 = ts.timeToCoordinate(anchorA.time);
        const x2 = ts.timeToCoordinate(anchorB.time);
        if (x1 == null || x2 == null) return;

        const width = Math.abs(x2 - x1);
        const left = Math.min(x1, x2);

        // Lấy chiều cao canvas
        const h = canvasRef.current!.height;

        // Vẽ 1 dải màu ở cuối (gần trục X)
        ctx.fillStyle = getCssVar('--color-background-opacity-2'); // xanh nhạt
        ctx.fillRect(left, h - heightX, width, heightX); // cao 20px ở sát đáy chart

        // === Vẽ label thời gian A và B ===
        const timeA = ts.coordinateToTime(x1);
        const timeB = ts.coordinateToTime(x2);

        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        if (timeA) {
          const text = formatDateLabel(timeA);
          const metrics = ctx.measureText(text);
          const paddingX = 4;
          const paddingY = 6;
          const textWidth = metrics.width + paddingX * 4;
          const textHeight = heightX;
          const rectX = x1 - textWidth / 2;
          const rectY = h - heightX;

          ctx.fillStyle = getCssVar('--color-background');
          ctx.fillRect(rectX, rectY, textWidth, textHeight);

          ctx.fillStyle = 'white';
          ctx.fillText(text, x1, rectY + paddingY + 4);
        }

        if (timeB) {
          const text = formatDateLabel(timeB);
          const metrics = ctx.measureText(text);
          const paddingX = 4;
          const paddingY = 6;
          const textWidth = metrics.width + paddingX * 2;
          const textHeight = heightX;
          const rectX = x2 - textWidth / 2;
          const rectY = h - heightX;

          ctx.fillStyle = getCssVar('--color-background');
          ctx.fillRect(rectX, rectY, textWidth, textHeight);

          ctx.fillStyle = 'white';
          ctx.fillText(text, x2, rectY + paddingY + 4);
        }

        //Trục Y
        const priceScale = candleSeriesRef.current;

        const high = Math.max(anchorA.price, anchorB.price);
        const low = Math.min(anchorA.price, anchorB.price);
        const diff = high - low;
        const up = anchorA.price < anchorB.price;

        fibLevels.forEach((l, idx) => {
          if (idx < 6) {
            const price = up ? high - diff * l : low + diff * l;
            const nextPrice = up ? high - diff * fibLevels[idx + 1] : low + diff * fibLevels[idx + 1];
            const y = priceScale.priceToCoordinate(price);
            const y2 = priceScale.priceToCoordinate(nextPrice);
            if (y == null || y2 == null) return;

            const axisWidth = 70;
            const priceScaleLeft = chartW;

            const top = Math.min(y, y2);
            const height = Math.abs(y2 - y);

            ctx.fillStyle = getCssVar('--color-background-opacity-2');
            ctx.fillRect(priceScaleLeft, top, axisWidth, height);

            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (idx === 0) {
              drawLabelWithBackground(ctx, price.toFixed(2), priceScaleLeft + axisWidth / 2, y);
            }
            if (idx === 5) {
              drawLabelWithBackground(ctx, nextPrice.toFixed(2), priceScaleLeft + axisWidth / 2, y2);
            }
          }
        });
      });
    }
  };

  const rafRefFib = useRef<number>(null);

  const triggerDrawFib = () => {
    if (rafRefFib.current) cancelAnimationFrame(rafRefFib.current);
    rafRefFib.current = requestAnimationFrame(() => {
      drawFib();
    });
  };

  const drawLines = () => {
    const canvas = overlayRef.current;
    const ctx = overlayRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    linesRef.forEach((line) => {
      const y = candleSeriesRef.current.priceToCoordinate(line.price); // ✅ series
      if (y !== null) {
        ctx.save(); // 👈 Lưu trạng thái ban đầu

        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(canvas.width - 70, y + 0.5);
        ctx.strokeStyle = 'blue';
        ctx.stroke();

        // Nội dung text
        const text = line.price.toFixed(2);
        ctx.font = '12px Arial';
        ctx.textBaseline = 'middle'; // căn giữa theo chiều dọc
        ctx.textAlign = 'start'; // 👈 Canh trái cho phần giá
        const textWidth = ctx.measureText(text).width;
        const textHeight = 16; // tạm ước lượng chiều cao font ~14px

        // Toạ độ text (ở cuối vạch)
        const textX = canvas.width - 70;
        const textY = y;

        // Vẽ background (ô chữ nhật bo nhỏ)
        ctx.fillStyle = 'blue'; // nền tối mờ
        ctx.fillRect(textX, textY - textHeight / 2, textWidth + 28, textHeight);

        // Vẽ text đè lên background
        ctx.fillStyle = 'white';
        ctx.fillText(text, textX + 12, textY + 2);

        // === Label thêm ở giữa line ===
        // const midX = canvas.width - 90; // giữa chart (không tính phần trục Y)

        // ctx.fillStyle = 'blue';
        // ctx.textAlign = 'center'; // 👈 cần set lại
        // ctx.fillText(`${t('Đường')} ${line.id}`, midX, y - 5);

        ctx.restore(); // 👈 Trả trạng thái lại
      }
    });

    // vẽ preview
    if (hoverPrice !== null) {
      const y = candleSeriesRef.current.priceToCoordinate(hoverPrice);
      if (y !== null) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(canvas.width - 70, y + 0.5);
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = 0.2;
        ctx.setLineDash([10, 10]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Nội dung text
        const text = hoverPrice.toFixed(2);
        ctx.font = '12px Arial';
        ctx.textBaseline = 'middle'; // căn giữa theo chiều dọc
        const textWidth = ctx.measureText(text).width;
        const textHeight = 16; // tạm ước lượng chiều cao font ~14px

        // Toạ độ text (ở cuối vạch)
        const textX = canvas.width - 70;
        const textY = y;

        // Vẽ background (ô chữ nhật bo nhỏ)
        ctx.fillStyle = getColorChart(); // nền tối mờ
        ctx.fillRect(textX, textY - textHeight / 2, textWidth + 40, textHeight);

        // Vẽ text đè lên background
        ctx.fillStyle = 'white';
        ctx.textAlign = 'start';
        ctx.fillText(text, textX + 12, textY);
      }
    }
  };

  const rafRef = useRef<any>(null);

  const requestRedraw = () => {
    needsRedrawRef.current = true;
  };

  useEffect(() => {
    if (!fibMode) return;

    if (canvasRef.current) {
      canvasRef.current.style.pointerEvents = isCheckFibonacci ? 'auto' : 'none';
    }

    const canvas = canvasRef.current;
    const container = chartContainerRef.current;
    if (!canvas || !container || !chartRef.current || !candleSeriesRef.current) return;

    const priceScale = candleSeriesRef.current;
    const timeScale = chartRef.current.timeScale();

    const setCursor = (cursor: string) => {
      container.style.cursor = cursor;
    };
    const getXY = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleDown = (e: MouseEvent) => {
      if (!chartRef.current || !candleSeriesRef.current) return;
      const priceScale = candleSeriesRef.current;
      const timeScale = chartRef.current.timeScale();

      const { x, y } = getXY(e);
      const price = priceScale.coordinateToPrice(y);

      // Lấy time theo pixel
      let time = timeScale.coordinateToTime(x) as UTCTimestamp | null;

      // Nếu ngoài vùng dữ liệu → fallback sang logical index
      if (!time) {
        const logical = timeScale.coordinateToLogical(x);
        if (logical != null) {
          const firstCandleTime = symbolsCand[0].time as UTCTimestamp;
          time = (firstCandleTime + Math.round(logical) * BAR_INTERVAL) as UTCTimestamp;
        }
      }
      if (price == null || time == null) return;

      let handled = false;

      // ====== Resize trên handle A/B
      const checkHandleHit = (anchor: any, px: number, py: number) => {
        const xx = timeScale.timeToCoordinate(anchor.time);
        const yy = priceScale.priceToCoordinate(anchor.price);
        if (xx == null || yy == null) return false;
        const dx = px - xx,
          dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy) <= 8;
      };

      // === Loop qua fibBlocks để check ===
      fibBlocks.forEach((block) => {
        if (handled) return;
        // resize A
        if (checkHandleHit(block.anchorA, x, y)) {
          setActiveFibId(block.id);
          setFibBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, resizing: 'A' } : b)));
          setDragging(true);
          setCursor('grabbing');
          chartRef.current!.applyOptions({ handleScroll: false, handleScale: false });
          handled = true;
        }
        // resize B
        if (!handled && checkHandleHit(block.anchorB, x, y)) {
          setActiveFibId(block.id);
          setFibBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, resizing: 'B' } : b)));
          setDragging(true);
          setCursor('grabbing');
          chartRef.current!.applyOptions({ handleScroll: false, handleScale: false });
          handled = true;
        }

        // move cả block
        if (!handled && block.done) {
          const high = Math.max(block.anchorA.price, block.anchorB.price);
          const low = Math.min(block.anchorA.price, block.anchorB.price);
          const diff = high - low;
          const up = block.anchorA.price < block.anchorB.price;

          const yHigh = priceScale.priceToCoordinate(high)!;
          const yLow = priceScale.priceToCoordinate(low)!;

          const x1 = timeScale.timeToCoordinate(block.anchorA.time)!;
          const x2 = timeScale.timeToCoordinate(block.anchorB.time)!;

          const fibRect = {
            left: Math.min(x1, x2),
            right: Math.max(x1, x2),
            top: Math.min(yHigh, yLow),
            bottom: Math.max(yHigh, yLow),
          };

          let isOnLine = false;
          for (const lvl of fibLevels) {
            const priceLvl = up ? high - diff * lvl : low + diff * lvl;
            const yLevel = priceScale.priceToCoordinate(priceLvl);
            if (yLevel != null && Math.abs(y - yLevel) <= FIB_TOLERANCE && x >= fibRect.left && x <= fibRect.right) {
              isOnLine = true;
              break;
            }
          }

          if (isOnLine) {
            setActiveFibId(block.id);
            dragStart.current = { x, y, a: { ...block.anchorA }, b: { ...block.anchorB } };
            setFibBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, moving: true } : b)));
            setDragging(true);
            setCursor('grabbing');
            chartRef.current!.applyOptions({ handleScroll: false, handleScale: false });
            handled = true;
          }
        }
      });

      // === Nếu chưa handled → tạo block mới ===
      if (!handled) {
        const newBlock: FibBlock = {
          id: Date.now().toString(),
          anchorA: { time, price },
          anchorB: { time, price },
          done: false,
        };
        setFibBlocks((prev) => [...prev, newBlock]);
        setActiveFibId(newBlock.id);
        setDragging(true);
        setCursor('grabbing');
        chartRef.current.applyOptions({ handleScroll: false, handleScale: false });
        handled = true;
      }

      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleMove = (e: MouseEvent) => {
      if (!dragging) return;
      const { x, y } = getXY(e);
      const price = priceScale.coordinateToPrice(y);

      // Lấy time theo pixel
      let time = timeScale.coordinateToTime(x) as UTCTimestamp | null;

      // Nếu ngoài vùng dữ liệu → fallback sang logical index
      if (!time) {
        const logical = timeScale.coordinateToLogical(x);
        if (logical != null) {
          const firstCandleTime = symbolsCand[0].time as UTCTimestamp;
          time = (firstCandleTime + Math.round(logical) * BAR_INTERVAL) as UTCTimestamp;
        }
      }
      if (price == null || time == null) return;

      setCursor('grabbing');
      setFibBlocks((prev) =>
        prev.map((block) => {
          if (block.id !== activeFibId) return block;

          // tạo mới → kéo anchorB
          if (!block.done && dragging) {
            return { ...block, anchorB: { time, price } };
          }

          // resize
          if (block.resizing === 'A') {
            return { ...block, anchorA: { time, price } };
          }
          if (block.resizing === 'B') {
            return { ...block, anchorB: { time, price } };
          }

          // move cả block
          if (block.moving && dragStart.current) {
            const dx = x - dragStart.current.x;
            const dy = y - dragStart.current.y;

            const aX = timeScale.timeToCoordinate(dragStart.current.a.time)!;
            const bX = timeScale.timeToCoordinate(dragStart.current.b.time)!;

            const newAX = aX + dx;
            const newBX = bX + dx;

            const newATime = timeScale.coordinateToTime(newAX);
            const newBTime = timeScale.coordinateToTime(newBX);

            const aY = priceScale.priceToCoordinate(dragStart.current.a.price)!;
            const bY = priceScale.priceToCoordinate(dragStart.current.b.price)!;

            const newAY = aY + dy;
            const newBY = bY + dy;

            const newAPrice = priceScale.coordinateToPrice(newAY);
            const newBPrice = priceScale.coordinateToPrice(newBY);

            if (newATime && newBTime && newAPrice != null && newBPrice != null) {
              return {
                ...block,
                anchorA: { time: newATime as UTCTimestamp, price: newAPrice },
                anchorB: { time: newBTime as UTCTimestamp, price: newBPrice },
              };
            }
          }
          return block;
        }),
      );
    };

    // === HANDLE UP ===
    const handleUp = () => {
      if (!dragging || !activeFibId) return;
      setFibBlocks((prev) =>
        prev.map((block) =>
          block.id === activeFibId ? { ...block, done: true, moving: false, resizing: null } : block,
        ),
      );

      setDragging(false);
      setActiveFibId(null);
      chartRef.current!.applyOptions({ handleScroll: true, handleScale: true });
      setCursor('default');
    };

    if (!fibMode || !chartRef.current) return;

    timeScale && timeScale.subscribeVisibleLogicalRangeChange(triggerDrawFib);
    timeScale && timeScale.subscribeVisibleTimeRangeChange(triggerDrawFib);

    if (fibMode) {
      triggerDrawFib();
    }

    // Quan trọng: lắng nghe trên CANVAS với capture để chặn chart
    canvas.addEventListener('mousedown', handleDown, { capture: true });
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);

    return () => {
      timeScale && timeScale.unsubscribeVisibleTimeRangeChange(triggerDrawFib);
      timeScale && timeScale.unsubscribeVisibleLogicalRangeChange(triggerDrawFib);
      if (rafRefFib.current) cancelAnimationFrame(rafRefFib.current);
      rafRefFib.current = null;
      if (canvas) canvas.removeEventListener('mousedown', handleDown, { capture: true } as any);
      // window.removeEventListener("resize", resize);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [fibMode, dragging, activeFibId, fibBlocks, isCheckFibonacci, indicator]);

  const handleDelete = (title: 'fibonacci' | 'line' | 'trendLine' | 'brush', idx: number) => {
    if (title === 'fibonacci') {
      if (idx >= 0) {
        const dataNew = fibBlocks.filter((_, id) => id !== idx);
        setFibBlocks(dataNew);
      }
    }
    if ((title === 'line' || title === 'fibonacci' || title === 'trendLine' || title === 'brush') && idx < 0) {
      setFibBlocks([]);
      setlinesRef([]);
      setTrendlines([]);
      setStrokes([]);
    }
    if (title === 'line') {
      if (idx >= 0) {
        const dataNew = linesRef.filter((_) => _.id !== idx);
        setlinesRef(dataNew);
      }
    }
    if (title === 'trendLine') {
      if (idx >= 0) {
        const dataNew = trendlines.filter((_, id) => id !== idx);
        setTrendlines(dataNew);
      }
    }
    if (title === 'brush') {
      if (idx >= 0) {
        const dataNew = strokes.filter((_, id) => id !== idx);
        setStrokes(dataNew);
      }
    }
  };

  useEffect(() => {
    if (!chartRefCurent.current) return;
    const width = chartContainerRef.current!.clientWidth;
    if (chartRefCurentADR.current) {
      chartRefCurentADR.current.applyOptions({ width: width });
    }
    if (chartRefCurentATR.current) {
      chartRefCurentATR.current.applyOptions({ width: width });
    }
    if (chartRefCurentRSI.current) {
      chartRefCurentRSI.current.applyOptions({ width: width });
    }
    if (chartRefCurentROC.current) {
      chartRefCurentROC.current.applyOptions({ width: width });
    }
    if (chartRefCurentSLOPE.current) {
      chartRefCurentSLOPE.current.applyOptions({ width: width });
    }
    if (chartRefCurentROLLING.current) {
      chartRefCurentROLLING.current.applyOptions({ width: width });
    }
    if (chartRefCurentZSCORE.current) {
      chartRefCurentZSCORE.current.applyOptions({ width: width });
    }
    if (chartRefCurentADX.current) {
      chartRefCurentADX.current.applyOptions({ width: width });
    }
  }, [utilities]);

  useEffect(() => {
    if (!chartRefCurent.current) return;
    const dataActiveTab: Iindicator[] = indicator.filter((a) => a.active);

    chartRefCurent.current.applyOptions({
      timeScale: {
        visible: !indicator.some((a) => a.active),
      },
      height: indicator.some((a) => a.active) ? (dataActiveTab.length === 2 ? 430 : 480) : 620,
    });

    const height = chartContainerRef.current!.clientHeight;

    switch (indicator.filter((a) => a.active).length) {
      case 2:
        overlayRef.current.height = height - 70;
        canvasTrendLine.current.height = height - 70;
        canvasStrokes.current.height = height - 70;
        canvasRef.current.height = 628;
        chartRefCurent.current.applyOptions({
          height: 356,
        });
        break;
      case 1:
        overlayRef.current.height = height;
        canvasStrokes.current.height = height;
        canvasTrendLine.current.height = height;
        canvasRef.current.height = 625;
        break;
      default:
        overlayRef.current.height = height - 28;
        canvasStrokes.current.height = height - 28;
        canvasTrendLine.current.height = height - 28;
        canvasRef.current.height = height;
        break;
    }

    const chartAcitaveTime: (a?: string) => React.RefObject<any> = (a?: string) => {
      switch (a) {
        case 'rsi':
          return chartRefCurentRSI;
        case 'adr':
          return chartRefCurentADR;
        case 'atr':
          return chartRefCurentATR;
        case 'roc':
          return chartRefCurentROC;
        case 'slope':
          return chartRefCurentSLOPE;
        case 'rolling':
          return chartRefCurentROLLING;
        case 'zscore':
          return chartRefCurentZSCORE;
        case 'adx':
          return chartRefCurentADX;
        default:
          return chartRefCurentRSI;
      }
    };

    dataActiveTab.map((d, idx) => {
      if (idx === dataActiveTab.length - 1) {
        chartAcitaveTime(String(d.value)).current.applyOptions({
          height: 147,
          timeScale: {
            visible: true,
          },
        });
      } else {
        chartAcitaveTime(String(d.value)).current.applyOptions({
          height: 120,
          timeScale: {
            visible: false,
          },
        });
      }
    });
  }, [indicator, activeTab]);

  useEffect(() => {
    if (!overlayRef.current && !chartContainerRef.current && !candleSeriesRef.current && !chartRef.current) return;

    const setCursor = (cursor: string) => {
      overlayRef.current && (overlayRef.current.style.cursor = cursor);
    };

    const subrequestRedraw = () => {
      requestRedraw();
    };

    // redraw khi chart thay đổi
    chartRef.current?.subscribeCrosshairMove(subrequestRedraw);

    if (overlayRef.current) {
      overlayRef.current.style.pointerEvents = isDrawingMode ? 'auto' : 'none';
    }

    const click = (e: any) => {
      if (!isDrawingMode || wasDraggingRef.current) {
        wasDraggingRef.current = false; // reset sau khi bỏ qua
        return;
      }

      const rect = overlayRef.current.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const price = candleSeriesRef.current.coordinateToPrice(mouseY);
      if (price !== null) {
        setlinesRef((prev) => {
          // Thêm phần tử mới vào cuối
          let updated = [...prev, { price: Number(price.toFixed(2)), id: 0 }];

          // Nếu dài hơn 4, xóa phần tử đầu tiên
          if (updated.length > 4) {
            updated.shift();
          }

          // Đánh lại id từ 1 → n
          updated = updated.map((item, index) => ({
            ...item,
            id: index + 1,
          }));
          return updated;
        });
        setHoverPrice(null);
        requestRedraw();
      }
    };

    const mousedown = (e: any) => {
      if (!overlayRef.current) return;
      const rect = overlayRef.current.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;

      // check click gần line nào
      linesRef.forEach((line) => {
        const y = candleSeriesRef.current.priceToCoordinate(line.price);
        if (y && Math.abs(mouseY - y) < 12) {
          // phạm vi ±6px
          isDraggingRef.current = true;
          dragLineIndexRef.current = line.id;
          wasDraggingRef.current = false; // reset
          setCursor('grabbing');
        }
      });
    };

    const mouseleave = () => {
      setHoverPrice(null);
      requestRedraw();
    };

    const mousemove = (e: any) => {
      const rect = overlayRef.current.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const price = candleSeriesRef.current.coordinateToPrice(mouseY);

      if (isDraggingRef.current && dragLineIndexRef.current !== null) {
        if (price !== null) {
          setlinesRef((prev) => {
            const dataNew = prev.map((i) => {
              if (i.id === dragLineIndexRef.current) {
                return { ...i, price: Number(price.toFixed(2)) };
              }
              return i;
            });
            return dataNew;
          });
          wasDraggingRef.current = true; // có kéo thật sự
        }
      } else if (isDrawingMode) {
        setHoverPrice(price !== null ? Number(price) : null);
      }
      requestRedraw();
    };

    const handleUp = () => {
      isDraggingRef.current = false;
      dragLineIndexRef.current = null;
      setCursor('default');
    };

    overlayRef.current.addEventListener('click', click);
    overlayRef.current.addEventListener('mousedown', mousedown);
    overlayRef.current.addEventListener('mouseleave', mouseleave);
    overlayRef.current.addEventListener('mousemove', mousemove);
    overlayRef.current.addEventListener('mouseup', handleUp);

    requestRedraw();

    const renderLoop = () => {
      if (needsRedrawRef.current) {
        drawLines();
        needsRedrawRef.current = false;
      }
      rafRef.current = requestAnimationFrame(renderLoop);
    };
    rafRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (chartRef.current) chartRef.current.unsubscribeCrosshairMove(subrequestRedraw);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;

      if (overlayRef.current) {
        overlayRef.current.removeEventListener('mouseleave', mouseleave);
        overlayRef.current.removeEventListener('mousedown', mousedown);
        overlayRef.current.removeEventListener('mousemove', mousemove);
        overlayRef.current.removeEventListener('mouseup', handleUp);
        overlayRef.current.removeEventListener('click', click);
      }
    };
  }, [isDrawingMode, hoverPrice, linesRef]);

  // events
  useEffect(() => {
    if (!canvasTrendLine.current || !chartRef.current || !candleSeriesRef.current) return;
    const setCursor = (cursor: string) => {
      canvasTrendLine.current && (canvasTrendLine.current.style.cursor = cursor);
    };

    if (canvasTrendLine.current) {
      canvasTrendLine.current.style.pointerEvents = drawing ? 'auto' : 'none';
    }

    const subrequestRedraw = () => {
      drawAllTrendlines();
    };

    // redraw khi chart thay đổi
    chartRef.current?.subscribeCrosshairMove(subrequestRedraw);

    const handleDown = (e: MouseEvent) => {
      const rect = canvasTrendLine.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const timeScale = chartRef.current!.timeScale();

      // check trúng line
      for (let i = 0; i < trendlines.length; i++) {
        const line = trendlines[i];
        const x1 = timeScale.timeToCoordinate(line.start.time as any);
        const y1 = candleSeriesRef.current.priceToCoordinate(line.start.price);
        const x2 = timeScale.timeToCoordinate(line.end.time as any);
        const y2 = candleSeriesRef.current.priceToCoordinate(line.end.price);

        if (x1 && y1 && Math.hypot(x - x1, y - y1) < 10) {
          draggingHandle.current = { lineIndex: i, point: 'start' };
          return;
        }
        if (x2 && y2 && Math.hypot(x - x2, y - y2) < 10) {
          draggingHandle.current = { lineIndex: i, point: 'end' };
          return;
        }
        if (x1 && x2 && y1 && y2 && isPointNearLine(x, y, x1, y1, x2, y2, 10)) {
          draggingLineIndex.current = i;
          dragStartTrandLine.current = { mouseX: x, mouseY: y, start: line };
          return;
        }
        setCursor('grabbing');
      }

      // vẽ line mới
      const time = timeScale.coordinateToTime(x);
      const price = candleSeriesRef.current.coordinateToPrice(y);
      if (!time || !price) return;
      if (!tempStartRef.current) {
        tempStartRef.current = { time, price };
      } else {
        const newLine: Trendline = { start: tempStartRef.current, end: { time, price } };
        setTrendlines((prev) => [...prev, newLine]);
        tempStartRef.current = null;
        tempEndRef.current = null;
      }
      needRedraw.current = true;
    };

    const handleMove = (e: MouseEvent) => {
      const rect = canvasTrendLine.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const timeScale = chartRef.current!.timeScale();

      if (draggingLineIndex.current !== null && dragStartTrandLine.current) {
        const dx = x - dragStartTrandLine.current.mouseX;
        const dy = y - dragStartTrandLine.current.mouseY;

        const start = dragStartTrandLine.current.start;

        const x1 = timeScale.timeToCoordinate(start.start.time as any)! + dx;
        const x2 = timeScale.timeToCoordinate(start.end.time as any)! + dx;

        const newStartTime = timeScale.coordinateToTime(x1) as UTCTimestamp;
        const newEndTime = timeScale.coordinateToTime(x2) as UTCTimestamp;

        const y1 = candleSeriesRef.current.priceToCoordinate(start.start.price)! + dy;
        const y2 = candleSeriesRef.current.priceToCoordinate(start.end.price)! + dy;

        const newStartPrice = candleSeriesRef.current.coordinateToPrice(y1)!;
        const newEndPrice = candleSeriesRef.current.coordinateToPrice(y2)!;

        if (newStartTime && newEndTime && newStartPrice && newEndPrice) {
          const dataNew = trendlines.map((i, id) => {
            if (id === draggingLineIndex.current) {
              return {
                start: { time: newStartTime, price: newStartPrice },
                end: { time: newEndTime, price: newEndPrice },
              };
            }
            return i;
          });
          setTrendlines(dataNew);
          needRedraw.current = true;
        }
        setCursor('grabbing');
        return;
      }

      if (draggingHandle.current) {
        const { lineIndex, point } = draggingHandle.current; // copy ra biến cục bộ
        const time = timeScale.coordinateToTime(x);
        const price = candleSeriesRef.current.coordinateToPrice(y);
        if (!time || !price) return;

        setTrendlines((prev) => {
          const newArr = [...prev];
          if (!newArr[lineIndex]) return prev; // tránh out-of-bound
          newArr[lineIndex] = {
            ...newArr[lineIndex],
            [point]: { time, price },
          };
          return newArr;
        });

        needRedraw.current = true;
        setCursor('grabbing');
        return;
      }

      if (tempStartRef.current) {
        const time = timeScale.coordinateToTime(x);
        const price = candleSeriesRef.current.coordinateToPrice(y);
        if (time && price) {
          tempEndRef.current = { time, price };
          needRedraw.current = true;
        }
        setCursor('grabbing');
      }
    };

    const handleUp = () => {
      draggingLineIndex.current = null;
      draggingHandle.current = null;
      dragStartTrandLine.current = null;
      setCursor('default');
    };

    canvasTrendLine.current.addEventListener('mousedown', handleDown, { capture: true });
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);

    drawAllTrendlines();

    let raf: number;

    const renderLoop = () => {
      if (needRedraw.current) {
        drawAllTrendlines();
        needRedraw.current = false;
      }
      raf = requestAnimationFrame(renderLoop);
    };
    raf = requestAnimationFrame(renderLoop);

    const timeScale = chartRef.current?.timeScale()!;

    timeScale && timeScale?.subscribeVisibleTimeRangeChange(drawAllTrendlines);
    timeScale && timeScale?.subscribeVisibleLogicalRangeChange(drawAllTrendlines);
    return () => {
      timeScale && timeScale.unsubscribeVisibleTimeRangeChange(drawAllTrendlines);
      cancelAnimationFrame(raf);
      chartRef.current && chartRef.current.unsubscribeCrosshairMove(subrequestRedraw);
      timeScale && timeScale.unsubscribeVisibleLogicalRangeChange(drawAllTrendlines);
      canvasTrendLine.current &&
        canvasTrendLine.current?.removeEventListener('mousedown', handleDown, { capture: true } as any);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [drawing, trendlines]);

  const requestRedrawStrokes = () => {
    if (canvasStrokes.current && chartRef.current) {
      redraw(canvasStrokes, strokes, chartRef, candleSeriesRef, isDrawingBrush);
    }
  };

  useEffect(() => {
    if (!canvasStrokes.current && !chartRef.current) return;

    const setCursor = (cursor: string) => {
      canvasStrokes.current && (canvasStrokes.current.style.cursor = cursor);
    };

    canvasStrokes.current.style.pointerEvents = isDrawingBrush ? 'auto' : 'none';

    const subrequestRedraw = () => {
      requestRedrawStrokes();
    };

    // redraw khi chart thay đổi
    chartRef.current?.subscribeCrosshairMove(subrequestRedraw);

    const handleMouseDown = (e: MouseEvent) => {
      const x = e.offsetX;
      const y = e.offsetY;

      const time = chartRef.current.timeScale().coordinateToTime(x);
      const price = candleSeriesRef.current.coordinateToPrice(y);

      if (!time || price == null) return;

      // kiểm tra có hit stroke không
      const hitIndex = findStrokeAt(strokes, x, y, chartRef, candleSeriesRef);
      if (hitIndex !== null) {
        setDraggingStrokeIndex(hitIndex);
        dragStartStrokes.current = { x, y };
        return;
      }

      // bắt đầu vẽ mới
      setIsDrawing(true);
      currentStrokePixels.current = [{ x, y }];
      setCursor('default');
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing && draggingStrokeIndex === null) return;

      const x = e.offsetX;
      const y = e.offsetY;

      // kéo stroke
      if (draggingStrokeIndex !== null) {
        const dx = x - dragStartStrokes.current.x;
        const dy = y - dragStartStrokes.current.y;

        const baseStroke = strokes[draggingStrokeIndex];

        const draggedPixels = baseStroke.map((p) => {
          const xx = chartRef.current.timeScale().timeToCoordinate(p.time)! + dx;
          const yy = candleSeriesRef.current.priceToCoordinate(p.price)! + dy;
          return { x: xx, y: yy };
        });

        // Vẽ lại toàn bộ strokes NHƯNG bỏ stroke cũ ra
        const ctx = canvasStrokes.current!.getContext('2d')!;
        ctx.clearRect(0, 0, canvasStrokes.current!.width, canvasStrokes.current!.height);

        redraw(
          canvasStrokes,
          strokes.filter((_, i) => i !== draggingStrokeIndex), // ❌ bỏ stroke cũ
          chartRef,
          candleSeriesRef,
          isDrawingBrush,
        );

        // ✅ vẽ stroke đang kéo
        drawSmoothLine(ctx, draggedPixels);
        setCursor('grabbing');
        return;
      }

      const ctx = canvasStrokes.current!.getContext('2d')!;

      // vẽ stroke mới (chỉ lưu pixel)
      const last = currentStrokePixels.current[currentStrokePixels.current.length - 1];
      if (!last || Math.hypot(last.x - x, last.y - y) > 3) {
        // lọc điểm gần nhau
        currentStrokePixels.current.push({ x, y });
      }

      ctx.clearRect(0, 0, canvasStrokes.current!.width, canvasStrokes.current!.height);
      // vẽ lại các stroke đã có
      redraw(canvasStrokes, strokes, chartRef, candleSeriesRef, isDrawingBrush);
      // requestRedrawStrokes()

      drawSmoothLine(ctx, currentStrokePixels.current); // vẽ stroke tạm thời
      setCursor('default');
    };

    const handleMouseUp = (e: MouseEvent) => {
      setCursor('default');

      if (draggingStrokeIndex !== null) {
        const x = e.offsetX;
        const y = e.offsetY;
        const dx = x - dragStartStrokes.current.x;
        const dy = y - dragStartStrokes.current.y;

        const baseStroke = strokes[draggingStrokeIndex];

        const updatedStroke = baseStroke.map((p) => {
          const newX = chartRef.current.timeScale().timeToCoordinate(p.time)! + dx;
          const newY = candleSeriesRef.current.priceToCoordinate(p.price)! + dy;
          return {
            time: chartRef.current.timeScale().coordinateToTime(newX) as number,
            price: candleSeriesRef.current.coordinateToPrice(newY) as number,
          };
        });

        setStrokes((prev) => {
          const newStrokes = [...prev];
          newStrokes[draggingStrokeIndex] = updatedStroke;
          return newStrokes;
        });

        setDraggingStrokeIndex(null);
        return;
      }

      if (isDrawing) {
        const finalStroke = currentStrokePixels.current.map((p) => {
          const time = chartRef.current.timeScale().coordinateToTime(p.x);
          const price = candleSeriesRef.current.coordinateToPrice(p.y);
          return {
            time: time as number,
            price: price as number,
          };
        });

        setStrokes((prev) => [...prev, finalStroke]);
        requestRedrawStrokes(); // ✅ ép redraw ngay

        currentStrokePixels.current = [];
        setIsDrawing(false);
      }
    };

    canvasStrokes.current.addEventListener('mousedown', handleMouseDown);
    canvasStrokes.current.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const timeScale = chartRef.current?.timeScale()!;

    // đăng ký khi pan/zoom chart
    timeScale && timeScale?.subscribeVisibleLogicalRangeChange(requestRedrawStrokes);
    timeScale && timeScale.subscribeVisibleTimeRangeChange(requestRedrawStrokes);

    requestRedrawStrokes();

    return () => {
      timeScale && timeScale.unsubscribeVisibleTimeRangeChange(requestRedrawStrokes);
      timeScale && timeScale.unsubscribeVisibleLogicalRangeChange(requestRedrawStrokes);
      chartRef.current && chartRef.current.unsubscribeCrosshairMove(subrequestRedraw);
      if (!canvasStrokes.current) return;
      if (rafRefStrokes.current) cancelAnimationFrame(rafRefStrokes.current);
      rafRefStrokes.current = null;
      canvasStrokes.current.removeEventListener('mousedown', handleMouseDown);
      canvasStrokes.current.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDrawingBrush, isDrawing, strokes, draggingStrokeIndex, dragStartStrokes]);

  const handleShowIndicator = () => {
    if (canvasRef.current || overlayRef.current || canvasStrokes.current || canvasTrendLine.current) {
      canvasRef.current.style.display = !showIndicator ? 'block' : 'none';
      overlayRef.current.style.display = !showIndicator ? 'block' : 'none';
      canvasStrokes.current.style.display = !showIndicator ? 'block' : 'none';
      canvasTrendLine.current.style.display = !showIndicator ? 'block' : 'none';
    }
    setShowIndicator(!showIndicator);
  };

  const indicatorComponents: Record<string, (props: any) => JSX.Element> = {
    adr: (props) => (
      <Adr
        candleData={props.candleIndicator}
        chartRefCandl={props.chartRef}
        chartRefCurentADR={props.chartRefCurentADR}
        setIndicator={props.setIndicator}
        setDataPeriod={props.setDataPeriod}
        activeTab={props.activeTab}
      />
    ),
    rsi: (props) => (
      <Rsi
        candleData={props.candleIndicator}
        chartRefCandl={props.chartRef}
        chartRefCurentRSI={props.chartRefCurentRSI}
        setIndicator={props.setIndicator}
        setDataPeriod={props.setDataPeriod}
        activeTab={props.activeTab}
      />
    ),
    atr: (props) => (
      <Atr
        candleData={props.candleIndicator}
        chartRefCandl={props.chartRef}
        currentRange={props.currentRange}
        chartRefCurentATR={props.chartRefCurentATR}
        setIndicator={props.setIndicator}
        setDataPeriod={props.setDataPeriod}
        activeTab={props.activeTab}
      />
    ),
    roc: (props) => (
      <Roc
        candleData={props.candleIndicator}
        chartRefCandl={props.chartRef}
        chartRefCurentROC={props.chartRefCurentROC}
        setIndicator={props.setIndicator}
        setDataPeriod={props.setDataPeriod}
        activeTab={props.activeTab}
      />
    ),
    slope: (props) => (
      <Slope
        candleData={props.candleIndicator}
        chartRefCandl={props.chartRef}
        chartRefCurentSLOPE={props.chartRefCurentSLOPE}
        setIndicator={props.setIndicator}
        setDataPeriod={props.setDataPeriod}
        activeTab={props.activeTab}
      />
    ),
    rolling: (props) => (
      <Rolling
        candleData={props.candleIndicator}
        chartRefCandl={props.chartRef}
        chartRefCurentROLLING={props.chartRefCurentROLLING}
        setIndicator={props.setIndicator}
        setDataPeriod={props.setDataPeriod}
        activeTab={props.activeTab}
      />
    ),
    zscore: (props) => (
      <Zscore
        candleData={props.candleIndicator}
        chartRefCandl={props.chartRef}
        chartRefCurentZSCORE={props.chartRefCurentZSCORE}
        setIndicator={props.setIndicator}
        setDataPeriod={props.setDataPeriod}
        activeTab={props.activeTab}
      />
    ),
    adx: (props) => (
      <Adx
        candleData={props.candleIndicator}
        chartRefCandl={props.chartRef}
        chartRefCurentADX={props.chartRefCurentADX}
        setIndicator={props.setIndicator}
        setDataPeriod={props.setDataPeriod}
        activeTab={props.activeTab}
      />
    ),
  };

  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [showSetting, setShowSetting] = useState<boolean>(false);

  const menuSetup: IMenuSub[] = [
    {
      label: 'Cài đặt chỉ báo',
      value: '',
      onClick: () => setShowSetting(!showSetting),
    },
    {
      label: 'Tắt tất cả chỉ báo',
      value: 'activate',
      onClick: () => {
        // setIndicatorChart((prev) =>
        //   prev.map((i) => {
        //     if (i.value === 'bb') {
        //       return {
        //         ...i,
        //         active: false,
        //       };
        //     }
        //     return i;
        //   }),
        // );
      },
    },
  ];

  const roc = useMemo(() => {
    const dataRoc = calculateROC(candleIndicator, dataPeriod.periodROC);
    const dataSlope = linearRegressionSlopePeriod(candleIndicator, dataPeriod.periodSLOPE);
    const rolling = rollingStdDev(candleIndicator, dataPeriod.periodROLLING);
    const zScore = rollingZScore(candleIndicator, dataPeriod.periodZSCORE);

    const sma = calculateSMA(candleIndicator as any, indicatorChart.find((i) => i.value === 'sma')?.period);
    const ema = calculateEMA(candleIndicator as any, indicatorChart.find((i) => i.value === 'ema')?.period);
    const wma = calculateWMA(candleIndicator as any, indicatorChart.find((i) => i.value === 'wma')?.period);
    const rma = calculateRMA(candleIndicator as any, indicatorChart.find((i) => i.value === 'rma')?.period);

    return {
      dataRoc: dataRoc[dataRoc.length - 1]?.value?.toFixed(2),
      dataSlope: dataSlope[dataSlope.length - 1]?.value?.toFixed(4),
      rolling: rolling[rolling.length - 1]?.value?.toFixed(4),
      zScore: zScore[zScore.length - 1]?.value?.toFixed(4),
      sma: sma[sma.length - 1]?.value?.toFixed(4),
      ema: ema[ema.length - 1]?.value?.toFixed(4),
      wma: wma[wma.length - 1]?.value?.toFixed(4),
      rma: rma[rma.length - 1]?.value?.toFixed(4),
    };
  }, [candleIndicator, dataPeriod, indicatorChart]);

  return (
    <div className="text-center">
      <div className="flex flex-wrap justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400 gap-2">
            {activeTab.map((item) => (
              <React.Fragment key={item.tabsName}>
                <TooltipCustom isButton titleTooltip={item.tabsName}>
                  <Button
                    disabled={loading}
                    onClick={() => handleClick(item)}
                    isLoading={loading}
                    className={`flex justify-center items-center md:w-[40px] md:h-[40px] w-[32px] h-[32px] rounded-lg p-0 ${
                      item.active
                        ? 'text-[var(--color-text)] bg-[var(--color-background)] active'
                        : 'bg-gray-200 text-black hover:text-[var(--color-text)] hover:bg-[var(--color-background-opacity-5)] border border-rose-100 dark:hover:border-rose-200'
                    } cursor-pointer`}
                    aria-current="page"
                  >
                    {item.icon}
                  </Button>
                </TooltipCustom>
              </React.Fragment>
            ))}

            <Filter handleClick={handleRangeChange} currentRange={currentRange} />

            <TooltipCustom
              handleClick={() => {
                setUtilities((prev) => !prev);
              }}
              titleTooltip={`${utilities ? t('Mở') : t('Đóng')} ${t('tiện ích')}`}
              classNameButton={`${
                utilities ? 'bg-[var(--color-background)] text-white' : 'text-black bg-gray-200'
              }  md:w-[40px] md:h-[40px] w-[32px] h-[32px]`}
            >
              <Icon name="icon-sidebar-right" width={20} height={20} />
            </TooltipCustom>

            <CompIndicatorChart
              dataView={indicatorChart}
              iconName="icon-indication-chart"
              nameTitle="Chỉ báo biểu đồ"
              indicator={indicatorChart}
              setIndicator={setIndicatorChart}
              className="z-[42]"
            />

            <CompIndicator
              indicator={indicator}
              dataView={indicator.filter((_, i) => i < 4)}
              setIndicator={setIndicator}
              className="z-40"
              iconName="icon-rsi"
              nameTitle="Các chỉ báo"
            />

            <CompIndicator
              indicator={indicator}
              dataView={indicator.filter((_, i) => i > 3)}
              setIndicator={setIndicator}
              className="z-30"
              iconName="icon-quantitative"
              nameTitle="Các chỉ báo định lượng"
            />
          </div>

          {activeTab.filter((item: IOptionsTabsCharts) => item?.active)[0]?.tabsName === 'Biểu đồ nến' && (
            <>
              <TooltipCustom
                handleClick={() => {
                  setIsCheckFibonacci((prev) => !prev);
                  setFibMode(true);
                  setIsDrawingMode(false);
                  setDrawing(false);
                  setIsDrawingBrush(false);
                }}
                titleTooltip={'fibonacci thoái lui'}
                classNameButton={`${
                  isCheckFibonacci ? 'bg-[var(--color-background)] text-white' : 'text-black bg-gray-200'
                }  md:w-[40px] md:h-[40px] w-[32px] h-[32px]`}
              >
                <Icon name="icon-fibonacci" width={18} height={18} />
              </TooltipCustom>

              <TooltipCustom
                handleClick={() => {
                  setIsDrawingMode(!isDrawingMode);
                  setIsCheckFibonacci(false);
                  setDrawing(false);
                  setIsDrawingBrush(false);
                }}
                titleTooltip={'Đường nằm ngang'}
                classNameButton={`${
                  isDrawingMode ? 'bg-[var(--color-background)] text-white' : 'text-black bg-gray-200'
                }  md:w-[40px] md:h-[40px] w-[32px] h-[32px]`}
              >
                <Icon name="icon-line-v2" width={24} height={24} />
              </TooltipCustom>

              <TooltipCustom
                handleClick={() => {
                  setDrawing(!drawing);
                  setIsCheckFibonacci(false);
                  setIsDrawingMode(false);
                  setIsDrawingBrush(false);
                }}
                titleTooltip={'Đường xu hướng'}
                classNameButton={`${
                  drawing ? 'bg-[var(--color-background)] text-white' : 'text-black bg-gray-200'
                }  md:w-[40px] md:h-[40px] w-[32px] h-[32px]`}
              >
                <Icon name="icon-trend-line" width={20} height={20} />
              </TooltipCustom>

              <TooltipCustom
                handleClick={() => {
                  setIsDrawingBrush(!isDrawingBrush);
                  setIsCheckFibonacci(false);
                  setDrawing(false);
                  setIsDrawingMode(false);
                }}
                titleTooltip={'Cọ vẽ'}
                classNameButton={`${
                  isDrawingBrush ? 'bg-[var(--color-background)] text-white' : 'text-black bg-gray-200'
                }  md:w-[40px] md:h-[40px] w-[32px] h-[32px]`}
              >
                <Icon name="icon-paint-brush" width={20} height={20} />
              </TooltipCustom>

              <TooltipCustom
                handleClick={handleShowIndicator}
                titleTooltip={showIndicator ? 'Ẩn bản vẽ & chỉ báo' : 'Hiện bản vẽ & chỉ báo'}
                classNameButton={`${
                  showIndicator ? 'bg-[var(--color-background)] text-white' : 'text-black bg-gray-200'
                }  md:w-[40px] md:h-[40px] w-[32px] h-[32px]`}
              >
                <Icon name={`${showIndicator ? 'icon-eye' : 'icon-no-eye'}`} width={20} height={20} />
              </TooltipCustom>

              <DeleteFibonacci
                strokes={strokes}
                trendlinesRef={trendlines}
                linesRef={linesRef}
                data={fibBlocks}
                onClick={handleDelete}
              />

              <button className="flex items-center ml-4 cursor-pointer" onClick={toggleOpen}>
                <input
                  checked={isOpen}
                  readOnly
                  type="checkbox"
                  value=""
                  className="custom-checkbox cursor-pointer appearance-none bg-gray-100 checked:bg-[var(--color-background)] w-4 h-4 rounded-sm dark:bg-white border border-[var(--color-background)] ring-offset-[var(--color-background)]"
                />
                <label
                  htmlFor="green-checkbox"
                  className="cursor-pointer ms-2 text-sm font-medium text-gray-900 dark:text-gray-900"
                >
                  {t('Đường trung bình')}
                </label>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 mt-3 gap-1">
        <div
          className={`${
            utilities ? 'col-span-3' : 'col-span-4'
          } p-2 border border-gray-200  overflow-hidden rounded-lg shadow-xl relative`}
        >
          <div ref={chartContainerRef}>
            {indicatorChart.find((i) => i.value === 'volume')?.active && (
              <VolumeProfileOverlay
                chartRef={chartRef}
                seriesRefs={[seriesRef, candleSeriesRef]}
                candleIndicator={candleIndicator}
                activeIndex={activeTab.find((i) => i.active)?.tabsName === 'Biểu đồ đường' ? 0 : 1}
                chartContainerRef={chartContainerRef}
              />
            )}
            {indicatorChart.filter((i) => i.active).length !== 0 && (
              <div className="absolute top-1 left-2 z-10 text-gray-500 text-sm">
                {t('Hiển thị')}: {indicatorChart.filter((i) => i.active).map((i) => i.titleSub + ' ' + i.period + '; ')}
              </div>
            )}
            {activeTab.map((item) => (
              <React.Fragment key={item.tabsName}>
                {item.active &&
                  (loading ? (
                    <Loading className="h-[620px]" />
                  ) : item.tabsName === 'Biểu đồ đường' ? (
                    <ChartComponent
                      chartContainerRef={chartContainerRef}
                      chartRef={chartRef}
                      chartRefCurent={chartRefCurent}
                      seriesRef={seriesRef}
                      dataOld={symbolsCand}
                      setPagination={setPagination}
                      latestData={symbolsCandSocket}
                      currentRange={currentRange}
                      indicatorChart={indicatorChart}
                      setMenu={setMenu}
                    />
                  ) : (
                    <CandlestickSeriesComponent
                      chartContainerRef={chartContainerRef}
                      chartRef={chartRef}
                      chartRefCurent={chartRefCurent}
                      candleSeriesRef={candleSeriesRef}
                      dataOld={symbolsCand}
                      setPagination={setPagination}
                      isOpen={isOpen}
                      latestData={symbolsCandSocket}
                      currentRange={currentRange}
                      indicatorChart={indicatorChart}
                      setMenu={setMenu}
                    />
                  ))}
              </React.Fragment>
            ))}
          </div>
          {indicator
            .filter((item) => item.active)
            .map((item, idx) => (
              <React.Fragment key={idx}>
                {indicatorComponents[item.value]?.({
                  candleIndicator: candleIndicator,
                  chartRef,
                  chartRefCurentADR,
                  chartRefCurentRSI,
                  chartRefCurentATR,
                  chartRefCurentROC,
                  chartRefCurentSLOPE,
                  chartRefCurentROLLING,
                  chartRefCurentZSCORE,
                  chartRefCurentADX,
                  activeTab,
                  setDataPeriod,
                  setIndicator,
                })}
              </React.Fragment>
            ))}
        </div>

        {utilities && (
          <div className="col-span-1 p-2 border border-gray-200 rounded-lg shadow-xl relative">
            <div className="grid grid-cols-2 gap-1">
              <TooltipCustom
                titleTooltip={'Tốc độ thay đổi'}
                classNameButton="md:w-auto w-auto rounded-sm shadow-sm shadow-gray-500 rounded-sm bg-[var(--color-background-roc)]"
                placement="top"
              >
                <div className="flex justify-start items-center gap-1">
                  <div className="text-left">
                    roc<sub>t</sub>
                    <sup>({dataPeriod.periodROC})</sup>:
                  </div>
                  <div className="">{roc.dataRoc ?? '...'}%</div>
                </div>
              </TooltipCustom>
              <TooltipCustom
                titleTooltip={'Độ dốc hồi quy tuyến tính'}
                classNameButton="md:w-auto w-auto rounded-sm shadow-sm shadow-gray-500 rounded-sm bg-[var(--color-background-slope)]"
                placement="top"
              >
                <div className="flex justify-start items-center gap-1">
                  <div className="text-left">
                    slope<sub>t</sub>
                    <sup>({dataPeriod.periodSLOPE})</sup>:
                  </div>
                  <div className="">{roc.dataSlope !== 'NaN' ? roc.dataSlope : '...'}</div>
                </div>
              </TooltipCustom>
              <TooltipCustom
                placement="top"
                titleTooltip={'Độ lệnh chuẩn cuộn'}
                classNameButton="md:w-auto w-auto rounded-sm shadow-sm shadow-gray-500 rounded-sm bg-[var(--color-background-rolling)]"
              >
                <div className="flex justify-start items-center gap-1">
                  <div className="text-left">
                    σ<sub>t</sub>
                    <sup>({dataPeriod.periodROLLING})</sup>:
                  </div>
                  <div className="">{roc.rolling !== 'NaN' ? roc.rolling : '...'}</div>
                </div>
              </TooltipCustom>
              <TooltipCustom
                placement="top"
                titleTooltip={'Z-score'}
                classNameButton="md:w-auto w-auto rounded-sm shadow-sm shadow-gray-500 rounded-sm bg-[var(--color-background-zScore)]"
              >
                <div className="flex justify-start items-center gap-1">
                  <div className="text-left">
                    Z<sub>t</sub>
                    <sup>({dataPeriod.periodZSCORE})</sup>:
                  </div>
                  <div className="">{roc.zScore !== 'NaN' ? roc.zScore : '...'}</div>
                </div>
              </TooltipCustom>
              <TooltipCustom
                placement="top"
                titleTooltip={'Trung bình động đơn giản SMA'}
                classNameButton="md:w-auto w-auto rounded-sm shadow-sm shadow-gray-500 rounded-sm bg-[var(--color-background-zScore)]"
              >
                <div className="flex justify-start items-center gap-1">
                  <div className="text-left">
                    sma<sup>({indicatorChart.find((i) => i.value === 'sma')?.period})</sup>:
                  </div>
                  <div className="">{roc.sma ?? '...'}</div>
                </div>
              </TooltipCustom>
              <TooltipCustom
                placement="top"
                titleTooltip={'Trung bình động hàm mũ EMA'}
                classNameButton="md:w-auto w-auto rounded-sm shadow-sm shadow-gray-500 rounded-sm bg-[var(--color-background-ema)]"
              >
                <div className="flex justify-start items-center gap-1">
                  <div className="text-left">
                    ema<sup>({indicatorChart.find((i) => i.value === 'ema')?.period})</sup>:
                  </div>
                  <div className="">{roc.ema ?? '...'}</div>
                </div>
              </TooltipCustom>
              <TooltipCustom
                placement="top"
                titleTooltip={'Trung bình động có trọng số WMA'}
                classNameButton="md:w-auto w-auto rounded-sm shadow-sm shadow-gray-500 rounded-sm bg-[var(--color-background-wma)]"
              >
                <div className="flex justify-start items-center gap-1">
                  <div className="text-left">
                    wma<sup>({indicatorChart.find((i) => i.value === 'wma')?.period})</sup>:
                  </div>
                  <div className="">{roc.wma ?? '...'}</div>
                </div>
              </TooltipCustom>
              <TooltipCustom
                placement="top"
                titleTooltip={'Đường trung bình động của Wilder RMA'}
                classNameButton="md:w-auto w-auto rounded-sm shadow-sm shadow-gray-500 rounded-sm bg-[var(--color-background-rma)]"
              >
                <div className="flex justify-start items-center gap-1">
                  <div className="text-left">
                    rma<sup>({indicatorChart.find((i) => i.value === 'rma')?.period})</sup>:
                  </div>
                  <div className="">{roc.rma ?? '...'}</div>
                </div>
              </TooltipCustom>
            </div>
            <div className="absolute bottom-2 left-0 right-0 p-2 pb-0">
              <div className="grid grid-cols-3 font-bold text-[14px]">
                <span className="border border-gray-200 py-1">{t('Cặp tiền')}</span>
                <span className="border border-gray-200 py-1">{t('Giá hiện tại')}</span>
                <span className="border border-gray-200 py-1">{t('Lợi nhuận')}</span>
              </div>
              {dataRealTime.map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 font-semibold text-[14px]">
                  <span className="border border-gray-200 py-0.5">{item.symbol}</span>
                  <span className="border border-gray-200 text-[var(--color-background)] py-0.5">
                    {item.current_price.toFixed(4)}
                  </span>
                  <span
                    className={`${
                      item.profit > 0 ? 'text-blue-500' : item.profit === 0 ? 'text-gray-500' : 'text-red-500'
                    } border border-gray-200 py-0.5`}
                  >
                    {item.profit.toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {menu && (
        <MenuSetupIndicator
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          dataMenu={menuSetup}
          activate={showSetting}
        />
      )}

      <SetupIndicatorAll
        close={() => setShowSetting(false)}
        open={showSetting}
        data={indicatorChart}
        setDataCurrent={setIndicatorChart}
        setDataPeriod={setDataPeriod}
      />
    </div>
  );
}

const Filter = ({ handleClick, currentRange }: any) => {
  const popupRef: any = useRef(null);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false); // để delay unmount
  const handleToggle = () => {
    if (open) {
      // Đóng có delay để chạy animation
      setOpen(false);
      setTimeout(() => setVisible(false), 200); // khớp với duration
    } else {
      setVisible(true);
      setTimeout(() => setOpen(true), 10); // delay nhẹ để Tailwind áp transition
    }
  };
  useClickOutside(
    popupRef,
    () => {
      setOpen(false);
      setTimeout(() => setVisible(false), 200);
    },
    visible,
  );
  return (
    <div ref={popupRef} className="z-[45] relative">
      <Button
        onClick={handleToggle}
        className={`p-0 flex justify-center items-center rounded-lg md:w-[40px] md:h-[40px] w-[32px] h-[32px] active cursor-pointer font-semibold shadow-xs shadow-gray-500 text-[var(--color-text)] bg-[var(--color-background)] md:text-sm text-[12px]`}
      >
        <div>{timeOptions.find((a) => a.label === currentRange)?.label}</div>
      </Button>

      {visible && (
        <div
          className={`grid grid-cols-5 sm:grid-cols-11 gap-2 w-[300px] sm:w-[600px] transition-all duration-200 absolute -top-3 -left-24 mt-2 bg-white shadow-sm shadow-gray-300 rounded-lg border border-gray-200 p-2 ${
            open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}
        >
          {timeOptions.map((opt: any) => (
            <Button
              key={opt.label}
              onClick={() => {
                handleToggle();
                handleClick(opt.label);
              }}
              className={`p-0 md:h-[36px] col-span-1 h-[32px] rounded-lg ${
                currentRange === opt.label
                  ? 'text-[var(--color-text)] bg-[var(--color-background)] active'
                  : 'bg-gray-200 text-black hover:bg-[var(--color-background-opacity-2)] hover:text-[var(--color-background)] border border-rose-100 dark:hover:border-rose-200'
              } cursor-pointer font-semibold md:text-sm text-[12px]`}
            >
              <div>{opt.label}</div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

const DeleteFibonacci = ({
  strokes,
  trendlinesRef,
  data,
  onClick,
  linesRef,
}: {
  strokes: {
    time: number;
    price: number;
  }[][];
  data: any;
  onClick: (title: 'fibonacci' | 'line' | 'trendLine' | 'brush', idx: number) => void;
  linesRef: {
    price: number;
    id: number;
  }[];
  trendlinesRef: Trendline[];
}) => {
  const { t } = useTranslation();
  const popupRef: any = useRef(null);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false); // để delay unmount

  const handleToggle = () => {
    if (open) {
      // Đóng có delay để chạy animation
      setOpen(false);
      setTimeout(() => setVisible(false), 200); // khớp với duration
    } else {
      setVisible(true);
      setTimeout(() => setOpen(true), 10); // delay nhẹ để Tailwind áp transition
    }
  };

  useClickOutside(
    popupRef,
    () => {
      setOpen(false);
      setTimeout(() => setVisible(false), 200);
    },
    visible,
  );

  return (
    <div ref={popupRef} className="relative z-20">
      {(data.length !== 0 || linesRef.length !== 0 || trendlinesRef.length !== 0 || strokes.length !== 0) && (
        <div className="absolute top-1 right-1 z-10 bg-white rounded-2xl text-[12px] font-bold w-[14px] h-[14px] flex justify-center items-center text-[var(--color-background)]">
          {data.length + linesRef.length + trendlinesRef.length + strokes.length}
        </div>
      )}
      <TooltipCustom
        handleClick={handleToggle}
        titleTooltip={'Xóa fibonacci thoái lui'}
        classNameButton={`${
          data.length !== 0 || linesRef.length !== 0 || trendlinesRef.length !== 0 || strokes.length !== 0
            ? 'bg-[var(--color-background)] text-white'
            : 'text-black bg-gray-200'
        }  md:w-[40px] md:h-[40px] w-[32px] h-[32px]`}
      >
        <Icon name="icon-delete" width={18} height={18} />
      </TooltipCustom>

      {(data.length !== 0 || linesRef.length !== 0 || trendlinesRef.length !== 0 || strokes.length !== 0) &&
        visible && (
          <div
            className={`ml-2 transition-all duration-200 absolute w-[460px] max-h-[50vh] overflow-y-scroll my-scroll -top-2 left-full mt-2 bg-white shadow-sm shadow-gray-300 rounded-lg border border-gray-300 p-2 pb-0 ${
              open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            }`}
          >
            {data?.map((_: any, idx: number) => {
              return (
                <Button
                  key={idx}
                  className="w-full shadow-none text-black cursor-pointer font-semibold text-left px-4 hover:bg-[var(--color-background-opacity-2)] hover:text-[var(--color-background)] py-2"
                  onClick={() => onClick('fibonacci', idx)}
                >
                  {t('Xóa bản vẽ')} {idx + 1}
                </Button>
              );
            })}
            {linesRef.map((i, idx) => {
              return (
                <Button
                  key={idx}
                  className="w-full shadow-none text-black cursor-pointer font-semibold text-left px-4 hover:bg-[var(--color-background-opacity-2)] hover:text-[var(--color-background)] py-2"
                  onClick={() => onClick('line', i.id)}
                >
                  {t('Xóa đường nằm ngang')} {i.id}
                </Button>
              );
            })}
            {trendlinesRef.map((_i, idx) => {
              return (
                <Button
                  key={idx}
                  className="w-full shadow-none text-black cursor-pointer font-semibold text-left px-4 hover:bg-[var(--color-background-opacity-2)] hover:text-[var(--color-background)] py-2"
                  onClick={() => onClick('trendLine', idx)}
                >
                  {t('Xóa đường xu hướng')} {idx + 1}
                </Button>
              );
            })}
            {strokes.map((_i, idx) => {
              return (
                <Button
                  key={idx}
                  className="w-full shadow-none text-black cursor-pointer font-semibold text-left px-4 hover:bg-[var(--color-background-opacity-2)] hover:text-[var(--color-background)] py-2"
                  onClick={() => onClick('brush', idx)}
                >
                  {t('Xóa cọ vẽ')} {idx + 1}
                </Button>
              );
            })}
            <div className="sticky -bottom-2 left-0 right-0 w-full bg-white pb-2">
              <Button
                className="w-full shadow-none text-black cursor-pointer font-semibold text-left px-4 hover:bg-[var(--color-background-opacity-2)] hover:text-[var(--color-background)] py-2"
                onClick={() => onClick('fibonacci', -1)}
              >{`${t('Xóa')} ${data.length} ${t('bản vẽ')}, ${linesRef.length + trendlinesRef.length} ${t(
                'chỉ báo',
              )} ${t('và')} ${strokes.length} ${t('cọ vẽ')}`}</Button>
            </div>
          </div>
        )}
    </div>
  );
};

const CompIndicator = ({
  indicator,
  dataView,
  setIndicator,
  className,
  iconName,
  nameTitle,
}: {
  indicator: Iindicator[];
  dataView: Iindicator[];
  setIndicator: React.Dispatch<React.SetStateAction<Iindicator[]>>;
  className?: string;
  iconName: string;
  nameTitle: string;
}) => {
  const { t } = useTranslation();
  const popupRef: any = useRef(null);
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [visible, setVisible] = useState(false); // để delay unmount

  const handleToggle = () => {
    if (open) {
      // Đóng có delay để chạy animation
      setOpen(false);
      setTimeout(() => setVisible(false), 200); // khớp với duration
    } else {
      setVisible(true);
      setTimeout(() => setOpen(true), 10); // delay nhẹ để Tailwind áp transition
    }
  };

  useClickOutside(
    popupRef,
    () => {
      if (!openModal) {
        setOpen(false);
        setTimeout(() => setVisible(false), 200);
      }
    },
    visible,
  );

  const onClick = (value: string) => {
    const activate = indicator.filter((i) => i.active);
    if (activate.length === 2 && !activate.some((i) => i.value === value)) {
      setOpenModal(true);
    } else {
      const dataNew: Iindicator[] = [...indicator].map((a) => {
        if (a.value === value) {
          return { ...a, active: !a.active };
        } else {
          return { ...a };
        }
      });
      setIndicator(dataNew);
    }
  };

  return (
    <>
      <div ref={popupRef} className={`relative ${className}`}>
        <TooltipCustom
          handleClick={handleToggle}
          titleTooltip={nameTitle}
          classNameButton={`${
            dataView.find((a) => a.active) ? 'bg-[var(--color-background)] text-white' : 'text-black bg-gray-200'
          }  md:w-[40px] md:h-[40px] w-[32px] h-[32px]`}
        >
          <Icon name={`${iconName}`} width={24} height={24} />
        </TooltipCustom>

        {visible && (
          <div
            className={`ml-1 transition-all duration-200 absolute -top-2 left-full mt-2 bg-white shadow-sm shadow-gray-300 rounded-lg border border-gray-300 p-2 ${
              open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            } flex flex-col justify-center items-center gap-1`}
          >
            <div>{nameTitle}</div>
            {dataView?.map((d: Iindicator, idx: number) => {
              return (
                <Button
                  onClick={() => onClick(d.value)}
                  key={idx}
                  className={`${
                    d.active
                      ? 'bg-[var(--color-background)] text-white'
                      : 'text-black hover:bg-[var(--color-background-opacity-2)] hover:text-[var(--color-background)]'
                  } shadow-none text-sm cursor-pointer font-semibold w-[320px] text-left px-4 py-2 rounded-sm`}
                >
                  {t(d.label)} {d.period}
                </Button>
              );
            })}
          </div>
        )}
      </div>
      <ModupComfimIndicator open={openModal} setOpen={setOpenModal} indicator={indicator} setIndicator={setIndicator} />
    </>
  );
};

const ModupComfimIndicator = ({
  open,
  setOpen,
  indicator,
  setIndicator,
  max = 2,
}: {
  max?: number;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  indicator: Iindicator[];
  setIndicator: React.Dispatch<React.SetStateAction<Iindicator[]>>;
}) => {
  const { t } = useTranslation();
  const [data, setData] = useState<Iindicator[]>(indicator);

  useEffect(() => {
    setData(indicator);
  }, [indicator]);

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-100">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-white px-4 sm:py-6 sm:pt-4">
              <div className="mt-3 text-center sm:mt-0">
                <DialogTitle as="h1" className="text-[15px] md:text-md font-semibold text-gray-900">
                  {t('Để đảm bảo về trải nghiệm')} <br />
                  {t('chúng tôi chỉ cho phép hiển thị tối đa 2 chỉ báo cùng lúc')}
                </DialogTitle>

                <div className="grid grid-cols-1 gap-4 mt-6">
                  {data.filter((i) => i.active).length !== 0 && (
                    <div className="grid grid-cols-6 gap-1">
                      <div className="col-span-6 text-left font-semibold text-[14px] md:text-[16px]">
                        {t('Chỉ báo hiển thị')}:
                      </div>
                      {data
                        .filter((i) => i.active)
                        .map((i) => (
                          <Button
                            onClick={() => {
                              setData((prev) => {
                                return prev.map((a) => {
                                  if (a.value === i.value) {
                                    return {
                                      ...a,
                                      active: false,
                                    };
                                  }
                                  return a;
                                });
                              });
                            }}
                            key={i.value}
                            className="col-span-1 bg-[var(--color-background)] p-1 rounded-sm px-0 cursor-pointer text-[14px] md:text-[16px"
                          >
                            {i.value.toLocaleUpperCase()}
                          </Button>
                        ))}
                    </div>
                  )}

                  <div className="grid grid-cols-6 gap-1">
                    <div className="col-span-6 text-left font-semibold text-[14px] md:text-[16px">
                      {t('Tất cả các chỉ báo')}:
                    </div>
                    {data.map((i) => (
                      <Button
                        onClick={() => {
                          const activeList = data.filter((d) => d.active);
                          const dd = data.map((a) => {
                            let dataNew = a;
                            if (
                              activeList.length === max &&
                              a.value === activeList[0].value &&
                              !activeList.some((z) => z.value === i.value)
                            ) {
                              dataNew = {
                                ...a,
                                active: false,
                              };
                            }
                            if (a.value === i.value) {
                              dataNew = {
                                ...a,
                                active: a.value === i.value,
                              };
                            }
                            return dataNew;
                          });
                          setData(dd);
                        }}
                        className="text-[14px] md:text-[16px col-span-1 p-1 text-[var(--color-background)] rounded-sm px-0 cursor-pointer hover:bg-[var(--color-background-opacity-2)]"
                        key={i.value}
                      >
                        {i.value.toLocaleUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-3">
              <Button
                onClick={() => {
                  setOpen(false);
                  setIndicator(data);
                }}
                type="button"
                className="shadow-gray-400 cursor-pointer inline-flex w-full justify-center rounded-md bg-[var(--color-background)] px-3 py-2 text-sm font-semibold text-white shadow-md sm:ml-3 sm:w-auto"
              >
                {t('Xác nhận')}
              </Button>
              <Button
                type="button"
                data-autofocus
                onClick={() => setOpen(false)}
                className="shadow-gray-400 cursor-pointer mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-md inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                {t('Hủy')}
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

const CompIndicatorChart = ({
  indicator,
  dataView,
  setIndicator,
  className,
  iconName,
  nameTitle,
}: {
  indicator: Iindicator[];
  dataView: Iindicator[];
  setIndicator: React.Dispatch<React.SetStateAction<Iindicator[]>>;
  className?: string;
  iconName: string;
  nameTitle: string;
}) => {
  const { t } = useTranslation();
  const popupRef: any = useRef(null);
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [visible, setVisible] = useState(false); // để delay unmount

  const handleToggle = () => {
    if (open) {
      // Đóng có delay để chạy animation
      setOpen(false);
      setTimeout(() => setVisible(false), 200); // khớp với duration
    } else {
      setVisible(true);
      setTimeout(() => setOpen(true), 10); // delay nhẹ để Tailwind áp transition
    }
  };

  useClickOutside(
    popupRef,
    () => {
      if (!openModal) {
        setOpen(false);
        setTimeout(() => setVisible(false), 200);
      }
    },
    visible,
  );

  const onClick = (idx: number, value: string) => {
    const activate = indicator.filter((i) => i.active);
    if (activate.length === 3 && !activate.some((i) => i.value === value)) {
      setOpenModal(true);
    } else {
      const dataNew: Iindicator[] = [...indicator].map((a, id) => {
        if (idx === id) {
          return { ...a, active: !a.active };
        } else {
          return { ...a };
        }
      });
      setIndicator(dataNew);
    }
  };

  return (
    <>
      <div ref={popupRef} className={`relative ${className}`}>
        <TooltipCustom
          handleClick={handleToggle}
          titleTooltip={nameTitle}
          classNameButton={`${
            dataView.find((a) => a.active) ? 'bg-[var(--color-background)] text-white' : 'text-black bg-gray-200'
          }  md:w-[40px] md:h-[40px] w-[32px] h-[32px]`}
        >
          <Icon name={`${iconName}`} width={24} height={24} />
        </TooltipCustom>

        {visible && (
          <div
            className={`ml-1 transition-all duration-200 absolute -top-2 left-full mt-2 bg-white shadow-sm shadow-gray-300 rounded-lg border border-gray-300 p-2 ${
              open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            } flex flex-col justify-center items-center gap-1`}
          >
            {dataView?.map((d: Iindicator, idx: number) => {
              return (
                <Button
                  onClick={() => onClick(idx, d.value)}
                  key={idx}
                  className={`${
                    d.active
                      ? 'bg-[var(--color-background)] text-white'
                      : 'text-black hover:bg-[var(--color-background-opacity-2)] hover:text-[var(--color-background)]'
                  } shadow-none text-sm cursor-pointer font-semibold w-[320px] text-left px-4 py-2 rounded-sm`}
                >
                  {t(d.label)} {d.value === 'volume' ? '' : d.period}
                </Button>
              );
            })}
          </div>
        )}
      </div>
      <ModupComfimIndicator
        open={openModal}
        setOpen={setOpenModal}
        indicator={indicator}
        setIndicator={setIndicator}
        max={3}
      />
    </>
  );
};
