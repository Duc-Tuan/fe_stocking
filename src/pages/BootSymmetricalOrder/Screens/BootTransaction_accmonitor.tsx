import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import React, { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import Icon from '../../../assets/icon';
import { Button } from '../../../components/button';
import InputNumber from '../../../components/input';
import { LoadingOnly } from '../../../components/loading/indexOnly';
import TooltipCustom from '../../../components/tooltip';
import { useAppInfo } from '../../../hooks/useAppInfo';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { useCurrentPnl } from '../../../hooks/useCurrentPnl';
import type { AppDispatch } from '../../../store';
import { setServerMonitor } from '../../../store/transaction/transactionSlice';
import type { IOptions } from '../../../types/global';
import {
  convertData,
  convertTp,
  dataTypeAcc,
  OrderType,
  type IOrderSendAcc,
  type IOrderSendAccResponse,
} from '../type';
import SelectAccExness from './SelectAccExness';
import { postOpenOrderMonitorBoot } from '../../../api/boot';
import toast from 'react-hot-toast';

const initData: IOrderSendAcc[] = [
  {
    type: 'EXNESS',
    username: undefined,
    type_acc: undefined,
    tp: undefined,
    volume: undefined,
    acc_monitor: undefined,
    data: [],
  },
  {
    type: 'FUND',
    username: undefined,
    type_acc: undefined,
    tp: undefined,
    volume: undefined,
    acc_monitor: undefined,
    data: [],
  },
];

const paretypeOrder = (data: OrderType | undefined) => {
  switch (data) {
    case 0: // ORDER_TYPE_BUY
      return 'Xuôi';
    case 1: // ORDER_TYPE_SELL
      return 'Ngược';
    default:
      return undefined;
  }
};

export default function BootTransaction_AccMonitor() {
  const { t } = useTranslation();
  const { loadingServerMonitor, serverMonitor, serverMonitorActive, dataServerTransaction } = useAppInfo();
  const [data, setData] = useState<IOrderSendAcc[]>(initData);
  const [pip, setPip] = useState<number>(1);
  const { currentPnl } = useCurrentPnl();

  const [open, setOpen] = useState<boolean>(false);

  const isSubmit = useMemo(() => {
    return (
      data[0].tp !== undefined &&
      data[1].tp !== undefined &&
      data[0].volume !== undefined &&
      data[1].volume !== undefined &&
      data[0].type_acc !== undefined &&
      data[1].type_acc !== undefined &&
      data.find((i) => i.type === 'EXNESS')?.username !== undefined &&
      data.find((i) => i.type === 'FUND')?.username !== undefined
    );
  }, [data]);

  useEffect(() => {
    const dataNew = data.map((item, idx) => {
      if (idx === 0) {
        return {
          ...item,
          tp: convertTp(item.type_acc, currentPnl?.total_pnl, pip),
          data: convertData(currentPnl?.by_symbol, item.type_acc),
          acc_monitor: Number(serverMonitorActive?.value),
        };
      }
      return {
        ...item,
        tp: convertTp(item.type_acc, currentPnl?.total_pnl, pip),
        data: convertData(currentPnl?.by_symbol, item.type_acc),
        acc_monitor: Number(serverMonitorActive?.value),
      };
    });
    setData(dataNew);
  }, [pip, data[0].type_acc, currentPnl, serverMonitorActive]);

  const classInputHeder =
    'text-sm md:text-lg font-semibold border-b-2 caret-[var(--color-background)] text-center border-b-gray-300 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none p-1 w-full h-10 pl-2 focus:outline-none focus:border-b-[var(--color-background)]';
  const classInputBorder =
    'text-[12px] md:text-sm border border-gray-300 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none p-1 rounded w-full h-10 pl-2 shadow-sm shadow-gray-200 focus:outline-none focus:border-[var(--color-background)]';
  return (
    <div className="relative py-2 h-full flex flex-col justify-between items-center gap-1">
      <div className="w-full">
        <h1 className="text-center font-bold  text-[14px] md:text-lg text-shadow-sm">
          <span className="border-b border-b-gray-500">{t('Boot vào lệnh đối ứng theo thước')}</span>
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 w-full px-10 md:px-0 md:w-lg mx-auto mt-2">
          <div className="col-span-2 md:col-span-1 flex justify-center items-center">
            <h2 className="">
              {t('PNL của thước')}: {currentPnl?.total_pnl ?? t('loading...')}
            </h2>
          </div>

          <div className="col-span-2 md:col-span-1 flex justify-center items-center gap-1">
            <h2 className="text-[14px] md:text-sm w-full">{t('TP chênh lệch')}:</h2>
            <InputNumber
              type="number"
              placeholder={t('Nhập số chênh lệnh...')}
              value={String(pip)}
              onChange={(e) => {
                const dataNumber = Number(e.target.value);
                setPip(dataNumber);
                setData((prev) => [
                  { ...prev[0], tp: convertTp(prev[0].type_acc, currentPnl?.total_pnl, dataNumber) },
                  { ...prev[1], tp: convertTp(prev[1].type_acc, currentPnl?.total_pnl, dataNumber) },
                ]);
              }}
              className={classInputHeder}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 mt-4 gap-2 px-0 md:px-2">
          <div className="col-span-2 md:col-span-1 shadow shadow-gray-300 p-2 px-1 rounded">
            <div className="flex justify-center items-center flex-col gap-2">
              <h1 className="text-center text-[12px] md:text-[16px]">
                <span className="border-b border-b-gray-500">{t('Vào lệnh cho tài khoản tham chiếu')}</span>
              </h1>
              <div className="flex justify-start items-center gap-2 text-[12px] md:text-[16px]">
                {t('Exness')}:
                <SelectAccExness
                  dataAccTransaction={dataServerTransaction.filter(
                    (i) => i.type_acc === 'RECIPROCAL_ACC' && i.username !== data[1].username,
                  )}
                  setDataSubmit={setData}
                  dataSelect={data.find((i) => i.type === 'EXNESS')}
                  title="EXNESS"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2 px-2 md:px-1">
              <div className="flex flex-col justify-center items-start gap-1 col-span-1">
                <label htmlFor="exness-symbol" className="text-[12px] md:text-[16px]">
                  {t('Thước')}:
                </label>
                <SelectSymbol
                  setData={setData}
                  serverMonitor={serverMonitor}
                  loadingServerMonitor={loadingServerMonitor}
                  serverMonitorActive={serverMonitorActive}
                />
              </div>
              <div className="flex flex-col justify-center items-start gap-1 col-span-1">
                <label htmlFor="exness-symbol" className="text-[12px] md:text-[16px]">
                  {t('Kiểu lệnh')}:
                </label>
                <SeletType setValue={setData} />
              </div>
            </div>
            <div className="flex flex-col justify-center items-start gap-1 mb-2 px-2 md:px-1">
              <label htmlFor="exness-volume" className="text-[12px] md:text-[16px]">
                {t('Volume')}
              </label>
              <InputNumber
                id="exness-volume"
                type="number"
                placeholder={t('Volume')}
                value={data[0].volume ?? ''}
                onChange={(e) => setData((prev) => prev.map((i) => ({ ...i, volume: Number(e.target.value) })))}
                min={0}
                max={1}
                step={0.01}
                // className="border border-gray-300 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none p-1 rounded w-full h-10 pl-2 shadow-sm shadow-gray-200 focus:outline-none focus:border-[var(--color-background)]"
                className={`${classInputBorder}`}
              />
            </div>

            <div className="px-1 mb-2">
              <div className="mb-1">{t('Thông tin chi tiết từng cặp')}:</div>
              <div className="grid grid-cols-4 font-bold text-[14px]">
                <span className="border border-gray-200 py-1 text-center">{t('Cặp tiền')}</span>
                <span className="border border-gray-200 py-1 text-center">{t('Kiểu lệnh')}</span>
                <span className="border border-gray-200 py-1 text-center">{t('Giá hiện tại')}</span>
                <span className="border border-gray-200 py-1 text-center">{t('Lợi nhuận')}</span>
              </div>
              {data[0].data?.map((item: any, idx) => (
                <div key={idx} className="grid grid-cols-4 font-semibold text-[14px]">
                  <span className="border border-gray-200 py-0.5 text-center">{item.symbol}</span>
                  <span
                    className={`border border-gray-200 py-0.5 text-center ${
                      item.type === 'BUY' ? 'text-blue-500' : 'text-red-500'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="border border-gray-200 text-[var(--color-background)] py-0.5 text-center">
                    {item.current_price.toFixed(4)}
                  </span>
                  <span
                    className={`${
                      item.profit > 0 ? 'text-blue-500' : item.profit === 0 ? 'text-gray-500' : 'text-red-500'
                    } border border-gray-200 py-0.5 text-center`}
                  >
                    {item.profit.toFixed(4)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col justify-center items-start gap-1 mb-2 px-2 md:px-1">
              <div className="flex justify-start items-center gap-1">
                <label htmlFor="exness-tp" className="text-[12px] md:text-[16px]">
                  {t('Chốt lời (TP)')}:
                </label>
              </div>
              <InputNumber
                id="exness-tp"
                type="number"
                placeholder={t('TP')}
                disabled
                value={data[0].tp?.toFixed(2)}
                className={classInputBorder}
              />
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 shadow shadow-gray-300 p-2 px-1 rounded">
            <div className="flex justify-center items-center flex-col gap-2">
              <h1 className="text-center text-[12px] md:text-[16px]">
                <span className="border-b border-b-gray-500">{t('Vào lệnh cho tài khoản đối ứng của')}</span>
              </h1>
              <div className="flex justify-start items-center gap-2 text-[12px] md:text-[16px]">
                {t('Exness')}:
                <SelectAccExness
                  dataAccTransaction={dataServerTransaction.filter(
                    (i) => i.type_acc === 'RECIPROCAL_ACC' && i.username !== data[0].username,
                  )}
                  setDataSubmit={setData}
                  dataSelect={data.find((i) => i.type === 'FUND')}
                  title="FUND"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2 px-2 md:px-1">
              <div className="flex flex-col justify-center items-start gap-1 col-span-1">
                <label htmlFor="exness-symbol" className="text-[12px] md:text-[16px]">
                  {t('Thước')}:
                </label>
                <div className="border border-gray-300 p-1 rounded w-full h-10 pl-2 shadow-sm shadow-gray-200 flex justify-start items-center font-semibold text-[12px] md:text-sm">
                  {serverMonitorActive?.value ?? t('Chọn')}
                </div>
              </div>
              <div className="flex flex-col justify-center items-start gap-1 col-span-1">
                <label htmlFor="exness-symbol" className="text-[12px] md:text-[16px]">
                  {t('Kiểu lệnh')}:
                </label>
                <div className="border border-gray-300 p-1 rounded w-full h-10 pl-2 shadow-sm shadow-gray-200 flex justify-start items-center font-semibold text-[12px] md:text-sm">
                  {paretypeOrder(data[1].type_acc) ?? t('Chọn')}
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center items-start gap-1 mb-2 px-2 md:px-1">
              <div className="flex justify-start items-center gap-1">
                <label htmlFor="exness-volume" className="text-[12px] md:text-[16px]">
                  {t('Volume')}:
                </label>
              </div>
              <InputNumber
                id="exness-volume"
                type="number"
                disabled
                placeholder={t('Volume')}
                value={String(data[1].volume ?? '')}
                className={`${classInputBorder}`}
              />
            </div>

            <div className="px-1 mb-2">
              <div className="mb-1">{t('Thông tin chi tiết từng cặp')}:</div>
              <div className="grid grid-cols-4 font-bold text-[14px]">
                <span className="border border-gray-200 py-1 text-center">{t('Cặp tiền')}</span>
                <span className="border border-gray-200 py-1 text-center">{t('Kiểu lệnh')}</span>
                <span className="border border-gray-200 py-1 text-center">{t('Giá hiện tại')}</span>
                <span className="border border-gray-200 py-1 text-center">{t('Lợi nhuận')}</span>
              </div>
              {data[1].data?.map((item: any, idx) => (
                <div key={idx} className="grid grid-cols-4 font-semibold text-[14px]">
                  <span className="border border-gray-200 py-0.5 text-center">{item.symbol}</span>
                  <span
                    className={`border border-gray-200 py-0.5 text-center ${
                      item.type === 'BUY' ? 'text-blue-500' : 'text-red-500'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="border border-gray-200 text-[var(--color-background)] py-0.5 text-center">
                    {item.current_price.toFixed(4)}
                  </span>
                  <span
                    className={`${
                      item.profit > 0 ? 'text-blue-500' : item.profit === 0 ? 'text-gray-500' : 'text-red-500'
                    } border border-gray-200 py-0.5 text-center`}
                  >
                    {item.profit.toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-center items-start gap-1 mb-2 px-2 md:px-1">
              <div className="flex justify-start items-center gap-1">
                <label htmlFor="exness-tp" className="text-[12px] md:text-[16px]">
                  {t('Chốt lời (TP)')}:
                </label>
              </div>
              <InputNumber
                id="exness-tp"
                type="number"
                disabled
                placeholder={t('TP')}
                defaultValue={String(data[1].tp?.toFixed(2) ?? '')}
                className={`${classInputBorder}`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center w-full">
        <Button
          className={`${
            isSubmit ? 'bg-[var(--color-background)]' : 'bg-gray-300'
          } px-10 py-2 rounded cursor-pointer mt-2 md:mt-4 mr-2 text-[12px] md:text-[16px]`}
          onClick={() => {
            isSubmit && setOpen(true);
          }}
        >
          {t('Gửi lệnh')}
        </Button>
      </div>

      <Modal open={open} setOpen={setOpen} dataCurrent={data} />
    </div>
  );
}

const SelectSymbol = ({
  serverMonitor,
  setData,
  loadingServerMonitor,
  serverMonitorActive,
}: {
  serverMonitor: IOptions[];
  setData: any;
  loadingServerMonitor: boolean;
  serverMonitorActive: IOptions<string> | null;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const popupFilterStatusRef: any = useRef(null);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false); // để delay unmount

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

  const groupedOptions = serverMonitor.reduce((acc, item) => {
    const len = item.data?.length || 0;
    if (!acc[len]) acc[len] = [];
    acc[len].push(item);
    return acc;
  }, {} as Record<number, IOptions[]>);

  const handleClick = (selected: IOptions) => {
    setData((prev: any) => prev.map((i: any) => ({ ...i, acc_monitor: selected.value })));
    dispatch(setServerMonitor(selected));
    handleToggle();
  };

  return (
    <div ref={popupFilterStatusRef} className="z-20 h-10 w-full rounded relative border border-gray-300">
      <Button
        onClick={handleToggle}
        className="flex justify-between items-center gap-4 text-black p-1 rounded-none w-full cursor-pointer h-full shadow-sm shadow-gray-200 pl-2"
      >
        <div className="text-[12px] md:text-sm font-semibold">{serverMonitorActive?.value ?? t('Chọn')}</div>
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
          className={`transition-all duration-200 absolute top-full min-w-[204%] bg-white shadow-lg shadow-gray-300 rounded border border-gray-300 p-2 ${
            open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <div className="flex flex-row justify-center items-start gap-1">
            {loadingServerMonitor ? (
              <div className="min-h-[10vh] flex justify-center items-center">
                <LoadingOnly />
              </div>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                {Object.entries(groupedOptions)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([length, items]) => (
                    <div key={length}>
                      <div className="font-semibold mb-1 text-sm md:text-base">
                        {t('Các dãy')} {length}
                      </div>
                      <div className="grid md:grid-cols-5 grid-cols-4 gap-2">
                        {items.map((item: IOptions) => (
                          <React.Fragment key={item.value}>
                            <TooltipCustom
                              isButton
                              titleTooltip={
                                <>
                                  <div className="text-[12px] md:text-sm">
                                    {t('Tài khoản')}: {item?.value}
                                  </div>
                                  <div className="text-[12px] md:text-sm">
                                    {t('Máy chủ')}: {item?.label}
                                  </div>
                                  <div className="font-bold text-[12px] md:text-sm">
                                    {t('Cặp tiền')}: {JSON.stringify(item?.data)}
                                  </div>
                                </>
                              }
                            >
                              <Button
                                // disabled={isLoading}
                                // isLoading={isLoading}
                                onClick={() => handleClick(item)}
                                className={`flex justify-center items-center h-[32px] md:h-[36px] w-full rounded-lg ${
                                  item.value === serverMonitorActive?.value
                                    ? 'text-[var(--color-text)] bg-[var(--color-background)] active'
                                    : 'bg-gray-200 text-black hover:bg-[var(--color-background-opacity-5)] hover:text-[var(--color-text)] border border-rose-100 dark:hover:border-rose-200'
                                } cursor-pointer text-[12px] md:text-sm p-0`}
                                aria-current="page"
                              >
                                T {String(item?.value).slice(-6)}
                              </Button>
                            </TooltipCustom>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SeletType = ({ setValue }: { setValue: any }) => {
  const { t } = useTranslation();
  const popupFilterStatusRef: any = useRef(null);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false); // để delay unmount

  const [data, setData] = useState<IOrderSendAccResponse[]>(dataTypeAcc);

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
    <div ref={popupFilterStatusRef} className="h-10 w-full rounded relative border border-gray-300">
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
          className={`transition-all duration-200 absolute top-full w-full bg-white shadow-lg shadow-gray-300 rounded border border-gray-300 p-2 ${
            open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {data.map((item, idx) => {
            return (
              <Button
                onClick={() => {
                  setValue((prev: IOrderSendAcc[]) => [
                    { ...prev[0], type_acc: item.value },
                    { ...prev[1], type_acc: item.value === 0 ? 1 : 0 },
                  ]);
                  setData((prev) => prev.map((d) => ({ ...d, active: d.value === item.value })));
                  handleToggle();
                }}
                className={`${
                  item.active ? 'text-[var(--color-background)]' : 'text-black'
                }  shadow-none p-1 hover:bg-[var(--color-background-opacity-2)] w-full cursor-pointer hover:text-[var(--color-background)] rounded-none text-left text-[12px] md:text-md font-semibold`}
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

const Modal = ({
  open,
  setOpen,
  dataCurrent,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  dataCurrent: IOrderSendAcc[];
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = async () => {
    const dataNew = dataCurrent.map((i) => ({ ...i, type_acc: i.type_acc === 0 ? 'XUOI' : 'NGUOC' }));
    setLoading(true);
    await postOpenOrderMonitorBoot(dataNew)
      .then((data) => {
        if (data.data.status === 'success') {
          setOpen(false);
          toast.success('Vào lệnh thành công!');
        } else {
          toast.error(`Gửi lệnh thất bại`);
        }
      })
      .finally(() => setLoading(false));
  };

  const isTextColor = (data?: number) => {
    let color = '';
    switch (data) {
      case 0:
        color = 'text-blue-500';
        break;
      case 1:
        color = 'text-red-500';
        break;
      default:
        color = 'text-red-500';
        break;
    }
    return color;
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
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-2xl data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-white p-3">
              <div className="mt-3 text-center sm:mt-0 sm:text-left">
                <DialogTitle as="h1" className="text-lg font-semibold text-gray-900 text-center text-[16px]">
                  {t('Bạn xác nhận muốn mở lệnh')}
                </DialogTitle>
                <div className="mt-4 grid grid-cols-2 text-[12px] md:text-[16px]">
                  {dataCurrent.map((item, idx) => {
                    return (
                      <div
                        className={`col-span-1 border-r border-r-gray-300 ${idx === 1 ? 'border-none' : ''} px-1`}
                        key={idx}
                      >
                        <h1 className="text-center border border-gray-300  p-1">
                          {t('Tài khoản exness:')} {item.username}
                        </h1>
                        <div className="flex justify-start items-center gap-2">
                          <label htmlFor="exness-tp">{t('Thước')}:</label>
                          <div className="font-semibold">{item.acc_monitor}</div>
                        </div>
                        <div className="flex justify-start items-center gap-2">
                          <label htmlFor="exness-tp">{t('Kiểu lệnh')}:</label>
                          <div className={`font-semibold ${isTextColor(item.type_acc)}`}>
                            {item.type_acc === 0 ? 'Xuôi' : 'Ngược'}
                          </div>
                        </div>
                        <div className="flex justify-start items-center gap-2">
                          <label htmlFor="exness-tp">{t('Volume')}:</label>
                          <div className="font-semibold">{item.volume}</div>
                        </div>
                        <div className="flex justify-start items-center gap-2">
                          <label htmlFor="exness-tp">{t('Chốt lời (TP)')}:</label>
                          <div className="font-semibold">{item.tp?.toFixed(4)}</div>
                        </div>
                        <div className="">
                          <div className="mb-1 text-left">{t('Thông tin chi tiết từng cặp')}:</div>
                          <div className="grid grid-cols-2 md:grid-cols-3 font-bold text-[14px]">
                            <span className="border border-gray-200 py-1 text-center">{t('Cặp tiền')}</span>
                            <span className="border border-gray-200 py-1 text-center">{t('Kiểu lệnh')}</span>
                            <span className="border border-gray-200 py-1 text-center hidden md:block">
                              {t('Giá hiện tại')}
                            </span>
                          </div>
                          {item.data?.map((item: any, idx) => (
                            <div key={idx} className="grid grid-cols-2 md:grid-cols-3 font-semibold text-[14px]">
                              <span className="border border-gray-200 py-0.5 text-center">{item.symbol}</span>
                              <span
                                className={`border border-gray-200 py-0.5 text-center ${
                                  item.type === 'BUY' ? 'text-blue-500' : 'text-red-500'
                                }`}
                              >
                                {item.type}
                              </span>
                              <span className="border border-gray-200 text-[var(--color-background)] py-0.5 text-center hidden md:block">
                                {item.current_price?.toFixed(4)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-3 flex flex-row-reverse justify-start items-center gap-2">
              <Button
                isLoading={loading}
                onClick={() => {
                  !loading && handleClick();
                }}
                type="button"
                className="shadow-gray-400 cursor-pointer inline-flex w-full justify-center rounded-sm bg-[var(--color-background)] px-3 py-2 text-sm font-semibold text-white shadow-md sm:w-auto"
              >
                {t('Xác nhận')}
              </Button>
              <Button
                type="button"
                data-autofocus
                onClick={() => setOpen(false)}
                className="shadow-gray-400 cursor-pointer inline-flex w-full justify-center rounded-sm bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-md inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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
