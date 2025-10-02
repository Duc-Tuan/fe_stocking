import { PathName } from "../../routes/path";
import type { Option } from "../History/type";

export interface IDatafunction {
    title: string;
    type: "Info" | "Acc_tracking" | "Acc_transaction" | "Language" | "Email" | "Notifition"
}

export interface IOptionDatafunctionSetting extends IDatafunction {
    active: boolean,
    path: string,
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
        type: "Info",
        path: PathName.INFOACC
    },
    {
        active: false,
        title: "Tài khoản theo dõi",
        type: "Acc_tracking",
        path: PathName.ACCMONITOR
    },
    {
        active: false,
        title: "Tài khoản giao dịch",
        type: "Acc_transaction",
        path: PathName.ACCTRANSACTION
    },
    {
        active: false,
        title: "Ngôn ngữ",
        type: "Language",
        path: PathName.LANGUAGE
    },
    {
        active: false,
        title: "Hộp thư",
        type: "Email",
        path: PathName.EMAIL
    },
    {
        active: false,
        title: "Thông báo",
        type: "Notifition",
        path: PathName.NOTIFICATION
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

export interface IOptionAccTransaction extends Option<number> {
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

export const pathSetting = (path: string) => `/${PathName.SETTING}/${path}`;

export const getNotificationId = (href: string, path: string) => {
    const base = path.replace('/:id', ''); // "/settings/notification"

    if (!href.startsWith(base)) return undefined; // không phải notification detail

    const idPart = href.slice(base.length + 1); // lấy phần sau "/settings/notification/"
    return idPart || ':id';
};

export const dataTypeAccTransaction: (name: string) => IChangColor[] = (name: string) => {
    const data = [
        {
            active: false,
            label: "Quỹ",
            value: "QUY"
        },
        {
            active: false,
            label: "Usd",
            value: "USD"
        },
        {
            active: false,
            label: "CopyTrade",
            value: "COPY"
        },
        {
            active: false,
            label: "Ký gửi",
            value: "DEPOSIT"
        },
        {
            active: false,
            label: "Boot cào com",
            value: "COM"
        },
        {
            active: false,
            label: "Đối ứng",
            value: "RECIPROCAL"
        },
        {
            active: false,
            label: "Vây",
            value: "VAY"
        },
        {
            active: false,
            label: "Swwing",
            value: "SWWING"
        },
    ]

    return data.map((i) => {
        if (i.value === name) {
            return {
                ...i,
                active: true
            }
        }
        return i
    })
}

export const dataTabsAccTransaction: IChangColor[] = [
    {
        active: true,
        label: "Quỹ",
        value: "QUY"
    },
    {
        active: false,
        label: "Usd",
        value: "USD"
    },
    {
        active: false,
        label: "CopyTrade",
        value: "COPY"
    },
    {
        active: false,
        label: "Ký gửi",
        value: "DEPOSIT"
    },
    {
        active: false,
        label: "Đối ứng",
        value: "RECIPROCAL"
    },
    {
        active: false,
        label: "Boot cào com",
        value: "COM"
    },
    {
        active: false,
        label: "Vây",
        value: "VAY"
    },
    {
        active: false,
        label: "Swwing",
        value: "SWWING"
    },
]

// swing - vây