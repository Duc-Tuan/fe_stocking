export type EMO = "Xuoi_Limit" | "Nguoc_Limit" | "Xuoi_Stop" | "Nguoc_Stop" | "Lenh_thi_truong";

export interface IActivateTypetransaction {
    active: boolean,
    title: string,
    type: EMO,
    color: string,
}

export const dataActivateTypetransaction: IActivateTypetransaction[] = [
    {
        active: true,
        color: "text-black",
        title: "Vào lệnh thị trường",
        type: "Lenh_thi_truong",
    },
    { title: "Xuôi Limit", type: "Xuoi_Limit", color: "text-red-600", active: false },
    { title: "Ngược Limit", type: "Nguoc_Limit", color: "text-blue-600", active: false },
    { title: "Xuôi Stop", type: "Xuoi_Stop", color: "text-red-600", active: false },
    { title: "Ngược Stop", type: "Nguoc_Stop", color: "text-blue-600", active: false },
]

export interface IAccTransaction {
    usename: number,
    active: boolean
}

export const dataAccTransaction: IAccTransaction[] = [
    {
        active: false,
        usename: 45623342
    },
    {
        active: false,
        usename: 65734563
    },
    {
        active: false,
        usename: 76345354
    },
]