import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCloseOrderBoot } from '../../../api/boot';
import type { QueryLots } from '../../../types/global';
import { type ISymbolBoot } from '../type';

const initPara: QueryLots = {
    page: 1,
    limit: 10,
    status: undefined,
    acc_transaction: undefined,
    end_time: undefined,
    start_time: undefined,
}

export default function BootHistory() {
  const { t } = useTranslation();
  const [data, setData] = useState<ISymbolBoot[]>([]);
  const [query, setQuery] = useState<QueryLots>(initPara)

  useEffect(() => {
    const fetch = async () => {
      const data = await getCloseOrderBoot(query)
      setData(data.data.data);
    }
    fetch()
  }, [query])

  return (
    <div>
      {data.map((a, idx) => (
        <div key={idx} className="flex justify-between items-center w-full shadow-sm shadow-gray-300 p-2 rounded-sm">
          <div className="">
            <div className="font-bold text-[12px] md:text-sm">
              {a.symbol}{' '}
              <span
                className={`text-[12px] md:text-sm font-semibold ${a.order_type === '1' ? 'text-red-500' : 'text-blue-500'}`}
              >
                {a.order_type === "0" ? "BUY" : "SELL"} {a.volume}
              </span>
            </div>
            <div className="text-[10px] md:text-sm flex justify-start items-center gap-1">
              <span className='font-semibold'>Ticket</span>: {a.id_transaction} | <span className='font-semibold'>{t("Giá")}</span>: {a.price.toFixed(4)} | <span className='font-semibold'>{t("TP")}</span>: {a.tp.toFixed(4)} | <span className='font-semibold'>{t("SL")}</span>: {a.sl.toFixed(4)}
            </div>
          </div>
          <div className="">
            <div
              className={`text-right text-[12px] md:text-sm ${
                a.profit > 0 ? 'text-blue-700' : a.profit === 0 ? 'text-gray-400' : 'text-red-500'
              } font-semibold`}
            >
              {a.profit} {t("Đã đóng lệnh")}
            </div>
            <div className="text-[12px] md:text-sm">{a.account_id} | {dayjs.utc(a.time).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
