import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import { getCssVar } from "../Home/type";

export default function ChartWithTrendlines() {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<any>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [strokes, setStrokes] = useState<{ x: number; y: number }[][]>([]);
    const currentStroke = useRef<{ x: number; y: number }[]>([]);

    const [draggingStrokeIndex, setDraggingStrokeIndex] = useState<number | null>(null);
    const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    function drawSmoothLine(ctx: CanvasRenderingContext2D, points: { x: number, y: number }[]) {
        if (points.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 0; i < points.length - 1; i++) {
            const midX = (points[i].x + points[i + 1].x) / 2;
            const midY = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
        }
        ctx.stroke();
    }

    function redraw(allStrokes: { x: number; y: number }[][]) {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        allStrokes.forEach((stroke) => {
            drawSmoothLine(ctx, stroke);

            // vẽ chấm tròn ở đầu & cuối stroke
            if (stroke.length > 1) {
                // điểm đầu
                ctx.beginPath();
                ctx.arc(stroke[0].x, stroke[0].y, 4, 0, Math.PI * 2);
                ctx.fillStyle = "white";       // màu trong
                ctx.fill();
                ctx.strokeStyle = getCssVar("--color-background");;     // viền dễ thấy
                ctx.lineWidth = 2;
                ctx.stroke();

                // điểm cuối
                ctx.beginPath();
                ctx.arc(stroke[stroke.length - 1].x, stroke[stroke.length - 1].y, 4, 0, Math.PI * 2);
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.strokeStyle = getCssVar("--color-background");;
                ctx.stroke();
            }
        }
        );
    }

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, { width: 600, height: 400 });
        const candleSeries = chart.addCandlestickSeries();

        const data: any = [
            { time: 1, open: 100, high: 110, low: 95, close: 105 },
            { time: 2, open: 105, high: 120, low: 100, close: 115 },
            { time: 3, open: 115, high: 125, low: 110, close: 120 },
            { time: 4, open: 120, high: 130, low: 115, close: 125 },
            { time: 5, open: 125, high: 135, low: 120, close: 130 },
        ];
        candleSeries.setData(data);

        chartRef.current = chart;

        const canvas = canvasRef.current!;
        canvas.style.zIndex = "10";
        canvas.style.pointerEvents = "auto";
        canvas.width = chartContainerRef.current!.clientWidth;
        canvas.height = chartContainerRef.current!.clientHeight;

        redraw(strokes);
    }, []);

    // Kiểm tra click gần stroke nào
    function findStrokeAt(x: number, y: number): number | null {
        const tolerance = 5;
        for (let i = 0; i < strokes.length; i++) {
            const stroke = strokes[i];
            for (let j = 0; j < stroke.length; j++) {
                if (Math.hypot(stroke[j].x - x, stroke[j].y - y) < tolerance) {
                    return i;
                }
            }
        }
        return null;
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        // thử chọn stroke cũ
        const hitIndex = findStrokeAt(x, y);
        if (hitIndex !== null) {
            setDraggingStrokeIndex(hitIndex);
            dragStart.current = { x, y };
            return;
        }

        // nếu không chọn trúng stroke nào thì bắt đầu vẽ mới
        setIsDrawing(true);
        currentStroke.current = [{ x, y }];
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        if (draggingStrokeIndex !== null) {
            // đang kéo stroke
            const dx = x - dragStart.current.x;
            const dy = y - dragStart.current.y;

            const newStrokes = [...strokes];
            newStrokes[draggingStrokeIndex] = newStrokes[draggingStrokeIndex].map((p) => ({
                x: p.x + dx,
                y: p.y + dy,
            }));
            setStrokes(newStrokes);
            dragStart.current = { x, y };
            redraw(newStrokes);
            return;
        }

        if (!isDrawing) return;

        const last = currentStroke.current[currentStroke.current.length - 1];
        if (!last || Math.hypot(last.x - x, last.y - y) > 2) {
            currentStroke.current.push({ x, y });
        }

        const ctx = canvasRef.current!.getContext("2d")!;
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

        redraw(strokes);
        drawSmoothLine(ctx, currentStroke.current);
    };

    const handleMouseUp = () => {
        if (draggingStrokeIndex !== null) {
            setDraggingStrokeIndex(null);
            return;
        }

        if (isDrawing) {
            setIsDrawing(false);
            setStrokes((prev) => [...prev, [...currentStroke.current]]);
        }
    };

    return (
        <div ref={chartContainerRef} style={{ position: "relative", width: 600, height: 400 }}>
            <canvas
                ref={canvasRef}
                style={{ position: "absolute", top: 0, left: 0 }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            />
        </div>
    );
}
