import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getDetailOrderBoot } from '../../../api/boot';
import Icon from '../../../assets/icon';
import { Button } from '../../../components/button';
import ButtonBack from '../../../components/buttonBack';
import { useAppInfo } from '../../../hooks/useAppInfo';
import { useSocket } from '../../../hooks/useWebSocket';
import { PathName } from '../../../routes/path';
import type { IServerTransaction } from '../../../types/global';
import { convertTimeDayjs } from '../../../utils/timeRange';
import { getNotificationId } from '../../Settings/type';
import { pathBoot, type IBootAcc, type IOrderBoot } from '../type';
import { Modal } from './BootMonitor';

function DetailMonitorBoot({ setDataCurrent }: { setDataCurrent: Dispatch<SetStateAction<IBootAcc[]>> }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { dataServerTransaction } = useAppInfo();
  const href = window.location.pathname;
  const id = getNotificationId(href, PathName.BOOT_ORDER_DETAIL());
  const [dataDetail, setDataDetail] = useState<IBootAcc>();
  const [open, setOpen] = useState(false);

  const { dataBootAcc } = useSocket(import.meta.env.VITE_URL_API, 'boot_monitor_acc', 1234234);

  const handleClickBack = () => {
    navigate(pathBoot(PathName.MONITOR_BOOT));
  };

  const fetch = async () => {
    await getDetailOrderBoot(Number(id))
      .then((d) => {
        const dataNew = d[0];
        const reciprocal = dataNew.acc_reciprocal;
        const reference = dataNew.acc_reference;

        dataNew.reciprocal = dataServerTransaction.find((i) => i.username === reciprocal);
        dataNew.reference = dataServerTransaction.find((i) => i.username === reference);

        setDataDetail(dataNew);
      })
      .catch(() => navigate(pathBoot(PathName.MONITOR_BOOT)));
  };

  useEffect(() => {
    if (id !== ':id') {
      fetch();
    }
  }, [id]);

  const dataOrder = useMemo(() => {
    const reciprocal = (dataBootAcc?.acc ?? dataServerTransaction).find(
      (i: any) => Number(i.name) === dataDetail?.acc_reciprocal,
    );
    const reference = (dataBootAcc?.acc ?? dataServerTransaction).find(
      (i: any) => Number(i.name) === dataDetail?.acc_reference,
    );

    const dataOrderExness = dataDetail?.dataOrder.find((i) => i.type_acc === 'EXNESS');
    const dataOrderFund = dataDetail?.dataOrder.find((i) => i.type_acc === 'FUND');

    dataBootAcc?.position.map((i: any) => {
      if (Number(i.username) === dataOrderExness?.account_id) {
        (dataOrderExness.price_market = i.current_price),
          (dataOrderExness.profit = i.profit),
          (dataOrderExness.time = i.time);
      } else if (Number(i.username) === dataOrderFund?.account_id) {
        (dataOrderFund.price_market = i.current_price),
          (dataOrderFund.profit = i.profit),
          (dataOrderFund.time = i.time);
      }
    });

    return {
      dataOrderExness,
      dataOrderFund,
      reciprocal,
      reference,
    };
  }, [dataDetail?.dataOrder, dataBootAcc]);

  return (
    <div className="relative h-full">
      <ButtonBack
        handleClick={handleClickBack}
        componentSp={
          <div className="flex justify-start items-center gap-2">
            <div className="flex justify-start items-center gap-1 bg-white p-1.5 shadow">
              <div className="text-[12px] md:text-[16px]">{t('Mã')}:</div>
              <div className="text-[12px] md:text-[16px] font-bold">{dataDetail?.id}</div>
            </div>

            {dataDetail?.type === 'RUNNING' && (
              <Button
                onClick={() => {
                  setOpen((prev: any) => !prev);
                }}
                className="bg-[var(--color-background)] p-1.5 px-4 md:text-[14px] text-[12px] cursor-pointer shadow-sm shadow-gray-400 rounded-sm"
              >
                {t('Đóng lệnh')}
              </Button>
            )}
          </div>
        }
      />

      <div className="mt-4 grid grid-cols-2 gap-1 md:gap-2 h-[calc(100%-50px)] md:p-2 p-0">
        <div className="col-span-1 rounded-md flex justify-between items-center flex-col gap-2 border border-gray-100 p-2">
          <ComponentOrder data={dataOrder.dataOrderExness} />
          <ComponentAcc data={dataOrder?.reference} title="EXNESS" />
        </div>
        <div className="col-span-1 rounded-md flex justify-between items-center flex-col gap-2 border border-gray-100 p-2">
          <ComponentOrder data={dataOrder.dataOrderFund} />
          <ComponentAcc data={dataOrder?.reciprocal} title="FUND" />
        </div>
      </div>

      <Modal open={open} setOpen={setOpen} dataCurrent={dataDetail} setData={setDataDetail} setDataCurrent={setDataCurrent}/>
    </div>
  );
}

