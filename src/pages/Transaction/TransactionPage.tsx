import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { postSendOrder } from "../../api/historys";
import Icon from "../../assets/icon";
import { Button } from "../../components/button";
import TooltipCustom from "../../components/tooltip";
import { useAppInfo } from "../../hooks/useAppInfo";
import { useCurrentPnl } from "../../hooks/useCurrentPnl";
import PopupAcc from "./PopupAcc";
import { dataActivateTypetransaction, type IActivateTypetransaction, type IOrderTransaction } from "./type";
import Volume from "./Volume";

const init: IOrderTransaction = {
    account_monitor_id: undefined,
    account_transaction_id: undefined,
    by_symbol: undefined,
    price: undefined,
    status: 'Lenh_thi_truong',
    status_sl_tp: undefined,
    stop_loss: undefined,
    take_profit: undefined,
    type: "RUNNING",
    volume: undefined
}

export default function TransactionPage() {
    const { serverMonitorActive } = useAppInfo();
    const { t } = useTranslation()
    const { currentPnl } = useCurrentPnl()
    const [open, setOpen] = useState(false)
    const [pnl, setPnl] = useState(19.56);
    const [stopLoss, setStopLoss] = useState(0);
    const [takeProfit, setTakeProfit] = useState(0);
    const [data, setData] = useState<IOrderTransaction | undefined>(init)
    const [mess, setMess] = useState<string>('')

    const [activateTypetransaction, setActivateTypetransaction] = useState<IActivateTypetransaction[]>(dataActivateTypetransaction)

    const handlClickActive = (datas: string) => {
        const updated = activateTypetransaction.map((a: IActivateTypetransaction) => ({
            ...a,
            active: a.type === datas,
        }));

        let statuss: "Nguoc" | "Xuoi" = 'Xuoi'
        switch (updated.find((a) => a.active)?.type) {
            case "Nguoc_Limit":
            case "Nguoc_Stop":
                statuss = 'Nguoc'
                break;
            case "Xuoi_Limit":
            case "Xuoi_Stop":
                statuss = 'Xuoi'
                break;
            default:
                statuss = 'Xuoi'
        }

        setData((prev) => ({ ...prev, status: updated.find((a) => a.active)?.type, status_sl_tp: statuss }))
        setActivateTypetransaction(updated)
    }

    useEffect(() => {
        setData((prev) => (
            {
                ...prev,
                account_monitor_id: Number(serverMonitorActive?.value),
                price: pnl,
                stop_loss: stopLoss,
                take_profit: takeProfit
            }
        ))
    }, [serverMonitorActive, pnl, stopLoss, takeProfit])

    const handleSendOrder = (type?: "Xuoi" | "Nguoc") => {
        let by_symbols: any = currentPnl?.by_symbol?.map((a) => ({ ...a, type: a.type.toUpperCase() }))
        if (type === "Nguoc" || data?.status_sl_tp === "Nguoc") {
            by_symbols = currentPnl?.by_symbol?.map((a) => ({ ...a, type: a.type.toUpperCase() === "BUY" ? "SELL" : "BUY" }))
        }

        setData((prev) => ({ ...prev, status_sl_tp: type ? type : data?.status_sl_tp, by_symbol: by_symbols }))

        if (data?.account_transaction_id === undefined) {
            setMess("Vui lòng chọn tài khoản giao dịch trước khi đặt lệnh!")
            setTimeout(() => setMess(''), 3000)
        } else {
            setOpen(true)
        }
    }

    const isCheckSumbit = useMemo(() => {
        if (data?.status === "Xuoi_Limit" || data?.status === "Nguoc_Stop") {
            const isPrice = pnl <= (currentPnl?.total_pnl ?? 0)
            return isPrice && (pnl ?? 0) < stopLoss && ((pnl ?? 0) > takeProfit)
        } else if (data?.status === "Nguoc_Limit" || data?.status === "Xuoi_Stop") {
            const isPrice = pnl >= (currentPnl?.total_pnl ?? 0)
            return isPrice && (pnl ?? 0) > stopLoss && ((pnl ?? 0) < takeProfit)
        }
    }, [data?.status_sl_tp, stopLoss, pnl, takeProfit])

    return (
        <div className="flex justify-center items-center mt-20">
            <div className="w-full max-w-4xl p-4 space-y-4">
                {/* Header */}
                <div className="text-center shadow-xs shadow-gray-500 rounded-lg py-2 mb-4 text-sm">
                    <div className="font-bold">{t("Cặp tiền của tài khoản theo dõi")} {serverMonitorActive?.value}</div>
                    <div className="text-gray-500">{serverMonitorActive?.label}</div>
                    <div className="text-[var(--color-background)] mt-1 font-bold">{serverMonitorActive?.data?.map((a: string, i: number) => {
                        return a + ((i !== (serverMonitorActive?.data.length - 1)) ? " - " : "")
                    })}</div>
                </div>

                {/* Giá và Lệnh */}
                <div className="grid grid-cols-4 gap-1">
                    <div className="col-span-1 shadow-xs shadow-gray-500 rounded-lg p-3 h-full">
                        <div className="flex flex-col justify-between h-full">
                            {currentPnl?.by_symbol.map((item, index) => (
                                <div
                                    key={index}
                                    className={`text-sm flex justify-between items-center text-gray-700 py-1 border-b border-b-gray-300 border-solid}`}
                                >
                                    <span className="font-bold">
                                        {item.symbol}
                                        <span className={`text-[10px] pl-1 ${item.type === "SELL" ? "text-rose-600" : "text-blue-600"}`}>{item.type}</span>
                                    </span>
                                    <span>{item.current_price?.toFixed(6)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bảng Giá */}
                    <div className="col-span-2 shadow-xs shadow-gray-500 rounded-lg p-3 space-y-2">
                        {/* Nút +/- */}
                        <div className="flex justify-between text-blue-600 text-sm font-semibold mb-2 border-b border-b-gray-300 border-solid">
                            <Volume setData={setData} />
                        </div>

                        <div className="flex flex-col justify-between items-center w-full h-[calc(100%-40px)]">
                            <div className="w-full">
                                {activateTypetransaction.filter((a) => a.active && a.type === "Lenh_thi_truong").length === 0 &&
                                    <div className="text-sm flex justify-between py-2">
                                        <span className="font-bold text-md">{t("Giá")}: (PNL)</span>
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => setPnl((prev) => prev - 1)}
                                                className="px-3 pb-1 rounded hover:bg-gray-300 text-xl"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                value={pnl}
                                                onChange={(e) => setPnl(Number(e.target.value))}
                                                className="w-20 text-center font-bold px-1 py-0.5 appearance-none focus:outline-none focus:ring-0 focus:border-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [MozAppearance:textfield]"
                                            />
                                            <button
                                                onClick={() => setPnl((prev) => prev + 1)}
                                                className="px-3 pb-1 rounded hover:bg-gray-300 text-xl"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                }
                                <div className="text-sm flex justify-between items-center pb-2">
                                    <span className="font-bold text-md">{t("Cắt lỗ")}: (PNL)</span>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => setStopLoss((prev) => prev - 1)}
                                            className="px-3 pb-1 rounded hover:bg-gray-300 text-xl"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={stopLoss}
                                            onChange={(e) => setStopLoss(Number(e.target.value))}
                                            className="w-20 text-center font-bold px-1 py-0.5 appearance-none focus:outline-none focus:ring-0 focus:border-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [MozAppearance:textfield]"
                                        />
                                        <button
                                            onClick={() => setStopLoss((prev) => prev + 1)}
                                            className="px-3 pb-1 rounded hover:bg-gray-300 text-xl"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div className="text-sm flex justify-between items-center pb-2">
                                    <span className="font-bold text-md">{t("Chốt lời")}: (PNL)</span>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => setTakeProfit((prev) => prev - 1)}
                                            className="px-3 pb-1 rounded hover:bg-gray-300 text-xl"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min={0}
                                            value={takeProfit}
                                            onChange={(e) => setTakeProfit(Number(e.target.value))}
                                            className="w-20 text-center font-bold px-1 py-0.5 appearance-none focus:outline-none focus:ring-0 focus:border-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [MozAppearance:textfield]"
                                        />
                                        <button
                                            onClick={() => setTakeProfit((prev) => prev + 1)}
                                            className="px-3 pb-1 rounded hover:bg-gray-300 text-xl"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full text-sm flex justify-between items-center border-t border-t-gray-300 border-solid pt-2">
                                <span className="font-bold text-md">{t("Hết hạn")}</span>
                                <span >GTC</span>
                            </div>
                        </div>
                    </div>

                    {/* Lệnh */}
                    <div className="col-span-1 shadow-xs shadow-gray-500 rounded-lg p-3 space-y-2">
                        {activateTypetransaction.map((a: IActivateTypetransaction, i: number) => {
                            return (
                                <React.Fragment key={i}>
                                    <TooltipCustom isButton titleTooltip={<p style={{ whiteSpace: "pre-line" }}>{a.subTitle}</p>} placement="right-end">
                                        <Button onClick={() => handlClickActive(a.type)} className={`flex w-full justify-between items-center  ${i === 0 ? "rounded-none border-b border-b-gray-300 border-solid py-1 px-2" : "py-2 px-2"} cursor-pointer shadow-none hover:bg-[var(--color-background-opacity-2)] transition`}>
                                            <div className={`text-sm font-bold ${a.color}`}>{t(a.title)}</div>
                                            {a.active && <span><Icon name="icon-check" width={18} height={18} className="text-[var(--color-background)]" /></span>}
                                        </Button>
                                    </TooltipCustom>
                                </React.Fragment>
                            )
                        })}
                    </div>
                </div>

                {/* Dòng dưới cùng */}
                <div className="grid grid-cols-3 gap-2 items-center">
                    <div className="col-span-1 flex items-center rounded-md p-2 text-sm shadow-xs shadow-gray-500">
                        <div className="flex justify-between items-center w-full font-bold">
                            <span>
                                PNL:
                            </span>
                            <span className="text-lg">{currentPnl?.total_pnl}</span>
                        </div>
                    </div>
                    <PopupAcc setDataSubmit={setData} />
                </div>

                {/* Nút Xuôi / Ngược */}
                {activateTypetransaction.filter((a) => a.active && a.type === "Lenh_thi_truong").length === 0 ?
                    <Button onClick={() => {
                        isCheckSumbit && handleSendOrder()
                    }} className={`${isCheckSumbit ? "bg-[var(--color-background)]" : "bg-gray-300"} p-0 w-full h-10 font-bold cursor-pointer text-white px-2 shadow-md shadow-gray-500`}>
                        <span>{t("Đặt lệnh")}</span>
                    </Button>
                    :
                    <div className="flex gap-2 h-10">
                        <Button onClick={() => {
                            ((currentPnl?.total_pnl ?? 0) > stopLoss && ((currentPnl?.total_pnl ?? 0) < takeProfit)) && handleSendOrder("Xuoi")
                        }} aria-current="page" className={`${((currentPnl?.total_pnl ?? 0) > stopLoss && ((currentPnl?.total_pnl ?? 0) < takeProfit)) ? "bg-rose-600 hover:bg-red-600" : "bg-gray-300"} p-0 flex-1  text-white rounded-lg shadow-xs shadow-gray-500  cursor-pointer font-bold`}>
                            {t("Xuôi")}
                        </Button>
                        <Button onClick={() => {
                            ((currentPnl?.total_pnl ?? 0) < stopLoss && ((currentPnl?.total_pnl ?? 0) > takeProfit)) && handleSendOrder("Nguoc")
                        }} aria-current="page" className={`${((currentPnl?.total_pnl ?? 0) < stopLoss && ((currentPnl?.total_pnl ?? 0) > takeProfit)) ? "bg-blue-600 hover:bg-blue-800" : "bg-gray-300"} p-0 flex-1 text-white rounded-lg shadow-xs shadow-gray-500 cursor-pointer font-bold`}>
                            {t("Ngược")}
                        </Button>
                    </div>
                }

                <div className="text-red-600 text-center font-semibold text-md">{t(mess)}</div>
            </div>

            <Modal open={open} setOpen={setOpen} dataCurrent={data} />
        </div>
    )
}

