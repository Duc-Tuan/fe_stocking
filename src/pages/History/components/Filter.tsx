import React, { useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { dataAccTransactionAllLot, dataStatusAllLot, dataStatusSymbol, dataType, type IFilterAllLot } from '../type';
import { useTranslation } from 'react-i18next';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { Button } from '../../../components/button';
import Icon from '../../../assets/icon';
import type dayjs from 'dayjs';
import RangePickerCustom from '../../../components/rangePicker';
import type { Dayjs } from 'dayjs';
import TooltipNavigate from '../../../layouts/TooltipNavigate';
import type { Func, QueryLots } from '../../../types/global';
import { useAppInfo } from '../../../hooks/useAppInfo';

const initFilter: IFilterAllLot = {
    accTransaction: null,
    status: null,
    type: undefined,
    toFrom: [undefined, undefined]
}

interface IProps {
    setFilter: Dispatch<SetStateAction<IFilterAllLot>>,
    filter: IFilterAllLot,
    subButton?: any,
    isStatus?: boolean,
    isStatusSymbol?: boolean,
    isType?: boolean,
    query?: QueryLots,
    setQuery?: Dispatch<SetStateAction<QueryLots>>,
    handleFilter?: Func<IFilterAllLot>
}

export default function Filter({ setFilter, filter, subButton, isStatus, isStatusSymbol, query, setQuery, handleFilter, isType }: IProps) {
    const { t } = useTranslation()
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

    return (
        <div className="sticky top-0 flex justify-between items-center bg-white shadow-lg shadow-gray-100 z-50">
            <div ref={popupRef} className="w-fit z-10 col-span-2 font-semibold rounded-md text-sm p-2">
                <div className="flex justify-start items-center">
                    <TooltipNavigate handle={handleToggle} iconName='icon-filter' path='#' title='Bộ lọc' />
                    {subButton}
                </div>

                {visible && (
                    <div className={`flex flex-col justify-between items-center h-60 transition-all duration-200 absolute top-full bg-white shadow-lg shadow-gray-300 rounded-lg border border-gray-300 p-2 ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} pt-0`}>
                        <div className="grid grid-cols-2">
                            {!isStatus &&
                                <FilterStatus setFilter={setFilter} filter={filter} />
                            }
                            {isStatusSymbol &&
                                <FilterStatusSymbol setFilter={setFilter} filter={filter} />
                            }
                            {isType &&
                                <FilterType setFilter={setFilter} filter={filter} />
                            }
                            <FilterAccTransaction setFilter={setFilter} filter={filter} />
                            <FilterTime setFilter={setFilter} filter={filter} />
                        </div>

                        <div className="flex justify-end items-center gap-2 w-full">
                            <Button onClick={handleToggle} className="cursor-pointer text-[var(--color-background)] px-3 py-2 border border-gray-300 border-solid shadow-md shadow-gray-300">{t("Hủy")}</Button>
                            <Button onClick={() => setFilter(initFilter)} className="cursor-pointer bg-[var(--color-background)] px-3 py-2 shadow-md shadow-gray-300">{t("Làm mới")}</Button>
                            <Button onClick={() => {
                                handleFilter && handleFilter(filter)
                                handleToggle()
                            }} className="cursor-pointer bg-[var(--color-background)] px-3 py-2 shadow-md shadow-gray-300">{t("Lọc")}</Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center gap-4 mr-2">
                <TooltipNavigate disabled={query?.page === 1} handle={() => { setQuery && setQuery((prev) => ({ ...prev, page: query?.page === 1 ? 1 : prev.page - 1 })) }} iconName='icon-left' path='#' title='Trang trước' className="w-[36px] h-[36px] p-0 flex justify-center items-center" />
                <div className="flex justify-between items-center gap-1">
                    <div className="w-[36px] h-[36px] shadow-md shadow-gray-500 flex justify-center items-center rounded-lg">{query?.page}</div>
                    <div className="">/</div>
                    <div className="w-[36px] h-[36px] shadow-md shadow-gray-500 flex justify-center items-center rounded-lg">{query?.totalPage}</div>
                </div>
                <TooltipNavigate disabled={query?.page === query?.totalPage || query?.totalPage === 0} handle={() => { setQuery && setQuery((prev) => ({ ...prev, page: query?.page === query?.totalPage ? prev.page : prev.page + 1 })) }} iconName='icon-right' path='#' title='Trang sau' className="w-[36px] h-[36px] p-0 flex justify-center items-center" />
                <div className="h-[36px] px-2 ml-2 shadow-md shadow-gray-500 flex justify-center items-center rounded-lg font-semibold">{t("Tổng số bản")}: {query?.total}</div>
            </div>
        </div>
    )
}

const FilterStatus = ({ setFilter, filter }: { setFilter: Dispatch<SetStateAction<IFilterAllLot>>, filter: IFilterAllLot }) => {
    const { t } = useTranslation();
    const popupFilterStatusRef: any = useRef(null);
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

    useClickOutside(popupFilterStatusRef, () => {
        setOpen(false);
        setTimeout(() => setVisible(false), 200);
    }, visible);


    return <div ref={popupFilterStatusRef} className="col-span-1 w-fit z-10 font-semibold rounded-md text-sm p-2 relative">
        <div className="">{t("Trạng thái lô")}:</div>
        <Button onClick={handleToggle} className="flex justify-between items-center gap-4 text-black px-2 cursor-pointer z-50 min-w-46">
            <div className="">{t(dataStatusAllLot.find((a) => a.value === filter.status)?.label ?? "Chọn")}</div>
            <div className=""><Icon name="icon-up" width={14} height={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`} /></div>
        </Button>

        {visible && (
            <div className={`transition-all -mt-2 duration-200 absolute top-full w-[calc(100%-16px)] bg-white shadow-lg shadow-gray-300 rounded-lg border border-gray-300 p-2 ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>

                {
                    dataStatusAllLot.map((item) => {
                        return <Button onClick={() => {
                            handleToggle()
                            setFilter((prev) => ({ ...prev, status: item.value }))
                        }} className={`${item.value === filter.status ? "text-[var(--color-background)]" : "text-black"}  shadow-none p-1 hover:bg-[var(--color-background-opacity-2)] w-full cursor-pointer hover:text-[var(--color-background)] rounded-none text-left font-semibold`} key={item.value}>{t(item.label)}</Button>
                    })
                }
            </div>
        )}
    </div>
}
const FilterStatusSymbol = ({ setFilter, filter }: { setFilter: Dispatch<SetStateAction<IFilterAllLot>>, filter: IFilterAllLot }) => {
    const { t } = useTranslation();
    const popupFilterStatusRef: any = useRef(null);
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

    useClickOutside(popupFilterStatusRef, () => {
        setOpen(false);
        setTimeout(() => setVisible(false), 200);
    }, visible);


    return <div ref={popupFilterStatusRef} className="col-span-1 w-fit z-10 font-semibold rounded-md text-sm p-2 relative">
        <div className="">{t("Trạng thái cặp tiền")}:</div>
        <Button onClick={handleToggle} className="flex justify-between items-center gap-4 text-black px-2 cursor-pointer z-50 min-w-46">
            <div className="">{t(dataStatusSymbol.find((a) => a.value === filter.status)?.label ?? "Chọn")}</div>
            <div className=""><Icon name="icon-up" width={14} height={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`} /></div>
        </Button>

        {visible && (
            <div className={`transition-all -mt-2 duration-200 absolute top-full w-[calc(100%-16px)] bg-white shadow-lg shadow-gray-300 rounded-lg border border-gray-300 p-2 ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>

                {
                    dataStatusSymbol.map((item) => {
                        return <Button onClick={() => {
                            handleToggle()
                            setFilter((prev) => ({ ...prev, status: item.value }))
                        }} className={`${item.value === filter.status ? "text-[var(--color-background)]" : "text-black"}  shadow-none p-1 hover:bg-[var(--color-background-opacity-2)] w-full cursor-pointer hover:text-[var(--color-background)] rounded-none text-left font-semibold`} key={item.value}>{t(item.label)}</Button>
                    })
                }
            </div>
        )}
    </div>
}
const FilterType = ({ setFilter, filter }: { setFilter: Dispatch<SetStateAction<IFilterAllLot>>, filter: IFilterAllLot }) => {
    const { t } = useTranslation();
    const popupFilterStatusRef: any = useRef(null);
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

    useClickOutside(popupFilterStatusRef, () => {
        setOpen(false);
        setTimeout(() => setVisible(false), 200);
    }, visible);


    return <div ref={popupFilterStatusRef} className="col-span-1 w-fit z-10 font-semibold rounded-md text-sm p-2 relative">
        <div className="">{t("Trạng thái")}:</div>
        <Button onClick={handleToggle} className="flex justify-between items-center gap-4 text-black px-2 cursor-pointer z-50 min-w-46">
            <div className="">{t(dataType.find((a) => a.value === filter.type)?.label ?? "Chọn")}</div>
            <div className=""><Icon name="icon-up" width={14} height={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`} /></div>
        </Button>

        {visible && (
            <div className={`transition-all -mt-2 duration-200 absolute top-full w-[calc(100%-16px)] bg-white shadow-lg shadow-gray-300 rounded-lg border border-gray-300 p-2 ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>

                {
                    dataType.map((item) => {
                        return <Button onClick={() => {
                            handleToggle()
                            setFilter((prev) => ({ ...prev, type: item.value }))
                        }} className={`${item.value === filter.type ? "text-[var(--color-background)]" : "text-black"}  shadow-none p-1 hover:bg-[var(--color-background-opacity-2)] w-full cursor-pointer hover:text-[var(--color-background)] rounded-none text-left font-semibold`} key={item.value}>{t(item.label)}</Button>
                    })
                }
            </div>
        )}
    </div>
}

