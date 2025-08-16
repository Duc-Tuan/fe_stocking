import type { IChartApi } from "lightweight-charts";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { symbolApi } from "../../api/symbol";
import { Button } from "../../components/button";
import { CandlestickSeriesComponent } from "../../components/candlestickSeries";
import type { IDataSymbols } from "../../components/candlestickSeries/options";
import { ChartComponent } from "../../components/line";
import { Loading } from "../../components/loading";
import TooltipCustom from "../../components/tooltip";
import { useAppInfo } from "../../hooks/useAppInfo";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useToggle } from "../../hooks/useToggle";
import type {
    IDataRequest,
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
import { useTranslation } from "react-i18next";
import { useCurrentPnl } from "../../hooks/useCurrentPnl";

export default function HomePage() {
    const { t } = useTranslation()
    const { serverMonitorActive } = useAppInfo()
    const { currentPnl } = useCurrentPnl()
    const chartRef1: any = useRef<IChartApi | null>(null);
    const chartRef2: any = useRef<IChartApi | null>(null);
    const [isOpen, toggleOpen] = useToggle(true);

    const [currentRange, setCurrentRange] = useState<string>('M1');

    const [symbols, setSymbols] = useState<IinitialData[]>([]);
    const [symbolsSocket, setSymbolsSocket] = useState<IinitialData[]>([]);

    const [symbolsCand, setSymbolsCand] = useState<IinitialDataCand[]>([]);
    const [symbolsCandSocket, setSymbolsCandSocket] = useState<IinitialDataCand[]>([]);

    const [activeTab, setActiveTab] = useState<IOptionsTabsCharts[]>(optionsTabsCharts);
    const [pagination, setPagination] = useState<IPagination>({
        limit: 5000,
        page: 1,
        total: 100,
        totalPage: 1,
        last_time: undefined,
        has_more: false
    });
    const [loading, setLoading] = useState<boolean>(false);

    const isFetchingRef = useRef(false);
    
    const serverId: number = useMemo(() => { return Number(serverMonitorActive?.value) }, [serverMonitorActive?.value])

    // Gọi api khi page thay đổi
    const getSymbolApi = async (idServer: number) => {
        try {
            const res: IDataRequest<IDataSymbols> = await symbolApi(
                { last_time: pagination.last_time, limit: pagination.limit },
                idServer
            );

            setPagination((prev) => ({
                ...prev,
                total: res.data.total,
                totalPage: Math.ceil(res.data.total / res.data.limit),
                last_time: res.data.next_cursor,
                has_more: res.data.has_more
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
                { last_time: undefined, limit: pagination.limit },
                serverId
            );

            setPagination((prev) => ({
                ...prev,
                total: res.data.total,
                totalPage: Math.ceil(res.data.total / res.data.limit),
                has_more: res.data.has_more,
                last_time: res.data.next_cursor,
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
        if (currentPnl) {
            setSymbolsSocket(convertDataLine([currentPnl]))
            setSymbolsCandSocket(convertDataCandline([currentPnl]))
        }
    }, [currentPnl]);

    useEffect(() => {
        let ignore = false;

    if (serverMonitorActive?.value && !pagination.has_more && !isFetchingRef.current) {
        (async () => {
            isFetchingRef.current = true; // đánh dấu đang gọi API
            try {
                if (!ignore) {
                    await getSymbolApi(Number(serverMonitorActive?.value));
                }
            } finally {
                isFetchingRef.current = false; // gọi xong thì reset lại
            }
        })();
    }

    return () => { ignore = true };
    }, [pagination.page]);

    useEffect(() => {
        if (serverId) {
            setPagination((prev) => ({ ...prev, last_time: undefined }));
            setSymbols([]);
            setSymbolsCand([]);
            getSymbolApiServerId(serverId);
        }
    }, [serverId]);

    const handleClick = (selected: IOptionsTabsCharts) => {
        const updated = activeTab.map((tab) => ({
            ...tab,
            active: tab.tabsName === selected.tabsName,
        }));
        setActiveTab(updated);
    };

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

    return (
        <div className="text-center">
            <div className="flex flex-wrap justify-between">
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400 gap-2">
                        {activeTab.map((item) => (
                            <React.Fragment key={item.tabsName}>
                                <TooltipCustom isButton titleTooltip={item.tabsName}>
                                    <Button
                                        disabled={loading}
                                        onClick={() => handleClick(item)}
                                        isLoading={loading}
                                        className={`inline-block p-1 px-2 rounded-lg ${item.active
                                            ? "text-[var(--color-text)] bg-[var(--color-background)] active"
                                            : "bg-gray-200 text-black hover:text-[var(--color-text)] hover:bg-[var(--color-background-opacity-5)] border border-rose-100 dark:hover:border-rose-200"
                                            } cursor-pointer`}
                                        aria-current="page"
                                    >
                                        {item.icon}
                                    </Button>
                                </TooltipCustom>
                            </React.Fragment>
                        ))}

                        <Filter handleClick={handleRangeChange} currentRange={currentRange} />
                    </div>

                    {
                        activeTab.filter((item: IOptionsTabsCharts) => item?.active)[0]?.tabsName === "Biểu đồ nến" && (
                            <button className="flex items-center me-4 cursor-pointer" onClick={toggleOpen}>
                                <input checked={isOpen} readOnly type="checkbox" value="" className="custom-checkbox cursor-pointer appearance-none bg-gray-100 checked:bg-[var(--color-background)] w-4 h-4 rounded-sm dark:bg-white border border-[var(--color-background)] ring-offset-[var(--color-background)]" />
                                <label htmlFor="green-checkbox" className="cursor-pointer ms-2 text-sm font-medium text-gray-900 dark:text-gray-900">{t("Đường trung bình")}</label>
                            </button>
                        )
                    }


                </div>
            </div>

            <div className="mt-5 p-2 border border-gray-200  overflow-hidden rounded-lg shadow-xl">
                {activeTab.map((item) => (
                    <React.Fragment key={item.tabsName}>
                        {item.active && (
                            loading ? <Loading /> :
                                item.tabsName === "Biểu đồ đường" ? chartMemo : candlestickMemo
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

const Filter = ({ handleClick, currentRange }: any) => {
    const popupRef: any = useRef(null);
    const [open, setOpen] = useState(false);
    const [visible, setVisible] = useState(false); // để delay unmount
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
    useClickOutside(popupRef, () => {
        setOpen(false);
        setTimeout(() => setVisible(false), 200);
    }, visible);
    return (
        <div ref={popupRef} className="z-10 relative">
            <Button
                onClick={handleToggle}
                className={`inline-block p-1 px-2 rounded-lg w-[44px] h-[44px] active cursor-pointer font-semibold shadow-xs shadow-gray-500 text-[var(--color-text)] bg-[var(--color-background)]`}
            >
                <div>{timeOptions.find((a) => a.label === currentRange)?.label}</div>
            </Button>

            {visible && (
                <div className={`grid grid-cols-5 sm:grid-cols-11 gap-2 w-[300px] sm:w-[600px] transition-all duration-200 absolute -top-3 -left-27 mt-2 bg-white shadow-sm shadow-gray-300 rounded-lg border border-gray-200 p-2 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                    {timeOptions.map((opt: any) => (
                        <Button
                            key={opt.label}
                            onClick={() => {
                                handleToggle()
                                handleClick(opt.seconds, opt.label)
                            }
                            }
                            className={`h-[42px] w-[46px] rounded-lg ${currentRange === opt.label
                                ? "text-[var(--color-text)] bg-[var(--color-background)] active"
                                : "bg-gray-200 text-black hover:bg-[var(--color-background-opacity-2)] hover:text-[var(--color-background)] border border-rose-100 dark:hover:border-rose-200"
                                } cursor-pointer font-semibold`}
                        >
                            <div>{opt.label}</div>
                        </Button>
                    ))}
                </div>
            )}
        </div>
    )
}