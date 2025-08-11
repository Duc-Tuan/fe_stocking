import type { Time } from "lightweight-charts";
import Icon from "../../assets/icon";
import type { IOptionsTabsCharts } from "../../types/global";

export interface IinitialData {
    time: Time,
    value: number
}

export interface IinitialDataCand {
    time: number,
    open: number,
    high: number,
    low: number,
    close: number,
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
    }
]

export const convertDataCandline = (data: any[] = []): IinitialDataCand[] => {
    if (data.length === 0) return [];

    const dataNew = data
        .map((data: any) => {
            const utcPlus7 = adjustToUTCPlus7(new Date(data.time).getTime());
            // const date = new Date(utcPlus7);
            // const day = date.getDay();

            // Loại bỏ Thứ 7 và Chủ nhật
            // if (day === 0 || day === 6) return null;

            return {
                time: utcPlus7,
                value: data.total_pnl,
            };
        })
        // .filter(Boolean)
        .sort((a: any, b: any) => a.time - b.time);

    const candles: IinitialDataCand[] = [];
    let current: any = null;

    dataNew.forEach((point: any) => {
        const date = new Date(point.time * 1000);
        const day = date.getDay();
        const hour = date.getHours();

        let bucketStart: Date;

        if (day === 1 && hour >= 4 && hour < 7) {
            // Thứ 2, phiên riêng 4h - 7h
            bucketStart = new Date(date);
            bucketStart.setHours(4, 0, 0, 0);
        } else {
            // Bình thường: từ 7h sáng hôm trước đến 7h sáng hôm nay
            bucketStart = new Date(date);
            if (hour < 7) {
                bucketStart.setDate(bucketStart.getDate() - 1);
            }
            bucketStart.setHours(7, 0, 0, 0);
        }

        const bucket = Math.floor(bucketStart.getTime() / 1000);

        if (!current || current.bucket !== bucket) {
            if (current) {
                const P = (current.high + current.low + current.close) / 3;
                candles.push({
                    time: adjustToUTCPlus7(Math.floor(current.bucket / 1000)),
                    open: current.open,
                    high: current.high,
                    low: current.low,
                    close: current.close,
                    P,
                });
            }

            current = {
                bucket,
                open: point.value,
                high: point.value,
                low: point.value,
                close: point.value,
            };
        } else {
            current.high = Math.max(current.high, point.value);
            current.low = Math.min(current.low, point.value);
            current.close = point.value;
        }
    });

    if (current) {
        const P = (current.high + current.low + current.close) / 3;
        candles.push({
            time: adjustToUTCPlus7(Math.floor(current.bucket / 1000)),
            open: current.open,
            high: current.high,
            low: current.low,
            close: current.close,
            P,
        });
    }

    return candles;
};

export const timeOptions = [
    { label: 'M1', seconds: 60 },
    { label: 'M5', seconds: 5 * 60 },
    { label: 'M6', seconds: 6 * 60 },
    { label: 'M10', seconds: 10 * 60 },
    { label: 'M15', seconds: 15 * 60 },
    { label: 'M30', seconds: 30 * 60 },
    { label: 'H1', seconds: 60 * 60 },
    { label: 'H4', seconds: 4 * 60 * 60 },
    { label: 'D1', seconds: 24 * 60 * 60 },
    { label: 'W1', seconds: 7 * 24 * 60 * 60 },
    { label: 'MN', seconds: 30 * 24 * 60 * 60 },
];

export const convertDataLine: ((data: any[]) => Array<IinitialData>) = (data: any[]) => {
    const dataLine: any[] = data
        ?.map((data: any) => {
            const date = new Date(data?.time);
            // const day = date.getDay();

            // Bỏ qua nếu là thứ 7 (6) hoặc Chủ nhật (0)
            // if (day === 0 || day === 6) return null;

            return {
                time: adjustToUTCPlus7(Math.floor(date.getTime() / 1000)), // hoặc Math.floor(date.getTime() / 1000) nếu dùng dạng UNIX (giây)
                value: data?.total_pnl,
            };
        })
    // .filter(Boolean); // Loại bỏ các phần tử null
    return dataLine;
}

export const adjustToUTCPlus7 = (timestamp: number) => timestamp + 7 * 60 * 60;

export const adjustToUTCPlus_7 = (timestamp: number) => timestamp - (7 * 60 * 60);
