import type { Dayjs } from "dayjs";
import type { EMO } from "../Transaction/type";

export interface IDatafunction {
    title: string;
    type: "Positions" | "Orders" | "Deals" | "Lot"
}

export interface IOptionDatafunction extends IDatafunction {
    active: boolean
}

export const datafunction: IOptionDatafunction[] = [
    {
        active: true,
        title: "Các lô đã vào lệnh",
        type: "Lot"
    },
    {
        active: false,
        title: "Các lệnh đã đóng",
        type: "Positions"
    },
    {
        active: false,
        title: "Tất cả lệnh gửi",
        type: "Orders"
    },
    {
        active: false,
        title: "Giao dịch khớp lệnh thực tế",
        type: "Deals"
    },
]

export interface IHistoryLot {
    id: number;
    status: EMO;
    sl: number;
    tp: number;
    volume: number;
    pnl: number;
    accTransaction: number;
    accMonitor: number;
    price: number;
    bySymbol: { current_price: number, symbol: string, type: string }[];
    time: string;
    type: "CLOSE" | "RUNNING"
}

export interface IActiveHistoryLot extends IHistoryLot {
    lot: number
}

export const dataHistoryLot: IHistoryLot[] = [
    {
        id: 1,
        accTransaction: 45623342,
        accMonitor: 263006287,
        status: "Lenh_thi_truong",
        price: 0,
        bySymbol: [
            {
                current_price: 0.594190,
                symbol: "NZDUSDc",
                type: "SELL"
            },
            {
                current_price: 197.863000,
                symbol: "GBPJPYc",
                type: "BUY"
            },
            {
                current_price: 1.600550,
                symbol: "EURCADc",
                type: "SELL"
            },
            {
                current_price: 0.524520,
                symbol: "AUDCHFc",
                type: "BUY"
            },
            {
                current_price: 1.163690,
                symbol: "EURUSDc",
                type: "SELL"
            },
        ],
        pnl: 34.67,
        sl: 0,
        tp: 0,
        volume: 0.01,
        time: "19:06:00 08/11/2025",
        type: "RUNNING"
    },
    {
        id: 2,
        accTransaction: 76345354,
        accMonitor: 183459647,
        status: "Nguoc_Limit",
        price: 19.02,
        bySymbol: [
            {
                current_price: 1.846910,
                symbol: "GBPCADc",
                type: "SELL"
            },
            {
                current_price: 1.163690,
                symbol: "EURUSDc",
                type: "SELL"
            },
            {
                current_price: 95.751000,
                symbol: "AUDJPYc",
                type: "BUY"
            },
            {
                current_price: 1.958940,
                symbol: "EURNZDc",
                type: "SELL"
            },
            {
                current_price: 0.807230,
                symbol: "USDCHFc",
                type: "BUY"
            },
        ],
        pnl: 34.67,
        sl: 0,
        tp: 20.99,
        volume: 0.01,
        time: "12:00:00 08/11/2025",
        type: "RUNNING"
    },
    {
        id: 3,
        accTransaction: 76345354,
        accMonitor: 183459647,
        status: "Lenh_thi_truong",
        price: 19.02,
        bySymbol: [
            {
                current_price: 1.846910,
                symbol: "GBPCADc",
                type: "SELL"
            },
            {
                current_price: 1.163690,
                symbol: "EURUSDc",
                type: "SELL"
            },
            {
                current_price: 95.751000,
                symbol: "AUDJPYc",
                type: "BUY"
            },
            {
                current_price: 1.958940,
                symbol: "EURNZDc",
                type: "SELL"
            },
            {
                current_price: 0.807230,
                symbol: "USDCHFc",
                type: "BUY"
            },
        ],
        pnl: 34.67,
        sl: 0,
        tp: 20.99,
        volume: 0.01,
        time: "12:00:00 08/11/2025",
        type: "CLOSE"
    },
]

export interface IStatusAllLot {
    value: EMO,
    label: string
}

export const dataStatusAllLot: IStatusAllLot[] = [
    {
        label: "Lệnh thị trường",
        value: "Lenh_thi_truong"
    },
    {
        label: "Ngược limit",
        value: "Nguoc_Limit"
    },
    {
        label: "Ngược stop",
        value: "Nguoc_Stop"
    },
    {
        label: "Xuôi limit",
        value: "Xuoi_Limit"
    },
    {
        label: "Xuôi stop",
        value: "Xuoi_Stop"
    }
]

export const dataAccTransactionAllLot: any[] = [
    {
        label: 12452534,
        value: 12452534
    },
    {
        label: 19678545,
        value: 19678545
    },
    {
        label: 65745656,
        value: 65745656
    }
]

export interface IFilterAllLot {
    status: EMO | null,
    accTransaction: number | null,
    toFrom: [start: Dayjs | null | undefined, end: Dayjs | null | undefined]
} 