import { ColorType, createChart } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { usePriceLines } from '../../hooks/usePriceLines';
import { useRightClickMenu } from '../../hooks/useRightClick';
import { type IinitialDataCand } from '../../pages/Home/options';
import type { IDataPeriod, Iindicator } from '../../pages/Home/type';
import { initSetupIndicatorADR, type ISetupIndicator } from '../../types/global';
import { getColorChart } from '../../utils/timeRange';
import { formatVietnamTimeSmart, gridColor } from '../line/formatTime';
import MenuSetupIndicator from '../menuSetupIndicator';
import SetupIndicator from '../setupIndicator';
import type { IMenuSub } from '../setupIndicator/type';
import { calculateATR } from './type';

export default function Atr({
  candleData,
  chartRefCandl,
  // currentRange,
  chartRefCurentATR,
  setIndicator,
  setDataPeriod,
  activeTab,
  colors: {
    backgroundColor = 'transparent',
    lineColor = getColorChart('--color-background-atr'),
    textColor = 'black',
  } = {},
}: {
  candleData: IinitialDataCand[];
  currentRange: any;
  chartRefCandl: any;
  chartRefCurentATR: any;
  colors?: any;
  setIndicator: any;
  setDataPeriod: React.Dispatch<React.SetStateAction<IDataPeriod>>;
  activeTab: any
}) {
  const chartAtrRef = useRef<HTMLDivElement>(null);
  const chartAtr = useRef<any>(null);

  const seriesRef = useRef<any>(null);

  const currentData = useRef<any>(null);

  const currentDataAtr = useRef<any>(null);
  const [currentAtr, setCurrentAtr] = useState<{ time: any; value: any } | null>(null);

  const { menu, setMenu } = useRightClickMenu(chartAtrRef);
  const [openSetup, setOpenSetup] = useState<boolean>(false);
  const [dataCurrent, setDataCurrent] = useState<ISetupIndicator>(initSetupIndicatorADR);

  useEffect(() => {
    if (!chartAtrRef.current) return;

    // Chart ATR
    const atrChart = createChart(chartAtrRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      grid: gridColor,
      height: 120,
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
      crosshair: {
        vertLine: { labelBackgroundColor: getColorChart() },
        horzLine: { labelBackgroundColor: lineColor },
      },
      localization: {
        locale: 'vi-VN',
        timeFormatter: (time: any) => formatVietnamTimeSmart(time, true),
      },
    });

    const atrSeries = atrChart.addLineSeries({
      color: lineColor,
      lineWidth: 1,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    chartAtr.current = atrChart;
    chartRefCurentATR.current = atrChart;
    seriesRef.current = atrSeries;

    return () => {
      atrChart.remove();
      chartAtr.current = null;
      seriesRef.current = null;
      chartRefCurentATR.current = null;
    };
  }, []);

  useEffect(() => {
    const candleChart = chartRefCandl.current;
    const atrChart = chartAtr.current;

    if (!candleChart || !atrChart) return;

    // Sync zoom/pan giữa 2 chart
    const unsubCandle = candleChart.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
      if (range) {
        atrChart.timeScale().setVisibleLogicalRange(range);
      }
    });

    const unsubAtr = atrChart.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
      if (range) {
        candleChart.timeScale().setVisibleLogicalRange(range);
      }
    });

    // Sync crosshair
    const unsubCrosshair = candleChart.subscribeCrosshairMove((param: any) => {
      if (param.time) {
        const rsiPoint = currentData.current.find((p: any) => p.time === param.time);
        const data = currentDataAtr.current.find((p: any) => p.time === param.time);
        setCurrentAtr(data);

        if (rsiPoint) {
          atrChart.setCrosshairPosition(rsiPoint.value, param.time, seriesRef.current);
        }
      } else {
        setCurrentAtr(currentDataAtr.current[currentDataAtr.current.length - 1]);
        atrChart.clearCrosshairPosition();
      }
    });

    atrChart.priceScale('right').applyOptions({ minimumWidth: 70 });

    // Cleanup
    return () => {
      unsubCandle?.();
      unsubAtr?.();
      unsubCrosshair?.();
    };
  }, [chartRefCandl.current, activeTab]); // Chỉ chạy 1 lần sau mount

  useEffect(() => {
    const atrData = calculateATR(candleData, dataCurrent.period).sort((a: any, b: any) => a.time - b.time);

    currentData.current = atrData;
    currentDataAtr.current = atrData;

    setCurrentAtr(atrData[atrData.length - 1]);

    seriesRef.current.setData(atrData);
  }, [candleData, dataCurrent.period]);

  useEffect(() => {
    setDataPeriod((prev) => ({ ...prev, periodATR: dataCurrent.period ?? 14 }));
  }, [dataCurrent.period]);

  const menuSetup: IMenuSub[] = [
    {
      label: 'Cài đặt chỉ báo',
      value: 'ATR',
      onClick: () => setOpenSetup(true),
    },
    {
      label: 'Bật/tắt đường tiệm cận',
      value: 'activate',
      onClick: () => setDataCurrent((prev) => ({ ...prev, isOpen: !prev.isOpen })),
    },
    {
      label: 'Tắt chỉ báo',
      value: 'indication',
      onClick: () => {
        setIndicator((prev: Iindicator[]) =>
          prev.map((i: Iindicator) => {
            if (i.value === 'atr') {
              return {
                ...i,
                active: false,
              };
            }
            return i;
          }),
        );
      },
    },
  ];

  usePriceLines(seriesRef, dataCurrent);

  return (
    <>
      <div ref={chartAtrRef} style={{ position: 'relative', marginTop: '4px' }}>
        <div className="absolute w-[calc(100%-70px)] h-[120px] bg-[var(--color-background-atr-1)] left-0 right-0 top-0" />

        <div className="absolute left-4 top-1 text-[12px]">
          ATR {dataCurrent.period} <span className="text-gray-400">RMA</span>{' '}
          <span className="text-[var(--color-background)] ml-2">{currentAtr && currentAtr.value.toFixed(2)}</span>
        </div>
      </div>
      {menu && (
        <MenuSetupIndicator
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          dataMenu={menuSetup}
          activate={dataCurrent.isOpen}
        />
      )}
      <SetupIndicator
        title="atr"
        open={openSetup}
        setOpen={setOpenSetup}
        data={dataCurrent}
        setDataCurrent={setDataCurrent}
      />
    </>
  );
}
