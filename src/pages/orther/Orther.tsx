import React, { useEffect, useRef, useState } from "react";
import {
    ColorType,
    createChart,
    type IChartApi,
} from "lightweight-charts";
import { gridColor } from "../../components/line/formatTime";
import { getCssVar } from "../Home/type";

interface Trendline {
    start: { time: number; price: number };
    end: { time: number; price: number };
}

const ChartWithTrendlines = ({ colors: {
    backgroundColor = 'transparent',
    textColor = 'black',
    upColor = '#4bffb5',
    borderUpColor = '#4bffb5',
    wickUpColor = '#4bffb5',
    borderDownColor = '#ff4976',
    downColor = '#ff4976',
    wickDownColor = '#ff4976',
} = {}, }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<any>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [drawing, setDrawing] = useState(false);

    // refs giữ dữ liệu runtime
    const trendlinesRef = useRef<Trendline[]>([]);
    const tempStartRef = useRef<{ time: number; price: number } | null>(null);
    const tempEndRef = useRef<{ time: number; price: number } | null>(null);

    const draggingLineIndex = useRef<number | null>(null);
    const draggingHandle = useRef<{ lineIndex: number; point: "start" | "end" } | null>(null);
    const dragStart = useRef<{
        mouseX: number;
        mouseY: number;
        start: Trendline;
    } | null>(null);

    const needRedraw = useRef(false);

    // kiểm tra click gần line
    const isPointNearLine = (x: number, y: number, x1: number, y1: number, x2: number, y2: number, tolerance = 5) => {
        const A = x - x1, B = y - y1, C = x2 - x1, D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;
        let xx, yy;
        if (param < 0) { xx = x1; yy = y1; }
        else if (param > 1) { xx = x2; yy = y2; }
        else { xx = x1 + param * C; yy = y1 + param * D; }
        const dx = x - xx, dy = y - yy;
        return dx * dx + dy * dy <= tolerance * tolerance;
    };

    // draw
    const drawAllTrendlines = () => {
        const canvas = canvasRef.current;
        if (!canvas || !chartRef.current || !seriesRef.current) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const timeScale = chartRef.current.timeScale();

        trendlinesRef.current.forEach(line => {
            const x1 = timeScale.logicalToCoordinate(line.start.time as any);
            const y1 = seriesRef.current.priceToCoordinate(line.start.price);
            const x2 = timeScale.logicalToCoordinate(line.end.time as any);
            const y2 = seriesRef.current.priceToCoordinate(line.end.price);
            if (x1 && x2 && y1 && y2) {
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 1;
                ctx.stroke();
                if (drawing) {
                    [[x1, y1], [x2, y2]].forEach(([xx, yy]) => {
                        ctx.beginPath();
                        ctx.arc(xx, yy, 4, 0, 2 * Math.PI);
                        ctx.fillStyle = "white";
                        ctx.fill();
                        ctx.strokeStyle = getCssVar("--color-background");
                        ctx.stroke();
                    });
                }
            }
        });

        // vẽ tạm line mới
        if (tempStartRef.current && tempEndRef.current) {
            const x1 = timeScale.logicalToCoordinate(tempStartRef.current.time as any);
            const y1 = seriesRef.current.priceToCoordinate(tempStartRef.current.price);
            const x2 = timeScale.logicalToCoordinate(tempEndRef.current.time as any);
            const y2 = seriesRef.current.priceToCoordinate(tempEndRef.current.price);
            if (x1 && x2 && y1 && y2) {
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = getCssVar("--color-background");
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            if (x1 && y1) {
                ctx.beginPath();
                ctx.arc(x1, y1, 4, 0, 2 * Math.PI);
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.strokeStyle = getCssVar("--color-background");
                ctx.stroke();
            }
        }
    };

    // init chart
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
            rightPriceScale: { borderColor: '#00000030' },
            timeScale: { timeVisible: true, secondsVisible: true, borderColor: '#00000030' }
        });
        chartRef.current = chart;
        const candleSeries = chart.addCandlestickSeries({
            upColor, downColor, borderUpColor, borderDownColor, wickUpColor, wickDownColor,
        });
        seriesRef.current = candleSeries;

        // sample data
        const data: any[] = [];
        let time = 1, price = 100;
        for (let i = 0; i < 100; i++) {
            const open = price;
            const high = open + Math.round(Math.random() * 10);
            const low = open - Math.round(Math.random() * 10);
            const close = low + Math.round(Math.random() * (high - low));
            data.push({ time, open, high, low, close });
            price = close; time++;
        }
        candleSeries.setData(data);

        const canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "10";
        chartContainerRef.current.appendChild(canvas);
        canvasRef.current = canvas;

        const resize = () => {
            if (!canvasRef.current || !chartContainerRef.current) return;
            canvasRef.current.width = chartContainerRef.current.clientWidth;
            canvasRef.current.height = chartContainerRef.current.clientHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const timeScale = chartRef.current.timeScale();

        const handleVisibleRangeChange = () => {
            drawAllTrendlines(); // gọi lại hàm vẽ mỗi khi pan/zoom
        };

        // Đăng ký event
        timeScale.subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
        return () => {
            chart.remove();
            window.removeEventListener("resize", resize);
            timeScale.unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
            canvasRef.current = null;
            seriesRef.current = null;
            chartRef.current = null;
            chartContainerRef.current = null;
        };
    }, []);

    // loop vẽ
    useEffect(() => {
        drawAllTrendlines();
        if (drawing) {
            let raf: number;
            const loop = () => {
                if (needRedraw.current) {
                    drawAllTrendlines();
                    needRedraw.current = false;
                }
                raf = requestAnimationFrame(loop);
            };
            raf = requestAnimationFrame(loop);
            return () => cancelAnimationFrame(raf);
        }
    }, [drawing]);

    // events
    useEffect(() => {
        if (!drawing || !canvasRef.current || !chartRef.current || !seriesRef.current) return;

        const handleDown = (e: MouseEvent) => {
            const rect = canvasRef.current!.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const timeScale = chartRef.current!.timeScale();

            // check trúng line
            for (let i = 0; i < trendlinesRef.current.length; i++) {
                const line = trendlinesRef.current[i];
                const x1 = timeScale.logicalToCoordinate(line.start.time as any);
                const y1 = seriesRef.current.priceToCoordinate(line.start.price);
                const x2 = timeScale.logicalToCoordinate(line.end.time as any);
                const y2 = seriesRef.current.priceToCoordinate(line.end.price);

                if (x1 && y1 && Math.hypot(x - x1, y - y1) < 7) {
                    draggingHandle.current = { lineIndex: i, point: "start" };
                    return;
                }
                if (x2 && y2 && Math.hypot(x - x2, y - y2) < 7) {
                    draggingHandle.current = { lineIndex: i, point: "end" };
                    return;
                }
                if (x1 && x2 && y1 && y2 && isPointNearLine(x, y, x1, y1, x2, y2, 5)) {
                    draggingLineIndex.current = i;
                    dragStart.current = { mouseX: x, mouseY: y, start: line };
                    return;
                }
            }

            // vẽ line mới
            const time = timeScale.coordinateToLogical(x);
            const price = seriesRef.current.coordinateToPrice(y);
            if (!time || !price) return;
            if (!tempStartRef.current) {
                tempStartRef.current = { time, price };
            } else {
                const newLine: Trendline = { start: tempStartRef.current, end: { time, price } };
                trendlinesRef.current.push(newLine);
                tempStartRef.current = null;
                tempEndRef.current = null;
            }
            needRedraw.current = true;
        };

        const handleMove = (e: MouseEvent) => {
            const rect = canvasRef.current!.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const timeScale = chartRef.current!.timeScale();

            if (draggingLineIndex.current !== null && dragStart.current) {
                const dx = x - dragStart.current.mouseX;
                const dy = y - dragStart.current.mouseY;
                const deltaTime =
                    timeScale.coordinateToLogical(
                        timeScale.logicalToCoordinate(dragStart.current.start.start.time as any)! + dx
                    )! - dragStart.current.start.start.time;
                const deltaPrice =
                    seriesRef.current.coordinateToPrice(
                        seriesRef.current.priceToCoordinate(dragStart.current.start.start.price)! + dy
                    )! - dragStart.current.start.start.price;
                const movedLine: Trendline = {
                    start: {
                        time: dragStart.current.start.start.time + deltaTime,
                        price: dragStart.current.start.start.price + deltaPrice,
                    },
                    end: {
                        time: dragStart.current.start.end.time + deltaTime,
                        price: dragStart.current.start.end.price + deltaPrice,
                    },
                };
                trendlinesRef.current[draggingLineIndex.current] = movedLine;
                needRedraw.current = true;
                return;
            }

            if (draggingHandle.current) {
                const time = timeScale.coordinateToLogical(x);
                const price = seriesRef.current.coordinateToPrice(y);
                if (!time || !price) return;
                trendlinesRef.current[draggingHandle.current.lineIndex] = {
                    ...trendlinesRef.current[draggingHandle.current.lineIndex],
                    [draggingHandle.current.point]: { time, price }
                };
                needRedraw.current = true;
                return;
            }

            if (tempStartRef.current) {
                const time = timeScale.coordinateToLogical(x);
                const price = seriesRef.current.coordinateToPrice(y);
                if (time && price) {
                    tempEndRef.current = { time, price };
                    needRedraw.current = true;
                }
            }
        };

        const handleUp = () => {
            draggingLineIndex.current = null;
            draggingHandle.current = null;
            dragStart.current = null;
        };

        canvasRef.current.addEventListener("mousedown", handleDown, { capture: true });
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);

        return () => {
            canvasRef.current?.removeEventListener("mousedown", handleDown, { capture: true } as any);
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };
    }, [drawing]);

    return (
        <div style={{ position: "relative" }}>
            <div ref={chartContainerRef} />
            <button
                onClick={() => {
                    setDrawing(!drawing);
                    if (canvasRef.current) {
                        canvasRef.current.style.pointerEvents = !drawing ? "auto" : "none";
                    }
                }}
            >
                {drawing ? "Kết thúc vẽ" : "Bật chế độ vẽ"}
            </button>
        </div>
    );
};

export default ChartWithTrendlines;
