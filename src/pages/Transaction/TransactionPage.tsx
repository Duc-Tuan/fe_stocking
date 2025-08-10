import { useEffect, useRef, useState } from "react";
import Icon from "../../assets/icon";
import { Button } from "../../components/button";
import { dataActivateTypetransaction, type IActivateTypetransaction } from "./type";
import Volume from "./Volume";
import PopupAcc from "./PopupAcc";
import { useAppInfo } from "../../hooks/useAppInfo";

export default function TransactionPage() {
    const { currentPnl, serverMonitorActive } = useAppInfo();
    const [pnl, setPnl] = useState(19.56);
    const [stopLoss, setStopLoss] = useState(0);
    const [takeProfit, setTakeProfit] = useState(0);

    const [activateTypetransaction, setActivateTypetransaction] = useState<IActivateTypetransaction[]>(dataActivateTypetransaction)

    const handlClickActive = (data: string) => {
        const updated = activateTypetransaction.map((a: IActivateTypetransaction) => ({
            ...a,
            active: a.type === data,
        }));
        setActivateTypetransaction(updated)
    }

    return (
        <div className="flex justify-center items-center mt-20">
            <div className="w-full max-w-4xl p-4 space-y-4">
                {/* Header */}
                <div className="text-center shadow-xs shadow-gray-500 rounded-lg py-2 mb-4 text-sm">
                    <div className="font-bold">Cặp tiền của tài khoản theo dõi {serverMonitorActive?.value}</div>
                    <div className="text-gray-500">{serverMonitorActive?.label}</div>
                    <div className="text-red-600 mt-1 font-bold">{serverMonitorActive?.data?.map((a: string, i: number) => {
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
                                    className={`text-sm flex justify-between items-center text-gray-700 py-1 ${index !== 4 ? "border-b border-b-gray-300" : ""
                                        }`}
                                >
                                    <span className="font-bold">{item.symbol}</span>
                                    <span>{item.current_price.toFixed(6)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bảng Giá */}
                    <div className="col-span-2 shadow-xs shadow-gray-500 rounded-lg p-3 space-y-2">
                        {/* Nút +/- */}
                        <div className="flex justify-between text-blue-600 text-sm font-semibold mb-2 border-b border-b-gray-300 border-solid">
                            <Volume />
                        </div>

                        <div className="flex flex-col justify-between items-center w-full h-[calc(100%-40px)]">
                            <div className="w-full">
                                {activateTypetransaction.filter((a) => a.active && a.type === "Lenh_thi_truong").length === 0 &&
                                    <div className="text-sm flex justify-between py-2">
                                        <span className="font-bold text-md">Giá: (PNL)</span>
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
                                    <span className="font-bold text-md">Cắt lỗ: (PNL)</span>
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
                                    <span className="font-bold text-md">Chốt lời: (PNL)</span>
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
                                <span className="font-bold text-md">Hết hạn</span>
                                <span >GTC</span>
                            </div>
                        </div>
                    </div>

                    {/* Lệnh */}
                    <div className="col-span-1 shadow-xs shadow-gray-500 rounded-lg p-3 space-y-2">
                        {activateTypetransaction.map((a: IActivateTypetransaction, i: number) => {
                            return (
                                <Button onClick={() => handlClickActive(a.type)} key={i} className={`flex w-full justify-between items-center  ${i === 0 ? "rounded-none border-b border-b-gray-300 border-solid py-1 px-2" : "py-2 px-2"} cursor-pointer shadow-none hover:bg-rose-100 transition`}>
                                    <div className={`text-sm font-medium ${a.color}`}>{a.title}</div>
                                    {a.active && <span><Icon name="icon-check" width={18} height={18} className="text-rose-400" /></span>}
                                </Button>
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
                    <PopupAcc />
                </div>

                {/* Nút Xuôi / Ngược */}
                {activateTypetransaction.filter((a) => a.active && a.type === "Lenh_thi_truong").length === 0 ?
                    <Button className="w-full h-10 font-bold cursor-pointer text-white px-2 bg-rose-500 shadow-md shadow-gray-500">
                        <span>Đặt lệnh</span>
                    </Button>
                    :
                    <div className="flex gap-2 h-10">
                        <Button aria-current="page" className="flex-1 bg-rose-600 text-white rounded-lg shadow-xs shadow-gray-500  hover:bg-red-600 cursor-pointer font-bold">
                            Xuôi
                        </Button>
                        <Button aria-current="page" className="flex-1 bg-blue-600 text-white rounded-lg shadow-xs shadow-gray-500  hover:bg-blue-800 cursor-pointer font-bold">
                            Ngược
                        </Button>
                    </div>
                }
            </div>
        </div>
    )
}
