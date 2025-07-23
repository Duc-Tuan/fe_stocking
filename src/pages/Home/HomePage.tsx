import { Tooltip } from "@material-tailwind/react";
import type { IChartApi } from "lightweight-charts";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { downloadFileExApi } from "../../api/downloadFile";
import { serverSymbolApi } from "../../api/serverSymbol";
import { symbolApi } from "../../api/symbol";
import Icon from "../../assets/icon";
import { Button } from "../../components/button";
import { CandlestickSeriesComponent } from "../../components/candlestickSeries";
import { ChartComponent } from "../../components/line";
import { Loading } from "../../components/loading";
import { LoadingOnly } from "../../components/loading/indexOnly";
import Tabs from "../../components/tabs";
import { useToggle } from "../../hooks/useToggle";
import { useSocket } from "../../hooks/useWebSocket";
import type {
    IDataRequest,
    IOptions,
    IOptionsTabsCharts,
    IPagination,
} from "../../types/global";
import { handleTimeRangeChange } from "../../utils/timeRange";
import {
    convertDataCandline,
    convertDataLine,
    optionsTabsCharts,
    timeOptions,
    type IinitialData,
    type IinitialDataCand,
} from "./options";
import toast from "react-hot-toast";
import type { IDataSymbols } from "../../components/candlestickSeries/options";
import PopupLoginMt5, { type ILoginMt5 } from "./PopupLoginMt5";

