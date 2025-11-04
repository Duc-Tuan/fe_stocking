import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getDetailNotificationApi } from '../../../api/notification';
import Icon from '../../../assets/icon';
import { Button } from '../../../components/button';
import ButtonBack from '../../../components/buttonBack';
import { type INotifi } from '../../../layouts/type';
import { PathName } from '../../../routes/path';
import { getNotificationId, pathSetting } from '../type';

export default function DetailNotification({
  handlelick,
}: {
  handlelick: (i?: INotifi, type?: 'view' | 'order') => void;
}) {
  const { t } = useTranslation();
  const href = window.location.pathname;
  const navigate = useNavigate();
  const id = getNotificationId(href, PathName.NOTIFICATION_DETAIL());
  const [data, setData] = useState<INotifi>();

  const handleClickBack = () => {
    navigate(pathSetting(PathName.NOTIFICATION));
  };

  const fetch = async () => {
    const dataReq = await getDetailNotificationApi(Number(id)).catch(() =>
      navigate(pathSetting(PathName.NOTIFICATION)),
    );
    setData(dataReq);
  };

  useEffect(() => {
    if (id !== ':id') {
      fetch();
    }
  }, [id]);

  const riskOrder = useMemo(() => {
    return (data?.monney_acctransaction ?? 0) * ((data?.risk ?? 0) / 100);
  }, [data?.monney_acctransaction, data?.risk]);

  const dailyRiskOrder = useMemo(() => {
    return (data?.monney_acctransaction ?? 0) * ((data?.daily_risk ?? 0) / 100);
  }, [data?.monney_acctransaction, data?.daily_risk]);

  return (
    <div className="relative">
      <ButtonBack
        handleClick={handleClickBack}
        componentSp={
          <div className="flex justify-start items-center gap-1 bg-white p-1 shadow">
            <div className="text-[12px] md:text-[16px]">{t('Mã thông báo')}:</div>
            <div className="text-[12px] md:text-[16px] font-bold">{data?.id}</div>

            {!data?.is_send && (
              <Button
                onClick={() => {
                  handlelick(data, 'order');
                  // setOpenModal((prev: any) => !prev);
                }}
                className="bg-[var(--color-background)] ml-2 p-0.5 px-2 md:text-[16px] text-[12px] cursor-pointer shadow-sm shadow-gray-400 rounded-sm"
              >
                {t('Vào lệnh ngay')}
              </Button>
            )}
          </div>
        }
      />

      <div className="p-2">
        <div className="shadow mt-2 p-2 bg-[var(--color-background-opacity-1)] grid grid-cols-2 md:grid-cols-3 gap-1">
          <div className="col-span-1">
            <div className="text-[12px] md:text-[16px]">{t('Cặp tiền')}:</div>
            <div className="text-[12px] md:text-[16px] font-bold text-[var(--color-background)]">{data?.symbol}</div>
          </div>
          <div className="col-span-1">
            <div className="text-[12px] md:text-[16px]">{t('Tổng volume')}:</div>
            <div className="text-[12px] md:text-[16px] font-bold text-[var(--color-background)]">
              {data?.total_volume}
            </div>
          </div>
          <div className="col-span-1">
            <div className="text-[12px] md:text-[16px]">{t('Tổng lợi nhận')}:</div>
            <div className="text-[12px] md:text-[16px] font-bold text-[var(--color-background)]">{data?.profit}</div>
          </div>
          <div className="col-span-1">
            <div className="text-[12px] md:text-[16px]">{t('Tài khoản giao dịch')}:</div>
            <div className="text-[12px] md:text-[16px] font-bold text-[var(--color-background)]">
              {data?.account_transaction_id}
            </div>
          </div>
          <div className="col-span-1">
            <div className="text-[12px] md:text-[16px]">{t('Quỹ')}:</div>
            <div className="text-[12px] md:text-[16px] font-bold text-[var(--color-background)]">
              {data?.monney_acctransaction.toLocaleString('de-DE')} usd
            </div>
          </div>
          <div className="col-span-1">
            <div className="text-[12px] md:text-[16px]">{t('Vượt lỗ theo lệnh')}:</div>
            <div className="text-[12px] md:text-[16px] font-bold text-[var(--color-background)]">
              {data?.risk}%___(-{riskOrder > 100 ? riskOrder.toLocaleString('de-DE') : riskOrder}usd)
            </div>
          </div>
          <div className="col-span-1">
            <div className="text-[12px] md:text-[16px]">{t('Vượt lỗ theo ngày')}:</div>
            <div className="text-[12px] md:text-[16px] font-bold text-[var(--color-background)]">
              {data?.risk}%___(-{dailyRiskOrder > 100 ? dailyRiskOrder.toLocaleString('de-DE') : dailyRiskOrder}usd)
            </div>
          </div>
          <div className="col-span-1">
            <div className="text-[12px] md:text-[16px]">{t('Trạng thái lệnh bù')}:</div>
            <div className="text-[12px] md:text-[16px] font-bold text-[var(--color-background)]">
              {data?.is_send ? t('Lệnh đã được vào') : t('Lệnh chưa được vào')}
            </div>
          </div>
          <div className="col-span-1">
            <div className="text-[12px] md:text-[16px]">{t('Tổng lệnh đã cắt')}:</div>
            <div className="text-[12px] md:text-[16px] font-bold text-[var(--color-background)]">
              {data?.total_order}
            </div>
          </div>
          <div className="col-span-1">
            <div className="text-[12px] md:text-[16px]">{t('Thời gian cắt lệnh')}:</div>
            <div className="text-[12px] md:text-[16px] font-semibold">
              {dayjs(data?.time).format('HH:mm:ss DD/MM/YYYY')}
            </div>
          </div>
        </div>
        <div className="shadow mt-2 p-2 bg-[var(--color-background-opacity-1)]">
          <h1 className="text-[12px] md:text-[16px] mb-2">
            {t('Chi tiết thông tin các lệnh đã cắt của cặp tiền')} <span className="font-bold">"{data?.symbol}"</span>
          </h1>

          <div className="grid grid-cols-1 gap-1">
            {data?.deals?.map((i, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center w-full shadow-sm shadow-gray-300 p-2 rounded-sm col-span-1 text-[12px] md:text-[16px]"
              >
                <div className="">
                  <div className="font-bold">
                    {data?.symbol}{' '}
                    <span
                      className={`text-sm font-semibold ${i.position_type !== '0' ? 'text-red-500' : 'text-blue-500'}`}
                    >
                      {i.position_type === '0' ? 'BUY' : 'SELL'} {i.volume}
                    </span>
                  </div>
                  <div className="text-sm flex justify-start items-center gap-1">
                    {i.open_price} <Icon name="icon-right-v2" width={14} height={14} /> {t('Thị trường')}
                  </div>
                </div>
                <div className="">
                  <div
                    className={`text-right ${
                      i.profit > 0 ? 'text-blue-700' : i.profit === 0 ? 'text-gray-400' : 'text-red-500'
                    } font-semibold`}
                  >
                    {i.profit}
                  </div>
                  <div className="text-sm text-right">
                    {i.account_id} | {dayjs.utc(i.open_time).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
