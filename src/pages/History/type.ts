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

export interface ISymbol {
    id: number,
    symbol: string,
    accTransaction: number,
    type: "SELL" | "BUY",
    priceOpen: number,
    price: number,
    time: string,
    profit: number,
    volume: number,
    status: string
}

export const dataAccTransaction = [20305495, 102743455, 957463445, 333354356]

export const dataSymbolTransaction: ISymbol[] = [
    {
        id: 1,
        accTransaction: 20305495,
        symbol: "NZDUSDc",
        price: 2.235435,
        priceOpen: 1.23432,
        profit: 7.5,
        status: "filled",
        time: "2025.08.11 11:00:01",
        type: "BUY",
        volume: 0.01
    },
    {
        id: 2,
        accTransaction: 20305495,
        symbol: "GBPJPYc",
        price: 2.235435,
        priceOpen: 1.23432,
        profit: 7.5,
        status: "filled",
        time: "2025.08.11 11:00:01",
        type: "SELL",
        volume: 0.01
    },
    {
        id: 3,
        accTransaction: 20305495,
        symbol: "EURUSDc",
        price: 2.235435,
        priceOpen: 1.23432,
        profit: 7.5,
        status: "filled",
        time: "2025.08.11 11:00:01",
        type: "SELL",
        volume: 0.01
    },
    {
        id: 4,
        accTransaction: 20305495,
        symbol: "AUDCHFc",
        price: 2.235435,
        priceOpen: 1.23432,
        profit: 7.5,
        status: "filled",
        time: "2025.08.11 11:00:01",
        type: "BUY",
        volume: 0.01
    },
    {
        id: 5,
        accTransaction: 20305495,
        symbol: "NZDUSDc",
        price: 2.235435,
        priceOpen: 1.23432,
        profit: 7.5,
        status: "filled",
        time: "2025.08.11 11:00:01",
        type: "BUY",
        volume: 0.01
    },
    {
        id: 6,
        accTransaction: 102743455,
        symbol: "GBPJPYc",
        price: 2.235435,
        priceOpen: 1.23432,
        profit: 7.5,
        status: "filled",
        time: "2025.08.11 11:00:01",
        type: "SELL",
        volume: 0.01
    },
    {
        id: 7,
        accTransaction: 102743455,
        symbol: "EURUSDc",
        price: 2.235435,
        priceOpen: 1.23432,
        profit: 7.5,
        status: "filled",
        time: "2025.08.11 11:00:01",
        type: "SELL",
        volume: 0.01
    },
    {
        id: 8,
        accTransaction: 957463445,
        symbol: "AUDCHFc",
        price: 2.235435,
        priceOpen: 1.23432,
        profit: 7.5,
        status: "filled",
        time: "2025.08.11 11:00:01",
        type: "BUY",
        volume: 0.01
    },
    {
        id: 9,
        accTransaction: 957463445,
        symbol: "NZDUSDc",
        price: 2.235435,
        priceOpen: 1.23432,
        profit: 7.5,
        status: "cancel",
        time: "2025.08.11 11:00:01",
        type: "BUY",
        volume: 0.01
    },
    {
        id: 10,
        accTransaction: 957463445,
        symbol: "GBPJPYc",
        price: 2.235435,
        priceOpen: 1.23432,
        profit: 7.5,
        status: "filled",
        time: "2025.08.11 11:00:01",
        type: "SELL",
        volume: 0.01
    },
    {
        id: 11,
        accTransaction: 957463445,
        symbol: "EURUSDc",
        price: 2.235435,
        priceOpen: 1.23432,
        profit: 7.5,
        status: "filled",
        time: "2025.08.11 11:00:01",
        type: "SELL",
        volume: 0.01
    },
    {
        id: 12,
        accTransaction: 333354356,
        symbol: "AUDCHFc",
        price: 2.235435,
        priceOpen: 1.23432,
        profit: 7.5,
        status: "filled",
        time: "2025.08.11 11:00:01",
        type: "BUY",
        volume: 0.01
    },
    {
        id: 13,
        accTransaction: 333354356,
        symbol: "NZDUSDc",
        price: 2.235435,
        priceOpen: 1.23432,
        profit: 7.5,
        status: "filled",
        time: "2025.08.11 11:00:01",
        type: "BUY",
        volume: 0.01
    },
    {
        id: 14,
        accTransaction: 333354356,
        symbol: "GBPJPYc",
        price: 2.235435,
        priceOpen: 1.23432,
        profit: 7.5,
        status: "filled",
        time: "2025.08.11 11:00:01",
        type: "SELL",
        volume: 0.01
    },
    {
        id: 15,
        accTransaction: 333354356,
        symbol: "EURUSDc",
        price: 2.235435,
        priceOpen: 1.23432,
        profit: 7.5,
        status: "filled",
        time: "2025.08.11 11:00:01",
        type: "SELL",
        volume: 0.01
    },
    {
        id: 16,
        accTransaction: 333354356,
        symbol: "AUDCHFc",
        price: 2.235435,
        priceOpen: 1.23432,
        profit: 7.5,
        status: "filled",
        time: "2025.08.11 11:00:01",
        type: "BUY",
        volume: 0.01
    },
]

export const initFilter: IFilterAllLot = {
    accTransaction: null,
    status: null,
    toFrom: [undefined, undefined]
}