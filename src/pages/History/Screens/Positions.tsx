import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'
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
import { useClickOutside } from '../../../hooks/useClickOutside'
import { Button } from '../../../components/button'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'

const initPara: QueryLots = {
    page: 1,
    limit: 10,
    acc_transaction: undefined,
    end_time: undefined,
    start_time: undefined,
    symbol: undefined,
    type: undefined
}

interface IBreakEven {
    account_monitor: number,
    account_transaction: number,
    pnl: number,
    pnl_break_even: number,
    total_profit: number,
    total_volume: number
}

interface IData extends IServerTransaction {
    open_orders?: any,
    position?: number,
    break_even?: IBreakEven[]
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
            const dataSocket = dataCurrentPosition.positions?.find((d: any) => i.id_transaction === d?.id_transaction)!
            if (i.id_transaction === dataSocket?.id_transaction) {
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

                const data = dataCurrentPosition.positions?.filter(
                    (t: any) => t.account_id === dataSocket?.username
                )

                if (!data || data.length === 0) {
                    return i; // hoặc undefined, hoặc skip
                }

                const break_even = dataCurrentPosition.break_even?.filter(
                    (t: any) => t.account_transaction === dataSocket?.username
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
                    position: dataCurrentPosition.positions ? data.length : 0,
                    swap: data.reduce((sum: number, item: any) => sum + (item.swap || 0), 0),
                    break_even: break_even
                }
            }
            return i
        })
        setDataAccTransaction(dataNewAcc)
    }, [dataCurrentPosition])

    return (
        <div className='relative'>
            <Filter setFilter={setFilter} filter={filter} isType isStatus query={query} setQuery={setQuery} handleFilter={handleFilter} />
            <div className="p-2 flex flex-col justify-start items-start gap-2 min-h-[410px]">
                {
                    !loading ?
                        data.length === 0 ?
                            <div className='text-gray-300 flex justify-center items-center flex-1 w-full'>{t("Hiện không có lệnh nào đang mở")}</div>
                            :
                            data.map((a, idx) => <div key={idx} className="flex justify-between items-center w-full shadow-sm shadow-gray-300 p-2 rounded-sm">
                                <div className="">
                                    <div className='font-bold'>{a.symbol} <span className={`text-sm font-semibold ${a.position_type === "SELL" ? "text-red-500" : "text-blue-500"}`}>{a.position_type} {a.volume}</span></div>
                                    <div className='text-sm flex justify-start items-center gap-1'>{a.open_price} <Icon name="icon-right-v2" width={14} height={14} /> {a.current_price}</div>
                                </div>
                                <div className="">
                                    <div className={`text-right ${a.profit > 0 ? "text-blue-700" : (a.profit === 0 ? "text-gray-400" : "text-red-500")} font-semibold`}>{a.profit}</div>
                                    <div className='text-sm'>{a.account_id} | {(dayjs.utc(a.time)).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss")}</div>
                                </div>
                            </div>)
                        :
                        <Loading />
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
                                <div className="flex justify-between items-center">
                                    <div className="text-sm"><span className='font-bold mr-2'>{t("Tài khoản")}: </span>{d.name}</div>
                                    <More data={d.break_even} title={d.name} />
                                </div>
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


const More = ({ data, title }: { data: IBreakEven[], title: string }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return <div className="">
        <Button onClick={() => setOpen(!open)} className="shadow-none p-0 cursor-pointer hover:text-[var(--color-background)] text-gray-500"><Icon name="icon-more-v2" /></Button>
        <Dialog open={open} onClose={setOpen} className="relative z-100">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                    >
                        <div className="bg-white p-4 shadow-custom">
                            <h1 className='text-center font-bold'>{t("Điểm PNL hòa vốn")}</h1>
                            <div className="flex justify-center items-center gap-1 text-sm">
                                <div className="">{t("Tài khoản giao dịch")}:</div>
                                <h2 className='text-center font-bold text-[var(--color-background)]'>{title}</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {data ? data?.map((d, idx) =>
                                    <div className="col-span-1 text-sm" key={idx}>
                                        <div className="flex">
                                            <div className="">{t("Tài khoản theo dõi")}: </div>
                                            <div className="font-semibold pl-2">{d.account_monitor}</div>
                                        </div>
                                        <div className="flex">
                                            <div className="">{t("PNL thị trường")}: </div>
                                            <div className="font-semibold pl-2 text-[var(--color-background)]">{d.pnl}</div>
                                        </div>
                                        <div className="flex">
                                            <div className="">{t("Tổng lợi nhuận / Volume")}: </div>
                                            <div className="font-semibold pl-2">{d.pnl_break_even.toFixed(5)}</div>
                                        </div>
                                        <div className="flex">
                                            <div className="">{t("Tổng lợi nhuận")}: </div>
                                            <div className="font-semibold pl-2">{d.total_profit.toFixed(5)}</div>
                                        </div>
                                        <div className="flex">
                                            <div className="">{t("Tổng volume")}: </div>
                                            <div className="font-semibold pl-2">{d.total_volume}</div>
                                        </div>
                                        <div className="flex">
                                            <div className="">{t("Điểm PNL hòa vốn")}: </div>
                                            <div className="font-semibold pl-2">{(d.pnl - d.pnl_break_even).toFixed(5)}</div>
                                        </div>
                                    </div>
                                ) : <div className="text-sm w-full col-span-2 text-center min-h-40 flex justify-center items-center text-gray-400">{t("Hiện đang không có lệnh nào đang mở.")}</div> }
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    </div>
}