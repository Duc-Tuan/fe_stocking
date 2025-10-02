import type { ISeriesApi, Time, UTCTimestamp } from 'lightweight-charts';
import Icon from '../../assets/icon';
import type { IOptionsTabsCharts } from '../../types/global';

export interface IinitialData {
  time: Time;
  value: number;
}

export interface IinitialDataCand {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  P: number;
}

export const optionsTabsCharts: IOptionsTabsCharts[] = [
  {
    tabsName: 'Biểu đồ đường',
    icon: <Icon name="icon-line" />,
    active: true,
  },
  {
    tabsName: 'Biểu đồ nến',
    icon: <Icon name="icon-candle" />,
    active: false,
  },
];

export const convertDataCandline = (data: any): IinitialDataCand[] => {
  const time = new Date(data.time).getTime();
  const dataNew = {
    time: time,
    value: data.total_pnl,
  };

  const P = (dataNew.value + dataNew.value + dataNew.value) / 3;
  return [
    {
      time: adjustToUTCPlus7(Math.floor(dataNew.time / 1000)),
      open: dataNew.value,
      high: dataNew.value,
      low: dataNew.value,
      close: dataNew.value,
      P,
    },
  ];
};

export const timeOptions = [
  { label: 'M1', seconds: 60 },
  { label: 'M5', seconds: 5 * 60 },
  { label: 'M10', seconds: 10 * 60 },
  { label: 'M15', seconds: 15 * 60 },
  { label: 'M30', seconds: 30 * 60 },
  { label: '1H', seconds: 60 * 60 },
  { label: '2H', seconds: 2 * 60 * 60 },
  { label: '4H', seconds: 4 * 60 * 60 },
  { label: '1D', seconds: 24 * 60 * 60 },
  { label: '1W', seconds: 7 * 24 * 60 * 60 },
  { label: 'MN', seconds: 30 * 24 * 60 * 60 },
];

export const convertDataLine: (data: any[]) => Array<IinitialData> = (data: any[]) => {
  const dataLine: any[] = data?.map((data: any) => {
    const date = new Date(data?.time);

    return {
      time: adjustToUTCPlus7(Math.floor(date.getTime() / 1000)), // hoặc Math.floor(date.getTime() / 1000) nếu dùng dạng UNIX (giây)
      value: data?.total_pnl,
    };
  });
  // .filter(Boolean); // Loại bỏ các phần tử null
  return dataLine;
};

export const adjustToUTCPlus7 = (timestamp: number) => timestamp + 7 * 60 * 60;

export const adjustToUTCPlus_7 = (timestamp: number) => timestamp - 7 * 60 * 60;
