import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getSymbolTransaction } from '../../../api/historys'
import type { QueryLots } from '../../../types/global'
import Filter from '../components/Filter'
import { initFilter, type IFilterAllLot, type ISymbolAll } from '../type'
import { getTime } from '../../../utils/timeRange'
import dayjs from 'dayjs'
import { Loading } from '../../../components/loading'

const initPara: QueryLots = {
  page: 1,
  limit: 10,
  acc_transaction: undefined,
  end_time: undefined,
  start_time: undefined,
  symbol: undefined,
}


export default function Deals() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<IFilterAllLot>(initFilter)
  const [data, setData] = useState<ISymbolAll[]>([])
  const [total, setTotal] = useState<{ totalFilled: number, totalCancelled: number, total: number }>({ total: 0, totalCancelled: 0, totalFilled: 0 })
  const [loading, setLoading] = useState<boolean>(false)
  const [query, setQuery] = useState<QueryLots>(initPara)

  useEffect(() => {
    const fetchApi = async () => {
      setLoading(true)
      const res = await getSymbolTransaction(query)
      setData(res.data.data);
      setLoading(false)
      setTotal({
        total: res.data.total,
        totalFilled: res.data.totalFilled,
        totalCancelled: res.data.totalCancelled,
      })
      setQuery((prev) => ({ ...prev, total: res.data.total, totalPage: Math.ceil(res.data.total / res.data.limit) }))
    }
    fetchApi();
  }, [query.page, query.acc_transaction, query.symbol, query.end_time, query.end_time, query.status])

  const handleFilter = (data: IFilterAllLot) => {
    setQuery((prev) => {
      return {
        ...prev,
        acc_transaction: data.accTransaction ?? undefined,
        status: data.status ?? undefined,
        end_time: getTime(data.toFrom[1]),
        start_time: getTime(data.toFrom[0]),
        page: 1,
      }
    })
  }

  return (
    <div className='relative'>
      <Filter setFilter={setFilter} filter={filter} isStatus query={query} setQuery={setQuery} isStatusSymbol handleFilter={handleFilter} />
      <div className="p-2 flex flex-col justify-center items-start gap-2">
        {
          !loading ? data.map((a, idx) => <div key={idx} className="flex justify-between items-center w-full shadow-sm shadow-gray-300 p-2 rounded-sm">
            <div className="text-[12px] md:text-sm">
              <div className='font-bold mb-1'>{a.symbol} <span className={`text-[12px] md:text-sm font-semibold ${a.type === "SELL" ? "text-red-500" : "text-blue-500"}`}>{a.type}</span></div>
              <div>{a.volume} {t("tại")} {a.price_open}</div>
            </div>
            <div className="text-[12px] md:text-sm">
              <div className={`mb-1 text-right ${a.status === "filled" ? "text-blue-700" : (a.status === "pending" ? "text-yellow-500" : "text-red-500")} font-semibold`}>{a.profit} <span>{a.status}</span></div>
              <div>{a.account_transaction_id} | {(dayjs.utc(a.time)).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss")}</div>
            </div>
          </div>)
            :
            <Loading />
        }
      </div>

      <div className="sticky bottom-0 bg-white p-2">
        <div className="flex justify-between items-center">
          <div className="font-semibold text-[12px] md:text-sm">{t("Tổng lệnh")}</div>
          <span className='font-bold text-[12px] md:text-sm'>{total.total}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="font-semibold text-[12px] md:text-sm">Filled</div>
          <span className='font-bold text-[12px] md:text-sm'>{total.totalFilled}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="font-semibold text-[12px] md:text-sm">{t("Đã đóng lệnh")}</div>
          <span className='font-bold text-[12px] md:text-sm'>{total.totalCancelled}</span>
        </div>
      </div>
    </div>
  )
}
