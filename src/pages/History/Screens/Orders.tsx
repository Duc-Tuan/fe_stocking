import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getOrdersClose } from '../../../api/historys'
import type { QueryLots } from '../../../types/global'
import Filter from '../components/Filter'
import { initFilter, type IFilterAllLot, type ISymbol } from '../type'
import dayjs from 'dayjs'
import { getTime } from '../../../utils/timeRange'
import { Loading } from '../../../components/loading'


const initPara: QueryLots = {
  page: 1,
  limit: 10,
  acc_transaction: undefined,
  end_time: undefined,
  start_time: undefined,
  symbol: undefined,
}


export default function Orders() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<IFilterAllLot>(initFilter)
  const [data, setData] = useState<ISymbol[]>([])
  const [query, setQuery] = useState<QueryLots>(initPara)
  const [total, setTotal] = useState<{ totalOrder: number }>({ totalOrder: 0 })
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchApi = async () => {
      setLoading(true)
      const res = await getOrdersClose(query)
      setData(res.data.data);
      setLoading(false)
      setTotal({ totalOrder: res.data.totalOrder })
      setQuery((prev) => ({ ...prev, total: res.data.total, totalPage: Math.ceil(res.data.total / res.data.limit) }))
    }
    fetchApi();
  }, [query.page, query.acc_transaction, query.symbol, query.end_time, query.end_time])

  const handleFilter = (data: IFilterAllLot) => {
    setQuery((prev) => {
      return {
        ...prev,
        acc_transaction: data.accTransaction ?? undefined,
        end_time: getTime(data.toFrom[1]),
        start_time: getTime(data.toFrom[0]),
        page: 1,
      }
    })
  }

  return (
    <div className="relative">
      <Filter setFilter={setFilter} filter={filter} isStatus query={query} setQuery={setQuery} handleFilter={handleFilter} />

      <div className="p-2 flex flex-col justify-center items-start gap-2">
        {
          !loading ? data.map((a, idx) => <div key={idx} className="flex justify-between items-center w-full shadow-sm shadow-gray-300 p-2 rounded-sm">
            <div className="text-sm">
              <div className='font-bold mb-1 '>{a.symbol} <span className={`text-sm font-semibold ${a.position_type === "SELL" ? "text-red-500" : "text-blue-500"}`}>{a.position_type}</span></div>
              <div>{a.volume} / {a.volume} {t("ở chợ")}</div>
            </div>
            <div className="text-sm">
              <div className={`mb-1 text-right text-red-500 font-semibold`}>{t("Lệnh đã đóng")}</div>
              <div>{a.account_id} | {(dayjs.utc(a.close_time)).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss")}</div>
            </div>
          </div>) : <Loading />
        }
      </div>

      <div className="sticky bottom-0 bg-white p-2">
        <div className="flex justify-between items-center">
          <div className="font-semibold">{t("Tổng lệnh")}</div>
          <span className='font-bold'>{total.totalOrder}</span>
        </div>
      </div>
    </div>
  )
}
