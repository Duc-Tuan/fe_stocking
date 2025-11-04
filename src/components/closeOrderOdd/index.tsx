import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { closeOddOrder } from '../../api/oddOrder';
import TooltipNavigate from '../../layouts/TooltipNavigate';
import type { ISymbolPosition } from '../../pages/History/type';
import { Button } from '../button';
import InputNumber from '../input';

function CloseOrderOdd({
  data,
  setData,
}: {
  data: ISymbolPosition;
  setData: Dispatch<SetStateAction<ISymbolPosition[]>>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<boolean>(false);
  const [valueVolume, setValueVolume] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const resetValue = () => {
    setValueVolume(data.volume);
  };

  useEffect(() => {
    resetValue();
  }, [data.id]);

  const handleSend = async () => {
    setLoading(true);
    await closeOddOrder({ acc_transaction: data.account_id, ticket: data?.id_transaction, vloume: valueVolume })
      .then((req) => {
        if (valueVolume >= data.volume) {
          setData((prev) => prev.filter((i) => i.id_transaction !== data.id_transaction));
        }
        toast.success(req.data.success);
        setOpen(false);
      })
      .catch((e) => console.log(e))
      .finally(() => setLoading(false));
  };

  return (
    <>
      <TooltipNavigate
        handle={() => {
          // setDataCurrent({ ...a, lot: idx + 1 });
          setOpen((prev) => !prev);
        }}
        classSub="shadow-sm w-[20px] md:w-[24px] h-[20px] md:h-[24px] p-0"
        iconName="icon-close-transaction"
        path="#"
        title="Đóng lệnh nhanh"
      />

      <Dialog
        open={open}
        onClose={() => {
          resetValue();
          setOpen(false);
        }}
        className="relative z-100"
      >
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
                      {t('Bạn muốn cắt lệnh của')} "<span className="font-bold">Ticket: {data?.id_transaction}</span>"
                    </div>
                  </DialogTitle>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="w-full text-left">
                      <div className="text-[12px] md:text-[16px]">{t('Cặp tiền')}:</div>
                      <div className="font-bold">{data?.symbol}</div>
                    </div>

                    <div className="w-full text-left">
                      <div className="text-[12px] md:text-[16px]">{t('Tài khoản giao dịch')}:</div>
                      <div className="font-bold">{data?.account_id}</div>
                    </div>

                    <div className="w-full text-left">
                      <div className="text-[12px] md:text-[16px]">{t('Lợi nhuận')}:</div>
                      <div className={`font-bold ${data?.profit > 0 ? 'text-blue-500' : 'text-red-500'}`}>
                        {data?.profit.toFixed(4)}
                      </div>
                    </div>

                    <div className="w-full text-left">
                      <div className="text-[12px] md:text-[16px]">{t('Kiểu lệnh')}:</div>
                      <div className={`font-bold ${data?.position_type === 'BUY' ? 'text-blue-500' : 'text-red-500'}`}>
                        {data?.position_type}
                      </div>
                    </div>

                    <div className="w-full text-left col-span-2">
                      <div className="text-[12px] md:text-[16px]">{t('Volume')}:</div>
                      <InputNumber
                        id="exness-volume"
                        type="number"
                        placeholder={t('Volume')}
                        value={String(valueVolume)}
                        onChange={(e) => setValueVolume(Number(e.target.value))}
                        className="font-semibold mt-1 text-[12px] md:text-sm border border-gray-300 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none p-1 rounded w-full h-8 md:h-10 pl-2 shadow-sm shadow-gray-200 focus:outline-none focus:border-[var(--color-background)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-3">
                <Button
                  isLoading={loading}
                  onClick={() => {
                    !loading && handleSend();
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
                    resetValue();
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
    </>
  );
}

export default CloseOrderOdd;
