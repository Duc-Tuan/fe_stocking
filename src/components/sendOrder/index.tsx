import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../assets/icon';
import { useClickOutside } from '../../hooks/useClickOutside';
import type { INotifi, INotification } from '../../layouts/type';
import { type IOrderSendResponse } from '../../pages/BootSymmetricalOrder/type';
import { Button } from '../button';
import InputNumber from '../input';
import { postNotificationApi } from '../../api/notification';
import { useAppInfo } from '../../hooks/useAppInfo';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { setNotification } from '../../store/notification/notification';
import { getLots } from '../../api/historys';
import type { Option } from '../../pages/History/type';
import toast from 'react-hot-toast';

export default function ScreenOrderSend({
  open,
  setOpen,
  data,
  setDataCurrent,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  data?: INotifi | null;
  setDataCurrent?: any;
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const { notificationReducer } = useAppInfo();
  const dispatch = useDispatch<AppDispatch>();
  const [dataSelectLot, setDataSelectLot] = useState<(Option<number> & { active: boolean })[]>([]);

  const getDataLot = async () => {
    const dataReq = await getLots({
      page: 1,
      limit: 10,
      statusType: 'RUNNING',
      acc_transaction: data?.account_transaction_id,
    });
    const dataNew: (Option<number> & { active: boolean })[] =
      dataReq.data.data.lenght !== 0
        ? dataReq.data.data.map((i: any, idx: number) => ({
            active: false,
            label: `${t('Lô')} ${idx + 1} <sl:${i.stop_loss}; tp:${i.take_profit}> TK theo dõi:${
              i.account_monitor_id
            } `,
            value: i.id,
          }))
        : [];
    setDataSelectLot(dataNew);
  };

  useEffect(() => {
    if (data) {
      getDataLot();
    }
  }, [data?.id]);

  const handleClick = async () => {
    setLoading(true);
    if (data) {
      await postNotificationApi({
        id_notification: data?.id,
        symbol: data.symbol,
        lot: data.total_volume,
        order_type: Number(data.type) === 0 ? 'BUY' : 'SELL',
        account_transaction_id: data.account_transaction_id,
        lot_id: dataSelectLot.find((i) => i.active)?.value ?? 0,
        price: null,
      })
        .then((datarep) => {
          const dataNew = notificationReducer.map((i) => {
            if (i.id === data.id) {
              return {
                ...i,
                total_volume: data.total_volume,
                type: Number(data.type) === 0 ? 'BUY' : 'SELL',
                lot_id: data.lot_id,
                is_send: true,
              };
            }
            return i;
          });
          dispatch(setNotification(dataNew));
          setOpen(false);
          toast.success(t(datarep.mess));
        })
        .catch((datarep) => toast.success(t(datarep.mess)))
        .finally(() => setLoading(false));
    }
  };

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-100">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-white px-4 sm:p-3 sm:py-6 sm:pt-4">
              <div className="mt-3 text-center sm:mt-0">
                <DialogTitle as="h1" className="text-md font-semibold text-gray-900">
                  <div className="">
                    {t('Bạn có muốn vào lệnh cho cặp tiền')} "<span className="font-bold">{data?.symbol}</span>"
                  </div>

                  <div className="text-[14px]">
                    {t('Tài khoản giao dịch:')}{' '}
                    <span className="text-[var(--color-background)]">{data?.account_transaction_id}</span>
                  </div>
                </DialogTitle>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="w-full text-left">
                    <div className="text-[12px] md:text-[16px]">{t('Cặp tiền')}:</div>
                    <div className="font-bold">{data?.symbol}</div>
                  </div>

                  <div className="w-full text-left">
                    <div className="text-[12px] md:text-[16px]">{t('Tài khoản')}:</div>
                    <div className="font-bold">{data?.account_transaction_id}</div>
                  </div>

                  <div className="col-span-2 flex flex-col justify-center items-start gap-1 w-full">
                    <label htmlFor="exness-symbol" className="text-[12px] md:text-[16px]">
                      {t('Lô gửi nhờ')}:{' '}
                      {dataSelectLot.length === 0 && <span>({t('Hiện không có lô nào đang mở')})</span>}
                    </label>
                    <SeletLot value={dataSelectLot} setValue={setDataSelectLot} />
                  </div>

                  <div className="flex flex-col justify-center items-start gap-1 w-full">
                    <label htmlFor="exness-symbol" className="text-[12px] md:text-[16px]">
                      {t('Kiểu lệnh')}:
                    </label>
                    <SeletType setValue={setDataCurrent} />
                  </div>

                  <div className="w-full text-left ">
                    <div className="text-[12px] md:text-[16px]">{t('Volume')}:</div>
                    <InputNumber
                      id="exness-volume"
                      type="number"
                      placeholder={t('Volume')}
                      value={String(data?.total_volume)}
                      onChange={(e) =>
                        setDataCurrent((prev: any) => ({ ...prev, total_volume: Number(e.target.value) }))
                      }
                      className="mt-1 text-[12px] md:text-sm border border-gray-300 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none p-1 rounded w-full h-8 md:h-10 pl-2 shadow-sm shadow-gray-200 focus:outline-none focus:border-[var(--color-background)]"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-3">
              <Button
                isLoading={loading}
                onClick={() => {
                  !loading && handleClick();
                }}
                type="button"
                className="shadow-gray-400 cursor-pointer inline-flex w-full justify-center rounded-md bg-[var(--color-background)] px-3 py-2 text-sm font-semibold text-white shadow-md sm:ml-3 sm:w-auto"
              >
                {t('Xác nhận')}
              </Button>
              <Button
                type="button"
                data-autofocus
                onClick={() => {
                  setDataSelectLot((prev) => prev.map((i) => ({ ...i, active: false })));
                  setOpen(false);
                }}
                className="shadow-gray-400 cursor-pointer mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-md inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                {t('Hủy')}
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

const SeletType = ({ setValue }: { setValue?: Dispatch<SetStateAction<INotification>> }) => {
  const { t } = useTranslation();
  const popupFilterStatusRef: any = useRef(null);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false); // để delay unmount

  const [data, setData] = useState<IOrderSendResponse[]>([
    { value: 0, label: 'BUY', active: false },
    { value: 1, label: 'SELL', active: false },
  ]);

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

  useClickOutside(
    popupFilterStatusRef,
    () => {
      setOpen(false);
      setTimeout(() => setVisible(false), 200);
    },
    visible,
  );

  return (
    <div ref={popupFilterStatusRef} className="h-8 md:h-10 w-full rounded relative border border-gray-300 z-110">
      <Button
        onClick={handleToggle}
        className="flex justify-between items-center gap-4 text-black p-1 rounded-none w-full cursor-pointer h-full shadow-sm shadow-gray-200 pl-2"
      >
        <div className="text-[12px] md:text-sm font-semibold">{data.find((a) => a.active)?.label ?? t('Chọn')}</div>
        <div className="">
          <Icon
            name="icon-up"
            width={14}
            height={14}
            className={`transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
          />
        </div>
      </Button>

      {visible && (
        <div
          className={`transition-all duration-200 absolute top-full mt-1 w-full bg-white shadow-lg shadow-gray-300 rounded border border-gray-300 p-2 ${
            open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {data.map((item, idx) => {
            return (
              <Button
                onClick={() => {
                  handleToggle();
                  setValue && setValue((prev) => ({ ...prev, type: item.value as 0 | 1 }));
                  setData((prev) => prev.map((d) => ({ ...d, active: d.value === item.value })));
                }}
                className={`${
                  item.active ? 'text-[var(--color-background)]' : 'text-black'
                }  shadow-none p-1 hover:bg-[var(--color-background-opacity-2)] w-full cursor-pointer hover:text-[var(--color-background)] rounded-none text-left text-[12px] md:text-[14px] font-semibold`}
                key={idx}
              >
                {t(item.label)}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SeletLot = ({
  setValue,
  value,
}: {
  setValue: Dispatch<
    SetStateAction<
      (Option<number> & {
        active: boolean;
      })[]
    >
  >;
  value: (Option<number> & { active: boolean })[];
}) => {
  const { t } = useTranslation();
  const popupFilterStatusRef: any = useRef(null);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false); // để delay unmount

  const handleToggle = () => {
    if (value.length !== 0) {
      if (open) {
        // Đóng có delay để chạy animation
        setOpen(false);
        setTimeout(() => setVisible(false), 200); // khớp với duration
      } else {
        setVisible(true);
        setTimeout(() => setOpen(true), 10); // delay nhẹ để Tailwind áp transition
      }
    }
  };

  useClickOutside(
    popupFilterStatusRef,
    () => {
      setOpen(false);
      setTimeout(() => setVisible(false), 200);
    },
    visible,
  );

  return (
    <div ref={popupFilterStatusRef} className="h-8 md:h-10 w-full rounded relative border border-gray-300 z-120">
      <Button
        onClick={handleToggle}
        className={`flex justify-between items-center gap-4 text-black p-1 rounded-none w-full cursor-pointer h-full shadow-sm shadow-gray-200 pl-2 ${
          value.length === 0 ? 'bg-gray-200' : ''
        }`}
      >
        <div className="text-[12px] md:text-sm font-semibold text-left">
          {value.find((a) => a.active)?.label ?? t('Chọn')}
        </div>
        <div className="">
          <Icon
            name="icon-up"
            width={14}
            height={14}
            className={`transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
          />
        </div>
      </Button>

      {visible && value.length !== 0 && (
        <div
          className={`transition-all duration-200 my-scroll max-h-32 mt-1 absolute top-full w-full bg-white shadow-lg shadow-gray-300 rounded border border-gray-300 p-2 ${
            open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {value.map((item, idx) => {
            return (
              <Button
                onClick={() => {
                  handleToggle();
                  setValue((prev) =>
                    prev.map((i) => {
                      if (i.value === item.value) {
                        return {
                          ...i,
                          active: i.value === item.value,
                        };
                      }
                      return i;
                    }),
                  );
                }}
                className={`${
                  item.active ? 'text-[var(--color-background)]' : 'text-black'
                }  shadow-none p-1 hover:bg-[var(--color-background-opacity-2)] w-full cursor-pointer hover:text-[var(--color-background)] rounded-none text-left text-[12px] md:text-[14px] font-semibold`}
                key={idx}
              >
                {t(item.label)}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};
