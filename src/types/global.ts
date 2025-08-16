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

export type Func<T> = (data: T) => void