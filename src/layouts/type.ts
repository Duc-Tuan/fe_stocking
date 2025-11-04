import dayjs from "dayjs"
import { PathName } from "../routes/path"
import { t } from "i18next"
import type { ISymbol, Option } from "../pages/History/type"
import type { IinitialDataCand } from "../pages/Home/options"

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
    },
    {
        nameIcon: "icon-watch-status",
        path: PathName.SYMMETRICAL_ORDER,
        title: "Boot vào lệnh đối xứng"
    }
]

export interface INotification {
    id: number,
    loginId: number,
    isRead: boolean,
    symbol: string,
    total_volume: number,
    is_send: boolean,
    time: number,
    profit: number,
    acc_transaction: number,
    total_order: number,
    type?: 0 | 1,
    risk: number,
}

export interface INotifi {
    account_transaction_id: number,
    id: number,
    isRead: boolean,
    is_send: boolean,
    loginId: number,
    profit: number,
    risk: number,
    symbol: string,
    time: string,
    total_order: number,
    total_volume: number,
    monney_acctransaction: number,
    type: "BUY" | "SELL",
    deals?: IDealNotification[],
    lot_id: number,
    type_notification: string,
    daily_risk: number
}

export interface IDealNotification {
    close_price: number,
    close_time: string
    id: number,
    open_price: number,
    open_time: string,
    position_type: "0" | "1",
    profit: number,
    symbol: string,
    volume: number,
    account_id: number
}

export const dataNotification: INotification[] = [
    {
        id: 1,
        is_send: false,
        isRead: false,
        loginId: 1,
        symbol: "USDCADc",
        time: 1758340680,
        total_volume: 0.1,
        profit: -200,
        acc_transaction: 12344325,
        total_order: 5,
        risk: 1.9
    },
    {
        id: 2,
        is_send: true,
        isRead: true,
        loginId: 1,
        symbol: "EURGBPc",
        time: 1758214800,
        total_volume: 0.1,
        profit: -130,
        acc_transaction: 12344325,
        total_order: 3,
        risk: 1.9
    },
    {
        id: 3,
        is_send: false,
        isRead: false,
        loginId: 1,
        symbol: "GBPNZDc",
        time: 1758340500,
        total_volume: 0.41,
        profit: -200,
        acc_transaction: 12344325,
        total_order: 1,
        risk: 1.9
    },
    {
        id: 4,
        is_send: true,
        isRead: true,
        loginId: 1,
        symbol: "USDCADc",
        time: 1758340680,
        total_volume: 0.1,
        profit: -450,
        acc_transaction: 12344325,
        total_order: 9,
        risk: 1.9
    },
    {
        id: 5,
        is_send: false,
        isRead: false,
        loginId: 1,
        symbol: "EURGBPc",
        time: 1758340620,
        total_volume: 0.122,
        profit: -380,
        acc_transaction: 12344325,
        total_order: 6,
        risk: 1.9
    },
    {
        id: 6,
        is_send: false,
        isRead: true,
        loginId: 1,
        symbol: "EURGBPc",
        time: 1758340620,
        total_volume: 0.122,
        profit: -380,
        acc_transaction: 12344325,
        total_order: 6,
        risk: 1.9
    },
    {
        id: 7,
        is_send: false,
        isRead: false,
        loginId: 1,
        symbol: "EURGBPc",
        time: 1758340620,
        total_volume: 0.122,
        profit: -380,
        acc_transaction: 12344325,
        total_order: 6,
        risk: 1.9
    },
    {
        id: 8,
        is_send: false,
        isRead: true,
        loginId: 1,
        symbol: "EURGBPc",
        time: 1758340620,
        total_volume: 0.122,
        profit: -380,
        acc_transaction: 12344325,
        total_order: 6,
        risk: 1.9
    },
]

export function timeAgo(timestamp: number) {
    const now = dayjs();
    const past = dayjs(timestamp * 1000);
    const diffMinutes = now.diff(past, 'minute');
    const diffHours = now.diff(past, 'hour');
    const diffDays = now.diff(past, 'day');

    if (diffMinutes < 60) {
        return `${diffMinutes}p  ${t('trước')}`;
    } else if (diffHours < 24) {
        return `${diffHours}h  ${t('trước')}`;
    } else if (diffDays < 2) {
        const hoursRemainder = diffHours % 24;
        return `${diffDays}d${hoursRemainder > 0 ? hoursRemainder + 'h' : ''} ${t('trước')}`;
    } else {
        return past.format('HH:mm:ss DD/MM/YYYY');
    }
}

