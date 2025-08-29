import React from 'react'
import { useAppInfo } from '../../../hooks/useAppInfo'
import { useTranslation } from 'react-i18next'

export default function Acc() {
    const { user } = useAppInfo();
    const { t } = useTranslation();
    
    return (
        <div className='relative'>
            <div className='shadow-lg shadow-gray-300 absolute top-0 -left-12 text-white bg-[var(--color-background)] font-bold px-8 py-1 -rotate-45 text-sm'>{user?.role === 200 ? "ADMIN" : "USER"}</div>

            <div className="flex justify-center items-center pt-10 flex-col">
                <div className="shadow-[inset_0_0_10px_theme(colors.blue.200),_inset_0_0_6px_var(--color-background)] p-4 rounded-lg px-8">
                    <div className=""><span className='font-bold'>{t("Tài khoản")}:</span> {user.username}</div>
                    <div className=""><span className='font-bold'>{t("Máy chủ")}:</span> {t("Hệ thống theo dõi")}</div>

                </div>
            </div>
        </div>
    )
}
