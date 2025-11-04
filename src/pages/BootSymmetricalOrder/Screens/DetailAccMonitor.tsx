import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { pathBoot, type IMonitorBoot, type IOrderBoot } from '../type';
import ButtonBack from '../../../components/buttonBack';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PathName } from '../../../routes/path';
import { getDetailOrderMonitorBoot } from '../../../api/boot';
import { getNotificationId } from '../../Settings/type';
import { useAppInfo } from '../../../hooks/useAppInfo';
import { useSocket } from '../../../hooks/useWebSocket';
import type { IServerTransaction } from '../../../types/global';
import Icon from '../../../assets/icon';
import { convertTimeDayjs } from '../../../utils/timeRange';
import { Button } from '../../../components/button';
import { Modal } from './BootTransaction_monitor';

function DetailAccMonitor({ setDataCurrent }: { setDataCurrent: Dispatch<SetStateAction<IMonitorBoot[]>> }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const href = window.location.pathname;
  const id = getNotificationId(href, PathName.BOOT_ACC_ORDER_DETAIL());
  const { dataServerTransaction } = useAppInfo();
  const [dataDetail, setDataDetail] = useState<IMonitorBoot>();
  const [open, setOpen] = useState(false);

  const handleClickBack = () => {
    navigate(pathBoot(PathName.MONITOR_ACC_BOOT));
  };

  const fetch = async () => {
    await getDetailOrderMonitorBoot(Number(id))
      .then((d) => {
        const dataNew = d[0];
        const reciprocal = dataNew.acc_reciprocal;
        const reference = dataNew.acc_reference;

        dataNew.reciprocal = dataServerTransaction.find((i) => i.username === reciprocal);
        dataNew.reference = dataServerTransaction.find((i) => i.username === reference);

        setDataDetail(dataNew);
      })
      .catch(() => navigate(pathBoot(PathName.MONITOR_ACC_BOOT)));
  };

  useEffect(() => {
    if (id !== ':id') {
      fetch();
    }
  }, [id]);

  const { dataCurrentPosition } = useSocket(import.meta.env.VITE_URL_API, 'position_message', 1314);

  const dataOrder = useMemo(() => {
    const reciprocal = (dataCurrentPosition?.acc ?? dataServerTransaction).find(
      (i: any) => Number(i.name) === dataDetail?.acc_reciprocal,
    );
    const reference = (dataCurrentPosition?.acc ?? dataServerTransaction).find(
      (i: any) => Number(i.name) === dataDetail?.acc_reference,
    ); // tham chiếu

    let dataOrderExness = dataDetail?.dataOrder
      .filter((i) => i.account_transaction_id === reference.username)
      .map((i) => ({ ...i, price_market: 0 }));
    let dataOrderFund = dataDetail?.dataOrder
      .filter((i) => i.account_transaction_id === reciprocal.username)
      .map((i) => ({ ...i, price_market: 0 }));

    dataCurrentPosition?.positions.map((i: any) => {
      if (dataOrderExness?.find((d) => d.id_transaction === i.id_transaction)) {
        dataOrderExness = dataOrderExness.map((d) => {
          if (d.id_transaction === i.id_transaction) {
            return {
              ...d,
              price_market: i.open_price,
              profit: i.profit,
              time: i.time,
            };
          }
          return d;
        });
      }
      if (dataOrderFund?.find((d) => d.id_transaction === i.id_transaction)) {
        dataOrderFund = dataOrderFund.map((d) => {
          if (d.id_transaction === i.id_transaction) {
            return {
              ...d,
              price_market: i.open_price,
              profit: i.profit,
              time: i.time,
            };
          }
          return d;
        });
      }
    });

    return {
      dataOrderExness,
      dataOrderFund,
      reciprocal,
      reference,
    };
  }, [dataDetail?.dataOrder, dataCurrentPosition]);

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

      <div className="mt-2 grid grid-cols-2 gap-1 md:gap-2 h-[calc(100%-50px)] my-scroll">
        <div className="col-span-1 rounded-md flex justify-between items-center flex-col gap-2 border border-gray-100 p-2">
          <ComponentOrder data={dataOrder.dataOrderExness} />
          <ComponentAcc data={dataOrder?.reference} title="EXNESS" profit={dataOrder.dataOrderExness?.reduce((acc, item) => acc + (item.profit || 0), 0) || 0}/>
        </div>
        <div className="col-span-1 rounded-md flex justify-between items-center flex-col gap-2 border border-gray-100 p-2">
          <ComponentOrder data={dataOrder.dataOrderFund} />
          <ComponentAcc data={dataOrder?.reciprocal} title="FUND" profit={dataOrder.dataOrderFund?.reduce((acc, item) => acc + (item.profit || 0), 0) || 0}/>
        </div>
      </div>

      <Modal
        open={open}
        setOpen={setOpen}
        dataCurrent={dataDetail}
        setData={setDataDetail}
        setDataCurrent={setDataCurrent}
      />
    </div>
  );
}

