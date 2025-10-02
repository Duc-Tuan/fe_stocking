import { useTranslation } from 'react-i18next';
import type { Func } from '../../types/global';
import { Button } from '../button';
import Icon from '../../assets/icon';

export default function ButtonBack({ handleClick, componentSp }: { handleClick: Func; componentSp?: any }) {
  const { t } = useTranslation();
  return (
    <div className="sticky top-2 left-0 flex justify-start items-center gap-2">
      <Button
        onClick={handleClick}
        className="bg-white md:p-1.5 md:pr-4 p-0.5 pr-2 text-black hover:bg-[var(--color-background)] hover:text-white rounded-sm rounded-l-none cursor-pointer flex justify-center items-center gap-1 shadow-md shadow-gray-300"
      >
        <Icon name="icon-left" />
        <span className="text-[12px] md:text-[16px]">{t('Trở về')}</span>
      </Button>

      {componentSp}
    </div>
  );
}
