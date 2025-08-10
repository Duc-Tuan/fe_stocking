export interface IDatafunction {
    title: string;
    type: "Info" | "Acc_tracking" | "Acc_transaction" | "Language" | "Email" | "Notifition"
}

export interface IOptionDatafunctionSetting extends IDatafunction {
    active: boolean
}

export interface ILanguage {
    label: string,
    value: string,
    active: boolean
}

export const datafunctionSetting: IOptionDatafunctionSetting[] = [
    {
        active: true,
        title: "Thông tin của tôi",
        type: "Info"
    },
    {
        active: false,
        title: "Tài khoản theo dõi",
        type: "Acc_tracking"
    },
    {
        active: false,
        title: "Tài khoản giao dịch",
        type: "Acc_transaction"
    },
    {
        active: false,
        title: "Ngôn ngữ và đổi màu",
        type: "Language"
    },
    {
        active: false,
        title: "Hộp thư",
        type: "Email"
    },
    {
        active: false,
        title: "Thông báo",
        type: "Notifition"
    },
]

export const dataLanguage: ILanguage[] = [
    {
        active: false,
        label: "Tiếng việt",
        value: 'vi'
    },
    {
        active: false,
        label: "English",
        value: 'en'
    },
]

export interface IChangColor {
    value: string,
    label: string,
    active: boolean,
}

export const dataChangColor: IChangColor[] = [
    {
        active: false,
        label: "bg-[var(--bg-primary)]",
        value: "",
    },
    {
        active: false,
        label: "bg-[var(--bg-blue)]",
        value: "blue",
    },
    {
        active: false,
        label: "bg-[var(--bg-green)]",
        value: "green",
    },
    {
        active: false,
        label: "bg-[var(--bg-ocean)]",
        value: "ocean",
    },
    {
        active: false,
        label: "bg-[var(--bg-purple)]",
        value: "purple",
    },
    {
        active: false,
        label: "bg-[var(--bg-pink)]",
        value: "pink",
    },
    {
        active: false,
        label: "bg-[var(--bg-orange)]",
        value: "orange",
    },
]