const Modal = ({ open, setOpen, dataCurrent }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, dataCurrent?: IOrderTransaction }) => {
    const { t } = useTranslation()
    const [loading, setLoading] = useState<boolean>(false)

    const handleClick = async () => {
        setLoading(true)
        await postSendOrder(dataCurrent).then((data) => {
            setLoading(false)
            const isError = data.data.message && data.data.message.find((a: any) => a.status === "error")
            if (isError) {
                const mess = (data.data.message.map((a: any) => a.symbol)).map((s: any) => s.trim()).join(", ")
                return toast.error(`Vào lệnh ${mess} thất bại / ${isError.message}`)
            }
            setOpen(false)
            toast.success("Vào lệnh thành công!")
        }).catch(() => setLoading(false))
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
                                    {t("Bạn xác nhận muốn vào lệnh bằng thông tin dưới đây")}
                                </DialogTitle>
                                <div className="mt-2 grid grid-cols-2">
                                    <div className="flex col-span-1">
                                        <span>{t("Tk theo dõi")}:</span>
                                        <span className="ml-1 font-semibold text-[var(--color-background)]">{dataCurrent?.account_monitor_id}</span>
                                    </div>
                                    <div className="flex col-span-1">
                                        <span>{t("Tk giao dịch")}:</span>
                                        <span className="ml-1 font-semibold text-[var(--color-background)]">{dataCurrent?.account_transaction_id}</span>
                                    </div>
                                    <div className="flex col-span-2">
                                        <span>{t("Trạng thái")}:</span>
                                        <span className="ml-1 font-semibold text-[var(--color-background)]">{t(String(dataActivateTypetransaction.find((a) => a.type === dataCurrent?.status)?.title))}</span>
                                    </div>
                                    <div className="flex col-span-1">
                                        <span>{t("Giá")}:</span>
                                        <span className="ml-1 font-semibold text-[var(--color-background)]">{dataCurrent?.price}</span>
                                    </div>
                                    <div className="flex col-span-1">
                                        <span>{t("Volume")}:</span>
                                        <span className="ml-1 font-semibold text-[var(--color-background)]">{dataCurrent?.volume}</span>
                                    </div>
                                    <div className="flex col-span-1">
                                        <span>SL:</span>
                                        <span className="ml-1 font-semibold text-[var(--color-background)]">{dataCurrent?.stop_loss}</span>
                                    </div>
                                    <div className="flex col-span-1">
                                        <span>TP:</span>
                                        <span className="ml-1 font-semibold text-[var(--color-background)]">{dataCurrent?.take_profit}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span>{t("Thông tin chi tiết cặp tiền vào lệnh")}:</span>
                                        <div className="mt-2">
                                            <div className="flex justify-between items-center">
                                                <div className="border flex-2 border-gray-200">
                                                    <div className="text-sm font-bold text-center border-b border-b-gray-200 p-1">{t("Tên cặp tiền")}</div>
                                                    {dataCurrent?.by_symbol?.map((d, idx) => <div key={idx} className="text-sm text-center font-semibold h-6">{d.symbol}</div>)}
                                                </div>
                                                <div className="border flex-1 border-gray-200">
                                                    <div className="text-sm font-bold text-center border-b border-b-gray-200 p-1">{t("Trạng thái")}</div>
                                                    {dataCurrent?.by_symbol?.map((d, idx) => <div key={idx} className={`text-center h-6 text-[12px] font-bold flex justify-center items-center ${d.type === "SELL" ? "text-red-500" : "text-blue-500"}`}>{d.type}</div>)}
                                                </div>
                                                <div className="border flex-1 border-gray-200">
                                                    <div className="text-sm font-bold text-center border-b border-b-gray-200 p-1">{t("Giá vào lệnh")}</div>
                                                    {dataCurrent?.by_symbol?.map((d, idx) => <div key={idx} className="text-sm text-center h-6">{d.current_price?.toFixed(5)}</div>)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
