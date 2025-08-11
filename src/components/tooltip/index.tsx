import { Tooltip } from '@material-tailwind/react';
import { type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../button';
import { LoadingOnly } from '../loading/indexOnly';

interface IProps {
    children: JSX.Element;
    titleTooltip: JSX.Element | string;
    loading?: boolean,
    handleClick?: () => void;
    isButton?: boolean;
    w?: string;
    h?: string;
    classNameButton?: string
    placement?: string
}

export default function TooltipCustom({ placement = "bottom", children, titleTooltip, loading, handleClick, isButton, w, h, classNameButton }: IProps) {
    const { t } = useTranslation()
    return (
        <Tooltip
            className="z-50 bg-transparent"
            content={
                <div className="text-[var(--color-text)] bg-[var(--color-background)] rounded-lg py-1 px-2">
                    {(typeof titleTooltip === 'string') ? t(titleTooltip.toString()) : titleTooltip}
                </div>
            }
            placement={placement}
        >
            {isButton ? children : <Button
                disabled={loading}
                onClick={handleClick}
                isLoading={loading}
                className={`flex justify-center items-center ${w ?? 'w-[46px]'} ${h ?? 'h-[44px]'} rounded-lg text-[var(--color-text)] bg-[var(--color-background)] active cursor-pointer ${classNameButton}`}
                aria-current="page"
            >
                {loading ? <LoadingOnly /> : children}
            </Button>}

        </Tooltip>
    )
}
