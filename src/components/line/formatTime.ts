import { LineStyle, type Time } from "lightweight-charts";
import { adjustToUTCPlus_7 } from "../../pages/Home/options";

export const gridColor = {
    vertLines: {
        color: 'rgba(0, 0, 0, 0.05)', // màu đường dọc (vertical)
        style: LineStyle.Solid, // có thể dùng Dotted, Dashed
    },
    horzLines: {
        color: 'rgba(0, 0, 0, 0.05)', // màu đường ngang (horizontal)
        style: LineStyle.Solid,
    }
}

export function formatVietnamTimeSmart(time: number, isTooltip?: boolean) {
    const date = new Date(adjustToUTCPlus_7(time) * 1000);
    const dd = date.getDate().toString().padStart(2, '0');
    const MM = (date.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');
    if (isTooltip) return `${dd}/${MM}/${yyyy} ${hh}:${mm}:${ss}`
}

export interface IDataLine {
    time: Time,
    value: number
}

export const covertDataLine = (data: any[]): IDataLine[] => {
    return data.map(item => ({
        time: item.time,
        value: item.high
    }));
}
