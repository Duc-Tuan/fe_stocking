import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../assets/icon';
import { Button } from '../../../components/button';
import InputNumber from '../../../components/input';
import TooltipCustom from '../../../components/tooltip';
import { useClickOutside } from '../../../hooks/useClickOutside';
import {
  calculateTpSl,
  dataSymbols,
  dataType,
  OrderType,
  type IOrderSend,
  type IOrderSendResponse,
  type OrderSide,
} from '../type';
import { useSocket } from '../../../hooks/useWebSocket';
import { postOpenOrderBoot } from '../../../api/boot';
import toast from 'react-hot-toast';
import { useAppInfo } from '../../../hooks/useAppInfo';

const initData: IOrderSend[] = [
  {
    type: 'EXNESS',
    username: undefined,
    data: {
      price: undefined,
      sl: undefined,
      tp: undefined,
      symbol: undefined,
      type: undefined,
      volume: undefined,
    },
  },
  {
    type: 'FUND',
    username: undefined,
    data: {
      price: undefined,
      sl: undefined,
      tp: undefined,
      symbol: undefined,
      type: undefined,
      volume: undefined,
    },
  },
];

const typeOrder = (data: OrderType | undefined) => {
  switch (data) {
    case 0: // ORDER_TYPE_BUY
      return 1;
    case 1: // ORDER_TYPE_SELL
      return 0;
    case 2: // ORDER_TYPE_BUY_LIMIT
      return 5;
    case 3: // ORDER_TYPE_SELL_LIMIT
      return 4;
    case 4: // ORDER_TYPE_BUY_STOP
      return 3;
    case 5: // ORDER_TYPE_SELL_STOP
      return 2;
  }
};

const paretypeOrder = (data: OrderType | undefined) => {
  switch (data) {
    case 0: // ORDER_TYPE_BUY
      return 'BUY';
    case 1: // ORDER_TYPE_SELL
      return 'SELL';
    case 2: // ORDER_TYPE_BUY_LIMIT
      return 'BUY_LIMIT';
    case 3: // ORDER_TYPE_SELL_LIMIT
      return 'SELL_LIMIT';
    case 4: // ORDER_TYPE_BUY_STOP
      return 'BUY_STOP';
    case 5: // ORDER_TYPE_SELL_STOP
      return 'SELL_STOP';
  }
};

