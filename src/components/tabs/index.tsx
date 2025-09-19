import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import type { IOptions } from "../../types/global";
import { Button } from "../button";
import TooltipCustom from "../tooltip";

interface IProps {
    options: IOptions[];
    handleClick: (data: any) => void;
    isLoading?: boolean
    serverMonitorActive: IOptions | null;
}

const Tabs = (props: IProps) => {
    const { options, handleClick, isLoading, serverMonitorActive } = props;
    const { t } = useTranslation()

    return (
        <>
            {options.map((item: IOptions) => (
                <React.Fragment key={item.value}>
                    <TooltipCustom isButton titleTooltip={<>
                        <div className="text-[12px] md:text-sm">
                            {t("Tài khoản")}: {item?.value}
                        </div>
                        <div className="text-[12px] md:text-sm">
                            {t("Máy chủ")}: {item?.label}
                        </div>
                        <div className="font-bold text-[12px] md:text-sm">
                            {t("Cặp tiền")}: {JSON.stringify(item?.data)}
                        </div>
                    </>}>
                        <Button

                            disabled={isLoading}
                            isLoading={isLoading}
                            onClick={() => handleClick(item)}
                            className={`flex justify-center items-center h-[32px] md:h-[36px] w-[70px] md:w-[80px] rounded-lg ${item.value === serverMonitorActive?.value
                                ? "text-[var(--color-text)] bg-[var(--color-background)] active"
                                : "bg-gray-200 text-black hover:bg-[var(--color-background-opacity-5)] hover:text-[var(--color-text)] border border-rose-100 dark:hover:border-rose-200"
                                } cursor-pointer text-[12px] md:text-sm`}
                            aria-current="page"
                        >
                            T {String(item?.value).slice(-6)}
                        </Button>
                    </TooltipCustom>
                </React.Fragment>
            ))}
        </>
    )
}


export default memo(Tabs)