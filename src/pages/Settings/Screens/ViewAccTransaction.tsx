import React, { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { IServerTransaction } from '../../../types/global';
import { Button } from '../../../components/button';
import { dataTypeAccTransaction, type IChangColor, type IOptionAccTransaction } from '../type';
import { useTranslation } from 'react-i18next';
import { useClickOutside } from '../../../hooks/useClickOutside';
import Icon from '../../../assets/icon';
import type { Option } from '../../History/type';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import InputNumber from '../../../components/input';
import toast from 'react-hot-toast';
import { updateTransactionApi } from '../../../api/serverSymbol';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../store';
import { setDataAccTransaction } from '../../../store/transaction/transactionSlice';
import { useAppInfo } from '../../../hooks/useAppInfo';

function ViewAccTransaction({
  data,
  dataRisk,
  dataDailtRisk,
}: {
  data: IServerTransaction[];
  dataRisk: IOptionAccTransaction[];
  dataDailtRisk: IOptionAccTransaction[];
}) {
  const { t } = useTranslation();
  return [...data, ...Array(Math.max(0, 4 - data.length)).fill({ isFake: true })].map((d, index) => {
    if (d.isFake) {
      return (
        <div
          className="col-span-1 border border-dashed border-gray-300 p-2 opacity-50 min-h-[176px] shadow-sm shadow-gray-200 rounded-sm flex justify-center items-center"
          key={`fake-${index}`}
        >
          <div className="text-[10px] md:text-sm text-gray-400">{t('Đang chờ tài khoản')}...</div>
        </div>
      );
    }

    return (
      <div
        className="bg-[var(--color-background-opacity-1)] w-full p-2 shadow-sm shadow-gray-200 rounded-sm relative"
        key={d.id}
      >
        <More dataSelect={dataRisk} init={d} dataDailtRisk={dataDailtRisk} />
        <div className="flex items-start justify-start md:items-center gap-0 flex-col md:flex-row md:gap-10">
          <div className="text-[12px] md:text-sm">
            <span className="font-bold mr-2">{t('Tài khoản')}: </span>
            {d.name}
          </div>
          <div className="text-[12px] md:text-sm">
            <span className="font-bold mr-1">{t('Rủi ro theo lệnh')}: </span>
            <span className="text-[var(--color-background)] font-bold">
              {d.risk ?? 0}% __(-{(d.monney_acc * (d.risk / 100)) > 1000 ? (d.monney_acc * (d.risk / 100)).toLocaleString('de-DE') : (d.monney_acc * (d.risk / 100))}usd)
            </span>
          </div>
        </div>
        <div className="flex items-start justify-start md:items-center gap-0 flex-col md:flex-row md:gap-10">
          <div className="text-[12px] md:text-sm">
            <span className="font-bold mr-2">{t('Máy chủ')}: </span>
            {d.server}
          </div>
          <div className="text-[12px] md:text-sm">
            <span className="font-bold mr-1">{t('Rủi ro theo ngày')}: </span>
            <span className="text-[var(--color-background)] font-bold">
              {d.daily_risk ?? 0}% __(-{(d.monney_acc * (d.daily_risk / 100)) > 1000 ? (d.monney_acc * (d.daily_risk / 100)).toLocaleString('de-DE') : (d.monney_acc * (d.daily_risk / 100))}usd)
            </span>
          </div>
        </div>

        <div className="text-[12px] md:text-sm">
          <span className="font-bold mr-2">{t('Loại tài khoản')}: </span>
          {d.type_acc} (<span className="font-semibold">{d.monney_acc.toLocaleString('de-DE')} usd</span>)
        </div>
        <div className="text-[12px] md:text-sm">
          <span className="font-bold mr-2">{t('Số dư')}: </span>
          {d.balance}
        </div>
        <div className="text-[12px] md:text-sm">
          <span className="font-bold mr-2">{t('Vốn chủ sở hữu / Tài sản ròng')}: </span>
          {d.equity}
        </div>
        <div className="text-[12px] md:text-sm">
          <span className="font-bold mr-2">{t('Ký quỹ')}: </span>
          {d.margin}
        </div>
        <div className="text-[12px] md:text-sm">
          <span className="font-bold mr-2">{t('Ký quỹ khả dụng')}: </span>
          {d.free_margin}
        </div>
        <div className="text-[12px] md:text-sm">
          <span className="font-bold mr-2">{t('Đòn bẩy')}: </span>
          {d.leverage}
        </div>
      </div>
    );
  });
}

export default ViewAccTransaction;

const More = ({
  dataSelect,
  init,
  dataDailtRisk,
}: {
  dataSelect: IOptionAccTransaction[];
  dataDailtRisk: IOptionAccTransaction[];
  init: IServerTransaction;
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [dataRisk, setDataRisk] = useState<IOptionAccTransaction[]>([]);
  const [dataDailyRisk, setDataDailyRisk] = useState<IOptionAccTransaction[]>([]);
  const [dataTypeAcc, setDataTypeAcc] = useState<IChangColor[]>(dataTypeAccTransaction(init.type_acc));
  const [valueUSD, setValueUSD] = useState<number>(init.monney_acc);
  const dispatch = useDispatch<AppDispatch>();
  const { dataServerTransaction } = useAppInfo();

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const dataSelectRisk = dataSelect
      .map((i) => {
        if (i.label === String(init.risk)) {
          return {
            ...i,
            active: true,
          };
        }
        return i;
      })
      .sort((a: any, b: any) => Number(b.label) - Number(a.label));
    setDataRisk(dataSelectRisk);
  }, [dataSelect]);

  useEffect(() => {
    const dataSelectRisk = dataDailtRisk
      .map((i) => {
        if (i.label === String(init.daily_risk)) {
          return {
            ...i,
            active: true,
          };
        }
        return i;
      })
      .sort((a: any, b: any) => Number(b.label) - Number(a.label));
    setDataDailyRisk(dataSelectRisk);
  }, [dataDailtRisk]);

  const handleClick = async () => {
    const selectRisk = dataRisk.find((i) => i.active);
    const selectDailyRisk = dataDailyRisk.find((i) => i.active);
    const selectTypeAcc = dataTypeAcc.find((i) => i.active);
    setLoading(true);
    await updateTransactionApi({
      id_acc: init.id,
      id_Risk: selectRisk?.value,
      monney_acc: valueUSD,
      type_acc: selectTypeAcc?.value,
      id_daily_risk: selectDailyRisk?.value,
    })
      .then(() => {
        const dataNewUpdate: IServerTransaction[] = dataServerTransaction.map((i) => {
          if (i.id === init.id) {
            return {
              ...i,
              type_acc: selectTypeAcc?.value as 'QUY' | 'USD' | 'COPY' | 'DEPOSIT',
              monney_acc: valueUSD,
              risk: Number(selectRisk?.label),
              daily_risk: Number(selectDailyRisk?.label),
            };
          }
          return i;
        });
        dispatch(setDataAccTransaction(dataNewUpdate));
        setOpen(false);
        toast.success(`${t('Cập nhập thành công tk:')} ${init.username}`);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="absolute top-2 right-2">
      <Button
        onClick={() => setOpen(!open)}
        className="shadow-md shadow-gray-400 cursor-pointer hover:text-[var(--color-background)] text-gray-500 bg-[var(--color-background)] p-1 md:p-1.5"
      >
        <Icon name="icon-edit-lot" className="md:h-[20px] md:w-[20px] h-[18px] w-[18px] text-white" />
      </Button>

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
              <div className="bg-white p-4 md:text-[16px] text-[12px]">
                <h1 className="text-center font-bold">{t('Cài đặt tỷ lệ rủi ro lợi nhuận cho tài khoản')}</h1>
                <div className="flex justify-center items-center gap-1 text-sm">
                  <div className="">{t('Tài khoản giao dịch')}:</div>
                  <h2 className="text-center font-bold text-[var(--color-background)]">{init.name}</h2>
                </div>

                <div className="min-h-45 mt-1">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="">
                      <div className="text-[14px] md:text-base">{t('Rủi ro')}(%):</div>
                      <SeletType dataRisk={dataRisk} setValue={setDataRisk} />
                    </div>
                    <div className="">
                      <div className="text-[14px] md:text-base">{t('Rủi ro theo ngày')}(%):</div>
                      <SeletType dataRisk={dataDailyRisk} setValue={setDataDailyRisk} />
                    </div>
                    <div className="">
                      <div className="text-[14px] md:text-base">{t('Loại tài khoản')}:</div>
                      <SeletTypeAcc data={dataTypeAcc} setValue={setDataTypeAcc} />
                    </div>

                    <div className="">
                      <label htmlFor="exness-price" className="text-[12px] md:text-[16px]">
                        {t('Loại quỹ')} (USD):
                      </label>
                      <InputNumber
                        id="exness-price"
                        type="number"
                        placeholder={t('Nhập quỹ...')}
                        value={String(valueUSD)}
                        onChange={(e) => {
                          const price = Number(e.target.value);
                          setValueUSD(price);
                        }}
                        className="text-[12px] md:text-sm border border-gray-300 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none p-1 rounded w-full h-10 pl-2 shadow-sm shadow-gray-200 focus:outline-none focus:border-[var(--color-background)]"
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
                    setOpen(false);
                    const dataSelectRisk = dataSelect
                      .map((i) => {
                        if (i.label === String(init.risk)) {
                          return {
                            ...i,
                            active: true,
                          };
                        }
                        return i;
                      })
                      .sort((a: any, b: any) => Number(b.label) - Number(a.label));
                    setDataRisk(dataSelectRisk);
                    setValueUSD(init.monney_acc);
                    setDataTypeAcc(dataTypeAccTransaction(init.type_acc));
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
    </div>
  );
};

const SeletType = ({
  setValue,
  dataRisk,
}: {
  setValue: Dispatch<SetStateAction<IOptionAccTransaction[]>>;
  dataRisk:
    | (Option<number> & {
        active: boolean;
      })[]
    | undefined;
}) => {
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

  return (
    <div ref={popupFilterStatusRef} className="h-10 w-full rounded relative border border-gray-300 z-10">
      <Button
        onClick={handleToggle}
        className="flex justify-between items-center gap-4 text-black p-1 rounded-none w-full cursor-pointer h-full shadow-sm shadow-gray-200 pl-2"
      >
        <div className="text-[12px] md:text-sm font-semibold">
          {t(dataRisk?.find((a) => a.active)?.label ?? '') ?? t('Chọn')}
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

      {visible && (
        <div
          className={`transition-all my-scroll max-h-30 duration-200 absolute top-full w-full bg-white shadow-lg shadow-gray-300 rounded border border-gray-300 p-2 ${
            open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {dataRisk?.map((item, idx) => {
            return (
              <Button
                onClick={() => {
                  handleToggle();
                  setValue((prev) => prev?.map((d) => ({ ...d, active: d.value === item.value })));
                }}
                className={`${
                  item.active ? 'text-[var(--color-background)]' : 'text-black'
                }  shadow-none p-1 hover:bg-[var(--color-background-opacity-2)] w-full cursor-pointer hover:text-[var(--color-background)] rounded-none text-left text-[12px] md:text-[14px] font-semibold`}
                key={idx}
              >
                {t(item.label)} %
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SeletTypeAcc = ({
  setValue,
  data,
}: {
  setValue: Dispatch<SetStateAction<IChangColor[]>>;
  data: IChangColor[];
}) => {
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

  return (
    <div ref={popupFilterStatusRef} className="h-10 w-full rounded relative border border-gray-300">
      <Button
        onClick={handleToggle}
        className="flex justify-between items-center gap-4 text-black p-1 rounded-none w-full cursor-pointer h-full shadow-sm shadow-gray-200 pl-2"
      >
        <div className="text-[12px] md:text-sm font-semibold">
          {t(data?.find((a) => a.active)?.label ?? '') ?? t('Chọn')}
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

      {visible && (
        <div
          className={`transition-all my-scroll max-h-30 duration-200 absolute top-full w-full bg-white shadow-lg shadow-gray-300 rounded border border-gray-300 p-2 ${
            open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {data?.map((item, idx) => {
            return (
              <Button
                onClick={() => {
                  handleToggle();
                  setValue((prev) => prev?.map((d) => ({ ...d, active: d.value === item.value })));
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
