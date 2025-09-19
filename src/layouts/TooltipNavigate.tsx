import { Tooltip } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import Icon from '../assets/icon';
import { Button } from '../components/button';
import { useTranslation } from 'react-i18next';

interface IProps {
  title: string;
  className?: string;
  iconName: string;
  path: string;
  handle?: () => void;
  disabled?: boolean;
  w?: number;
  h?: number;
}

export default function TooltipNavigate({
  iconName,
  title,
  path,
  handle,
  className,
  disabled,
  w = 20,
  h = 20,
}: IProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <Tooltip
      content={
        <div className="text-[var(--color-text)] bg-[var(--color-background)] rounded-lg py-1 px-2 text-[12px] md:text-sm">{t(title)}</div>
      }
      className="z-100 bg-transparent"
    >
      <Button
        onClick={() => {
          handle && handle();
          navigate(path);
        }}
        disabled={disabled}
        className={`${
          disabled ? 'text-black bg-gray-200' : 'text-[var(--color-text)] bg-[var(--color-background)]'
        } cursor-pointer inline-block p-2 rounded-lg active shadow-md shadow-gray-500 ${className} md:w-[36px] md:h-[36px] w-[32px] h-[32px] flex justify-center items-center`}
        aria-current="page"
      >
        <Icon name={iconName} width={w} height={h} />
      </Button>
    </Tooltip>
  );
}
