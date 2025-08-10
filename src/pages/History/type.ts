export interface IDatafunction {
    title: string;
    type: "Positions" | "Orders" | "Deals"
}

export interface IOptionDatafunction extends IDatafunction {
    active: boolean
}

export const datafunction: IOptionDatafunction[] = [
    {
        active: true,
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