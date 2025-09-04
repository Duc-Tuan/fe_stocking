import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import dayjs from 'dayjs';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../assets/icon';
import { Button } from '../../../components/button';
import { Loading } from '../../../components/loading';
import { useSocket } from '../../../hooks/useWebSocket';
import TooltipNavigate from '../../../layouts/TooltipNavigate';
import type { ISymbolPosition } from '../../History/type';
import { type IBootAcc } from '../type';

export default function BootMonitor() {
  const { t } = useTranslation();
  const [data, setData] = useState<IBootAcc[]>([]);
  const [position, setPosition] = useState<ISymbolPosition[]>([]);
  const [open, setOpen] = useState(false);
  const [dataCurrent, setDataCurrent] = useState<ISymbolPosition[]>([]);
  // boot_monitor_acc

  const { dataBootAcc } = useSocket(import.meta.env.VITE_URL_API, 'boot_monitor_acc', 1234234);

  useEffect(() => {
    if (dataBootAcc) {
      setData(dataBootAcc.acc);
      setPosition(dataBootAcc.position);
    }
  }, [dataBootAcc]);

  return (
    <div className="grid grid-cols-2 h-full gap-2">
      {data.length === 0 ? (
        <div className="col-span-2 w-full">
          <Loading />{' '}
        </div>
      ) : (
        data.map((item, idx) => {
          return (
            <div key={idx} className="col-span-1 shadow rounded">
              <div className="flex justify-between flex-col items-center gap-2 h-full">
                <div className="flex-1 w-full p-2">
                  {position ? (
                    position
                      .filter((d) => Number(d.username) === item.username)
                      .map((a, id) => (
                        <div
                          key={id}
                          className="flex justify-between items-center w-full shadow-sm shadow-gray-300 p-2 rounded-sm"
                        >
                          <div className="">
                            <div className="font-bold flex gap-2 justify-start items-center">
                              {a.symbol}{' '}
                              <span
                                className={`text-sm font-semibold ${
                                  a.position_type === '1' ? 'text-red-500' : 'text-blue-500'
                                }`}
                              >
                                {a.position_type === "1" ? "SELL" : "BUY"} {a.volume}
                              </span>
                              {idx === 0 && (
                                <TooltipNavigate
                                  handle={() => {
                                    setOpen(true);
                                    setDataCurrent(position);
                                  }}
                                  className="shadow-sm w-[24px] h-[24px] p-0 flex justify-center items-center"
                                  iconName="icon-close-transaction"
                                  path="#"
                                  title="Đóng lệnh nhanh"
                                />
                              )}
                            </div>
                            <div className="text-sm flex justify-start items-center gap-1">
                              {a.open_price} <Icon name="icon-right-v2" width={14} height={14} /> {a.current_price}
                            </div>
                          </div>
                          <div className="">
                            <div
                              className={`text-right ${
                                a.profit > 0 ? 'text-blue-700' : a.profit === 0 ? 'text-gray-400' : 'text-red-500'
                              } font-semibold`}
                            >
                              {a.profit}
                            </div>
                            <div className="text-sm">
                              {a.username} | {dayjs.utc(a.time).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')}
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-gray-300 flex justify-center items-center flex-1 w-full h-full">
                      {t('Hiện không có lệnh nào đang mở')}
                    </div>
                  )}
                </div>
                <div className="w-full border-t border-t-gray-200 p-2">
                  <div className="text-md w-full">
                    <div className="font-semibold text-center w-full mr-2">
                      {t(idx === 0 ? 'Tài khoản exness' : 'Tài khoản quỹ')}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="font-bold mr-2">{t('Tài khoản')}: </span>
                      {item.name}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-bold mr-2">{t('Máy chủ')}: </span>
                    {item.server}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold mr-2">{t('Số dư')}: </span>
                    {item.balance}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold mr-2">{t('Vốn')}: </span>
                    {item.equity}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold mr-2">{t('Ký quỹ')}: </span>
                    {item.margin}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold mr-2">{t('Ký quỹ khả dụng')}: </span>
                    {item.free_margin}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold mr-2">{t('Đòn bẩy')}: </span>
                    {item.leverage}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

      <Modal open={open} setOpen={setOpen} dataCurrent={dataCurrent} />
    </div>
  );
}

const Modal = ({
  open,
  setOpen,
  dataCurrent,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  dataCurrent: ISymbolPosition[];
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = async () => {};

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
            <div className="bg-white p-3">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                    {t('Bạn xác nhận muốn đóng lệnh')} {dataCurrent[0]?.symbol}
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {t(
                        'Nếu bạn xác nhận đóng lệnh của các cặp tiền này thì sẽ không thể nào mở lại được tại thời điểm này nữa. Bạn vẫn muốn xác nhận chứ!',
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-3 sm:flex sm:flex-row-reverse">
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
                onClick={() => setOpen(false)}
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
};
