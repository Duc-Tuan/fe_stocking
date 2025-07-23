export interface IPagination {
    page: number;
    limit: number;
    totalPage?: number;
    total?: number
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
    active?: boolean
    data?: any
}