const FilterAccTransaction = ({ setFilter, filter }: { setFilter: Dispatch<SetStateAction<IFilterAllLot>>, filter: IFilterAllLot }) => {
    const { t } = useTranslation();
    const { serverMonitor } = useAppInfo()
    const popupFilterStatusRef: any = useRef(null);
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

    useClickOutside(popupFilterStatusRef, () => {
        setOpen(false);
        setTimeout(() => setVisible(false), 200);
    }, visible);


    return <div ref={popupFilterStatusRef} className="col-span-1 w-fit z-10 font-semibold rounded-md text-sm p-2 relative">
        <div className="">{t("Tài khoản giao dịch")}:</div>
        <Button onClick={handleToggle} className="flex justify-between items-center gap-4 text-black px-2 cursor-pointer z-50 min-w-46">
            <div className="">{serverMonitor.find((a) => Number(a.value) === filter.accTransaction)?.value ?? t("Chọn")}</div>
            <div className=""><Icon name="icon-up" width={14} height={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`} /></div>
        </Button>

        {visible && (
            <div className={`transition-all -mt-2 duration-200 absolute top-full w-[calc(100%-16px)] bg-white shadow-lg shadow-gray-300 rounded-lg border border-gray-300 p-2 ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>

                {
                    serverMonitor.map((item) => {
                        return <Button onClick={() => {
                            handleToggle()
                            setFilter((prev) => ({ ...prev, accTransaction: Number(item.value) }))
                        }} className={`${Number(item.value) === filter.accTransaction ? "text-[var(--color-background)]" : "text-black"}  shadow-none p-1 hover:bg-[var(--color-background-opacity-2)] w-full cursor-pointer hover:text-[var(--color-background)] rounded-none text-left font-semibold`} key={item.value}>{t(item.value)}</Button>
                    })
                }
            </div>
        )}
    </div>
}

const FilterTime = ({ setFilter, filter }: { setFilter: Dispatch<SetStateAction<IFilterAllLot>>, filter: IFilterAllLot }) => {
    const { t } = useTranslation()
    const changeTime = (dates: (dayjs.Dayjs | null)[] | null, dateStrings: any[]) => {
        if (dates) {
            const dataDate = [dates[0], dates[1]]
            setFilter((prev) => ({ ...prev, toFrom: dataDate as [start: Dayjs | null | undefined, end: Dayjs | null | undefined] }))
        } else {
            const dataDate = [undefined, undefined]
            setFilter((prev) => ({ ...prev, toFrom: dataDate as [start: Dayjs | null | undefined, end: Dayjs | null | undefined] }))
        }
    }

    return <div className="col-span-2">
        <div className="p-2">
            <div className="mb-1">{t("Thời gian")}:</div>
            <RangePickerCustom onRangeChange={changeTime} value={filter.toFrom} />
        </div>
    </div>
}