// components/Adr.jsx
import { ColorType, createChart } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { usePriceLines } from '../../hooks/usePriceLines';
import { useRightClickMenu } from '../../hooks/useRightClick';
import type { IDataPeriod, Iindicator } from '../../pages/Home/type';
import { initSetupIndicatorADR, type IOptionsTabsCharts, type ISetupIndicator } from '../../types/global';
import { getColorChart } from '../../utils/timeRange';
import { calculateADX } from '../../utils/typeRecipe';
import { formatVietnamTimeSmart, gridColor } from '../line/formatTime';
import MenuSetupIndicator from '../menuSetupIndicator';
import type { IMenuSub } from '../menuSetupIndicator/type';
import SetupIndicator from '../setupIndicator';

export default function Adx({
  candleData,
  chartRefCandl,
  chartRefCurentADX,
  setIndicator,
  setDataPeriod,
  activeTab,
  colors: {
    backgroundColor = 'transparent',
    textColor = 'black',
    lineColor = getColorChart('--color-background-adx'),
  } = {},
}: {
  candleData: any;
  chartRefCandl: any;
  colors?: any;
  chartRefCurentADX: any;
  setIndicator: any;
  setDataPeriod: React.Dispatch<React.SetStateAction<IDataPeriod>>;
  activeTab: IOptionsTabsCharts[];
}) {
  const chartAdrRef = useRef<HTMLDivElement>(null);
  const chartAdx = useRef<any>(null);

  const currentDataAdx = useRef<any>(null);
  const currentData = useRef<any>(null);

  const [currentAdx, setCurrentAdx] = useState<{
    adx: number;
    diMinus: number;
    diPositive: number;
  }>({
    adx: 0,
    diMinus: 0,
    diPositive: 0,
  });

  const { menu, setMenu } = useRightClickMenu(chartAdrRef);
  const [openSetup, setOpenSetup] = useState<boolean>(false);
  const [dataCurrent, setDataCurrent] = useState<ISetupIndicator>(initSetupIndicatorADR);

  const adxLine = useRef<any>(null);
  const adxPositiveDILine = useRef<any>(null);
  const adxMinusDILine = useRef<any>(null);

  const addChartLine = (ref: any, chart: any, color: string, isLast: boolean = false) => {
    return (ref.current = chart.addLineSeries({
      color: getColorChart(color),
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: isLast,
      crosshairMarkerVisible: false,
    }));
  };

  useEffect(() => {
    if (!chartAdrRef.current) return;

    const adxChart = createChart(chartAdrRef.current, {
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

    addChartLine(adxLine, adxChart, '--color-background-adx', true);
    addChartLine(adxPositiveDILine, adxChart, '--color-background-adx-positive-di');
    addChartLine(adxMinusDILine, adxChart, '--color-background-adx-minus-di');

    chartAdx.current = adxChart;
    chartRefCurentADX.current = adxChart;

    return () => {
      adxChart.remove();
      chartAdx.current = null;
      chartRefCurentADX.current = null;
      adxLine.current = null;
      adxPositiveDILine.current = null;
      adxMinusDILine.current = null;
    };
  }, []);

  useEffect(() => {
    const candleChart = chartRefCandl.current;
    const adrChart = chartAdx.current;

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
        const rsiPoint = currentData.current.adx.find((p: any) => p.time === param.time);

        if (currentDataAdx.current) {
          const dataAdx = currentDataAdx.current
          const adx = dataAdx.adx.find((p: any) => p.time === param.time)?.value ?? 0;
          const adxMinus = dataAdx.minusDI.find((p: any) => p.time === param.time)?.value ?? 0;
          const adxPositive = dataAdx.plusDI.find((p: any) => p.time === param.time)?.value ?? 0;
          setCurrentAdx({ adx, diMinus: adxMinus, diPositive: adxPositive });
        }
        if (rsiPoint) {
          adrChart.setCrosshairPosition(rsiPoint.value, param.time, adxLine.current);
        }
      } else {
        const adx = currentDataAdx.current.adx[currentDataAdx.current.adx.length - 1].value;
        const adxMinus = currentDataAdx.current.minusDI[currentDataAdx.current.minusDI.length - 1].value;
        const adxPositive = currentDataAdx.current.plusDI[currentDataAdx.current.plusDI.length - 1].value;
        setCurrentAdx({ adx, diMinus: adxMinus, diPositive: adxPositive });
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
    const adxData = calculateADX(candleData, dataCurrent.period);

    currentData.current = adxData;

    currentDataAdx.current = adxData;

    const adx = adxData.adx[adxData.adx.length - 1].value;
    const adxMinus = adxData.minusDI[adxData.minusDI.length - 1].value;
    const adxPositive = adxData.plusDI[adxData.plusDI.length - 1].value;
    setCurrentAdx({ adx, diMinus: adxMinus, diPositive: adxPositive });

    adxLine.current.setData(adxData.adx);
    adxMinusDILine.current.setData(adxData.minusDI);
    adxPositiveDILine.current.setData(adxData.plusDI);
  }, [candleData, dataCurrent.period]);

  useEffect(() => {
    setDataPeriod((prev) => ({ ...prev, periodADR: dataCurrent.period ?? 14 }));
  }, [dataCurrent.period]);

  const menuSetup: IMenuSub[] = [
    {
      label: 'Cài đặt chỉ báo',
      value: 'ADX',
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
            if (i.value === 'adx') {
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

  usePriceLines(adxLine, dataCurrent);

  return (
    <>
      <div ref={chartAdrRef} style={{ position: 'relative', marginTop: '4px' }}>
        <div className="absolute w-[calc(100%-70px)] h-[120px] bg-[var(--color-background-adr-1)] left-0 right-0 top-0" />

        <div className="absolute left-4 top-1 text-[12px]">
          ADX <span className="text-gray-400">TR</span> {dataCurrent.period}
          <span className="text-[var(--color-background-adx)] ml-2">
            adx: {currentAdx && currentAdx.adx.toFixed(2)}
          </span>
          <span className="text-[var(--color-background-adx-minus-di)] ml-2">
            -di: {currentAdx && currentAdx.diMinus.toFixed(2)}
          </span>
          <span className="text-[var(--color-background-adx-positive-di)] ml-2">
            +di: {currentAdx && currentAdx.diPositive.toFixed(2)}
          </span>
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
        title="adr"
        open={openSetup}
        setOpen={setOpenSetup}
        data={dataCurrent}
        setDataCurrent={setDataCurrent}
      />
    </>
  );
}
