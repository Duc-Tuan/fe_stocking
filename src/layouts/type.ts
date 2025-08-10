import { PathName } from "../routes/path"

interface IDataHeader {
    nameIcon: string,
    path: string,
    title: string
}

export const dataHeader: IDataHeader[] = [
    {
        nameIcon: "icon-home",
        path: PathName.HOME,
        title: "Trang theo dõi PNL"
    },
    {
        nameIcon: "icon-transaction",
        path: PathName.TRANSACTION,
        title: "Trang giao dịch"
    },
    {
        nameIcon: "icon-history",
        path: PathName.HISTORY,
        title: "Trang lịch sử giao dịch"
    },
    {
        nameIcon: "icon-more",
        path: PathName.SETTING,
        title: "Mở rộng thêm"
    }
]