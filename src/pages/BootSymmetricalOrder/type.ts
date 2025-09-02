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