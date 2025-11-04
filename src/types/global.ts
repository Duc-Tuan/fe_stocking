export interface IPagination {
    page?: number;
    limit: number;
    totalPage?: number;
    total?: number;
    is_last_page?: boolean;
    timeframe?: string | "M1" | "M5" | "M10" | "M15" | "M30" | "1H" | "2H" | "4H" | "1D" | "1W" | "MN";
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
    active?: boolean,
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
    statistical: IStatistical[]
}

export interface IStatistical {
    best_day: string
    best_day_change: number
    best_month: string
    best_month_change: number
    best_week: string
    best_week_change: number
    day_max: number
    day_min: number
    id: number
    login: number
    month_max: number
    month_min: number
    time: string
    week_max: number
    week_min: number
    worst_day: string
    worst_day_change: number
    worst_month: string
    worst_month_change: number
    worst_week: string
    worst_week_change: number
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
    loginId: number,
    risk: number | null,
    type_acc: "QUY" | "USD" | "COPY" | "DEPOSIT" | "RECIPROCAL" | "RECIPROCAL_ACC" | "COM" | "VAY" | "SWWING" | "DEMO",
    monney_acc: number,
    daily_risk: number
}

export interface QueryLots extends IPagination {
    start_time?: number,
    end_time?: number,
    symbol?: string,
    type?: "BUY" | "SELL",
    status?: "Xuoi_Limit" | "Nguoc_Limit" | "Xuoi_Stop" | "Nguoc_Stop" | "Lenh_thi_truong" | "pending" | "filled" | "cancelled" | "rejected",
    acc_transaction?: number,
    statusType?: "RUNNING"
}

export interface IPostCloseOrder {
    data: { id: number }[]
}

export interface IPatchLot {
    id: number,
    stop_loss: number,
    take_profit: number,
}

export type Func<T = void> = T extends void ? () => void : (data: T) => void;

type Tline = [number | undefined, number | undefined] | undefined;

export interface ISetupIndicator {
    outerLines: Tline,
    innerLines: Tline,
    midline: number | undefined,
    isOpen: boolean,
    period: number | undefined,
    periodADX?: number | undefined,
    periodEMA?: number | undefined,
}

export const initSetupIndicator: ISetupIndicator = {
    isOpen: false,
    innerLines: undefined,
    midline: undefined,
    period: undefined,
    outerLines: undefined,
    periodADX: undefined,
    periodEMA: undefined,
}

export const initSetupIndicatorRSI: ISetupIndicator = {
    isOpen: false,
    period: 14,
    innerLines: [70, 30],
    midline: 50,
    outerLines: [80, 20],
    periodADX: 14
}

export const initSetupIndicatorADR: ISetupIndicator = {
    isOpen: false,
    period: 14,
    innerLines: [0.3, 0],
    midline: 0.22,
    outerLines: [0.2, 0.2]
}
export const initSetupIndicatorMACD: ISetupIndicator = {
    isOpen: false,
    period: 26,
    periodEMA: 12,
    innerLines: [0.3, 0],
    midline: 0.22,
    outerLines: [0.2, 0.2]
}

export const initSetupIndicatorROC: ISetupIndicator = {
    isOpen: false,
    period: 12,
    innerLines: [0.3, 0],
    midline: 0.22,
    outerLines: [0.2, 0.2]
}

export const initSetupIndicatorROLLING: ISetupIndicator = {
    isOpen: false,
    period: 20,
    innerLines: [0.3, 0],
    midline: 0.22,
    outerLines: [0.2, 0.2]
}