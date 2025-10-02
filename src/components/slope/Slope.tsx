// components/Roc.jsx
import { ColorType, createChart, LineStyle } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { usePriceLines } from '../../hooks/usePriceLines';
import { useRightClickMenu } from '../../hooks/useRightClick';
import type { IDataPeriod, Iindicator } from '../../pages/Home/type';
import { initSetupIndicatorROC, type ISetupIndicator } from '../../types/global';
import { getColorChart } from '../../utils/timeRange';
import { formatVietnamTimeSmart, gridColor } from '../line/formatTime';
import MenuSetupIndicator from '../menuSetupIndicator';
import type { IMenuSub } from '../menuSetupIndicator/type';
import SetupIndicator from '../setupIndicator';
import { linearRegressionSlopePeriod } from './type';

export default function Slope({
  candleData,
  chartRefCandl,
  chartRefCurentSLOPE,
  setIndicator,
  setDataPeriod,
  activeTab,
  colors: {
    backgroundColor = 'transparent',
    lineColor = getColorChart('--color-background-slope'),
    textColor = 'black',
  } = {},
}: {
  candleData: any;
  chartRefCandl: any;
  colors?: any;
  chartRefCurentSLOPE: any;
  setIndicator: any;
  setDataPeriod: React.Dispatch<React.SetStateAction<IDataPeriod>>;
  activeTab: any
}) {
  const chartAdrRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<any>(null);
  const chartAdr = useRef<any>(null);

  const currentDataAdr = useRef<any>(null);
  const currentData = useRef<any>(null);

  const [currentSlope, setCurrentSlope] = useState<any | null>(null);

  const { menu, setMenu } = useRightClickMenu(chartAdrRef);
  const [openSetup, setOpenSetup] = useState<boolean>(false);
  const [dataCurrent, setDataCurrent] = useState<ISetupIndicator>(initSetupIndicatorROC);

  useEffect(() => {
    if (!chartAdrRef.current) return;

    const adrChart = createChart(chartAdrRef.current, {
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

    const atrSeries = adrChart.addLineSeries({
      color: lineColor,
      lineWidth: 1,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    atrSeries.createPriceLine({
      price: 0,
      color: getColorChart('--color-background'),
      lineWidth: 1,
      lineStyle: LineStyle.Solid,
      axisLabelVisible: true,
    });

    seriesRef.current = atrSeries;
    chartAdr.current = adrChart;
    chartRefCurentSLOPE.current = adrChart;

    return () => {
      adrChart.remove();
      seriesRef.current = null;
      chartAdr.current = null;
      chartRefCurentSLOPE.current = null;
    };
  }, []);

  useEffect(() => {
    const candleChart = chartRefCandl.current;
    const adrChart = chartAdr.current;

    if (!candleChart || !adrChart) return;

    // Sync zoom/pan giữa 2 chart
    const unsubCandle = candleChart.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
      if (range) {
        adrChart.timeScale().setVisibleLogicalRange(range);
      }
    });

    const unsubAtr = adrChart.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
      if (range) {
        candleChart.timeScale().setVisibleLogicalRange(range);
      }
    });

    // Sync crosshair
    const unsubCrosshair = candleChart.subscribeCrosshairMove((param: any) => {
      if (param.time) {
        const rsiPoint = currentData.current.find((p: any) => p.time === param.time);
        const data = currentDataAdr.current.find((p: any) => p.time === param.time);
        setCurrentSlope(data);

        if (rsiPoint) {
          adrChart.setCrosshairPosition(rsiPoint.value, param.time, seriesRef.current);
        }
      } else {
        setCurrentSlope(currentDataAdr.current[currentDataAdr.current.length - 1]);
        adrChart.clearCrosshairPosition();
      }
    });

    adrChart.priceScale('right').applyOptions({ minimumWidth: 70 });

    // Cleanup
    return () => {
      unsubCandle?.();
      unsubAtr?.();
      unsubCrosshair?.();
    };
  }, [chartRefCandl.current, activeTab]); // Chỉ chạy 1 lần sau mount

  useEffect(() => {
    // tính ADR
    const adrData = linearRegressionSlopePeriod(candleData, dataCurrent.period);

    setCurrentSlope(adrData[adrData.length - 1]);
    currentData.current = adrData;

    currentDataAdr.current = adrData;

    seriesRef.current.setData(adrData);
  }, [candleData, dataCurrent.period]);

  useEffect(() => {
    setDataPeriod((prev) => ({ ...prev, periodSLOPE: dataCurrent.period ?? 12 }));
  }, [dataCurrent.period]);

  const menuSetup: IMenuSub[] = [
    {
      label: 'Cài đặt chỉ báo',
      value: 'SLOPE',
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
            if (i.value === 'slope') {
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
      <div ref={chartAdrRef} style={{ position: 'relative', marginTop: '4px' }}>
        <div className="absolute w-[calc(100%-70px)] h-[120px] bg-[var(--color-background-slope-1)] left-0 right-0 top-0" />

        <div className="absolute left-4 top-1 text-[12px]">
          Slope {dataCurrent.period}{' '}
          <span className="text-[var(--color-background)] ml-2">{currentSlope && currentSlope.value.toFixed(4)}</span>
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
        title="roc"
        open={openSetup}
        setOpen={setOpenSetup}
        data={dataCurrent}
        setDataCurrent={setDataCurrent}
      />
    </>
  );
}
