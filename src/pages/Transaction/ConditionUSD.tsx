import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../assets/icon';
import { Button } from '../../components/button';
import InputNumber from '../../components/input';
import { useClickOutside } from '../../hooks/useClickOutside';
import type { IOrderTransaction } from './type';

function ConditionUSD({
  init,
  setData,
}: {
  init: IOrderTransaction | undefined;
  setData: React.Dispatch<React.SetStateAction<IOrderTransaction | undefined>>;
}) {
  const popupRef: any = useRef(null);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleToggle = () => {
    if (open) {
      setOpen(false);
      setTimeout(() => setVisible(false), 200);
    } else {
      setVisible(true);
      setTimeout(() => setOpen(true), 10);
    }
  };

  useClickOutside(
    popupRef,
    () => {
      setOpen(false);
      setTimeout(() => setVisible(false), 200);
    },
    open,
  );

  return (
    <div ref={popupRef} className="font-semibold shadow-xs shadow-gray-500 rounded-md text-sm relative">
      <Button
        onClick={handleToggle}
        className="flex h-9 md:h-11 justify-between items-center w-full font-bold cursor-pointer text-black px-2 hover:bg-[var(--color-background-opacity-2)] transition text-[12px] md:text-sm"
      >
        {init?.IsUSD && (init.usd !== 0 || init.usd !== undefined || init.usd !== null)
          ? `${t('Điều kiện cắt lô')}: ${init.usd}usd`
          : t('Thêm điều kiện cắt lô')}
        <Icon
          name="icon-up"
          width={14}
          height={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
        />
      </Button>

      {visible && (
        <div
          className={`min-h-[20vh] flex-col transition-all duration-200  absolute bottom-full w-full mb-1 z-50 bg-white shadow-sm rounded-lg border border-gray-300 p-2 ${
            open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <div className="flex justify-start items-start w-full gap-2">
            <Button
              className={` ${
                init?.IsUSD ? 'bg-[var(--color-background)] text-white' : 'text-black'
              } cursor-pointer p-1.5 px-2 shadow-sm shadow-gray-400 rounded-sm`}
              onClick={() => setData((prev) => ({ ...prev, IsUSD: true }))}
            >
              {t('Bật điều kiện')}
            </Button>
            <Button
              className={` ${
                !init?.IsUSD ? 'bg-[var(--color-background)] text-white' : 'text-black'
              } cursor-pointer p-1.5 px-2 shadow-sm shadow-gray-400 rounded-sm`}
              onClick={() => setData((prev) => ({ ...prev, IsUSD: false }))}
            >
              {t('Tắt điều kiện')}
            </Button>
          </div>

          <div className="flex flex-col justify-center items-start gap-1 mt-2">
            <label htmlFor="exness-volume" className="text-[12px] md:text-[16px]">
              {t('Số tiền lỗ chấp nhận')}(usd):
            </label>
            <InputNumber
              id="exness-volume"
              type="number"
              placeholder={t('Nhập số tiền...')}
              value={String(init?.usd)}
              onChange={(e) => setData((prev) => ({ ...prev, usd: Number(e.target.value) }))}
              min={0}
              max={1}
              step={0.01}
              className="border border-gray-300 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none p-1 rounded w-full h-10 pl-2 shadow-sm shadow-gray-200 focus:outline-none focus:border-[var(--color-background)]"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ConditionUSD;
