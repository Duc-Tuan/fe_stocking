import type { Dayjs } from "dayjs";
import type { EMO, IStatus_sl_tp } from "../Transaction/type";

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
        type: "Orders"
    },
    {
        active: false,
        title: "Tất cả lệnh",
        type: "Deals"
    },
    {
        active: false,
        title: "Giao dịch khớp lệnh thực tế",
        type: "Positions"
    },
]

export interface IHistoryLot {
    id: number;
    account_monitor_id: number;
    account_transaction_id: number;
    bySymbol: { price_transaction: number, symbol: string, type: string }[];
    price: number;
    status: EMO;
    status_sl_tp: IStatus_sl_tp;
    stop_loss: number;
    take_profit: number;
    time: string;
    type: "CLOSE" | "RUNNING";
    username_id: number;
    volume: number;
    IsUSD: boolean,
    usd: number,
}

export interface IActiveHistoryLot extends IHistoryLot {
    lot: number
}

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

export interface Option<T> {
    label: string;
    value: T
}

export const dataStatusSymbol: Option<"pending" | "filled" | "cancelled" | "rejected">[] = [
    {
        label: "Đang chờ",
        value: "pending"
    },
    {
        label: "Đã gửi lên thị trường",
        value: "filled"
    },
    {
        label: "Đã đóng lệnh",
        value: "cancelled"
    },
    {
        label: "Đã loại bỏ",
        value: "rejected"
    }
]

export const dataType: Option<"BUY" | "SELL">[] = [
    {
        label: "Mua",
        value: "BUY"
    },
    {
        label: "Bán",
        value: "SELL"
    }
]

export interface IFilterAllLot {
    status: EMO | "pending" | "filled" | "cancelled" | "rejected" | null,
    type?: 'BUY' | 'SELL'
    accTransaction: number | null,
    toFrom: [start: Dayjs | null | undefined, end: Dayjs | null | undefined]
}

export interface ISymbol {
    id: number,
    position_type: "SELL" | "BUY",
    account_id: number,
    close_price: number,
    close_time: number,
    comment: string,
    commission: number,
    open_price: number,
    open_time: string,
    profit: number,
    swap: number,
    symbol: string,
    username_id: number,
    volume: number,
}

export interface ISymbolAll {
    id: number,
    account_transaction_id: number,
    contract_size: number,
    description: string,
    digits: number,
    id_transaction: number,
    lot_id: number,
    price_open: number,
    price_transaction: number,
    profit: number,
    status: "cancelled" | "filled" | "pending",
    swap_long: number,
    swap_short: number,
    tick_size: number,
    tick_value: number,
    time: string,
    type: "SELL" | "BUY",
    username_id: number,
    volume: number
    symbol: string,
}

export interface IProfitOrderClose {
    account_transaction_id: number,
    time: string,
    total_profit: number,
    transaction_count: number
}

export interface ISymbolPosition {
    account_id: number,
    username?: string,
    comment: string,
    commission: number,
    current_price: number,
    id: number,
    id_transaction: number,
    magic_number: number,
    open_price: number,
    open_time: string,
    position_type: "BUY" | "SELL" | "1" | "0",
    profit: number,
    sl: number,
    swap: number,
    symbol: string,
    time: string,
    tp: number,
    username_id: number,
    volume: number,
    is_odd: boolean
}

export const dataAccTransaction = [20305495, 102743455, 957463445, 333354356]

export const initFilter: IFilterAllLot = {
    accTransaction: null,
    status: null,
    toFrom: [undefined, undefined]
}