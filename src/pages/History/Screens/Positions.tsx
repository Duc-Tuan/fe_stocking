import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getPositionTransaction } from '../../../api/historys'
import Icon from '../../../assets/icon'
import { Loading } from '../../../components/loading'
import { useSocket } from '../../../hooks/useWebSocket'
import type { QueryLots } from '../../../types/global'
import { getTime } from '../../../utils/timeRange'
import Filter from '../components/Filter'
import { initFilter, type IFilterAllLot, type ISymbolPosition } from '../type'

const initPara: QueryLots = {
    page: 1,
    limit: 10,
    acc_transaction: undefined,
    end_time: undefined,
    start_time: undefined,
    symbol: undefined,
    type: undefined
}

export default function Positions() {
    const { t } = useTranslation()
    const [filter, setFilter] = useState<IFilterAllLot>(initFilter)
    const [data, setData] = useState<ISymbolPosition[]>([])
    const [loading, setLoading] = useState<boolean>(false)

    const [query, setQuery] = useState<QueryLots>(initPara)

    const { dataCurrentPosition } = useSocket(
        import.meta.env.VITE_URL_API,
        "position_message",
        1314
    );

    useEffect(() => {
        const fetchApi = async () => {
            setLoading(true)
            const res = await getPositionTransaction(query)
            setData(res.data.data);
            setLoading(false)
            setQuery((prev) => ({ ...prev, total: res.data.total, totalPage: Math.ceil(res.data.total / res.data.limit) }))
        }
        fetchApi();
    }, [query.page, query.acc_transaction, query.symbol, query.end_time, query.end_time, query.type])

    const handleFilter = (data: IFilterAllLot) => {
        setQuery((prev) => {
            return {
                ...prev,
                acc_transaction: data.accTransaction ?? undefined,
                type: data.type ?? undefined,
                end_time: getTime(data.toFrom[1]),
                start_time: getTime(data.toFrom[0]),
                page: 1,
            }
        })
    }

    useEffect(() => {
        const dataNew: any = [...data].map((i) => {
            const dataSocket = dataCurrentPosition.find((d: any) => d.id === i.id)
            if (i.id === dataSocket.id) {
                return {
                    id: i.id,
                    account_id: dataSocket.account_id,
                    comment: dataSocket.comment,
                    commission: dataSocket.commission,
                    current_price: dataSocket.current_price,
                    id_transaction: dataSocket.id_transaction,
                    magic_number: dataSocket.magic_number,
                    open_price: dataSocket.open_price,
                    open_time: dataSocket.open_time,
                    position_type: dataSocket.position_type,
                    profit: dataSocket.profit,
                    sl: dataSocket.sl,
                    swap: dataSocket.swap,
                    symbol: dataSocket.symbol,
                    time: dataSocket.time,
                    tp: dataSocket.tp,
                    username_id: dataSocket.username_id,
                    volume: dataSocket.volume
                }
            }
            return i
        })

        setData(dataNew);
        
    }, [dataCurrentPosition])

    return (
        <div className='relative'>
            <Filter setFilter={setFilter} filter={filter} isType isStatus query={query} setQuery={setQuery} handleFilter={handleFilter} />
            <div className="p-2 flex flex-col justify-center items-start gap-2">
                {
                    !loading ? data.map((a, idx) => <div key={idx} className="flex justify-between items-center w-full shadow-sm shadow-gray-300 p-2 rounded-sm">
                        <div className="">
                            <div className='font-bold'>{a.symbol} <span className={`text-sm font-semibold ${a.position_type === "SELL" ? "text-red-500" : "text-blue-500"}`}>{a.position_type} {a.volume}</span></div>
                            <div className='text-sm flex justify-start items-center gap-1'>{a.open_price} <Icon name="icon-right-v2" width={14} height={14} /> {a.current_price}</div>
                        </div>
                        <div className="">
                            <div className={`text-right ${a.position_type === "SELL" ? "text-blue-700" : "text-red-500"} font-semibold`}>{a.profit}</div>
                            <div className='text-sm'>{a.account_id} | {(dayjs.utc(a.time)).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss")}</div>
                        </div>
                    </div>) : <Loading />
                }
            </div>

            <div className="sticky bottom-0 bg-white p-2">
                <div className="flex justify-between items-center">
                    <div className="font-semibold">{t("Tiền nạp")}</div>
                    <span className='font-bold'>100000</span>
                </div>
                <div className="flex justify-between items-center">
                    <div className="font-semibold">{t("Lợi nhuận")}</div>
                    <span className='font-bold'>13940</span>
                </div>
                <div className="flex justify-between items-center">
                    <div className="font-semibold">{t("Phí qua đêm")}</div>
                    <span className='font-bold'>10.9</span>
                </div>
                <div className="flex justify-between items-center">
                    <div className="font-semibold">{t("Số dư")}</div>
                    <span className='font-bold'>1200000</span>
                </div>
            </div >
        </div>
    )
}
