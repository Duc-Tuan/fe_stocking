import { ColorType, createChart, type IChartApi } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePriceLines } from '../../hooks/usePriceLines';
import { useRightClickMenu } from '../../hooks/useRightClick';
import { type IinitialDataCand } from '../../pages/Home/options';
import type { IDataPeriod, Iindicator } from '../../pages/Home/type';
import { initSetupIndicatorRSI, type ISetupIndicator } from '../../types/global';
import { getColorChart } from '../../utils/timeRange';
import { calculateADX } from '../../utils/typeRecipe';
import { formatVietnamTimeSmart, gridColor } from '../line/formatTime';
import MenuSetupIndicator from '../menuSetupIndicator';
import type { IMenuSub } from '../menuSetupIndicator/type';
import SetupIndicator from '../setupIndicator';
import { calculateRSI } from './type';
import SetupIndicatorADX from '../setupIndicatorADX';

export default function Rsi({
  chartRefCurentRSI,
  candleData,
  chartRefCandl,
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
  chartRefCandl: any;
  colors?: any;
  chartRefCurentRSI: any;
  setIndicator: any;
  setDataPeriod: React.Dispatch<React.SetStateAction<IDataPeriod>>;
  activeTab: any;
}) {
  const { t } = useTranslation();
  const chartRef = useRef<any>(null);
  const rsiChartRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<any>(null);

  const currentData = useRef<any>(null);

  const currentDataRsi = useRef<any>(null);
  const [currentRsi, setCurrentRsi] = useState<any>(null);

  const { menu, setMenu } = useRightClickMenu(rsiChartRef);
  const [openSetup, setOpenSetup] = useState<boolean>(false);
  const [showADX, setShowADX] = useState<boolean>(false);
  const [settingADX, setSettingADX] = useState<boolean>(false);
  const [dataCurrent, setDataCurrent] = useState<ISetupIndicator>(initSetupIndicatorRSI);

  const adxLine = useRef<any>(null);
  const adxPositiveDILine = useRef<any>(null);
  const adxMinusDILine = useRef<any>(null);

  const currentDataAdx = useRef<any>(null);
  const [currentAdx, setCurrentAdx] = useState<{
    adx: number;
    diMinus: number;
    diPositive: number;
  }>({
    adx: 0,
    diMinus: 0,
    diPositive: 0,
  });

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
    if (!rsiChartRef.current) return;

    // === Chart RSI ===
    const rsiChart: IChartApi = createChart(rsiChartRef.current, {
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

    addChartLine(seriesRef, rsiChart, '--color-background-atr', true);
    addChartLine(adxLine, rsiChart, '--color-background-adx');
    addChartLine(adxPositiveDILine, rsiChart, '--color-background-adx-positive-di');
    addChartLine(adxMinusDILine, rsiChart, '--color-background-adx-minus-di');

    chartRef.current = rsiChart;
    chartRefCurentRSI.current = rsiChart;

    return () => {
      rsiChart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      chartRefCurentRSI.current = null;
      adxLine.current = null;
      adxPositiveDILine.current = null;
      adxMinusDILine.current = null;
    };
  }, []);

  useEffect(() => {
    const candleChart = chartRefCandl.current;
    const rsiChart = chartRef.current;

    if (!candleChart || !rsiChart) return; // tránh null

    const unsubCandle = candleChart.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
      if (range) {
        rsiChart.timeScale().setVisibleLogicalRange(range);
      }
    });

    const unsubRsi = rsiChart.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
      if (range) {
        candleChart.timeScale().setVisibleLogicalRange(range);
      }
    });

    const unsubCrosshair = candleChart.subscribeCrosshairMove((param: any) => {
      if (param.time) {
        const rsiPoint = currentData.current.find((p: any) => p.time === param.time);
        const data = currentDataRsi.current.find((p: any) => p.time === param.time);
        setCurrentRsi(data);

        if (currentDataAdx.current) {
          const dataCurrentADX = currentDataAdx.current
          const adx = dataCurrentADX.adx.find((p: any) => p.time === param.time)?.value ?? 0;
          const adxMinus = dataCurrentADX.minusDI.find((p: any) => p.time === param.time)?.value ?? 0;
          const adxPositive = dataCurrentADX.plusDI.find((p: any) => p.time === param.time)?.value ?? 0;
          setCurrentAdx({ adx, diMinus: adxMinus, diPositive: adxPositive });
        }
        if (rsiPoint) {
          rsiChart.setCrosshairPosition(rsiPoint.value, param.time, seriesRef.current);
        }
      } else {
        const adx = currentDataAdx.current.adx[currentDataAdx.current.adx.length - 1].value;
        const adxMinus = currentDataAdx.current.minusDI[currentDataAdx.current.minusDI.length - 1].value;
        const adxPositive = currentDataAdx.current.plusDI[currentDataAdx.current.plusDI.length - 1].value;
        setCurrentAdx({ adx, diMinus: adxMinus, diPositive: adxPositive });

        setCurrentRsi(currentDataRsi.current[currentDataRsi.current.length - 1]);
        rsiChart.clearCrosshairPosition();
      }
    });

    rsiChart.priceScale('right').applyOptions({ minimumWidth: 70 });

    // Cleanup khi component unmount
    return () => {
      unsubCandle?.();
      unsubRsi?.();
      unsubCrosshair?.();
    };
  }, [chartRefCandl.current, activeTab]);

  useEffect(() => {
    const rsiData = calculateRSI(candleData, dataCurrent.period);
    const adxData = calculateADX(candleData, dataCurrent.periodADX);
    currentDataAdx.current = adxData;

    setCurrentRsi(rsiData[rsiData.length - 1]);
    currentData.current = rsiData;
    currentDataRsi.current = rsiData;

    if (adxData) {
      const adx = adxData.adx[adxData.adx.length - 1].value;
      const adxMinus = adxData.minusDI[adxData.minusDI.length - 1].value;
      const adxPositive = adxData.plusDI[adxData.plusDI.length - 1].value;
      setCurrentAdx({ adx, diMinus: adxMinus, diPositive: adxPositive });
    }

    seriesRef.current.setData(rsiData);

    adxLine.current.setData(adxData.adx);
    adxMinusDILine.current.setData(adxData.minusDI);
    adxPositiveDILine.current.setData(adxData.plusDI);
  }, [candleData, dataCurrent.period, dataCurrent.periodADX]);

  useEffect(() => {
    setDataPeriod((prev: any) => ({ ...prev, periodRSI: dataCurrent.period ?? 14 }));
  }, [dataCurrent.period]);

  useEffect(() => {
    if (adxLine.current && adxMinusDILine.current && adxPositiveDILine.current) {
      adxLine.current.applyOptions({ visible: showADX });
      adxMinusDILine.current.applyOptions({ visible: showADX });
      adxPositiveDILine.current.applyOptions({ visible: showADX });
    }
  }, [showADX]);

  const menuSetup: IMenuSub[] = [
    {
      label: 'Cài đặt chỉ báo ADX',
      value: 'ADX setting',
      onClick: () => setSettingADX(!settingADX),
    },
    {
      label: 'Bật thêm chỉ báo ADX',
      value: 'ADX actiave',
      onClick: () => setShowADX(!showADX),
    },
    {
      label: 'Cài đặt chỉ báo',
      value: 'RSI',
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
            if (i.value === 'rsi') {
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
      <div ref={rsiChartRef} style={{ position: 'relative', marginTop: '4px' }}>
        <div className="absolute w-[calc(100%-70px)] h-[120px] bg-[var(--color-background-atr-1)] left-0 right-0 top-0" />

        <div className="absolute left-4 top-1 text-[12px] flex justify-start items-center">
          <div className="">
            {t('Chỉ báo hội tụ RSI')} <span className="text-gray-400">{dataCurrent.period} close</span>{' '}
            <span className="text-[var(--color-background)] ml-2">{currentRsi && currentRsi.value.toFixed(2)}</span>
          </div>

          {showADX && (
            <div className="ml-4">
              ADX <span className="text-gray-400">TR {dataCurrent.periodADX}</span>
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
          )}
        </div>
      </div>
      {menu && (
        <MenuSetupIndicator
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          dataMenu={menuSetup}
          activate={dataCurrent.isOpen}
          activateSub={showADX}
        />
      )}

      <SetupIndicator
        title="rsi"
        open={openSetup}
        setOpen={setOpenSetup}
        data={dataCurrent}
        setDataCurrent={setDataCurrent}
      />

      <SetupIndicatorADX
        title="adx"
        open={settingADX}
        setOpen={setSettingADX}
        data={dataCurrent}
        setDataCurrent={setDataCurrent}
      />
    </>
  );
}
