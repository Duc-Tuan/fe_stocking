import { useEffect, useRef } from 'react';
import { ColorType, createChart } from 'lightweight-charts';
import { gridColor } from '../../components/line/formatTime';
import { getColorChart } from '../../utils/timeRange';

const ChartWithTrendlines = (props: any) => {
  const { colors: { backgroundColor = 'transparent', textColor = 'black' } = {} } = props;
  const chartContainerRef = useRef<any>(null);
  const overlayRef = useRef<any>(null);
  const chartRef = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);
  const dataRef = useRef<any>([]);

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
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

    chartRef.current = chart;
    const candleSeries = chart.addCandlestickSeries();
    candleSeriesRef.current = candleSeries;

    // 🔹 tạo dữ liệu mẫu OHLCV
    const data: any = [];
    let price = 100;
    for (let i = 0; i < 200; i++) {
      const open = price;
      const close = open + (Math.random() - 0.5) * 2;
      const high = Math.max(open, close) + Math.random() * 2;
      const low = Math.min(open, close) - Math.random() * 2;
      const volume = Math.floor(100 + Math.random() * 500);
      data.push({ time: i + 1, open, high, low, close, volume });
      price = close;
    }

    dataRef.current = data;
    candleSeries.setData(data);

    const overlay = overlayRef.current;
    const ctx = overlay.getContext('2d');

    const resizeOverlay = () => {
      const dpr = window.devicePixelRatio || 1;
      overlay.width = overlay.clientWidth * dpr;
      overlay.height = overlay.clientHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resizeOverlay();

    function calculateVolumeProfile(ohlcv: any, bins = 40) {
      const low = Math.min(...ohlcv.map((d: any) => d.low));
      const high = Math.max(...ohlcv.map((d: any) => d.high));
      const step = (high - low) / bins;

      const profile = Array.from({ length: bins }, (_, i) => ({
        price: low + i * step,
        volume: 0,
      }));

      for (const d of ohlcv) {
        const avgPrice = (d.high + d.low) / 2;
        const idx = Math.floor((avgPrice - low) / step);
        if (profile[idx]) profile[idx].volume += d.volume;
      }

      return profile;
    }

    function drawVolumeProfile() {
      ctx.clearRect(0, 0, overlay.clientWidth, overlay.clientHeight);

      const visibleRange = chart.timeScale().getVisibleRange();
      if (!visibleRange) return;

      const visibleData = dataRef.current.filter((d: any) => d.time >= visibleRange.from && d.time <= visibleRange.to);

      const profile = calculateVolumeProfile(visibleData, 40);
      if (profile.length === 0) return;

      console.log(profile);

      const maxVol = Math.max(...profile.map((p) => p.volume)) || 1;

      const dpr = window.devicePixelRatio || 1;
      const fullWidth = overlay.width / dpr;

      const barAreaWidth = 120; // vùng để vẽ Volume Profile
      const gap = 20; // khoảng cách giữa line và Volume Profile
      const barX = fullWidth - barAreaWidth; // điểm bắt đầu Volume Profile

            // 🚀 Tính POC
      const poc = profile.reduce((a, b) => (a.volume > b.volume ? a : b), { price: 0, volume: 0 });

      // 🚀 Tính VAH & VAL (70% volume)
      const totalVol = profile.reduce((sum, p) => sum + p.volume, 0);
      const targetVol = totalVol * 0.7;
      const sorted = [...profile].sort((a, b) => b.volume - a.volume);
      let cumVol = 0;
      let included: typeof profile = [];
      for (let i = 0; i < sorted.length; i++) {
        included.push(sorted[i]);
        cumVol += sorted[i].volume;
        if (cumVol >= targetVol) break;
      }
      const prices = included.map((p) => p.price);
      const VAL = Math.min(...prices);
      const VAH = Math.max(...prices);

      // 🚀 Vẽ Volume Profile bars
      profile.forEach((p) => {
        const y = candleSeriesRef.current.priceToCoordinate(p.price);
        if (!y) return;
        
        const barWidth = (p.volume / maxVol) * barAreaWidth;
        if (p.price === poc.price) {
          ctx.fillStyle = 'red'; // xanh lá trùng line VAH
        } else if (p.price >= VAH) {
          ctx.fillStyle = getColorChart('--color-background-opacity-2'); // mặc định
        } else {
          ctx.fillStyle = getColorChart(); // mặc định
        }
        ctx.fillRect(barX + (barAreaWidth - barWidth), y - 3, barWidth, 6);
      });

      // 🔹 Helper: vẽ 1 đường ngang
      function drawLine(y: number, color: string, label: string) {
        if (!y) return;
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(barX - gap, y);
        ctx.stroke();
        ctx.fillStyle = color;
      }

      // 🚀 Vẽ các line
      drawLine(candleSeriesRef.current.priceToCoordinate(poc.price), 'red', `POC: ${poc.price.toFixed(2)}`);
      drawLine(candleSeriesRef.current.priceToCoordinate(VAH), getColorChart(), `VAH: ${VAH.toFixed(2)}`);
      drawLine(candleSeriesRef.current.priceToCoordinate(VAL), getColorChart(), `VAL: ${VAL.toFixed(2)}`);
    }

    chart.timeScale().subscribeVisibleTimeRangeChange(drawVolumeProfile);
    chart.subscribeCrosshairMove(() => {
      drawVolumeProfile();
    });

    drawVolumeProfile();

    const handleResize = () => {
      chart.resize(chartContainerRef.current.clientWidth, chartContainerRef.current.clientHeight);
      resizeOverlay();
      drawVolumeProfile();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
      <canvas
        ref={overlayRef}
        style={{
          position: 'absolute',
          top: 0,
          right: '60px',
          bottom: 0,
          width: '95%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default ChartWithTrendlines;
