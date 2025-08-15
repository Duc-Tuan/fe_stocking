import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect, useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { getLots, postCloseOrder } from '../../../api/historys'
import Icon from '../../../assets/icon'
import { Button } from '../../../components/button'
import TooltipNavigate from '../../../layouts/TooltipNavigate'
import type { IPostCloseOrder, QueryLots } from '../../../types/global'
import type { EMO } from '../../Transaction/type'
import Filter from '../components/Filter'
import { type IActiveHistoryLot, type IFilterAllLot, type IHistoryLot } from '../type'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { getTime } from '../../../utils/timeRange'

const initFilter: IFilterAllLot = {
    accTransaction: null,
    status: null,
    toFrom: [undefined, undefined]
}

const initPara: QueryLots = {
    page: 1,
    limit: 10,
    status: undefined,
    acc_transaction: undefined,
    end_time: undefined,
    start_time: undefined,
}

export default function AllLot() {
    const { t } = useTranslation()
    const [data, setData] = useState<IHistoryLot[]>([])
    const [dataCurrent, setDataCurrent] = useState<IActiveHistoryLot | null>(null)
    const [open, setOpen] = useState(false)
    const [filter, setFilter] = useState<IFilterAllLot>(initFilter)
    const [query, setQuery] = useState<QueryLots>(initPara)

    const colorbg = useCallback((status: EMO) => {
        let classC: string = ""
        let label: string = ""
        switch (status) {
            case "Lenh_thi_truong":
                classC = "bg-[#00ff24]"
                label = "Đã gửi lên thị trường"
                break;
            case "Nguoc_Limit":
            case "Nguoc_Stop":
            case "Xuoi_Limit":
            case "Xuoi_Stop":
                classC = "bg-amber-300"
                label = "Đang chờ"
                break;
        }
        return {
            classC,
            label
        }
    }, [])

    const colorTextType = useCallback((type: string) => {
        let classC: string = ""
        switch (type) {
            case "BUY":
                classC = "text-blue-600"
                break;
            case "SELL":
                classC = "text-rose-600"
                break;
        }
        return classC
    }, [])

    useEffect(() => {
        const fetchApi = async () => {
            const res = await getLots(query)
            setData(res.data.data);
            setQuery((prev) => ({ ...prev, total: res.data.total, totalPage: Math.ceil(res.data.total / res.data.limit) }))
        }
        fetchApi();
    }, [query.page, query.acc_transaction, query.status, query.end_time, query.end_time])

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
        <div >
            <Filter subButton={<TaskSquare setDataLost={setData} query={query} idx={data.map((a) => a.id)} />} handleFilter={handleFilter} setFilter={setFilter} filter={filter} query={query} setQuery={setQuery} />

            <div className="mt-1 p-2">
                {data.map((a, idx) =>
                    <div key={idx} className="shadow-sm shadow-gray-300 p-4 pt-2 mb-2 bg-[var(--color-background-opacity-1)]">
                        <div className="flex justify-between items-center border-b border-b-gray-200 pb-2">
                            <div className="flex justify-start items-center gap-2">
                                <span className='font-bold mr-2'>{t("Lô")} {idx + 1}</span>
                                <span className={`${colorbg(a.status).classC} rounded-md text-white px-2 py-1 text-sm font-bold`}>{t(colorbg(a.status).label)}</span>
                                {a.type === "CLOSE" && <span className='font-semibold text-sm bg-red-600 py-1 px-2 rounded-md text-white'>{t("Lô đã đóng lệnh")}</span>}
                            </div>
                            <span className="text-[13px] font-bold">{(dayjs.utc(a.time)).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss")}</span>
                        </div>

                        <div className="flex flex-col justify-center items-start gap-[2px] mt-3">
                            <div className="flex justify-start items-center gap-2">
                                <span>{t("Tài khoản theo dõi")}:</span>
                                <span className='font-semibold'>{a.account_monitor_id}</span>
                            </div>

                            <div className="flex justify-start items-center gap-2">
                                <span>{t("Tài khoản giao dịch")}:</span>
                                <div className="flex justify-start items-center gap-1">
                                    <span className='font-semibold'>{a.account_transaction_id}</span>
                                    <Icon name="icon-chart-transaction" className="text-[var(--color-background)] mt-[2px]" width={18} height={18} />
                                </div>
                            </div>
                            <div className="flex justify-start items-center gap-2">
                                <span>{t("Volume")}: </span>
                                <span className='font-semibold'>{a.volume}</span>
                            </div>
                            <div className="flex justify-start items-center gap-2">
                                <span>{t("Giá")}(PNL): </span>
                                <span className='font-semibold'>{a.price}</span>
                            </div>
                            <div className="flex justify-start items-center gap-2">
                                <span>{t("Cắt lỗ")}(PNL): </span>
                                <span className='font-semibold'>{a.stop_loss}</span>
                            </div>
                            <div className="flex justify-start items-center gap-2">
                                <span>{t("Chốt lời")}(PNL): </span>
                                <span className='font-semibold'>{a.take_profit}</span>
                            </div>
                            <div className="w-full">
                                <div className="flex justify-between items-center">
                                    <span>{t("Thông tin chi tiết cặp tiền vào lệnh")}: </span>
                                    {colorbg(a.status).label !== "Đang chờ" && a.type === "RUNNING" && <TooltipNavigate handle={() => {
                                        setDataCurrent({ ...a, lot: idx + 1 })
                                        setOpen((prev) => !prev)
                                    }} className='shadow-sm w-[36px] h-[36px] p-0 flex justify-center items-center' iconName='icon-close-transaction' path='#' title='Đóng lệnh nhanh' />}
                                </div>
                                <div className="mt-2">
                                    <div className="flex justify-between items-center">
                                        <div className="border flex-1 border-gray-200">
                                            <div className="text-sm font-bold text-center border-b border-b-gray-200 p-1">{t("Tên cặp tiền")}</div>
                                            {a.bySymbol.map((d, idx) => <div key={idx} className="text-sm text-center font-semibold h-6">{d.symbol}</div>)}
                                        </div>
                                        <div className="border flex-1 border-gray-200">
                                            <div className="text-sm font-bold text-center border-b border-b-gray-200 p-1">{t("Trạng thái")}</div>
                                            {a.bySymbol.map((d, idx) => <div key={idx} className={`text-center h-6 text-[12px] font-bold flex justify-center items-center ${colorTextType(d.type)}`}>{d.type}</div>)}
                                        </div>
                                        <div className="border flex-1 border-gray-200">
                                            <div className="text-sm font-bold text-center border-b border-b-gray-200 p-1">{t("Giá vào lệnh")}</div>
                                            {a.bySymbol.map((d, idx) => <div key={idx} className="text-sm text-center h-6">{d.price_transaction}</div>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Modal open={open} setOpen={setOpen} dataCurrent={dataCurrent} setDataLost={setData} />
        </div>
    )
}

const TaskSquare = ({ query, idx, setDataLost }: { query: QueryLots, idx: number[], setDataLost: Dispatch<SetStateAction<IHistoryLot[]>> }) => {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [visible, setVisible] = useState(false); // để delay unmount
    const [data, setData] = useState<{ to: string | undefined, from: string | undefined }>({ to: "1", from: "1" })

    const handleToggle = () => {
        if (open) {
            // Đóng có delay để chạy animation
            setOpen(false);
            setTimeout(() => setVisible(false), 200); // khớp với duration
        } else {
            setVisible(true);
            setTimeout(() => setOpen(true), 10); // delay nhẹ để Tailwind áp transition
        }
    };

    const changeValue = (value: ChangeEvent<HTMLInputElement>, title: "to" | "from") => {
        const v = value.target.value
        if (title === "from") {
            return setData((prev) => ({ ...prev, from: Number(v) <= Number(data.to ?? query.total) ? (Number(v) < 0 ? Math.abs(Number(v)).toString() : v) : String(query.total) }))
        } else {
            return setData((prev) => ({ ...prev, to: Number(v) >= Number(query.total) ? String(query.total) : v }))
        }
    }

    return <div className="inline-block">
        {visible ?
            <div className={`ml-4 shadow-md rounded-md py-1 px-2 shadow-gray-300 flex justify-start items-center gap-2 transition-all duration-200 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'} pt-0`}>
                <span>{t("Chốt lệnh nhanh theo lô từ")}</span>
                <input type="number" onChange={(e) => changeValue(e, "from")} value={data.from} placeholder='1' className='w-16 text-center border border-[var(--color-background)] rounded-sm font-bold px-1 py-0.5 appearance-none focus:outline-none focus:ring-0 focus:border [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [MozAppearance:textfield]' />
                <span>{t("đến")}</span>
                <input type="number" onChange={(e) => changeValue(e, "to")} value={data.to} placeholder='2' className='w-16 text-center border border-[var(--color-background)] rounded-sm font-bold px-1 py-0.5 appearance-none focus:outline-none focus:ring-0 focus:border [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [MozAppearance:textfield]' />
                <Button onClick={handleToggle} className="ml-6 h-[30px] text-red-500 border p-0 px-2 cursor-pointer">{t("Hủy")}</Button>
                <Button onClick={() => setOpenModal((prev) => !prev)} className="h-[30px] text-white bg-[var(--color-background)] border p-0 px-2 cursor-pointer">{t("Xác nhận")}</Button>
            </div>
            :
            <TooltipNavigate handle={handleToggle} iconName='icon-task-square' path='#' title='Chốt lệnh nhanh' className='ml-2' />
        }

        <ModalTaskSquare open={openModal} setOpen={setOpenModal} data={data} idx={idx} setDataLost={setDataLost} />
    </div>
}

const ModalTaskSquare = ({ open, setOpen, data, idx, setDataLost }: { setDataLost: Dispatch<SetStateAction<IHistoryLot[]>>, idx: number[], open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, data: { to: string | undefined, from: string | undefined } }) => {
    const { t } = useTranslation()
    const [loading, setLoading] = useState<boolean>(false)

    const handleClick = async () => {
        setLoading(true)
        const start = Number(data.from);
        const end = Number(data.to);

        let body: IPostCloseOrder = {
            data: []
        }

        if (data.from === data.to) {
            body = { data: [{ id: idx[Number(data.to) - 1] }] }
        } else {
            const numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);
            const dataNew = numbers.map((i) => ({ id: idx[i - 1] }))
            body = { data: dataNew }
        }

        await postCloseOrder(body).then(() => {
            setOpen(false)
            setLoading(false)
            setDataLost((prev) => prev.map((a) => {
                const isCheck = body.data.find((i) => i.id === a.id)
                if (isCheck) {
                    return {
                        ...a,
                        type: "CLOSE"
                    }
                }
                return a
            }))
            toast.success(`${t("Đóng lệnh từ lô")} ${start} ${t("đến")} ${end} ${t('thành công')}!`)
        })
    }

    return <Dialog open={open} onClose={setOpen} className="relative z-100">
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
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                                <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-600" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                                    {
                                        data.from === data.to ?
                                            <>{t("Bạn xác nhận muốn đóng lệnh nhanh lô")} {data.from}</>
                                            :
                                            <>
                                                {t("Bạn xác nhận muốn đóng lệnh nhanh từ lô")} {data.from} {t("đến")} {data.to}
                                            </>
                                    }
                                </DialogTitle>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {t("Nếu bạn xác nhận đóng lệnh nhanh thì sẽ không thể nào mở lại được tại thời điểm này nữa. Bạn vẫn muốn xác nhận!")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <Button
                            isLoading={loading}
                            onClick={() => {
                                !loading && handleClick()
                            }}
                            type="button"
                            className="shadow-gray-400 cursor-pointer inline-flex w-full justify-center rounded-md bg-[var(--color-background)] px-3 py-2 text-sm font-semibold text-white shadow-md sm:ml-3 sm:w-auto"
                        >
                            {t("Xác nhận")}
                        </Button>
                        <Button
                            type="button"
                            data-autofocus
                            onClick={() => setOpen(false)}
                            className="shadow-gray-400 cursor-pointer mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-md inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        >
                            {t("Hủy")}
                        </Button>
                    </div>
                </DialogPanel>
            </div>
        </div>
    </Dialog>
}

const Modal = ({ open, setOpen, dataCurrent, setDataLost }: { setDataLost: Dispatch<SetStateAction<IHistoryLot[]>>, open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, dataCurrent: IActiveHistoryLot | null }) => {
    const { t } = useTranslation()
    const [loading, setLoading] = useState<boolean>(false)

    const handleClick = async () => {
        setLoading(true)
        await postCloseOrder({ data: [{ id: Number(dataCurrent?.id) }] }).then(() => {
            setOpen(false)
            setLoading(false)
            setDataLost((prev) => prev.map((a) => {
                if (a.id === dataCurrent?.id) {
                    return {
                        ...a,
                        type: "CLOSE"
                    }
                }
                return a
            }))
            toast.success(`${t("Đóng lệnh lô")} ${dataCurrent?.lot} ${t('thành công')}!`)
        })
    }

    return <Dialog open={open} onClose={setOpen} className="relative z-100">
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
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                                <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-600" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                                    {t("Bạn xác nhận muốn đóng lệnh của lô")} {dataCurrent?.lot} {t("dãy")} {dataCurrent?.bySymbol.map((a) => a.symbol + " ")}
                                </DialogTitle>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {t("Nếu bạn xác nhận đóng lệnh của các cặp tiền này thì sẽ không thể nào mở lại được tại thời điểm này nữa. Bạn vẫn muốn xác nhận chứ!")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <Button
                            isLoading={loading}
                            onClick={
                                () => {
                                    !loading && handleClick()
                                }
                            }
                            type="button"
                            className="shadow-gray-400 cursor-pointer inline-flex w-full justify-center rounded-md bg-[var(--color-background)] px-3 py-2 text-sm font-semibold text-white shadow-md sm:ml-3 sm:w-auto"
                        >
                            {t("Xác nhận")}
                        </Button>
                        <Button
                            type="button"
                            data-autofocus
                            onClick={() => setOpen(false)}
                            className="shadow-gray-400 cursor-pointer mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-md inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        >
                            {t("Hủy")}
                        </Button>
                    </div>
                </DialogPanel>
            </div>
        </div>
    </Dialog>
}