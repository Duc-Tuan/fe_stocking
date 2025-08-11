import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/button'
import Acc from './Screens/Acc'
import AccTracking from './Screens/AccTracking'
import AccTransaction from './Screens/AccTransaction'
import Email from './Screens/Email'
import Language from './Screens/Language'
import Notifition from './Screens/Notifition'
import { datafunctionSetting, type IOptionDatafunctionSetting } from './type'

export default function SettingTransaction() {
    const { t } = useTranslation()
    const [data, setData] = useState<IOptionDatafunctionSetting[]>(datafunctionSetting)
    const [highlightStyle, setHighlightStyle] = useState({ top: 0, height: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const activeIndex = data.findIndex(d => d.active)
        moveHighlight(activeIndex)
    }, [])

    const moveHighlight = (index: number) => {
        if (!containerRef.current) return
        const btn = containerRef.current.querySelectorAll<HTMLButtonElement>('#button-history')[index]
        if (btn) {
            setHighlightStyle({
                top: btn.offsetTop,
                height: btn.offsetHeight
            })
        }
    }

    const handlelick = (d: IOptionDatafunctionSetting, index: number, active: boolean) => {
        if (active) return;
        const dataNew = [...data].map((i) => ({
            ...i,
            active: i.type === d.type
        }))
        setData(dataNew)
        moveHighlight(index)
    }

    const activeType = data.find((d) => d.active);

    const screen = useMemo(() => {
        let content: React.ReactNode;
        switch (activeType?.type) {
            case "Info":
                content = <Acc />
                break;
            case "Acc_tracking":
                content = <AccTracking />
                break;
            case "Acc_transaction":
                content = <AccTransaction />
                break;
            case "Email":
                content = <Email />
                break;
            case "Language":
                content = <Language />
                break;
            case "Notifition":
                content = <Notifition />
                break;
            default:
                null
        }
        return (
            <div
                key={activeType?.type}
                className="animate-fade-in"
            >
                {content}
            </div>
        );
    }, [activeType])

    return (
        <div className='grid grid-cols-5 gap-2 h-[calc(100vh-95px)]'>
            <div className="col-span-1 shadow-md shadow-gray-500 rounded-lg p-2 relative" ref={containerRef}>
                <div
                    className="animate absolute left-2 w-[calc(100%-16px)] text-[var(--color-text)] bg-[var(--color-background)] rounded-md transition-all duration-300 -z-10 shadow-md shadow-gray-300"
                    style={{
                        top: highlightStyle.top,
                        height: highlightStyle.height
                    }}
                />
                {data.map((d, idx) => {
                    return <Button id="button-history" onClick={() => handlelick(d, idx, d.active)} key={d.type} className={`${d.active ? "text-white" : "text-[var(--color-background)] hover:bg-[var(--color-background-opacity-2)]"} cursor-pointer w-full text-left block shadow-none p-2 mb-1`}>{t(d.title)}</Button>
                })}
            </div>
            <div className="col-span-4 shadow-md shadow-gray-500 rounded-lg p-4 overflow-y-scroll my-scroll">
                <div className="">{screen}</div>
            </div>
        </div>)
}
