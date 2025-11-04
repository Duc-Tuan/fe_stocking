import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../assets/icon';
import { Button } from '../../components/button';
import { LoadingOnly } from '../../components/loading/indexOnly';
import TooltipCustom from '../../components/tooltip';
import { useAppInfo } from '../../hooks/useAppInfo';
import type { IOptions } from '../../types/global';
import InputNumber from '../../components/input';

function CompareCurrencyPair({
  serverIdCurrent,
  max = 4,
  handleGetCompare,
  setDataCompare,
  dataCompare,
}: {
  serverIdCurrent: number;
  max?: number;
  handleGetCompare: any;
  setDataCompare: React.Dispatch<React.SetStateAction<IOptions<string>[]>>;
  dataCompare: IOptions<string>[];
}) {
  const { t } = useTranslation();
  const { loadingServerMonitor, serverMonitor } = useAppInfo();
  const [open, setOpen] = useState<boolean>(false);
  const [applyNumberCandle, setApplyNumberCandle] = useState<number>(100)

  useEffect(() => {
    if (!loadingServerMonitor) {
      const dataNew = serverMonitor.map((i) => ({ ...i, active: false }));
      setDataCompare(dataNew);
    }
  }, [serverMonitor]);

  const groupedOptions = dataCompare.reduce((acc, item) => {
    const len = item.data?.length || 0;
    if (!acc[len]) acc[len] = [];
    acc[len].push(item);
    return acc;
  }, {} as Record<number, IOptions[]>);

  return (
    <>
      <TooltipCustom
        handleClick={() => {
          setOpen(true);
        }}
        titleTooltip="So sánh với các thước khác"
        classNameButton={`${
          true ? 'bg-[var(--color-background)] text-white' : 'text-black bg-gray-200'
        }  md:w-[40px] md:h-[40px] w-[32px] h-[32px]`}
      >
        <Icon name="icon-compare" width={20} height={20} />
      </TooltipCustom>

      <Dialog open={open} onClose={setOpen} className="relative z-100">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-2xl data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-white p-4">
                <DialogTitle as="h1" className="text-md font-bold text-[var(--color-background)]">
                  {t('Thước')} {serverIdCurrent}
                </DialogTitle>
                <div className="flex justify-between items-center">
                  <DialogTitle as="h1" className="text-md md:text-lg font-bold text-gray-900">
                    {t('So sánh')}
                  </DialogTitle>
                  <div className="flex justify-center items-center gap-2">
                    <div className="text-[14px] md:text-base w-full">{t('Số cây nến áp dụng')}:</div>
                    <InputNumber
                      id="exness-price"
                      type="number"
                      placeholder={t('Nhập số cây nến...')}
                      value={String(applyNumberCandle)}
                      onChange={(e) => {
                        const price = Number(e.target.value);
                        setApplyNumberCandle(price);
                      }}
                      className="text-[12px] md:text-sm border border-gray-300 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none p-1 rounded w-[100px] h-10 pl-2 shadow-sm shadow-gray-200 focus:outline-none focus:border-[var(--color-background)]"
                    />
                  </div>
                </div>

                <div className="my-2">
                  <div className="">
                    <div className="mb-1">{t('Các dãy dùng để so sánh')}:</div>

                    <div className="min-h-[36px]">
                      {dataCompare.filter((i) => i.active).length === 0 ? (
                        <div className="flex justify-center items-center min-h-[36px] text-gray-400">
                          {t('Hiện đang trống')}
                        </div>
                      ) : (
                        <div className="grid grid-cols-5 gap-2">
                          {dataCompare
                            .filter((i) => i.active)
                            .map((i, _idx) => (
                              <div className="w-full flex flex-col justify-center items-center gap-1" key={i.value}>
                                <Button
                                  onClick={() => {
                                    setDataCompare((prev) => {
                                      return prev.map((a) => {
                                        if (a.value === i.value) {
                                          return {
                                            ...a,
                                            active: false,
                                          };
                                        }
                                        return a;
                                      });
                                    });
                                  }}
                                  className={`w-full flex justify-center items-center h-[32px] md:h-[36px] rounded-sm text-[var(--color-text)] bg-[var(--color-background)] active cursor-pointer text-[12px] md:text-sm p-0`}
                                >
                                  {i.value}
                                </Button>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="">{t('Chọn các dãy')}:</div>
                    {loadingServerMonitor ? (
                      <div className="min-h-[200px] flex justify-center items-center">
                        <LoadingOnly />
                      </div>
                    ) : (
                      Object.entries(groupedOptions)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([length, items]) => (
                          <div key={length} className="mt-1">
                            <div className="flex justify-between items-center gap-2">
                              <div className="font-semibold mb-1 text-sm md:text-base">
                                {t('Các dãy')} {length}:
                              </div>
                              <button
                                className="flex items-center justify-center cursor-pointer"
                                onClick={() => {
                                  const dataNew = dataCompare
                                    .filter((i) => Number(i.value) !== serverIdCurrent)
                                    .map((d) => {
                                      const isCheck = items.find((i) => i.value === d.value);
                                      const isCheckAll = items.filter((i) => i.active).length === Number(length) - 1;
                                      if (isCheck) {
                                        return {
                                          ...d,
                                          active: isCheckAll ? !isCheck.active : true,
                                        };
                                      }
                                      return d;
                                    });
                                  setDataCompare(dataNew);
                                }}
                              >
                                <input
                                  checked={items.filter((i) => i.active).length === Number(length) - 1}
                                  readOnly
                                  type="checkbox"
                                  value=""
                                  className="custom-checkbox cursor-pointer appearance-none bg-gray-100 checked:bg-[var(--color-background)] w-4 h-4 rounded-sm dark:bg-white border border-[var(--color-background)] ring-offset-[var(--color-background)]"
                                />
                                <label
                                  htmlFor="green-checkbox"
                                  className="cursor-pointer ms-2 mb-0.5 text-sm font-medium text-gray-900 dark:text-gray-900"
                                >
                                  {t('Chọn tất cả')}
                                </label>
                              </button>
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                              {items
                                .filter((i) => Number(i.value) !== serverIdCurrent)
                                .map((item: IOptions) => (
                                  <Button
                                    key={item.value}
                                    onClick={() => {
                                      const activeList = dataCompare.filter((d) => d.active);
                                      const dd = dataCompare.map((a) => {
                                        let dataNew = a;
                                        if (
                                          activeList.length === max &&
                                          a.value === activeList[0].value &&
                                          !activeList.some((z) => z.value === item.value)
                                        ) {
                                          dataNew = {
                                            ...a,
                                            active: false,
                                          };
                                        }
                                        if (a.value === item.value) {
                                          dataNew = {
                                            ...a,
                                            active: a.value === item.value,
                                          };
                                        }
                                        return dataNew;
                                      });
                                      setDataCompare(dd);
                                    }}
                                    className={`flex justify-center items-center h-[32px] md:h-[36px] rounded-sm ${
                                      // item.value === serverMonitorActive?.value
                                      false
                                        ? 'text-[var(--color-text)] bg-[var(--color-background)] active'
                                        : 'bg-gray-200 text-black hover:bg-[var(--color-background-opacity-5)] hover:text-[var(--color-text)] border border-rose-100 dark:hover:border-rose-200'
                                    } cursor-pointer text-[12px] md:text-sm p-0`}
                                    aria-current="page"
                                  >
                                    {item?.value}
                                  </Button>
                                ))}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                <div className="flex justify-end items-center gap-1 mt-4">
                  <Button
                    type="button"
                    data-autofocus
                    onClick={() => setOpen(false)}
                    className="shadow-gray-400 cursor-pointer inline-flex w-full justify-center rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-md inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    {t('Hủy')}
                  </Button>
                  <Button
                    onClick={() => {
                      setDataCompare((prev) => prev.map((i) => ({ ...i, active: false })));
                      handleGetCompare([], applyNumberCandle);
                      setOpen(false);
                    }}
                    type="button"
                    className="shadow-gray-400 cursor-pointer inline-flex w-full justify-center rounded-md bg-[var(--color-background)] px-3 py-1.5 text-sm font-semibold text-white shadow-md sm:w-auto"
                  >
                    {t('Làm mới')}
                  </Button>

                  <Button
                    onClick={() => {
                      handleGetCompare(dataCompare.filter((i) => i.active), applyNumberCandle);
                      setOpen(false);
                    }}
                    type="button"
                    className="shadow-gray-400 cursor-pointer inline-flex w-full justify-center rounded-md bg-[var(--color-background)] px-3 py-1.5 text-sm font-semibold text-white shadow-md sm:w-auto"
                  >
                    {t('Xác nhận')}
                  </Button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default CompareCurrencyPair;
