import type { BarData, IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { symbolApi } from "../../api/symbol";
import { Button } from "../../components/button";
import { CandlestickSeriesComponent } from "../../components/candlestickSeries";
import { normalizeChartData, type IDataSymbols } from "../../components/candlestickSeries/options";
import { ChartComponent } from "../../components/line";
import { Loading } from "../../components/loading";
import TooltipCustom from "../../components/tooltip";
import { useAppInfo } from "../../hooks/useAppInfo";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useCurrentPnl } from "../../hooks/useCurrentPnl";
import { useToggle } from "../../hooks/useToggle";
import type {
    IDataRequest,
    IOptionsTabsCharts,
    IPagination,
} from "../../types/global";
import { handleTimeRangeChange } from "../../utils/timeRange";
import {
    convertDataCandline,
    convertDataLine,
    optionsTabsCharts,
    timeOptions,
    type IinitialData,
    type IinitialDataCand,
} from "./options";
import { drawLabelWithBackground, FIB_TOLERANCE, fibBaseColors, fibLevels, formatDateLabel, getCssVar, type FibBlock } from "./type";
import Icon from "../../assets/icon";
import Rsi from "../../components/rsi/Rsi";

// Khoảng thời gian 1 nến (M5 = 300 giây)
const BAR_INTERVAL = 300;

