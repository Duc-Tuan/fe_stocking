import { Tooltip } from '@material-tailwind/react';
import { type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../button';
import { LoadingOnly } from '../loading/indexOnly';
import type { placement } from '@material-tailwind/react/types/components/menu';

interface IProps {
    children: JSX.Element;
    titleTooltip: JSX.Element | string;
    loading?: boolean,
    handleClick?: () => void;
    isButton?: boolean;
    classNameButton?: string
    placement?: placement
}

export default function TooltipCustom({ placement = "bottom", children, titleTooltip, loading, handleClick, isButton, classNameButton }: IProps) {
    const { t } = useTranslation()
    return (
        <Tooltip
            className="z-50 bg-transparent"
            content={
                <div className="text-[var(--color-text)] bg-[var(--color-background)] rounded-sm py-1 px-2">
                    {(typeof titleTooltip === 'string') ? t(titleTooltip.toString()) : titleTooltip}
                </div>
            }
            placement={placement}
        >
            {isButton ? children : <Button
                disabled={loading}
                onClick={handleClick}
                isLoading={loading}
                className={`flex justify-center items-center rounded-lg text-[var(--color-text)] bg-[var(--color-background)] active cursor-pointer p-0 md:h-[36px] md:w-[36px] w-[32px] h-[32px] ${classNameButton}`}
                aria-current="page"
            >
                {loading ? <LoadingOnly /> : children}
            </Button>}

        </Tooltip>
    )
}
