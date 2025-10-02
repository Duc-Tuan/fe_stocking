import type { IServerTransaction } from "../../types/global";
import type { ISymbolPosition, Option } from "../History/type";

export interface IOptionDatafunctionBoot {
    active: boolean;
    title: string;
    type: "transaction" | "history" | "monitor"
}

export const datafunctionBoot: IOptionDatafunctionBoot[] = [
    {
        active: true,
        title: "Giao dịch nhanh",
        type: "transaction"
    },
    {
        active: false,
        title: "Lịch sử giao dịch",
        type: "history"
    },
    {
        active: false,
        title: "Theo dõi tài khoản",
        type: "monitor"
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

export interface IOrderSendResponse extends Option<"EURUSD" | "GBPUSD" | undefined | String | number> {
    active: boolean,
}

export const dataSymbols: IOrderSendResponse[] = [
    { value: "EURUSD", label: "EURUSD", active: false },
    { value: "GBPUSD", label: "GBPUSD", active: false },
    { value: "XAUUSD", label: "XAUUSD", active: false },
    { value: "USDJPY", label: "USDJPY", active: false },
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

export interface IBootAcc extends IServerTransaction {
    orders: ISymbolPosition[]
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