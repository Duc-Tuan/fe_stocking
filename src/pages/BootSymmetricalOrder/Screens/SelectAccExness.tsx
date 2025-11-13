import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../assets/icon';
import { Button } from '../../../components/button';
import { useClickOutside } from '../../../hooks/useClickOutside';
import type { IServerTransaction } from '../../../types/global';
import type { IOrderSendAcc } from '../type';

interface IData extends IServerTransaction {
  active: boolean;
}

const SelectAccExness = ({
  dataSelect,
  setDataSubmit,
  dataAccTransaction,
  title,
}: {
  title: 'FUND' | 'EXNESS';
  dataSelect?: IOrderSendAcc;
  setDataSubmit: React.Dispatch<React.SetStateAction<IOrderSendAcc[]>>;
  dataAccTransaction: IServerTransaction[];
}) => {
  const popupRef: any = useRef(null);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false); // để delay unmount
  const [data, setData] = useState<IData[]>([]);

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

  useEffect(() => {
    const dataNew = [...dataAccTransaction].map((a) => ({
      ...a,
      active: a.username === dataSelect?.username,
    }));

    setData(dataNew);
  }, [dataSelect, dataAccTransaction]);

  useClickOutside(
    popupRef,
    () => {
      setOpen(false);
      setTimeout(() => setVisible(false), 200);
    },
    open,
  );

  const handleClick = (d: IServerTransaction) => {
    if (title === 'EXNESS') {
      setDataSubmit((prev) =>
        prev.map((i, idx) => {
          if (idx === 0) {
            return {
              ...i,
              username: Number(d.username),
            };
          }
          return i;
        }),
      );
    } else if (title === 'FUND') {
      setDataSubmit((prev) =>
        prev.map((i, idx) => {
          if (idx === 1) {
            return {
              ...i,
              username: Number(d.username),
            };
          }
          return i;
        }),
      );
    }

    handleToggle();
  };

  return (
    <div ref={popupRef} className="font-semibold w-fit shadow-xs shadow-gray-500 rounded-sm text-sm relative">
      <Button
        onClick={handleToggle}
        className="flex h-8 md:h-8 justify-between items-center gap-2 font-bold cursor-pointer text-black px-2 hover:bg-[var(--color-background-opacity-2)] transition text-[12px] md:text-sm"
      >
        {data?.find((a) => a.active) ? (
          <span>
            {t('Tài khoản')}: {data?.find((a) => a.active)?.username}
          </span>
        ) : (
          <span>{t('Chọn tài khoản giao dịch')}</span>
        )}
        <Icon
          name="icon-up"
          width={14}
          height={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
        />
      </Button>

      {visible && (
        <div
          className={`flex justify-center items-start gap-1 flex-col transition-all duration-200  absolute top-full w-full mt-1 z-50 bg-white shadow-sm rounded-lg border border-gray-300 p-2 ${
            open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {data.length === 0 ? (
            <div className="text-gray-400 min-h-20 flex justify-center items-center w-full text-center">
              {t('Không có tài khoản giao dịch')}
            </div>
          ) : (
            data?.map((a, i) => (
              <Button
                key={i}
                onClick={() => handleClick(a)}
                className={`${
                  a.active ? 'text-[var(--color-background)] bg-[var(--color-background-opacity-2)]' : 'text-black'
                } cursor-pointer w-full text-start shadow-none py-2 pl-2 hover:bg-[var(--color-background-opacity-2)] transition text-[12px] md:text-sm`}
              >
                {a.username}
              </Button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SelectAccExness;
