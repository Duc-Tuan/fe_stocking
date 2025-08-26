import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getPositionTransaction } from '../../../api/historys'
import Icon from '../../../assets/icon'
import { Loading } from '../../../components/loading'
import { useSocket } from '../../../hooks/useWebSocket'
import type { IServerTransaction, QueryLots } from '../../../types/global'
import { getTime } from '../../../utils/timeRange'
import Filter from '../components/Filter'
import { initFilter, type IFilterAllLot, type ISymbolPosition } from '../type'
import { useAppInfo } from '../../../hooks/useAppInfo'

const initPara: QueryLots = {
    page: 1,
    limit: 10,
    acc_transaction: undefined,
    end_time: undefined,
    start_time: undefined,
    symbol: undefined,
    type: undefined
}

interface IData extends IServerTransaction {
    open_orders?: any
    position?: number
}

export default function Positions() {
    const { t } = useTranslation()
    const { dataServerTransaction, loadingserverTransaction } = useAppInfo()
    const [dataAccTransaction, setDataAccTransaction] = useState<IData[]>(dataServerTransaction)

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
            const dataSocket = dataCurrentPosition.position.find((d: any) => d.id === i.id)
            if (i.id === dataSocket?.id) {
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

        const dataNewAcc: any = [...dataAccTransaction].map((i) => {
            const dataSocket = dataCurrentPosition?.acc.find((d: any) => d.id === i.id)
            if (i.id === dataSocket?.id) {
                const data = dataCurrentPosition.position.filter(
                    (t: any) => t.account_id === dataSocket?.username
                )
                return {
                    id: dataSocket.id,
                    username: dataSocket.username,
                    name: dataSocket.name,
                    balance: dataSocket.balance,
                    equity: dataSocket.equity,
                    margin: dataSocket.margin,
                    free_margin: dataSocket.free_margin,
                    leverage: dataSocket.leverage,
                    server: dataSocket.server,
                    loginId: dataSocket.loginId,
                    position: data.length,
                    swap: data.reduce((sum: number, item: any) => sum + (item.swap || 0), 0)
                }
            }
            return i
        })
        setDataAccTransaction(dataNewAcc)

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
                            <div className={`text-right ${a.profit > 0 ? "text-blue-700" : (a.profit === 0 ? "text-gray-400" : "text-red-500")} font-semibold`}>{a.profit}</div>
                            <div className='text-sm'>{a.account_id} | {(dayjs.utc(a.time)).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss")}</div>
                        </div>
                    </div>) : <Loading />
                }
            </div>

            <div className="sticky bottom-0 bg-white p-2 grid grid-cols-5">
                {
                    [
                        ...dataAccTransaction,
                        // nếu ít hơn 5 thì thêm phần tử ảo cho đủ
                        ...Array(Math.max(0, 5 - dataAccTransaction.length)).fill({ isFake: true })
                    ].map((d, index) => {
                        if (d.isFake) {
                            return (
                                <div className="col-span-1 border border-dashed border-gray-300 p-2 opacity-50" key={`fake-${index}`}>
                                    <div className="text-sm text-gray-400">{t("Đang chờ tài khoản")}</div>
                                </div>
                            )
                        }

                        return (
                            <div className="col-span-1 border border-gray-300 p-2" key={d.id}>
                                <div className="text-sm"><span className='font-bold mr-2'>{t("Tài khoản")}: </span>{d.name}</div>
                                <div className="text-sm"><span className='font-bold mr-2'>{t("Máy chủ")}: </span>{d.server}</div>
                                <div className="text-sm"><span className='font-bold mr-2'>{t("Số dư")}: </span>{d.balance}</div>
                                <div className="text-sm"><span className='font-bold mr-2'>{t("Vốn")}: </span>{d.equity}</div>
                                <div className="text-sm"><span className='font-bold mr-2'>{t("Ký quỹ")}: </span>{d.margin}</div>
                                <div className="text-sm"><span className='font-bold mr-2'>{t("Ký quỹ khả dụng")}: </span>{d.free_margin}</div>
                                <div className="text-sm"><span className='font-bold mr-2'>{t("Đòn bẩy")}: </span>{d.leverage}</div>
                                <div className="text-sm"><span className='font-bold mr-2'>{t("Phí qua đêm")}: </span>{d.swap}</div>
                                <div className="text-sm"><span className='font-bold mr-2'>{t("Số lệnh đang mở")}: </span>{d.position}</div>
                            </div>
                        )
                    })
                }
            </div >
        </div>
    )
}
