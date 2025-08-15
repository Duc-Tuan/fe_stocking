import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Filter from '../components/Filter'
import { initFilter, type IFilterAllLot, type ISymbol, type ISymbolPosition } from '../type'
import Icon from '../../../assets/icon'
import type { QueryLots } from '../../../types/global'
import { getPositionTransaction } from '../../../api/historys'
import { getTime } from '../../../utils/timeRange'
import dayjs from 'dayjs'

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


    const [query, setQuery] = useState<QueryLots>(initPara)

    useEffect(() => {
        const fetchApi = async () => {
            const res = await getPositionTransaction(query)
            setData(res.data.data);
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

    return (
        <div className='relative'>
            <Filter setFilter={setFilter} filter={filter} isType isStatus query={query} setQuery={setQuery} handleFilter={handleFilter} />
            <div className="p-2 flex flex-col justify-center items-start gap-2">
                {data.map((a, idx) => <div key={idx} className="flex justify-between items-center w-full shadow-sm shadow-gray-300 p-2 rounded-sm">
                    <div className="">
                        <div className='font-bold'>{a.symbol} <span className={`text-sm font-semibold ${a.position_type === "SELL" ? "text-red-500" : "text-blue-500"}`}>{a.position_type} {a.volume}</span></div>
                        <div className='text-sm flex justify-start items-center gap-1'>{a.open_price} <Icon name="icon-right-v2" width={14} height={14} /> {a.current_price}</div>
                    </div>
                    <div className="">
                        <div className={`text-right ${a.position_type === "SELL" ? "text-blue-700" : "text-red-500"} font-semibold`}>{a.profit}</div>
                        <div className='text-sm'>{a.account_id} | {(dayjs.utc(a.time)).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss")}</div>
                    </div>
                </div>)}
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
