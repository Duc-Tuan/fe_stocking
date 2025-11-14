import { PathName } from "../../routes/path";
import type { IServerTransaction } from "../../types/global";
import type { Option } from "../History/type";

export interface IOptionDatafunctionBoot {
    active: boolean;
    title: string;
    type: "transaction" | "monitor_acc_boot" | "monitor" | "transaction_acc_monitor";
    path: string
}

export const pathBoot = (path: string) => `/${PathName.SYMMETRICAL_ORDER}/${path}`;

export const datafunctionBoot: IOptionDatafunctionBoot[] = [
    {
        active: true,
        title: "Giao dịch lẻ",
        type: "transaction",
        path: PathName.TRANSACTION_BOOT
    },
    {
        active: false,
        title: "Giao dịch theo thước",
        type: "transaction_acc_monitor",
        path: PathName.TRANSACTION_ACC_MONITOR_BOOT
    },
    {
        active: false,
        title: "Theo dõi TKGD theo thước",
        type: "monitor_acc_boot",
        path: PathName.MONITOR_ACC_BOOT
    },
    {
        active: false,
        title: "Theo dõi TKGD lệnh lẻ",
        type: "monitor",
        path: PathName.MONITOR_BOOT
    },
]

// Các loại lệnh MT5 dưới dạng union type và const object
export const OrderType = {
    BUY: 0,        // ORDER_TYPE_BUY
    SELL: 1,       // ORDER_TYPE_SELL
    BUY_LIMIT: 2,  // ORDER_TYPE_BUY_LIMIT
    SELL_LIMIT: 3, // ORDER_TYPE_SELL_LIMIT
    BUY_STOP: 4,   // ORDER_TYPE_BUY_STOP
    SELL_STOP: 5   // ORDER_TYPE_SELL_STOP
} as const;

export type OrderType = typeof OrderType[keyof typeof OrderType];

export interface IOrderSend {
    type: "EXNESS" | "FUND";
    username: number | undefined;
    data: {
        symbol: "EURUSD" | "GBPUSD" | "XAUUSD" | "USDJPY" | undefined;
        volume: number | undefined;
        price: number | undefined;
        tp: number | undefined;
        sl: number | undefined;
        type: OrderType | undefined;
    }
}

export interface IOrderSendAcc {
    type: "EXNESS" | "FUND";
    username: number | undefined;
    type_acc?: 0 | 1;
    tp?: number;
    volume?: number;
    acc_monitor?: number;
    data: {
        symbol: string;
        volume: number;
        price: number;
        tp: number;
        sl: number;
        type: OrderType;
    }[]
}

export interface IOrderSendResponse extends Option<"EURUSD" | "GBPUSD" | undefined | String | number> {
    active: boolean,
}
export interface IOrderSendAccResponse extends Option<number> {
    active: boolean,
}

export const dataSymbols: IOrderSendResponse[] = [
    { value: "EURUSD", label: "EURUSD", active: false },
    { value: "GBPUSD", label: "GBPUSD", active: false },
    { value: "XAUUSD", label: "XAUUSD", active: false },
    { value: "USDJPY", label: "USDJPY", active: false },
];

export const dataTypeAcc: IOrderSendAccResponse[] = [
    { value: 0, label: "Xuôi", active: false },
    { value: 1, label: "Ngược", active: false },
];

export const dataType: IOrderSendResponse[] = [
    { value: 0, label: "BUY", active: false },
    { value: 1, label: "SELL", active: false },
    { value: 2, label: "BUY_LIMIT", active: false },
    { value: 3, label: "SELL_LIMIT", active: false },
    { value: 4, label: "BUY_STOP", active: false },
    { value: 5, label: "SELL_STOP", active: false },
];

export type OrderSide = 'BUY' | 'SELL' | 'BUY_LIMIT' | 'BUY_STOP' | 'SELL_LIMIT' | 'SELL_STOP';

export function calculateTpSl(entryPrice: number, pipDistance: number, pair: string, side: OrderSide) {
    const pipSize = pair.includes('JPY') ? 0.01 : 0.0001;

    if (side === 'BUY' || side === 'BUY_LIMIT' || side === 'BUY_STOP') {
        return {
            tp: Math.ceil((entryPrice + pipDistance * pipSize) * 1000000) / 1000000,
            sl: Math.ceil((entryPrice - pipDistance * pipSize) * 1000000) / 1000000,
        };
    } else {
        return {
            tp: Math.ceil((entryPrice - pipDistance * pipSize) * 1000000) / 1000000,
            sl: Math.ceil((entryPrice + pipDistance * pipSize) * 1000000) / 1000000,
        };
    }
}

export interface IOrderBoot {
    account_id: number
    account_transaction_id: number
    id: number
    id_transaction: number
    lo_boot_id: number
    order_type: string
    type: string
    price: number
    profit: number
    sl: number
    status: string
    symbol: "EURUSD" | "GBPUSD" | "XAUUSD" | "USDJPY"
    time: string
    tp: number
    type_acc: "FUND" | "EXNESS"
    user_id: number
    volume: number
    price_market: number
    price_open: number
}

export interface IBootAcc extends IServerTransaction {
    acc_reciprocal: number //tham chiếu
    acc_reference: number
    id: number
    dataOrder: IOrderBoot[]
    login_id: number
    time: string
    type: "RUNNING" | "CLOSE"
    reciprocal: IServerTransaction
    reference: IServerTransaction // tham chiếu
}

export interface ISymbolBoot {
    account_id: number
    id: number
    id_transaction: number
    order_type: string
    price: number
    profit: number
    sl: number
    status: string
    symbol: string
    time: string
    tp: number
    user_id: number
    volume: number
}

export interface IMonitorBoot {
    acc_monitor: number
    acc_reciprocal: number
    acc_reference: number
    id: number
    login_id: number
    time: string
    tp_acc_reciprocal: number
    tp_acc_reference: number
    type: "RUNNING" | "CLOSE"
    type_acc_reciprocal: "NGUOC" | "XUOI"
    type_acc_reference: "XUOI" | "NGUOC"
    volume: number
    dataOrder: IOrderBoot[]
}

export const convertTp = (data: 0 | 1 | undefined, pnl: number | undefined, pip: number) => {
    switch (data) {
        case 0:
            return (pnl ?? 0) + pip;
        case 1:
            return (pnl ?? 0) - pip;
        default:
            return (pnl ?? 0);
    }
}

export const convertData = (data?: any[], type?: 0 | 1) => {
    return data ? (type === 1 ? data.map((item) => ({
        ...item,
        type: (item.type === 'BUY' ? "SELL" : "BUY"),
    })) : data.map((item) => ({
        ...item,
        type: item.type,
    }))) : [];
}