export default DetailMonitorBoot;

const ComponentAcc = ({ data, title, className }: { data?: IServerTransaction; title: 'FUND' | 'EXNESS',className?: string }) => {
  const { t } = useTranslation();
  return (
    <div className={`w-full shadow-sm shadow-gray-300 p-2 ${className}`}>
      <div className="text-[14px] md:text-[16px] w-full">
        <div className="font-semibold text-center w-full">
          {t(title === 'EXNESS' ? 'Tài khoản exness' : 'Tài khoản quỹ')}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-[12px] md:text-sm">
          <span className="font-bold mr-2">{t('Tài khoản')}: </span>
          {data?.username}
        </div>
      </div>
      <div className="text-[12px] md:text-sm md:flex">
        <div className="font-bold mr-2">{t('Máy chủ')}: </div>
        <div>{data?.server}</div>
      </div>
      <div className="text-[12px] md:text-sm">
        <span className="font-bold mr-2">{t('Số dư')}: </span>
        {data?.balance}
      </div>
      <div className="text-[12px] md:text-sm">
        <span className="font-bold mr-2">{t('Vốn')}: </span>
        {data?.equity}
      </div>
      <div className="text-[12px] md:text-sm">
        <span className="font-bold mr-2">{t('Ký quỹ')}: </span>
        {data?.margin}
      </div>
      <div className="text-[12px] md:text-sm">
        <span className="font-bold mr-2">{t('Ký quỹ khả dụng')}: </span>
        {data?.free_margin}
      </div>
      <div className="text-[12px] md:text-sm">
        <span className="font-bold mr-2">{t('Đòn bẩy')}: </span>
        {data?.leverage}
      </div>
    </div>
  );
};

const ComponentOrder = ({ data }: { data?: IOrderBoot }) => {
  const { t } = useTranslation();
  return (
    <div className="w-full">
      {data ? (
        <div className="flex justify-between items-center md:flex-row flex-col w-full shadow-sm shadow-gray-300 p-2 rounded-sm">
          <div className="text-[12px] md:text-[16px] w-full">
            <div className="font-bold flex gap-1 md:gap-2 justify-start items-center text-[12px] md:text-sm">
              {data.symbol}{' '}
              <span className={`font-semibold ${data.order_type === 'SELL' ? 'text-red-500' : 'text-blue-500'}`}>
                {data.order_type} {data.volume}
              </span>
              {/* {idx === 0 && (
                      <TooltipNavigate
                        handle={() => {
                          setOpen(true);
                          setDataCurrent(position);
                        }}
                        className="shadow-sm md:w-[24px] w-[20px] md:h-[24px] h-[20px] p-0 flex justify-center items-center"
                        iconName="icon-close-transaction"
                        path="#"
                        title="Đóng lệnh nhanh"
                      />
                    )} */}
            </div>
            <div className="text-[12px] md:text-sm flex justify-start items-center gap-1">
              {data.price.toFixed(4)} <Icon name="icon-right-v2" width={14} height={14} />{' '}
              {data.price_market.toFixed(4)}
            </div>
          </div>
          <div className="w-full">
            <div
              className={`text-right ${
                data.profit > 0 ? 'text-blue-700' : data.profit === 0 ? 'text-gray-400' : 'text-red-500'
              } font-semibold text-[14px] md:text-sm`}
            >
              {data.profit}
            </div>
            <div className="text-[12px] md:text-sm md:text-inherit text-right flex flex-col md:block">
              <span>{data.account_id}</span>
              <span className="md:w-auto w-full md:inline block">{convertTimeDayjs(data.time)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-300 flex justify-center items-center flex-1 w-full h-full">
          {t('Hiện không có lệnh nào đang mở')}
        </div>
      )}
    </div>
  );
};