export default function BootTransaction() {
  const { t } = useTranslation();
  const { dataServerTransaction } = useAppInfo();
  const [data, setData] = useState<IOrderSend[]>(initData);
  const [coefficient, setCoefficient] = useState<number>(3.75);
  const [difference, setDifference] = useState<number>(0.9);
  const [pip, setPip] = useState<number>(63);
  const [open, setOpen] = useState<boolean>(false);
  const [serverId, setServerId] = useState<number | null>(null);

  useEffect(() => {
    const dataAccTransaction = dataServerTransaction.filter((i) => i.type_acc === 'RECIPROCAL');
    // .map((i, idx) => {
    //   if (idx === 1) {
    //     return {
    //       ...i,
    //       server: 'WeMasterTrade-Virtual',
    //     };
    //   }
    //   return i;
    // });
    const dataExness = dataAccTransaction.find((i) => i.server.includes('Exness'));
    const dataFunc = dataAccTransaction.find((i) => i.server.includes('WeMasterTrade'));

    setData((prev) =>
      prev.map((i, idx) => {
        if (idx === 0) {
          return {
            ...i,
            type: 'EXNESS',
            username: Number(dataExness?.username),
          };
        }
        return {
          ...i,
          type: 'FUND',
          username: Number(dataFunc?.username),
        };
      }),
    );
  }, [dataServerTransaction]);

  const isSubmit = useMemo(() => {
    const dataa = data[0].data;
    // if (dataa.type === 0 || dataa.type === 1) {
    //   return dataa.price && dataa.sl && dataa.symbol && dataa.tp && dataa.volume;
    // } else {
    //   return dataa.price && dataa.sl && dataa.symbol && dataa.tp && dataa.volume;
    // }
    return (
      dataa.price &&
      dataa.sl &&
      dataa.symbol &&
      dataa.tp &&
      dataa.volume &&
      data.find((i) => i.type === 'EXNESS')?.username &&
      data.find((i) => i.type === 'FUND')?.username
    );
  }, [data]);

  const { dataBoot } = useSocket(import.meta.env.VITE_URL_API, 'boot_opposition', serverId, data[0].data.symbol);

  const priceDataBoot = (d: any) => {
    let price = 0;
    if (dataBoot) {
      switch (d.data.type) {
        case 0:
        case 2:
        case 4:
          price = dataBoot.ask;
          break;
        case 1:
        case 3:
        case 5:
          price = dataBoot.bid;
          break;
        default:
          price = 0;
          break;
      }
    }
    return price;
  };

  const addDifference = (d: any, pair: string) => {
    let price = 0;
    const pipSize = pair.includes('JPY') ? 0.01 : 0.0001;
    if (dataBoot) {
      switch (d.data.type) {
        case 0:
        case 2:
        case 4:
          price = 0 - difference * pipSize;
          break;
        case 1:
        case 3:
        case 5:
          price = difference * pipSize;
          break;
        default:
          price = 0;
          break;
      }
    }
    return price;
  };

  useEffect(() => {
    if (data[0].data.type === 0 || data[0].data.type === 1) {
      setData((prev) => {
        const isSymbol = prev[0].data.symbol === 'USDJPY' ? 'JPY' : 'EUR/USD';
        return [
          {
            ...prev[0],
            data: {
              ...prev[0].data,
              price: priceDataBoot(prev[0]),
              tp: calculateTpSl(
                priceDataBoot(prev[0]),
                pip - 0.5,
                isSymbol,
                paretypeOrder(prev[0].data.type) as OrderSide,
              ).tp,
              sl: calculateTpSl(priceDataBoot(prev[0]), pip, isSymbol, paretypeOrder(prev[0].data.type) as OrderSide)
                .sl,
            },
          },
          {
            ...prev[1],
            data: {
              ...prev[1].data,
              price: priceDataBoot(prev[1]),
              tp:
                calculateTpSl(
                  priceDataBoot(prev[0]),
                  pip - 0.5,
                  isSymbol,
                  paretypeOrder(prev[1].data.type) as OrderSide,
                ).tp + addDifference(prev[0], isSymbol),
              sl:
                calculateTpSl(priceDataBoot(prev[0]), pip, isSymbol, paretypeOrder(prev[1].data.type) as OrderSide).sl +
                addDifference(prev[0], isSymbol),
            },
          },
        ];
      });
    }
  }, [dataBoot, pip, difference]);

  const isTextColor = (data: any) => {
    let color = '';
    switch (data) {
      case 0:
      case 2:
      case 4:
        color = 'text-blue-500';
        break;
      case 1:
      case 3:
      case 5:
        color = 'text-red-500';
        break;
      default:
        color = 'text-red-500';
        break;
    }
    return color;
  };

  const isText = (data: any) => {
    let text = '';
    switch (data) {
      case 0:
      case 2:
      case 4:
        text = 'ask';
        break;
      case 1:
      case 3:
      case 5:
        text = 'bid';
        break;
      default:
        text = 'bid';
        break;
    }
    return text;
  };

  const classInputHeder =
    'text-sm md:text-lg font-semibold border-b-2 caret-[var(--color-background)] text-center border-b-gray-300 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none p-1 w-full h-10 pl-2 focus:outline-none focus:border-b-[var(--color-background)]';
  const classInputBorder =
    'text-[12px] md:text-sm border border-gray-300 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none p-1 rounded w-full h-10 pl-2 shadow-sm shadow-gray-200 focus:outline-none focus:border-[var(--color-background)]';
  return (
    <div className="relative pb-2">
      <h1 className="text-center font-bold  text-[14px] md:text-lg text-shadow-sm">
        <span className="border-b border-b-gray-500">{t('Boot vào lệnh đối ứng')}</span>
      </h1>

      <div className="grid grid-cols-3 gap-4 w-sm md:w-lg mx-auto mt-6">
        <div className="col-span-1">
          <InputNumber
            type="number"
            placeholder={t('Nhập hệ số...')}
            value={String(difference)}
            onChange={(e) => {
              setDifference(Number(e.target.value));
              setData((prev) => [
                {
                  ...prev[0],
                  data: {
                    ...prev[0].data,
                    price: prev[0].data.price,
                    tp: prev[0].data.tp,
                    sl: prev[0].data.sl,
                  },
                },
                {
                  ...prev[1],
                  data: {
                    ...prev[1].data,
                    price: prev[1].data.price,
                    tp: prev[1].data.tp,
                    sl: prev[1].data.sl,
                  },
                },
              ]);
            }}
            className={classInputHeder}
          />
          <h2 className="text-[12px] md:text-sm text-center text-gray-500 mt-1">{t('Hệ số lệch(Quỹ) sl, tp')}</h2>
        </div>
        <div className="col-span-1">
          <InputNumber
            type="number"
            placeholder={t('Nhập hệ số...')}
            value={String(coefficient)}
            onChange={(e) => {
              setCoefficient(Number(e.target.value));
              setData((prev) => [
                {
                  ...prev[0],
                },
                {
                  ...prev[1],
                  data: {
                    ...prev[1].data,
                    volume: Number(prev[0].data.volume) * Number(e.target.value),
                  },
                },
              ]);
            }}
            className={classInputHeder}
          />
          <h2 className="text-[12px] md:text-sm text-center text-gray-500 mt-1">{t('Hệ số nhân volume')}</h2>
        </div>

        <div className="col-span-1">
          <InputNumber
            type="number"
            placeholder={t('Nhập số pip...')}
            value={String(pip)}
            onChange={(e) => {
              if (Number(e.target.value) >= 1000) return;
              setPip(Number(e.target.value));
              setData((prev) => {
                const price = Number(prev[0].data.price);
                const isSymbol = prev[0].data.symbol === 'USDJPY' ? 'JPY' : 'EUR/USD';
                return [
                  {
                    ...prev[0],
                    data: {
                      ...prev[0].data,
                      tp: calculateTpSl(
                        price,
                        Number(e.target.value) - 0.5,
                        isSymbol,
                        paretypeOrder(prev[0].data.type) as OrderSide,
                      ).tp,
                      sl: calculateTpSl(
                        price,
                        Number(e.target.value),
                        isSymbol,
                        paretypeOrder(prev[0].data.type) as OrderSide,
                      ).sl,
                    },
                  },
                  {
                    ...prev[1],
                    data: {
                      ...prev[1].data,
                      tp:
                        calculateTpSl(
                          price,
                          Number(e.target.value) - 0.5,
                          isSymbol,
                          paretypeOrder(prev[1].data.type) as OrderSide,
                        ).tp + addDifference(prev[0], isSymbol),
                      sl:
                        calculateTpSl(
                          price,
                          Number(e.target.value),
                          isSymbol,
                          paretypeOrder(prev[1].data.type) as OrderSide,
                        ).sl + addDifference(prev[0], isSymbol),
                    },
                  },
                ];
              });
            }}
            className={classInputHeder}
          />
          <h2 className="text-[12px] md:text-sm text-center text-gray-500 mt-1">{t('Số pip tính sl, tp')}</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 mt-4 gap-2 px-0 md:px-2">
        <div className="col-span-1 shadow shadow-gray-300 p-0 md:p-2 rounded">
          <h1 className="text-center text-[12px] md:text-[16px]">
            <span className="border-b border-b-gray-500">
              {t('Vào lệnh cho tài khoản tham chiếu')}
              {data.find((i) => i.type === 'EXNESS')?.username ? `(Exness: ${data[0].username})` : `(${t('Trống')})`}
            </span>
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-4 px-2 md:px-4">
            <div className="flex flex-col justify-center items-start gap-1 col-span-1">
              <label htmlFor="exness-symbol" className="text-[12px] md:text-[16px]">
                {t('Cặp tiền')} (
                <span className={isTextColor(data[0].data.type)}>
                  {isText(data[0].data.type)}: {priceDataBoot(data[0]).toFixed(7)}
                </span>
                ):
              </label>
              <SeletSymbol setValue={setData} setServerId={setServerId} />
            </div>
            <div className="flex flex-col justify-center items-start gap-1 col-span-1">
              <label htmlFor="exness-symbol" className="text-[12px] md:text-[16px]">
                {t('Kiểu lệnh')}:
              </label>
              <SeletType setValue={setData} />
            </div>
          </div>
          <div className="flex flex-col justify-center items-start gap-1 mb-3 px-2 md:px-4">
            <label htmlFor="exness-volume" className="text-[12px] md:text-[16px]">
              {t('Volume')}
            </label>
            <InputNumber
              id="exness-volume"
              type="number"
              placeholder={t('Volume')}
              value={String(data[0].data.volume ?? '')}
              onChange={(e) =>
                setData((prev) => [
                  {
                    ...prev[0],
                    data: { ...prev[0].data, volume: Number(e.target.value) > 1.5 ? 1.5 : Number(e.target.value) },
                  },
                  {
                    ...prev[1],
                    data: {
                      ...prev[1].data,
                      volume: (Number(e.target.value) > 1.5 ? 1.5 : Number(e.target.value)) * coefficient,
                    },
                  },
                ])
              }
              min={0}
              max={1}
              step={0.01}
              // className="border border-gray-300 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none p-1 rounded w-full h-10 pl-2 shadow-sm shadow-gray-200 focus:outline-none focus:border-[var(--color-background)]"
              className={`${classInputBorder}`}
            />
          </div>
          <div className="flex flex-col justify-center items-start gap-1 mb-3 px-2 md:px-4">
            <label htmlFor="exness-price" className="text-[12px] md:text-[16px]">
              {t('Giá vào')}:
            </label>
            <InputNumber
              id="exness-price"
              type="number"
              placeholder={t('Giá vào')}
              step={0.01}
              value={String(data[0].data.price ?? '')}
              disabled={data[0].data.type === 0 || data[0].data.type === 1 || data[0].data.type === undefined}
              onChange={(e) => {
                const price = Number(e.target.value);
                setData((prev) => {
                  const isSymbol = prev[0].data.symbol === 'USDJPY' ? 'JPY' : 'EUR/USD';
                  return [
                    {
                      ...prev[0],
                      data: {
                        ...prev[0].data,
                        price: price,
                        tp: calculateTpSl(price, pip - 0.5, isSymbol, paretypeOrder(prev[0].data.type) as OrderSide).tp,
                        sl: calculateTpSl(price, pip, isSymbol, paretypeOrder(prev[0].data.type) as OrderSide).sl,
                      },
                    },
                    {
                      ...prev[1],
                      data: {
                        ...prev[1].data,
                        price: price,
                        tp: calculateTpSl(price, pip - 0.5, isSymbol, paretypeOrder(prev[1].data.type) as OrderSide).tp,
                        sl: calculateTpSl(price, pip, isSymbol, paretypeOrder(prev[1].data.type) as OrderSide).sl,
                      },
                    },
                  ];
                });
              }}
              className={`${
                data[0].data.type === 0 || data[0].data.type === 1 || data[0].data.type === undefined
                  ? 'bg-gray-100'
                  : ''
              }  ${classInputBorder}`}
            />
          </div>
          <div className="flex flex-col justify-center items-start gap-1 mb-3 px-2 md:px-4">
            <div className="flex justify-start items-center gap-1">
              <label htmlFor="exness-sl" className="text-[12px] md:text-[16px]">
                {t('Cắt lỗ (SL)')}:
              </label>
              <TooltipCustom titleTooltip={`${t('Số pip')}: ${pip}`} placement="top" classNameButton="bg-none" isButton>
                <Icon name="icon-help" className="cursor-help" width={16} height={16} />
              </TooltipCustom>
            </div>
            <InputNumber
              id="exness-sl"
              type="number"
              placeholder={t('SL')}
              value={String(data[0].data.sl ?? '')}
              disabled
              className={`${
                data[0].data.type === 0 || data[0].data.type === 1 || data[0].data.type === undefined
                  ? 'bg-gray-100'
                  : ''
              }  ${classInputBorder}`}
            />
          </div>
          <div className="flex flex-col justify-center items-start gap-1 mb-3 px-2 md:px-4">
            <div className="flex justify-start items-center gap-1">
              <label htmlFor="exness-tp" className="text-[12px] md:text-[16px]">
                {t('Chốt lời (TP)')}:
              </label>
              <TooltipCustom
                titleTooltip={`${t('Số pip')} ${Number(pip) - 0.5}`}
                placement="top"
                classNameButton="bg-none"
                isButton
              >
                <Icon name="icon-help" className="cursor-help" width={16} height={16} />
              </TooltipCustom>
            </div>
            <InputNumber
              id="exness-tp"
              type="number"
              placeholder={t('TP')}
              value={String(data[0].data.tp ?? '')}
              disabled
              className={`${
                data[0].data.type === 0 || data[0].data.type === 1 || data[0].data.type === undefined
                  ? 'bg-gray-100'
                  : ''
              }  ${classInputBorder}`}
            />
          </div>
        </div>

        <div className="col-span-1 shadow shadow-gray-300 p-0 md:p-2 rounded">
          <h1 className="text-center text-[12px] md:text-[16px]">
            <span className="border-b border-b-gray-500">
              {t('Vào lệnh cho tài khoản đối ứng của')}
              {data.find((i) => i.type === 'FUND')?.username ? `(${t('Quỹ')}: ${data[1].username})` : `(${t('Trống')})`}
            </span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-4 px-2 md:px-4">
            <div className="flex flex-col justify-center items-start gap-1 col-span-1">
              <label htmlFor="exness-symbol" className="text-[12px] md:text-[16px]">
                {t('Cặp tiền')} (
                <span className={isTextColor(data[1].data.type)}>
                  {isText(data[1].data.type)}: {priceDataBoot(data[1]).toFixed(7)}
                </span>
                ):
              </label>
              <div className="border border-gray-300 p-1 rounded w-full h-10 pl-2 shadow-sm shadow-gray-200 flex justify-start items-center font-semibold text-[12px] md:text-sm">
                {data[1].data.symbol ?? t('Chọn')}
              </div>
            </div>
            <div className="flex flex-col justify-center items-start gap-1 col-span-1">
              <label htmlFor="exness-symbol" className="text-[12px] md:text-[16px]">
                {t('Kiểu lệnh')}:
              </label>
              <div className="border border-gray-300 p-1 rounded w-full h-10 pl-2 shadow-sm shadow-gray-200 flex justify-start items-center font-semibold text-[12px] md:text-sm">
                {paretypeOrder(data[1].data.type) ?? t('Chọn')}
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center items-start gap-1 mb-3 px-2 md:px-4">
            <div className="flex justify-start items-center gap-1">
              <label htmlFor="exness-volume" className="text-[12px] md:text-[16px]">
                {t('Volume')}:
              </label>
              <TooltipCustom
                titleTooltip={`${t('Hệ số nhân')}: ${coefficient}`}
                placement="top"
                classNameButton="bg-none"
                isButton
              >
                <Icon name="icon-help" className="cursor-help" width={16} height={16} />
              </TooltipCustom>
            </div>
            <InputNumber
              id="exness-volume"
              type="number"
              disabled
              placeholder={t('Volume')}
              value={String(data[1].data.volume ?? '')}
              className={`${classInputBorder}`}
            />
          </div>
          <div className="flex flex-col justify-center items-start gap-1 mb-3 px-2 md:px-4">
            <label htmlFor="exness-price" className="text-[12px] md:text-[16px]">
              {t('Giá vào')}:
            </label>
            <InputNumber
              id="exness-price"
              type="number"
              disabled
              placeholder={t('Giá vào')}
              value={String(data[1].data.price ?? '')}
              className={`${classInputBorder}`}
            />
          </div>
          <div className="flex flex-col justify-center items-start gap-1 mb-3 px-2 md:px-4">
            <div className="flex justify-start items-center gap-1">
              <label htmlFor="exness-sl" className="text-[12px] md:text-[16px]">
                {t('Cắt lỗ (SL)')}:
              </label>
              <TooltipCustom titleTooltip={`${t('Số pip')}: ${pip}`} placement="top" classNameButton="bg-none" isButton>
                <Icon name="icon-help" className="cursor-help" width={16} height={16} />
              </TooltipCustom>
            </div>
            <InputNumber
              id="exness-sl"
              type="number"
              disabled
              placeholder={t('SL')}
              defaultValue={String(data[1].data.sl ?? '')}
              className={`${classInputBorder}`}
            />
          </div>
          <div className="flex flex-col justify-center items-start gap-1 mb-3 px-2 md:px-4">
            <div className="flex justify-start items-center gap-1">
              <label htmlFor="exness-tp" className="text-[12px] md:text-[16px]">
                {t('Chốt lời (TP)')}:
              </label>
              <TooltipCustom
                titleTooltip={`${t('Số pip')}: ${Number(pip) - 0.5}`}
                placement="top"
                classNameButton="bg-none"
                isButton
              >
                <Icon name="icon-help" className="cursor-help" width={16} height={16} />
              </TooltipCustom>
            </div>
            <InputNumber
              id="exness-tp"
              type="number"
              disabled
              placeholder={t('TP')}
              defaultValue={String(data[1].data.tp ?? '')}
              className={`${classInputBorder}`}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center">
        <Button
          className={`${
            isSubmit ? 'bg-[var(--color-background)]' : 'bg-gray-300'
          } px-10 py-2 rounded cursor-pointer mt-2 md:mt-6 md:mr-2 text-[12px] md:text-[16px]`}
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

const SeletSymbol = ({
  setValue,
  setServerId,
}: {
  setValue: Dispatch<SetStateAction<IOrderSend[]>>;
  setServerId: Dispatch<SetStateAction<number | null>>;
}) => {
  const { t } = useTranslation();
  const popupFilterStatusRef: any = useRef(null);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false); // để delay unmount

  const [data, setData] = useState<IOrderSendResponse[]>(dataSymbols);

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
    <div ref={popupFilterStatusRef} className="z-20 h-10 w-full rounded relative border border-gray-300">
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
                  handleToggle();
                  setServerId(idx + 1);
                  setValue((prev) => [
                    {
                      ...prev[0],
                      data: { ...prev[0].data, symbol: item.value as 'EURUSD' | 'GBPUSD' | undefined },
                    },
                    { ...prev[1], data: { ...prev[1].data, symbol: item.value as 'EURUSD' | 'GBPUSD' | undefined } },
                  ]);
                  setData((prev) => prev.map((d) => ({ ...d, active: d.value === item.value })));
                }}
                className={`${
                  item.active ? 'text-[var(--color-background)]' : 'text-black'
                }  shadow-none p-1 hover:bg-[var(--color-background-opacity-2)] w-full cursor-pointer hover:text-[var(--color-background)] rounded-none text-left text-[12px] md:text-sm font-semibold`}
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

