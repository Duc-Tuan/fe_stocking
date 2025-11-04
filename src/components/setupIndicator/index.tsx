import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../assets/icon';
import { initSetupIndicator, type ISetupIndicator } from '../../types/global';
import { Button } from '../button';
import InputNumber from '../input';

export default function SetupIndicator({
  open,
  setOpen,
  data,
  title,
  setDataCurrent,
}: {
  open: boolean;
  title: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
  data: ISetupIndicator;
  setDataCurrent: Dispatch<SetStateAction<ISetupIndicator>>;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState<ISetupIndicator>(initSetupIndicator);

  useEffect(() => {
    setValue(data);
  }, [data]);

  const classInputBorder =
    'text-[12px] md:text-sm border border-gray-300 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none p-1 rounded w-full h-10 pl-2 shadow-sm shadow-gray-200 focus:outline-none focus:border-[var(--color-background)]';
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
                  {t('Cài đặt thông số cho chỉ báo')} {title.toLocaleUpperCase()}
                </DialogTitle>

                <div className="mt-4">
                  <div className="">
                    <div className="flex justify-start items-center gap-1">
                      <div className="text-[12px] md:text-[16px] text-left mb-1">{t('Đường ranh giới')} 1:</div>
                      <Button
                        onClick={() =>
                          setValue((prev) => ({
                            ...prev,
                            outerLines: undefined,
                          }))
                        }
                        className={
                          'bg-[var(--color-background)] w-[18px] h-[18px] rounded-2xl p-0 cursor-pointer flex justify-center items-center'
                        }
                      >
                        <Icon name="icon-refresh" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col justify-center items-start gap-1 mb-3">
                        <div className="text-[10px] md:text-[14px] text-left mb-1">{t('Đường trên')}:</div>
                        <InputNumber
                          type="number"
                          placeholder={t('Nhập vào...')}
                          step={0.01}
                          value={String(value.outerLines?.[0] ?? '')}
                          onChange={(e) => {
                            setValue((prev) => ({
                              ...prev,
                              outerLines: [Number(e.target.value), prev.outerLines?.[1] ?? undefined],
                            }));
                          }}
                          className={classInputBorder}
                        />
                      </div>
                      <div className="flex flex-col justify-center items-start gap-1 mb-3">
                        <div className="text-[10px] md:text-[14px] text-left mb-1">{t('Đường dưới')}:</div>
                        <InputNumber
                          type="number"
                          placeholder={t('Nhập vào...')}
                          value={String(value.outerLines?.[1] ?? '')}
                          onChange={(e) => {
                            setValue((prev) => ({
                              ...prev,
                              outerLines: [prev.outerLines?.[0] ?? undefined, Number(e.target.value)],
                            }));
                          }}
                          className={classInputBorder}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="">
                    <div className="flex justify-start items-center gap-1">
                      <div className="text-[12px] md:text-[16px] text-left mb-1">{t('Đường ranh giới')} 2:</div>
                      <Button
                        onClick={() =>
                          setValue((prev) => ({
                            ...prev,
                            innerLines: undefined,
                          }))
                        }
                        className={
                          'bg-[var(--color-background)] w-[18px] h-[18px] rounded-2xl p-0 cursor-pointer flex justify-center items-center'
                        }
                      >
                        <Icon name="icon-refresh" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col justify-center items-start gap-1 mb-3">
                        <div className="text-[10px] md:text-[14px] text-left mb-1">{t('Đường trên')}:</div>
                        <InputNumber
                          type="number"
                          placeholder={t('Nhập vào...')}
                          step={0.01}
                          value={String(value.innerLines?.[0] ?? '')}
                          onChange={(e) => {
                            setValue((prev) => ({
                              ...prev,
                              innerLines: [Number(e.target.value), prev.innerLines?.[1] ?? undefined],
                            }));
                          }}
                          className={classInputBorder}
                        />
                      </div>
                      <div className="flex flex-col justify-center items-start gap-1 mb-3">
                        <div className="text-[10px] md:text-[14px] text-left mb-1">{t('Đường dưới')}:</div>
                        <InputNumber
                          type="number"
                          placeholder={t('Nhập vào...')}
                          value={String(value.innerLines?.[1] ?? '')}
                          onChange={(e) => {
                            setValue((prev) => ({
                              ...prev,
                              innerLines: [prev.innerLines?.[0] ?? undefined, Number(e.target.value)],
                            }));
                          }}
                          className={classInputBorder}
                        />
                      </div>
                    </div>
                  </div>
                  <div className={`grid ${title === "macd" ? "grid-cols-3": "grid-cols-2"} gap-2`}>
                    <div className="col-span-1">
                      <div className="flex justify-start items-center gap-1">
                        <div className="text-[12px] md:text-[16px] text-left mb-1">{t('Đường lẻ')}:</div>
                        <Button
                          onClick={() =>
                            setValue((prev) => ({
                              ...prev,
                              midline: undefined,
                            }))
                          }
                          className={
                            'bg-[var(--color-background)] w-[18px] h-[18px] rounded-2xl p-0 cursor-pointer flex justify-center items-center'
                          }
                        >
                          <Icon name="icon-refresh" />
                        </Button>
                      </div>

                      <InputNumber
                        type="number"
                        placeholder={t('Nhập vào...')}
                        value={String(value.midline ?? '')}
                        onChange={(e) => {
                          setValue((prev) => ({
                            ...prev,
                            midline: Number(e.target.value),
                          }));
                        }}
                        className={classInputBorder}
                      />
                    </div>
                    <div className="col-span-1">
                      <div className="flex justify-start items-center gap-1">
                        <div className="text-[12px] md:text-[16px] text-left mb-1">{t('Period')}:</div>
                      </div>

                      <InputNumber
                        type="number"
                        placeholder={t('Nhập vào...')}
                        value={String(value.period ?? '')}
                        onChange={(e) => {
                          setValue((prev) => ({
                            ...prev,
                            period: Number(e.target.value),
                          }));
                        }}
                        className={classInputBorder}
                      />
                    </div>
                    <div className="col-span-1">
                      <div className="flex justify-start items-center gap-1">
                        <div className="text-[12px] md:text-[16px] text-left mb-1">{t('Period EMA')}:</div>
                      </div>

                      <InputNumber
                        type="number"
                        placeholder={t('Nhập vào...')}
                        value={String(value.periodEMA ?? '')}
                        onChange={(e) => {
                          setValue((prev) => ({
                            ...prev,
                            periodEMA: Number(e.target.value),
                          }));
                        }}
                        className={classInputBorder}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-2 sm:flex sm:flex-row-reverse sm:px-3">
              <Button
                onClick={() => {
                  setOpen(false);
                  setDataCurrent({ ...value, isOpen: true });
                }}
                type="button"
                className="shadow-gray-400 cursor-pointer inline-flex w-full justify-center rounded-md bg-[var(--color-background)] px-3 py-1.5 text-sm font-semibold text-white shadow-md sm:ml-3 sm:w-auto"
              >
                {t('Xác nhận')}
              </Button>
              <Button
                type="button"
                data-autofocus
                onClick={() => setOpen(false)}
                className="shadow-gray-400 cursor-pointer inline-flex w-full justify-center rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-md inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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