export default DetailAccMonitor;

const ComponentAcc = ({
  data,
  title,
  className,
  profit,
}: {
  data?: IServerTransaction;
  title: 'FUND' | 'EXNESS';
  className?: string;
  profit?: number;
}) => {
  const { t } = useTranslation();
  return (
    <div className={`w-full shadow-sm shadow-gray-300 p-2 ${className} sticky bottom-[10px] bg-white`}>
      <div className="text-[14px] md:text-[16px] w-full">
        <div className="font-semibold text-center w-full">
          {t(title === 'EXNESS' ? 'Tài khoản tham chiếu' : 'Tài khoản đối ứng')}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-[12px] md:text-sm">
          <span className="font-bold mr-2">{t('Tài khoản')}: </span>
          {data?.username}
        </div>
        <div className="text-[12px] md:text-sm">
          <span className="font-bold mr-2">{t('Lợi nhuận')}: </span>
          {profit?.toFixed(4)}
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

const ComponentOrder = ({ data }: { data?: IOrderBoot[] }) => {
  const { t } = useTranslation();
  return (
    <div className="w-full">
      {data?.length !== 0 ? (
        <>
          {data?.map((i, idx) => (
            <div
              key={idx}
              className="mb-1.5 flex justify-between items-center md:flex-row flex-col w-full shadow-sm shadow-gray-300 p-2 rounded-sm"
            >
              <div className="text-[12px] md:text-[16px] w-full">
                <div className="font-bold flex gap-1 md:gap-2 justify-start items-center text-[12px] md:text-sm">
                  {i.symbol}{' '}
                  <span className={`font-semibold ${i.order_type === 'SELL' ? 'text-red-500' : 'text-blue-500'}`}>
                    {i.type} {i.volume}
                  </span>
                </div>
                <div className="text-[12px] md:text-sm flex justify-start items-center gap-1">
                  {i.price_open?.toFixed(4)} <Icon name="icon-right-v2" width={14} height={14} />{' '}
                  {i.price_market?.toFixed(4)}
                </div>
              </div>
              <div className="w-full">
                <div
                  className={`text-right ${
                    i.profit > 0 ? 'text-blue-700' : i.profit === 0 ? 'text-gray-400' : 'text-red-500'
                  } font-semibold text-[14px] md:text-sm`}
                >
                  {i.profit}
                </div>
                <div className="text-[12px] md:text-sm md:text-inherit text-right flex flex-col md:block">
                  <span>{i.account_id}</span>
                  <span className="md:w-auto w-full md:inline block">{convertTimeDayjs(i.time)}</span>
                </div>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="text-gray-300 flex justify-center items-center flex-1 w-full h-full">
          {t('Hiện không có lệnh nào đang mở')}
        </div>
      )}
    </div>
  );
};