export default function HomePage() {
    const { t } = useTranslation()
    const { serverMonitorActive } = useAppInfo()
    const { currentPnl } = useCurrentPnl()

    const chartRefCurent = useRef<any>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const candleSeriesRef = useRef<any>(null);
    const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);

    const chartRef: any = useRef<IChartApi | null>(null);

    const chartRef1: any = useRef<IChartApi | null>(null);
    const chartRef2: any = useRef<IChartApi | null>(null);
    const [isOpen, toggleOpen] = useToggle(true);

    const [currentRange, setCurrentRange] = useState<string>('M1');

    const [symbols, setSymbols] = useState<IinitialData[]>([]);
    const [symbolsSocket, setSymbolsSocket] = useState<IinitialData[]>([]);

    const [symbolsCand, setSymbolsCand] = useState<IinitialDataCand[]>([]);
    const [symbolsCandSocket, setSymbolsCandSocket] = useState<IinitialDataCand[]>([]);

    const [activeTab, setActiveTab] = useState<IOptionsTabsCharts[]>(optionsTabsCharts);
    const [pagination, setPagination] = useState<IPagination>({
        limit: 10000,
        page: 1,
        total: 100,
        totalPage: 1,
        last_time: undefined,
        has_more: false
    });
    const [loading, setLoading] = useState<boolean>(false);

    const isFetchingRef = useRef(false);

    const serverId: number = useMemo(() => { return Number(serverMonitorActive?.value) }, [serverMonitorActive?.value])

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const dragStart = useRef<{ x: number; y: number; a: any; b: any } | null>(null);

    const [fibMode, setFibMode] = useState(false);
    const [dragging, setDragging] = useState(false);

    const [isCheckFibonacci, setIsCheckFibonacci] = useState(false);

    const allData = useRef<BarData[]>([]);
    const widthCharRef = useRef<any>(0);

    const [fibBlocks, setFibBlocks] = useState<FibBlock[]>([]);
    const [activeFibId, setActiveFibId] = useState<string | null>(null);
    const [isRsi, setIsRsi] = useState<boolean>(false);

    // Gọi api khi page thay đổi
    const getSymbolApi = async (idServer: number) => {
        try {
            const res: IDataRequest<IDataSymbols> = await symbolApi(
                { last_time: pagination.last_time, limit: pagination.limit },
                idServer
            );

            setPagination((prev) => ({
                ...prev,
                total: res.data.total,
                totalPage: Math.ceil(res.data.total / res.data.limit),
                last_time: res.data.next_cursor,
                has_more: res.data.has_more
            }));

            const dataNew = convertDataLine(res.data.data);

            setSymbols((prev) => [...dataNew, ...prev])
            setSymbolsCand((prev) => [...convertDataCandline(res.data.data), ...prev])
        } catch (err) {
            console.error("Failed to fetch symbols:", err);
        }
    };

    // gọi api khi serverId đổi
    const getSymbolApiServerId = async (serverId: number) => {
        setLoading(true);
        try {
            const res: IDataRequest<IDataSymbols> = await symbolApi(
                { last_time: undefined, limit: pagination.limit },
                serverId
            );

            setPagination((prev) => ({
                ...prev,
                total: res.data.total,
                totalPage: Math.ceil(res.data.total / res.data.limit),
                has_more: res.data.has_more,
                last_time: res.data.next_cursor,
            }));

            setSymbolsCand(convertDataCandline(res.data.data));
            setSymbols(convertDataLine(res.data.data));
        } catch (error) {
            console.error("Failed to fetch symbols:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (currentPnl) {
            setSymbolsSocket(convertDataLine([currentPnl]))
            setSymbolsCandSocket(convertDataCandline([currentPnl]))
        }
    }, [currentPnl]);

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

        return () => { ignore = true };
    }, [pagination.page]);

    useEffect(() => {
        if (serverId) {
            setPagination((prev) => ({ ...prev, last_time: undefined }));
            setSymbols([]);
            setSymbolsCand([]);
            getSymbolApiServerId(serverId);
        }
    }, [serverId]);

    const handleClick = (selected: IOptionsTabsCharts) => {
        const updated = activeTab.map((tab) => ({
            ...tab,
            active: tab.tabsName === selected.tabsName,
        }));

        if (canvasRef.current && selected.tabsName === "Biểu đồ đường") {
            canvasRef.current.style.pointerEvents = "none"
        }
        setIsCheckFibonacci((selected.tabsName === "Biểu đồ đường"))

        setActiveTab(updated);
        setIsRsi(false)
    };

    const handleRangeChange = (seconds: number | null, label: string) => {
        if (chartRef1.current) {
            handleTimeRangeChange(chartRef1, symbols, seconds, "line");
        }
        if (chartRef2.current) {
            handleTimeRangeChange(chartRef2, symbolsCand, seconds);
        }
        setCurrentRange(label);
    };

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Nếu đã có rồi thì không tạo thêm
        if (!canvasRef.current) {
            const canvas = document.createElement("canvas");
            canvas.style.position = "absolute";
            canvas.style.top = "0";
            canvas.style.left = "0";
            canvas.style.pointerEvents = "none";
            canvas.style.zIndex = "10";
            chartContainerRef.current.appendChild(canvas);
            canvasRef.current = canvas;
        }

        const resize = () => {
            if (!canvasRef.current || !chartContainerRef.current) return;
            canvasRef.current.width = chartContainerRef.current!.clientWidth;
            canvasRef.current.height = chartContainerRef.current!.clientHeight;
            drawFib()
        };
        resize();
        window.addEventListener("resize", resize);

        return () => {
            window.removeEventListener("resize", resize);
        };
    }, [chartContainerRef.current, candleSeriesRef.current]);

    useEffect(() => {
        if (!chartContainerRef.current || !symbolsCand?.length) return;

        const fixed = normalizeChartData(symbolsCand).sort((a: any, b: any) => a.time - b.time);
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

        // const data = renderData(allData.current)
        if (candleSeriesRef.current) {
            drawFib()
        }
    }, [symbolsCand]);

    useEffect(() => {
        if (!chartRef.current) return
        widthCharRef.current = chartRef.current.timeScale().width()
    }, [])

    const drawFib = () => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx || !chartRef.current || !candleSeriesRef.current) return;
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

        fibBlocks.forEach((block, id) => {
            const { anchorA, anchorB } = block;
            if (!anchorA || !anchorB) return;
            const priceScale = candleSeriesRef.current;
            const timeScale = chartRef.current.timeScale();

            const x1 = timeScale.timeToCoordinate(anchorA.time);
            const x2 = timeScale.timeToCoordinate(anchorB.time);
            if (x1 == null || x2 == null) return;

            const high = Math.max(anchorA.price, anchorB.price);
            const low = Math.min(anchorA.price, anchorB.price);
            const diff = high - low;
            const up = anchorA.price < anchorB.price;

            fibLevels.forEach((l, idx) => {
                const price = up ? high - diff * l : low + diff * l;
                const y = priceScale.priceToCoordinate(price);
                if (y == null) return;

                // 🎨 Lấy màu cho level này
                const baseColor = fibBaseColors[idx % fibBaseColors.length];

                // fill giữa 2 levels
                if (idx < fibLevels.length - 1) {
                    const nextPrice = up ? high - diff * fibLevels[idx + 1] : low + diff * fibLevels[idx + 1];
                    const y2 = priceScale.priceToCoordinate(nextPrice);
                    if (y2 != null) {

                        // Nền (fill nhạt)
                        ctx.fillStyle = `rgba(${baseColor}, 0.2)`;
                        ctx.fillRect(Math.min(x1!, x2!), y, Math.abs(x2! - x1!), y2 - y);

                        // Viền (stroke đậm)
                        ctx.strokeStyle = `rgba(${baseColor}, 1)`;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(x1!, y);
                        ctx.lineTo(x2!, y);
                        ctx.stroke();
                    }

                    if (idx === 0) {
                        // label
                        ctx.fillStyle = getCssVar("--color-background");
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText(
                            `${t("bản vẽ")} ${id + 1}`,
                            (x1! + x2!) / 2,  // vị trí bên trái
                            y + 10
                        );
                    }

                    // 🎯 Chỉ bôi màu Y-axis cho 5 vạch đầu
                    if (idx < 6) {
                        const axisWidth = 60;
                        // const chartWidth = chartRef.current.timeScale().width();
                        const priceScaleLeft = widthCharRef.current - 58;   // mép trái của trục Y

                        const top = Math.min(y, y2);
                        const height = Math.abs(y2 - y);

                        // 👉 Tô đậm hơn
                        ctx.fillStyle = getCssVar("--color-background-opacity-2");
                        ctx.fillRect(priceScaleLeft, top, axisWidth, height);

                        // 👉 Chỉ hiển thị label ở dòng 1 (idx === 0) và dòng cuối (idx === 5)
                        ctx.fillStyle = "white";
                        ctx.font = "12px Arial";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";   // canh giữa theo chiều dọc

                        if (idx === 0) {
                            // Label nằm giữa vạch trên
                            drawLabelWithBackground(
                                ctx,
                                price.toFixed(2),
                                priceScaleLeft + axisWidth / 2,
                                y // vạch trên
                            );
                        }

                        if (idx === 5) {
                            // Label nằm giữa vạch dưới
                            drawLabelWithBackground(
                                ctx,
                                nextPrice.toFixed(2),
                                priceScaleLeft + axisWidth / 2,
                                y2 // vạch dưới
                            );
                        }
                    }
                }

                // label
                ctx.fillStyle = `rgba(${baseColor}, 1)`;
                ctx.textAlign = "right";
                ctx.textBaseline = "middle";
                ctx.fillText(
                    `${l} (${price.toFixed(2)})`,
                    Math.min(x1!, x2!) - 5,  // vị trí bên trái
                    y
                );
            });

            // === Vẽ đường đứt nối anchorA ↔ anchorB ===
            ctx.beginPath();
            ctx.setLineDash([6, 6]);
            ctx.moveTo(x1, priceScale.priceToCoordinate(anchorA.price)!);
            ctx.lineTo(x2, priceScale.priceToCoordinate(anchorB.price)!);
            ctx.strokeStyle = "rgba(0,0,0,0.6)";
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
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.strokeStyle = getCssVar("--color-background");
                ctx.stroke();
            };

            const ts = chartRef.current.timeScale();
            const width = Math.abs(x2 - x1);
            const left = Math.min(x1, x2);

            // Lấy chiều cao canvas
            const h = canvasRef.current!.height;

            // Vẽ 1 dải màu ở cuối (gần trục X)
            ctx.fillStyle = getCssVar("--color-background-opacity-2"); // xanh nhạt
            ctx.fillRect(left, h - 27, width, 20);   // cao 20px ở sát đáy chart

            // === Vẽ label thời gian A và B ===
            const timeA = ts.coordinateToTime(x1); // lấy time gốc từ chart
            const timeB = ts.coordinateToTime(x2);

            ctx.fillStyle = "black";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";

            if (timeA) {
                const text = formatDateLabel(timeA);
                ctx.font = "12px Arial";
                const metrics = ctx.measureText(text);
                const paddingX = 4;
                const paddingY = 6;
                const textWidth = metrics.width + paddingX * 4;
                const textHeight = 20; // fix height (12px font + padding)
                const rectX = x1 - textWidth / 2;
                const rectY = h - 27; // đặt cao hơn chút so với fillRect dưới trục

                // Vẽ nền đậm
                ctx.fillStyle = getCssVar("--color-background");
                ctx.fillRect(rectX, rectY, textWidth, textHeight);

                // Vẽ chữ trắng
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.fillText(text, x1, rectY + paddingY);
            }
            if (timeB) {
                const text = formatDateLabel(timeB);
                ctx.font = "12px Arial";
                const metrics = ctx.measureText(text);
                const paddingX = 4;
                const paddingY = 6;
                const textWidth = metrics.width + paddingX * 2;
                const textHeight = 20;
                const rectX = x2 - textWidth / 2;
                const rectY = h - 27;

                ctx.fillStyle = getCssVar("--color-background");
                ctx.fillRect(rectX, rectY, textWidth, textHeight);

                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.fillText(text, x2, rectY + paddingY);
            }

            drawHandle(anchorA);
            drawHandle(anchorB);
        });
    };

    useEffect(() => {
        if (!fibMode) return;

        const canvas = canvasRef.current;
        const container = chartContainerRef.current;
        if (!canvas || !container || !chartRef.current || !candleSeriesRef.current) return;

        const priceScale = candleSeriesRef.current;
        const timeScale = chartRef.current.timeScale();

        const setCursor = (cursor: string) => { container.style.cursor = cursor; };
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
                const dx = px - xx, dy = py - yy;
                return Math.sqrt(dx * dx + dy * dy) <= 8;
            };

            // === Loop qua fibBlocks để check ===
            fibBlocks.forEach(block => {
                if (handled) return;
                // resize A
                if (checkHandleHit(block.anchorA, x, y)) {
                    setActiveFibId(block.id);
                    setFibBlocks(prev => prev.map(b => b.id === block.id ? { ...b, resizing: "A" } : b));
                    setDragging(true);
                    setCursor("grabbing");
                    chartRef.current!.applyOptions({ handleScroll: false, handleScale: false });
                    handled = true;
                }
                // resize B
                if (!handled && checkHandleHit(block.anchorB, x, y)) {
                    setActiveFibId(block.id);
                    setFibBlocks(prev => prev.map(b => b.id === block.id ? { ...b, resizing: "B" } : b));
                    setDragging(true);
                    setCursor("grabbing");
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

                    const fibRect = { left: Math.min(x1, x2), right: Math.max(x1, x2), top: Math.min(yHigh, yLow), bottom: Math.max(yHigh, yLow) };

                    let isOnLine = false;
                    for (const lvl of fibLevels) {
                        const priceLvl = up ? high - diff * lvl : low + diff * lvl;
                        const yLevel = priceScale.priceToCoordinate(priceLvl);
                        if (yLevel != null &&
                            Math.abs(y - yLevel) <= FIB_TOLERANCE &&
                            x >= fibRect.left && x <= fibRect.right) {
                            isOnLine = true;
                            break;
                        }
                    }

                    if (isOnLine) {
                        setActiveFibId(block.id);
                        dragStart.current = { x, y, a: { ...block.anchorA }, b: { ...block.anchorB } };
                        setFibBlocks(prev => prev.map(b => b.id === block.id ? { ...b, moving: true } : b));
                        setDragging(true);
                        setCursor("grabbing");
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
                setFibBlocks(prev => [...prev, newBlock]);
                setActiveFibId(newBlock.id);
                setDragging(true);
                setCursor("grabbing");
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

            setCursor("grabbing");
            setFibBlocks(prev => prev.map(block => {
                if (block.id !== activeFibId) return block;

                // tạo mới → kéo anchorB
                if (!block.done && dragging) {
                    return { ...block, anchorB: { time, price } };
                }

                // resize
                if (block.resizing === "A") {
                    return { ...block, anchorA: { time, price } };
                }
                if (block.resizing === "B") {
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
                            anchorB: { time: newBTime as UTCTimestamp, price: newBPrice }
                        };
                    }
                }
                return block;
            }));
        };

        // === HANDLE UP ===
        const handleUp = () => {
            if (!dragging || !activeFibId) return;
            setFibBlocks(prev => prev.map(block =>
                block.id === activeFibId
                    ? { ...block, done: true, moving: false, resizing: null }
                    : block
            ));

            setDragging(false);
            setActiveFibId(null);
            chartRef.current!.applyOptions({ handleScroll: true, handleScale: true });
            setCursor("default");
        };

        if (!fibMode || !chartRef.current) return;

        const handleVisibleRangeChange = () => {
            drawFib(); // vẽ lại fib khi chart pan/zoom
        };
        timeScale.subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

        let raf: number;
        const loop = () => {
            drawFib();
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);

        // Quan trọng: lắng nghe trên CANVAS với capture để chặn chart
        canvas.addEventListener("mousedown", handleDown, { capture: true });
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);

        return () => {
            timeScale.unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
            cancelAnimationFrame(raf)
            canvas.removeEventListener("mousedown", handleDown, { capture: true } as any);
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };
    }, [fibMode, dragging, activeFibId, fibBlocks]);

    const handleDelete = (idx: number) => {
        if (idx >= 0) {
            const dataNew = fibBlocks.filter((_, id) => id !== idx)
            setFibBlocks(dataNew)
        } else if (idx < 0) {
            setFibBlocks([])
        }
    }

    useEffect(() => {
        if (!chartRefCurent.current) return

        chartRefCurent.current.applyOptions({
            timeScale: {
                visible: !isRsi
            },
            height: isRsi ? 450 : 600
        })
    }, [isRsi, chartRefCurent.current])

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
                                        className={`flex justify-center items-center h-[40px] w-[40px] rounded-lg ${item.active
                                            ? "text-[var(--color-text)] bg-[var(--color-background)] active"
                                            : "bg-gray-200 text-black hover:text-[var(--color-text)] hover:bg-[var(--color-background-opacity-5)] border border-rose-100 dark:hover:border-rose-200"
                                            } cursor-pointer`}
                                        aria-current="page"
                                    >
                                        {item.icon}
                                    </Button>
                                </TooltipCustom>
                            </React.Fragment>
                        ))}

                        <Filter handleClick={handleRangeChange} currentRange={currentRange} />
                    </div>

                    {
                        activeTab.filter((item: IOptionsTabsCharts) => item?.active)[0]?.tabsName === "Biểu đồ nến" && (
                            <>
                                <TooltipCustom handleClick={() => {
                                    setIsCheckFibonacci((prev) => !prev)
                                    setFibMode(true);
                                    drawFib();
                                    if (canvasRef.current) {
                                        canvasRef.current.style.pointerEvents = !isCheckFibonacci ? "auto" : "none"
                                    }
                                }} w="w-[40px]" h="h-[40px]" titleTooltip={"fibonacci thoái lui"} classNameButton={`${isCheckFibonacci ? "bg-[var(--color-background)] text-white" : "text-black bg-gray-200"}`}>
                                    <Icon name="icon-fibonacci" width={18} height={18} />
                                </TooltipCustom>

                                <DeleteFibonacci data={fibBlocks} onClick={handleDelete} />

                                <TooltipCustom handleClick={() => {
                                    setIsRsi((prev) => !prev)
                                }} w="w-[40px]" h="h-[40px]" titleTooltip={"Chỉ báo hội tụ RSI 14"} classNameButton={`${isRsi ? "bg-[var(--color-background)] text-white" : "text-black bg-gray-200"}`}>
                                    <Icon name="icon-rsi" width={22} height={22} />
                                </TooltipCustom>

                                <button className="flex items-center ml-4 cursor-pointer" onClick={toggleOpen}>
                                    <input checked={isOpen} readOnly type="checkbox" value="" className="custom-checkbox cursor-pointer appearance-none bg-gray-100 checked:bg-[var(--color-background)] w-4 h-4 rounded-sm dark:bg-white border border-[var(--color-background)] ring-offset-[var(--color-background)]" />
                                    <label htmlFor="green-checkbox" className="cursor-pointer ms-2 text-sm font-medium text-gray-900 dark:text-gray-900">{t("Đường trung bình")}</label>
                                </button>
                            </>
                        )
                    }
                </div>
            </div>

            <div className="mt-5 p-2 border border-gray-200  overflow-hidden rounded-lg shadow-xl">
                <div ref={chartContainerRef} style={{ position: "relative" }}>
                    {activeTab.map((item) => (
                        <React.Fragment key={item.tabsName}>
                            {item.active && (
                                loading ? <Loading /> :
                                    item.tabsName === "Biểu đồ đường" ?
                                        <ChartComponent
                                            chartContainerRef={chartContainerRef}
                                            chartRef={chartRef}
                                            chartRefCurent={chartRefCurent}
                                            seriesRef={seriesRef}
                                            dataOld={symbols}
                                            setPagination={setPagination}
                                            latestData={symbolsSocket}
                                            currentRange={currentRange}
                                        />
                                        :
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
                                        />
                            )}
                        </React.Fragment>
                    ))}
                    {
                        activeTab.find((a) => a.active && a.tabsName === "Biểu đồ nến") && isRsi && <>
                            <Rsi candleData={symbolsCand} chartRefCandl={chartRef} currentRange={currentRange} />
                            <div className="absolute w-[calc(100%-58px)] h-[120px] bg-[var(--color-background-opacity-1)] bottom-[27px] left-0 right-0"></div>
                        </>
                    }
                </div>
            </div>
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
    useClickOutside(popupRef, () => {
        setOpen(false);
        setTimeout(() => setVisible(false), 200);
    }, visible);
    return (
        <div ref={popupRef} className="z-30 relative">
            <Button
                onClick={handleToggle}
                className={`flex justify-center items-center rounded-lg w-[40px] h-[40px] active cursor-pointer font-semibold shadow-xs shadow-gray-500 text-[var(--color-text)] bg-[var(--color-background)]`}
            >
                <div>{timeOptions.find((a) => a.label === currentRange)?.label}</div>
            </Button>

            {visible && (
                <div className={`grid grid-cols-5 sm:grid-cols-11 gap-2 w-[300px] sm:w-[600px] transition-all duration-200 absolute -top-3 -left-24 mt-2 bg-white shadow-sm shadow-gray-300 rounded-lg border border-gray-200 p-2 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                    {timeOptions.map((opt: any) => (
                        <Button
                            key={opt.label}
                            onClick={() => {
                                handleToggle()
                                handleClick(opt.seconds, opt.label)
                            }
                            }
                            className={`p-0 h-[40px] w-[46px] rounded-lg ${currentRange === opt.label
                                ? "text-[var(--color-text)] bg-[var(--color-background)] active"
                                : "bg-gray-200 text-black hover:bg-[var(--color-background-opacity-2)] hover:text-[var(--color-background)] border border-rose-100 dark:hover:border-rose-200"
                                } cursor-pointer font-semibold`}
                        >
                            <div>{opt.label}</div>
                        </Button>
                    ))}
                </div>
            )}
        </div>
    )
}

const DeleteFibonacci = ({ data, onClick }: { data: any, onClick: any }) => {
    const { t } = useTranslation()
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

    useClickOutside(popupRef, () => {
        setOpen(false);
        setTimeout(() => setVisible(false), 200);
    }, visible);

    return <div ref={popupRef} className="relative z-20">
        {data.length !== 0 &&
            <div className="absolute top-1 right-1 z-10 bg-white rounded-2xl text-[12px] font-bold w-[14px] h-[14px] flex justify-center items-center text-[var(--color-background)]">
                {data.length}
            </div>
        }
        <TooltipCustom handleClick={handleToggle} w="w-[40px]" h="h-[40px]" titleTooltip={"Xóa fibonacci thoái lui"} classNameButton={`${data.length !== 0 ? "bg-[var(--color-background)] text-white" : "text-black bg-gray-200"}`}>
            <Icon name="icon-delete" width={18} height={18} />
        </TooltipCustom>

        {data.length !== 0 && visible && (
            <div className={`ml-2 transition-all duration-200 absolute -top-2 left-full mt-2 bg-white shadow-sm shadow-gray-300 rounded-lg border border-gray-300 p-2 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
                {data?.map((_: any, idx: number) => {
                    return <Button key={idx} className="shadow-none text-black cursor-pointer font-semibold w-[200px] text-left px-4 hover:bg-[var(--color-background-opacity-2)] hover:text-[var(--color-background)] py-2" onClick={() => onClick(idx)}>{t("Xóa bản vẽ")} {idx + 1}</Button>
                })}

                <Button className="shadow-none text-black cursor-pointer font-semibold w-[200px] text-left px-4 hover:bg-[var(--color-background-opacity-2)] hover:text-[var(--color-background)] py-2" onClick={() => onClick(-1)}>{t("Xóa tất cả các bản vẽ")}</Button>
            </div>
        )}
    </div>
}