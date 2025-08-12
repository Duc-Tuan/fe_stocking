import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Filter from '../components/Filter'
import { dataSymbolTransaction, initFilter, type IFilterAllLot, type ISymbol } from '../type'
import Icon from '../../../assets/icon'

export default function Positions() {
    const { t } = useTranslation()
    const [filter, setFilter] = useState<IFilterAllLot>(initFilter)
    const [data, setData] = useState<ISymbol[]>(dataSymbolTransaction)

    return (
        <div className='relative'>
            <Filter setFilter={setFilter} filter={filter} isStatus />

            <div className="p-2 flex flex-col justify-center items-start gap-2">
                {data.map((a, idx) => <div key={idx} className="flex justify-between items-center w-full shadow-sm shadow-gray-300 p-2 rounded-sm">
                    <div className="">
                        <div className='font-bold'>{a.symbol} <span className={`text-sm font-semibold ${a.type === "SELL" ? "text-red-500" : "text-blue-500"}`}>{a.type} {a.volume}</span></div>
                        <div className='text-sm flex justify-center items-center gap-1'>{a.priceOpen} <Icon name="icon-right-v2" width={14} height={14}/> {a.price}</div>
                    </div>
                    <div className="">
                        <div className={`text-right ${a.status === "filled" ? "text-blue-700" : "text-red-500"} font-semibold`}>{a.profit}</div>
                        <div className='text-sm'>{a.time}</div>
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
