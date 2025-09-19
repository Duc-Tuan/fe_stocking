import React, { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { Button } from '../../components/button';
import Icon from '../../assets/icon';
import { dataAccTransaction, type IAccTransaction, type IOrderTransaction } from './type';
import { useTranslation } from 'react-i18next';
import { useAppInfo } from '../../hooks/useAppInfo';
import type { IServerTransaction } from '../../types/global';

interface IData extends IServerTransaction {
    active: boolean
}

export default function PopupAcc({ setDataSubmit }: { setDataSubmit: Dispatch<SetStateAction<IOrderTransaction | undefined>> }) {
    const popupRef: any = useRef(null);
    const { dataServerTransaction } = useAppInfo()
    const { t } = useTranslation()
    const [open, setOpen] = useState(false);
    const [visible, setVisible] = useState(false); // để delay unmount
    const [data, setData] = useState<IData[]>([])

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

    // 📌 Auto close when click outside
    useEffect(() => {
        function handleClickOutside(event: any) {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setOpen(false);
                setTimeout(() => setVisible(false), 200);
            }
        }

        if (visible) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [visible]);

    useEffect(() => {
        const dataNew = [...dataServerTransaction].map((a) => ({
            ...a,
            active: false
        }))
        setData(dataNew)
    }, [dataServerTransaction])

    const handleClick = (d: IServerTransaction) => {
        const updated = data.map((a: IServerTransaction) => ({
            ...a,
            active: a.username === d.username,
        }));
        setData(updated)
        setDataSubmit((prev) => ({ ...prev, account_transaction_id: updated.find((a) => a.active)?.username }))
        handleToggle()
    }

    return (
        <div ref={popupRef} className="col-span-2 font-semibold shadow-xs shadow-gray-500 rounded-md text-sm relative">
            <Button onClick={handleToggle} className="flex h-9 md:h-11 justify-between items-center w-full font-bold cursor-pointer text-black px-2 hover:bg-[var(--color-background-opacity-2)] transition text-[12px] md:text-md">
                {data.find((a) => a.active) ?
                    <span>{t("Tài khoản")}: {data.find((a) => a.active)?.username}</span>
                    :
                    <span>{t("Chọn tài khoản giao dịch")}</span>
                }
                <Icon name="icon-up" width={14} height={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'
                    }`} />
            </Button>

            {visible && (
                <div className={`flex justify-center items-start gap-1 flex-col transition-all duration-200  absolute bottom-full w-full mb-2 z-50 bg-white shadow-sm rounded-lg border border-gray-300 p-2 ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                    {data.map((a, i) => (
                        <Button key={i} onClick={() => handleClick(a)} className={`${a.active ? "text-[var(--color-background)] bg-[var(--color-background-opacity-2)]" : "text-black"} cursor-pointer w-full text-start shadow-none py-2 pl-2 hover:bg-[var(--color-background-opacity-2)] transition text-[12px] md:text-md`} >{a.username}</Button>
                    ))}
                </div>
            )}
        </div>
    )
}
