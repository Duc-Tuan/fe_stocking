// components/Adr.jsx
import { ColorType, createChart } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { usePriceLines } from '../../hooks/usePriceLines';
import type { IDataPeriod, Iindicator } from '../../pages/Home/type';
import { initSetupIndicatorMACD, type ISetupIndicator } from '../../types/global';
import { getColorChart } from '../../utils/timeRange';
import { formatVietnamTimeSmart, gridColor } from '../line/formatTime';
import { calculateMACD } from './type';
import { useRightClickMenu } from '../../hooks/useRightClick';
import MenuSetupIndicator from '../menuSetupIndicator';
import type { IMenuSub } from '../menuSetupIndicator/type';
import SetupIndicator from '../setupIndicator';

export default function Macd({
  candleData,
  chartRefCandl,
  chartRefCurentMACD,
  setIndicator,
  setDataPeriod,
  activeTab,
  colors: {
    backgroundColor = 'transparent',
    lineColor = getColorChart('--color-background-adr'),
    textColor = 'black',
  } = {},
}: {
  candleData: any;
  chartRefCandl: any;
  colors?: any;
  chartRefCurentMACD: any;
  setIndicator: any;
  setDataPeriod: React.Dispatch<React.SetStateAction<IDataPeriod>>;
  activeTab: any;
}) {
  const chartMacdRef = useRef<HTMLDivElement>(null);
  const chartMacd = useRef<any>(null);

  const currentDataMacd = useRef<any>(null);
  const currentData = useRef<any>(null);

  const [currentMacd, setCurrentMacd] = useState<any | null>(null);

  const { menu, setMenu } = useRightClickMenu(chartMacdRef);
  const [showEMA, setShowEMA] = useState<{ macdLine: boolean; signalLine: boolean }>({
    macdLine: true,
    signalLine: true,
  });
  const [openSetup, setOpenSetup] = useState<boolean>(false);
  const [dataCurrent, setDataCurrent] = useState<ISetupIndicator>(initSetupIndicatorMACD);

  const macdChart = useRef<any>(null);
  const macdLineSeries = useRef<any>(null);
  const signalLineSeries = useRef<any>(null);

  const getChart = (ref: any, chart: any, color: string) => {
    return (ref.current = chart.addLineSeries({
      color: getColorChart(color),
      lineWidth: 1,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
    }));
  };

  useEffect(() => {
    if (!chartMacdRef.current) return;

    const chart = createChart(chartMacdRef.current, {
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

    macdChart.current = chart.addHistogramSeries({
      color: getColorChart(),
      base: 0,
    });

    getChart(macdLineSeries, chart, '--color-background-atr');
    getChart(signalLineSeries, chart, '--color-background-slope');

    chartMacd.current = chart;
    chartRefCurentMACD.current = chart;

    return () => {
      chart.remove();
      chartMacd.current = null;
      macdLineSeries.current = null;
      signalLineSeries.current = null;
      chartRefCurentMACD.current = null;
    };
  }, []);

  useEffect(() => {
    const candleChart = chartRefCandl.current;
    const adrChart = chartMacd.current;

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
        const data = currentDataMacd.current.find((p: any) => p.time === param.time);
        setCurrentMacd(data);

        if (rsiPoint) {
          adrChart.setCrosshairPosition(rsiPoint.value, param.time, macdChart.current);
        }
      } else {
        setCurrentMacd(currentDataMacd.current[currentDataMacd.current.length - 1]);
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
    const macdData: any[] = calculateMACD(candleData, dataCurrent.period, dataCurrent.periodEMA);

    setCurrentMacd(macdData[macdData.length - 1]);
    currentData.current = macdData;

    currentDataMacd.current = macdData;

    const maxHist = Math.max(...macdData.map((d: any) => Math.abs(d.hist)).filter((i) => !Number.isNaN(i)));

    const dataMacdColored = macdData.map((d: any) => {
      const alpha = Math.min(Math.abs(d.hist) / maxHist, 1); // alpha từ 0 → 1
      const baseColor = d.hist >= 0 ? '0,128,0' : '255,0,0'; // xanh lá / đỏ
      return {
        time: d.time,
        value: d.hist,
        color: `rgba(${baseColor},${alpha})`,
      };
    });

    const dataLine = macdData.map((d: any) => ({ time: d.time, value: d.macd }));
    const dataSignalLine = macdData.map((d: any) => ({ time: d.time, value: d.signal }));

    // map vào chart
    macdChart.current.setData(dataMacdColored);

    macdLineSeries.current.setData(dataLine);
    signalLineSeries.current.setData(dataSignalLine);
  }, [candleData, dataCurrent.period, dataCurrent.periodEMA]);

  useEffect(() => {
    setDataPeriod((prev) => ({ ...prev, periodMACD: dataCurrent.period ?? 26 }));
  }, [dataCurrent.period]);

  useEffect(() => {
    if (!macdLineSeries.current && !signalLineSeries.current) return;
    macdLineSeries.current.applyOptions({ visible: showEMA.macdLine });
    signalLineSeries.current.applyOptions({ visible: showEMA.signalLine });
  }, [showEMA]);

  const menuSetup: IMenuSub[] = [
    {
      label: 'Cài đặt chỉ báo',
      value: 'MACD',
      onClick: () => setOpenSetup(true),
    },
    {
      label: 'Bật/tắt đường tiệm cận',
      value: 'activate',
      onClick: () => setDataCurrent((prev) => ({ ...prev, isOpen: !prev.isOpen })),
    },
    {
      label: 'Bật/tắt đường tín hiệu',
      value: 'activate signalLine',
      onClick: () => setShowEMA((prev) => ({ ...prev, signalLine: !prev.signalLine })),
    },
    {
      label: 'Bật/tắt đường MACD',
      value: 'activate macdLine',
      onClick: () => setShowEMA((prev) => ({ ...prev, macdLine: !prev.macdLine })),
    },
    {
      label: 'Tắt chỉ báo',
      value: 'indication',
      onClick: () => {
        setIndicator((prev: Iindicator[]) =>
          prev.map((i: Iindicator) => {
            if (i.value === 'macd') {
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

  usePriceLines(macdChart, dataCurrent);

  return (
    <>
      <div ref={chartMacdRef} style={{ position: 'relative', marginTop: '4px' }}>
        <div className="absolute w-[calc(100%-70px)] h-[120px] bg-[var(--color-background-adr-1)] left-0 right-0 top-0" />

        <div className="absolute left-4 top-1 text-[12px]">
          MACD{' '}
          <span className="text-gray-400">
            {dataCurrent.periodEMA} {dataCurrent.period} close
          </span>{' '}
          <span className={`text-[${(currentMacd?.hist ?? 0) >= 0 ? 'rgba(0,128,0,1)' : 'rgba(255,0,0,1)'}] ml-2`}>
            {currentMacd && currentMacd.hist.toFixed(2)}
          </span>
          {showEMA.signalLine && (
            <span className="text-[var(--color-background-slope)] ml-2">
              {currentMacd && currentMacd.signal.toFixed(2)}
            </span>
          )}
          {showEMA.macdLine && (
            <span className="text-[var(--color-background-atr)] ml-2">
              {currentMacd && currentMacd.macd.toFixed(2)}
            </span>
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
          showmacdLineMACD={showEMA.macdLine}
          showsignalLineMACD={showEMA.signalLine}
        />
      )}

      <SetupIndicator
        title="macd"
        open={openSetup}
        setOpen={setOpenSetup}
        data={dataCurrent}
        setDataCurrent={setDataCurrent}
      />
    </>
  );
}
