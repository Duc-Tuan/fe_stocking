import React, { useEffect, useRef } from 'react';
import { getColorChart } from '../../utils/timeRange';

type Props = {
  chartRef: React.MutableRefObject<any>;
  seriesRefs: React.RefObject<any>[]; // array của tất cả series
  candleIndicator: any[];
  activeIndex: number; // index của series hiện tại
  chartContainerRef?: React.RefObject<HTMLDivElement | null>;
};

export const VolumeProfileOverlay: React.FC<Props> = ({
  chartRef,
  seriesRefs,
  candleIndicator,
  activeIndex,
  chartContainerRef,
}) => {
  const overlayRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const seriesRef = seriesRefs[activeIndex];
    if (!seriesRef?.current || !overlayRef.current || !chartRef.current) return;

    const width = chartContainerRef?.current!.clientWidth

    const overlay = overlayRef.current;
    overlay.style.width = `${Number(width) - 52}px`
    const ctx = overlay.getContext('2d')!;

    const resizeOverlay = () => {
      const dpr = window.devicePixelRatio || 1;
      overlay.width = overlay.clientWidth * dpr;
      overlay.height = overlay.clientHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resizeOverlay();

    // 🔹 cache data
    let cachedRange: { from: number; to: number } | null = null;
    let cachedProfile: any[] = [];
    let poc: any, VAH: number, VAL: number;

    function calculateProfile(ohlcv: any[], bins = 40) {
      if (!ohlcv.length) return [];
      const low = Math.min(...ohlcv.map((d) => d.low));
      const high = Math.max(...ohlcv.map((d) => d.high));
      const step = (high - low) / bins;
      const profile: Record<string, number> = {};

      ohlcv.forEach((candle) => {
        const lo = Math.floor(candle.low / step) * step;
        const hi = Math.ceil(candle.high / step) * step;
        for (let price = lo; price <= hi; price += step) {
          const key = price.toFixed(2);
          profile[key] = (profile[key] || 0) + 1;
        }
      });

      return Object.entries(profile).map(([price, vol]) => ({
        price: parseFloat(price),
        volume: vol as number,
      }));
    }

    function prepareProfile() {
      const visibleRange = chartRef.current.timeScale().getVisibleRange();
      if (!visibleRange) return;

      if (cachedRange && cachedRange.from === visibleRange.from && cachedRange.to === visibleRange.to) return;

      cachedRange = visibleRange;
      const visibleData = candleIndicator.filter((d) => d.time >= visibleRange.from && d.time <= visibleRange.to);

      cachedProfile = calculateProfile(visibleData, 40);
      if (!cachedProfile.length) return;

      const maxVol = Math.max(...cachedProfile.map((p) => p.volume)) || 1;
      poc = cachedProfile.reduce((a, b) => (a.volume > b.volume ? a : b), { price: 0, volume: 0 });

      // VAH/VAL
      const totalVol = cachedProfile.reduce((s, p) => s + p.volume, 0);
      const targetVol = totalVol * 0.7;
      const sorted = [...cachedProfile].sort((a, b) => b.volume - a.volume);
      let cumVol = 0;
      const included: typeof cachedProfile = [];
      for (let i = 0; i < sorted.length; i++) {
        included.push(sorted[i]);
        cumVol += sorted[i].volume;
        if (cumVol >= targetVol) break;
      }
      const prices = included.map((p) => p.price);
      VAL = Math.min(...prices);
      VAH = Math.max(...prices);

      cachedProfile.forEach((p) => (p.norm = p.volume / maxVol));
    }

    function drawProfile() {
      ctx.clearRect(0, 0, overlay.clientWidth, overlay.clientHeight);
      if (!cachedProfile.length) return;

      const dpr = window.devicePixelRatio || 1;
      const fullWidth = overlay.width / dpr;
      const barAreaWidth = 120;
      const gap = 20;
      const barX = fullWidth - barAreaWidth;

      cachedProfile.forEach((p) => {
        const y = seriesRef.current.priceToCoordinate(p.price);
        if (!y) return;
        const barWidth = p.norm * barAreaWidth;
        if (p.price === poc.price) {
          ctx.fillStyle = 'red';
        } else if (p.price >= VAH || p.price <= VAL) {
          ctx.fillStyle = getColorChart('--color-background-opacity-2');
        } else {
          ctx.fillStyle = getColorChart();
        }
        ctx.fillRect(barX + (barAreaWidth - barWidth), y - 3, barWidth, 6);
      });

      const drawLine = (price: number, color: string) => {
        const y = seriesRef.current.priceToCoordinate(price);
        if (!y) return;
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(barX - gap, y);
        ctx.stroke();
      };

      drawLine(poc.price, 'red');
      drawLine(VAH, getColorChart());
      drawLine(VAL, getColorChart());
    }

    const update = () => {
      prepareProfile();
      drawProfile();
    };

    chartRef.current.timeScale().subscribeVisibleTimeRangeChange(update);
    chartRef.current.subscribeCrosshairMove(update);
    update();

    const handleResize = () => {
      chartRef.current.resize(chartContainerRef?.current?.clientWidth, chartContainerRef?.current?.clientHeight);
      resizeOverlay();
      update();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      chartRef.current?.timeScale()?.unsubscribeVisibleTimeRangeChange(update);
      chartRef.current?.unsubscribeCrosshairMove(update);
      window.removeEventListener('resize', handleResize);
    };
  }, [candleIndicator, chartRef, seriesRefs, activeIndex]);

  return (
    <canvas
      ref={overlayRef}
      className="absolute top-2 right-16 bottom-0 h-[calc(100%-44px)] w-[94%] pointer-events-none"
    />
  );
};