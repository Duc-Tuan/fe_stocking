export interface IPagination {
    page?: number;
    limit: number;
    totalPage?: number;
    total?: number;
    last_time?: string;
    has_more?: boolean;
}

export interface IDataRequest<T> {
    data: T,
    status: number
}

export interface IOptionsTabsCharts {
    tabsName: string,
    icon: any,
    active: boolean,
}

export interface IOptions<T = string> {
    value: string,
    label: T,
    data?: any
}

export interface ICurrentPnl {
    by_symbol: {
        current_price: number,
        symbol: string,
        type: "SELL" | "BUY"
    }[],
    time: string,
    total_pnl: number
    id_symbol: string
}

export interface IServerTransaction {
    id: number,
    username: number,
    name: string,
    balance: number,
    equity: number,
    margin: number,
    free_margin: number,
    leverage: number,
    server: string,
    loginId: number
}

export interface QueryLots extends IPagination {
    start_time?: number,
    end_time?: number,
    symbol?: string,
    type?: "BUY" | "SELL",
    status?: "Xuoi_Limit" | "Nguoc_Limit" | "Xuoi_Stop" | "Nguoc_Stop" | "Lenh_thi_truong" | "pending" | "filled" | "cancelled" | "rejected",
    acc_transaction?: number
}

export interface IPostCloseOrder {
    data: { id: number }[]
}

export interface IPatchLot {
    id: number,
    stop_loss: number,
    take_profit: number,
}

export type Func<T> = (data: T) => void