const SeletType = ({ setValue }: { setValue: Dispatch<SetStateAction<IOrderSend[]>> }) => {
  const { t } = useTranslation();
  const popupFilterStatusRef: any = useRef(null);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false); // để delay unmount

  const [data, setData] = useState<IOrderSendResponse[]>(dataType);

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
                  handleToggle();
                  setValue((prev) => [
                    {
                      ...prev[0],
                      data: {
                        ...prev[0].data,
                        type: item.value as OrderType | undefined,
                        price: undefined,
                        tp: undefined,
                        sl: undefined,
                      },
                    },
                    {
                      ...prev[1],
                      data: {
                        ...prev[1].data,
                        type: typeOrder(item.value as OrderType | undefined),
                        price: undefined,
                        tp: undefined,
                        sl: undefined,
                      },
                    },
                  ]);
                  setData((prev) => prev.map((d) => ({ ...d, active: d.value === item.value })));
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
  dataCurrent: any[];
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = async () => {
    setLoading(true);
    await postOpenOrderBoot(dataCurrent)
      .then((data) => {
        setLoading(false);
        if (data.data.status === 'success') {
          setOpen(false);
          toast.success('Vào lệnh thành công!');
        } else {
          toast.error(`Gửi lệnh thất bại`);
        }
        console.log(data);
      })
      .catch(() => setLoading(false));
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
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-xl data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-white p-3">
              <div className="mt-3 text-center sm:mt-0 sm:text-left">
                <DialogTitle as="h1" className="text-lg font-semibold text-gray-900 text-center">
                  {t('Bạn xác nhận muốn mở lệnh')}
                </DialogTitle>
                <div className="mt-4 grid grid-cols-2">
                  {dataCurrent.map((item, idx) => {
                    const data = item.data;
                    return (
                      <div
                        className={`col-span-1 border-r border-r-gray-300 ${idx === 1 ? 'border-none' : ''}`}
                        key={idx}
                      >
                        <h1 className="text-center border-b border-b-gray-300 border-t border-t-gray-300 p-1">
                          {t(item.type === 'EXNESS' ? 'Vào lệnh cho tài khoản exness' : 'Vào lệnh cho tài khoản quỹ')}
                        </h1>
                        <div className="pl-4 py-2 border-b border-b-gray-300">
                          <div className="flex justify-start items-center gap-2">
                            <label htmlFor="exness-tp">{t('Cặp tiền')}:</label>
                            <div className="font-semibold">{data.symbol}</div>
                          </div>
                          <div className="flex justify-start items-center gap-2">
                            <label htmlFor="exness-tp">{t('Kiểu lệnh')}:</label>
                            <div className="font-semibold">{paretypeOrder(data.type)}</div>
                          </div>
                          <div className="flex justify-start items-center gap-2">
                            <label htmlFor="exness-tp">{t('Volume')}:</label>
                            <div className="font-semibold">{data.volume}</div>
                          </div>
                          <div className="flex justify-start items-center gap-2">
                            <label htmlFor="exness-tp">{t('Giá vào')}:</label>
                            <div className="font-semibold">{data.price?.toFixed(7)}</div>
                          </div>
                          <div className="flex justify-start items-center gap-2">
                            <label htmlFor="exness-tp">{t('Cắt lỗ (SL)')}:</label>
                            <div className="font-semibold">{data.sl?.toFixed(7)}</div>
                          </div>
                          <div className="flex justify-start items-center gap-2">
                            <label htmlFor="exness-tp">{t('Chốt lời (TP)')}:</label>
                            <div className="font-semibold">{data.tp?.toFixed(7)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