export default function HomePage() {
    const chartRef1: any = useRef<IChartApi | null>(null);
    const chartRef2: any = useRef<IChartApi | null>(null);
    const navigate = useNavigate();
    const [isOpen, toggleOpen, setOpen] = useToggle(true);
    const [openPopup, setOpenPopup] = useState<boolean>(false);

    const [currentRange, setCurrentRange] = useState<string>('1 phút');
    const [loadingDownload, setLoadingDownload] = useState<boolean>(false);
    const [dataServer, setDataServer] = useState<IOptions[]>([]);

    const [symbols, setSymbols] = useState<IinitialData[]>([]);
    const [symbolsSocket, setSymbolsSocket] = useState<IinitialData[]>([]);

    const [symbolsCand, setSymbolsCand] = useState<IinitialDataCand[]>([]);
    const [symbolsCandSocket, setSymbolsCandSocket] = useState<IinitialDataCand[]>([]);

    const [activeTab, setActiveTab] = useState<IOptionsTabsCharts[]>(optionsTabsCharts);
    const [pagination, setPagination] = useState<IPagination>({
        limit: 5000,
        page: 1,
        total: 100,
        totalPage: 1
    });
    const [loading, setLoading] = useState<boolean>(false);

    const currentServer = dataServer.find((i) => i.active);
    const serverId = Number(currentServer?.value);
    const prevServerId = useRef<number | null>(null); // ✅ Tránh gọi lại khi không cần

    const { data } = useSocket(
        import.meta.env.VITE_URL_API,
        "chat_message",
        serverId
    );

    const getDataServer = async () => {
        try {
            const data = await serverSymbolApi();
            const dataNew = data.map((a: any, i: number) => ({
                value: a.username,
                label: a.server,
                active: i === 0,
                data: JSON.parse(a.by_symbol)
            }));
            setDataServer(dataNew);
        } catch (error) {
            return navigate("/login")
        }

    };

    // Gọi api khi page thay đổi
    const getSymbolApi = async (idServer: number) => {
        try {
            const res: IDataRequest<IDataSymbols> = await symbolApi(
                { page: pagination.page, limit: pagination.limit },
                idServer
            );
            setPagination((prev) => ({
                ...prev,
                total: res.data.total,
                totalPage: Math.ceil(res.data.total / res.data.limit),
            }));

            const dataNew = convertDataLine(res.data.data);

            setSymbols((prev) => [...dataNew, ...prev])
            setSymbolsCand((prev) => [...convertDataCandline(res.data.data), ...prev])
        } catch (err) {
            console.error("Failed to fetch symbols:", err);
        }
    };

    // gọi api khi serverId đổi
    const getSymbolApiServerId = async (serverId: number) => {
        setLoading(true);
        try {

            const res: IDataRequest<IDataSymbols> = await symbolApi(
                { page: 1, limit: pagination.limit },
                serverId
            );
            setPagination((prev) => ({
                ...prev,
                total: res.data.total,
                totalPage: Math.ceil(res.data.total / res.data.limit),
            }));

            setSymbolsCand(convertDataCandline(res.data.data));
            setSymbols(convertDataLine(res.data.data));
        } catch (error) {
            console.error("Failed to fetch symbols:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (data) {
            setSymbolsSocket(convertDataLine([data]))
            setSymbolsCandSocket(convertDataCandline([data]))
        }
    }, [data]);

    useEffect(() => {
        if (pagination.page !== 1 && serverId) {
            getSymbolApi(serverId);
        }
    }, [pagination.page]);

    useEffect(() => {
        if (serverId && prevServerId.current !== serverId) {
            prevServerId.current = serverId;
            setPagination((prev) => ({ ...prev, page: 1 }));
            setSymbols([]);
            setSymbolsCand([]);
            getSymbolApiServerId(serverId);
        }
    }, [serverId]);

    useEffect(() => {
        getDataServer();
    }, []);

    const handleClick = (selected: IOptionsTabsCharts) => {
        const updated = activeTab.map((tab) => ({
            ...tab,
            active: tab.tabsName === selected.tabsName,
        }));
        setActiveTab(updated);
    };

    const handleClickServer = (selected: IOptions) => {
        const updated = dataServer.map((s) => ({
            ...s,
            active: s.value === selected.value,
        }));
        setDataServer(updated);
    };

    // ✅ Ghi nhớ component để tránh render lại
    const chartMemo = useMemo(() => (
        <ChartComponent
            dataOld={symbols}
            setPagination={setPagination}
            chartRef={chartRef1}
            latestData={symbolsSocket}
        />
    ), [symbols, pagination, symbolsSocket]);

    const candlestickMemo = useMemo(() => (
        <CandlestickSeriesComponent
            dataOld={symbolsCand}
            setPagination={setPagination}
            chartRef={chartRef2}
            latestData={symbolsCandSocket}
            isOpen={isOpen}
            currentRange={currentRange}
        />
    ), [symbolsCand, pagination, symbolsCandSocket, isOpen, currentRange]);

    const handleRangeChange = (seconds: number | null, label: string) => {
        if (chartRef1.current) {
            handleTimeRangeChange(chartRef1, symbols, seconds, "line");
        }
        if (chartRef2.current) {
            handleTimeRangeChange(chartRef2, symbolsCand, seconds);
        }
        setCurrentRange(label);
    };

    const handleClickDownload = async () => {
        if (!loadingDownload) {
            try {
                setLoadingDownload(true)
                await downloadFileExApi()
                return toast.success('Tải file xuống thành công!');
            } catch (error) {
                return toast.error('Tải file xuống thất bại!');
            } finally {
                setLoadingDownload(false)
            }
        }
    }

    const handleSubmitLogin = (data: ILoginMt5) => {
        setDataServer((prev: IOptions[]) => ([...prev, { label: data.server, value: data.username, active: false }]))
        setOpenPopup(false)
    }

    return (
        <div className="text-center">
            <div className="flex flex-wrap justify-between">
                <div className="flex flex-wrap gap-10">
                    <div className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400 gap-1">
                        {activeTab.map((item) => (
                            <Tooltip
                                key={item.tabsName}
                                content={
                                    <div className="dark:text-white dark:bg-rose-400 rounded-lg py-1 px-2">
                                        {item.tabsName}
                                    </div>
                                }
                            >
                                <Button
                                    disabled={loading}
                                    onClick={() => handleClick(item)}
                                    isLoading={loading}
                                    className={`inline-block p-1 px-2 rounded-lg ${item.active
                                        ? "text-white bg-rose-400 active"
                                        : "bg-gray-200 text-black hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-rose-200 dark:hover:text-rose-900 border border-rose-100 dark:hover:border-rose-200"
                                        } cursor-pointer`}
                                    aria-current="page"
                                >
                                    {item.icon}
                                </Button>
                            </Tooltip>
                        ))}
                    </div>
                    <Tabs handleClick={handleClickServer} options={dataServer} isLoading={loading}>
                        <div></div>
                    </Tabs>

                    {
                        activeTab.filter((item: IOptionsTabsCharts) => item?.active)[0]?.tabsName === "Biểu đồ nến" && (
                            <button className="flex items-center me-4 cursor-pointer" onClick={toggleOpen}>
                                <input checked={isOpen} type="checkbox" value="" className="custom-checkbox cursor-pointer appearance-none bg-gray-100 border-black checked:bg-rose-500 w-4 h-4 rounded-sm focus:ring-rose-400 dark:focus:ring-rose-400 focus:ring-2 dark:bg-white border dark:border-rose-400 dark:ring-offset-rose-400" />
                                <label htmlFor="green-checkbox" className="cursor-pointer ms-2 text-sm font-medium text-gray-900 dark:text-gray-900">Đường trung bình</label>
                            </button>
                        )
                    }

                </div>

                <div className="flex flex-wrap gap-2">
                    <div className="flex gap-2 cursor-pointer justify-around items-center p-1 px-2 rounded-lg text-white bg-rose-400 active hover:bg-rose-600 hover:font-medium" onClick={handleClickDownload}>
                        {loadingDownload ? <div className="px-2"><LoadingOnly /></div> : <><Icon name="icon-export" className="text-white w-[18px] h-[18px] " />
                            <span>Xuất file</span></>}


                    </div>

                    <Button className="flex gap-2 cursor-pointer justify-around items-center p-1 px-2 rounded-lg text-white bg-rose-400 active hover:bg-rose-600" onClick={() => setOpenPopup((prev) => !prev)}>
                        Theo dõi thêm tài khoản
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
                {timeOptions.map((opt: any) => (
                    <Button
                        key={opt.label}
                        onClick={() =>
                            handleRangeChange(opt.seconds, opt.label)
                        }
                        className={`inline-block p-[10px] rounded-lg ${currentRange === opt.label
                            ? "text-white bg-rose-400 active"
                            : "bg-gray-200 text-black hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-rose-200 dark:hover:text-rose-900 border border-rose-100 dark:hover:border-rose-200"
                            } cursor-pointer font-normal`}
                    >
                        <div>{opt.label}</div>
                    </Button>
                ))}
            </div>

            <div className="mt-5">
                {activeTab.map((item) => (
                    <React.Fragment key={item.tabsName}>
                        {item.active && (
                            loading ? <Loading /> :
                                item.tabsName === "Biểu đồ đường" ? chartMemo : candlestickMemo
                        )}
                    </React.Fragment>
                ))}
            </div>


            <PopupLoginMt5 open={openPopup} setOpen={setOpenPopup} handle={handleSubmitLogin} />
        </div>
    );
}
