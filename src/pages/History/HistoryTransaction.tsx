import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../../components/button'
import { datafunction, type IOptionDatafunction } from './type'
import Positions from './Screens/Positions'
import Deals from './Screens/Deals'
import Orders from './Screens/Orders'
import { useAppInfo } from '../../hooks/useAppInfo'

export default function HistoryTransaction() {
    const { t } = useAppInfo()
    const [data, setData] = useState<IOptionDatafunction[]>(datafunction)
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

    const handlelick = (d: IOptionDatafunction, index: number) => {
        const dataNew = [...data].map((i) => ({
            ...i,
            active: i.type === d.type
        }))
        setData(dataNew)
        moveHighlight(index)
    }

    const screen = useMemo(() => {
        const isCheck = data.find((d) => d.active)
        let content: React.ReactNode;
        switch (isCheck?.type) {
            case "Positions":
                content = <Positions />
                break;
            case "Orders":
                content = <Orders />
                break;
            case "Deals":
                content = <Deals />
                break;
            default:
                null
        }

        return (
            <div
                key={isCheck?.type}
                className="animate-fade-in"
            >
                {content}
            </div>
        );
    }, [data.find((d) => d.active)])

    return (
        <div className='grid grid-cols-5 gap-2 h-[calc(100vh-95px)]'>
            <div className="col-span-2 lg:col-span-1 shadow-md shadow-gray-500 rounded-lg p-2 relative" ref={containerRef}>
                <div
                    className="animate absolute left-2 w-[calc(100%-16px)] text-[var(--color-text)] bg-[var(--color-background)] rounded-md transition-all duration-300 -z-10 shadow-md shadow-gray-300"
                    style={{
                        top: highlightStyle.top,
                        height: highlightStyle.height
                    }}
                />
                {data.map((d, idx) => {
                    return <Button id="button-history" onClick={() => handlelick(d, idx)} key={d.type} className={`${d.active ? "text-white" : "text-[var(--color-background)] hover:bg-[var(--color-background-opacity-2)]"} cursor-pointer  w-full text-left block shadow-none p-2 mb-1`}>{t(d.title)}</Button>
                })}
            </div>
            <div className="col-span-3 lg:col-span-4 shadow-md shadow-gray-500 rounded-lg p-2 overflow-y-scroll my-scroll">
                <div className="">{screen}</div>
            </div>
        </div>
    )
}
