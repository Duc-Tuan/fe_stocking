export type EMO = "Xuoi_Limit" | "Nguoc_Limit" | "Xuoi_Stop" | "Nguoc_Stop" | "Lenh_thi_truong";

export interface IActivateTypetransaction {
    active: boolean,
    title: string,
    type: EMO,
    color: string,
    subTitle: string
}

export const dataActivateTypetransaction: IActivateTypetransaction[] = [
    {
        active: true,
        color: "text-black",
        title: "Vào lệnh thị trường",
        type: "Lenh_thi_truong",
        subTitle: `* Điều kiện để vào lệnh: 
            1. Xuôi: Cắt lỗ(PNL) < PNL, 
                  Chốt lời(PNL) > PNL
            2. Ngược: Cắt lỗ(PNL) > PNL, 
                  Chốt lời(PNL) < PNL
        `
    },
    {
        title: "Xuôi Limit",
        type: "Xuoi_Limit",
        color: "text-red-600",
        active: false,
        subTitle: `Điều kiện để vào lệnh: 
            Giá(PNL) < PNL, 
            Cắt lỗ(PNL) < Giá(PNL), 
            Chốt lời(PNL) > Giá(PNL)
        `
    },
    {
        title: "Ngược Limit",
        type: "Nguoc_Limit",
        color: "text-blue-600",
        active: false,
        subTitle: `Điều kiện để vào lệnh: 
            Giá(PNL) > PNL, 
            Cắt lỗ(PNL) > Giá(PNL), 
            Chốt lời(PNL) < Giá(PNL)
        `
    },
    {
        title: "Xuôi Stop",
        type: "Xuoi_Stop",
        color: "text-red-600",
        active: false,
        subTitle: `Điều kiện để vào lệnh: 
            Giá(PNL) > PNL, 
            Cắt lỗ(PNL) < Giá(PNL), 
            Chốt lời(PNL) > Giá(PNL)
        `
    },
    {
        title: "Ngược Stop",
        type: "Nguoc_Stop",
        color: "text-blue-600",
        active: false,
        subTitle: `Điều kiện để vào lệnh: 
            Giá(PNL) < PNL, 
            Cắt lỗ(PNL) > Giá(PNL), 
            Chốt lời(PNL) < Giá(PNL)
        `
    },
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

export type IStatus_sl_tp = "Xuoi_Limit" | "Nguoc_Limit" | "Xuoi_Stop" | "Nguoc_Stop";

export interface IOrderTransaction {
    account_monitor_id?: number,
    account_transaction_id?: number,
    price?: number,
    volume?: number,
    stop_loss?: number,
    take_profit?: number,
    status?: EMO,
    type?: "CLOSE" | "RUNNING",
    status_sl_tp?: IStatus_sl_tp,
    by_symbol?: {
        current_price: number,
        symbol: string,
        type: "SELL" | "BUY"
    }[]
}

export const titleSatusLot = (data: EMO) => {
    switch (data) {
        case "Lenh_thi_truong":
            return "Lệnh thị trường";
        case "Nguoc_Limit":
            return "Ngược Limit";
        case "Nguoc_Stop":
            return "Ngược Stop";
        case "Xuoi_Limit":
            return "Xuôi Limit";
        case "Xuoi_Stop":
            return "Xuôi Stop";
    }
}