export const dataTabsNotification: (Option<string> & { active: boolean })[] = [
    {
        active: true,
        label: "Đã xem",
        value: "View"
    },
    {
        active: false,
        label: "Chưa xem",
        value: "Haven't seen"
    },
    {
        active: false,
        label: "Tất cả",
        value: "View all"
    },
]

export const dataTabsNotificationSp: (Option<string> & { active: boolean })[] = [
    {
        active: false,
        label: "Đã vào lệnh",
        value: "Order"
    },
    {
        active: false,
        label: "Chưa vào lệnh",
        value: "Close"
    }
]

export interface ISymbolNotification extends Omit<ISymbol, 'open_time'> {
    id_notification: number,
    open_time: number
}

export const dataSymbolCloseNotification: ISymbolNotification[] = [
    {
        id: 1,
        account_id: 1,
        close_price: 1,
        close_time: 1,
        comment: "",
        commission: 1,
        id_notification: 1,
        open_price: 1,
        open_time: 1758515088,
        position_type: "BUY",
        profit: 0.125,
        swap: 0,
        symbol: "USDCADc",
        username_id: 1,
        volume: 0.01
    },
    {
        id: 2,
        account_id: 1,
        close_price: 1,
        close_time: 1,
        comment: "",
        commission: 1,
        id_notification: 1,
        open_price: 1,
        open_time: 1758515088,
        position_type: "BUY",
        profit: 0.125,
        swap: 0,
        symbol: "USDCADc",
        username_id: 1,
        volume: 0.01
    },
    {
        id: 3,
        account_id: 1,
        close_price: 1,
        close_time: 1,
        comment: "",
        commission: 1,
        id_notification: 1,
        open_price: 1,
        open_time: 1758515088,
        position_type: "BUY",
        profit: 0.125,
        swap: 0,
        symbol: "USDCADc",
        username_id: 1,
        volume: 0.01
    },
    {
        id: 4,
        account_id: 1,
        close_price: 1,
        close_time: 1,
        comment: "",
        commission: 1,
        id_notification: 1,
        open_price: 1,
        open_time: 1758515088,
        position_type: "BUY",
        profit: 0.125,
        swap: 0,
        symbol: "USDCADc",
        username_id: 1,
        volume: 0.01
    },
    {
        id: 5,
        account_id: 1,
        close_price: 1,
        close_time: 1,
        comment: "",
        commission: 1,
        id_notification: 1,
        open_price: 1,
        open_time: 1758515088,
        position_type: "BUY",
        profit: 0.125,
        swap: 0,
        symbol: "USDCADc",
        username_id: 1,
        volume: 0.01
    },
    {
        id: 6,
        account_id: 1,
        close_price: 1,
        close_time: 1,
        comment: "",
        commission: 1,
        id_notification: 1,
        open_price: 1,
        open_time: 1758515088,
        position_type: "BUY",
        profit: 0.125,
        swap: 0,
        symbol: "USDCADc",
        username_id: 1,
        volume: 0.01
    },
    {
        id: 7,
        account_id: 1,
        close_price: 1,
        close_time: 1,
        comment: "",
        commission: 1,
        id_notification: 1,
        open_price: 1,
        open_time: 1758515088,
        position_type: "BUY",
        profit: 0.125,
        swap: 0,
        symbol: "USDCADc",
        username_id: 1,
        volume: 0.01
    },
    {
        id: 8,
        account_id: 1,
        close_price: 1,
        close_time: 1,
        comment: "",
        commission: 1,
        id_notification: 1,
        open_price: 1,
        open_time: 1758515088,
        position_type: "BUY",
        profit: 0.125,
        swap: 0,
        symbol: "USDCADc",
        username_id: 1,
        volume: 0.01
    },
]

// Hàm tính mode (giá trị xuất hiện nhiều nhất)
const calculateMode = (data: number[]): number | null => {
  if (data.length === 0) return null;

  const counts: Record<number, number> = {};

  for (const value of data) {
    counts[value] = (counts[value] || 0) + 1;
  }

  let mode: number | null = null;
  let maxCount = 0;

  for (const [value, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      mode = Number(value);
    }
  }

  return mode;
};

// Gom 5 cây nến 1 nhóm rồi tính mode theo close
export const groupCandlesAndFindMode = (candles: IinitialDataCand[], groupSize = 5) => {
  const result: { groupIndex: number; modeClose: number | null }[] = [];

  for (let i = 0; i < candles.length; i += groupSize) {
    const group = candles.slice(i, i + groupSize);
    const closes = group.map(c => c.close);
    const modeClose = calculateMode(closes);
    result.push({ groupIndex: i / groupSize, modeClose });
  }

  return result;
};