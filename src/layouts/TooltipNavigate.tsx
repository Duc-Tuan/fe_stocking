import { Tooltip } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import Icon from '../assets/icon';
import { Button } from '../components/button';
import { useAppInfo } from '../hooks/useAppInfo';

interface IProps {
    title: string,
    iconName: string,
    path: string,
    handle?: () => void
}

export default function TooltipNavigate({ iconName, title, path, handle }: IProps) {
    const navigate = useNavigate();
    const { t } = useAppInfo()
    return (
        <Tooltip
            content={
                <div className="text-[var(--color-text)] bg-[var(--color-background)] rounded-lg py-1 px-2">
                    {t(title)}
                </div>
            }
            className="z-100 bg-transparent"
        >
            <Button
                onClick={() => {
                    handle && handle()
                    navigate(path)
                }}
                className={`cursor-pointer inline-block p-2 rounded-lg active shadow-md shadow-gray-500 text-[var(--color-text)] bg-[var(--color-background)]`}
                aria-current="page"
            >
                <Icon name={iconName} />
            </Button>
        </Tooltip>
    )
}
