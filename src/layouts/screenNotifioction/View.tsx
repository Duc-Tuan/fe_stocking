import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/button';
import { PathName } from '../../routes/path';
import { timeAgo, type INotifi } from '../type';
import { adjustToUTCPlus7 } from '../../pages/Home/options';

export default function ViewNotification({ data, hendleView }: { data: INotifi[]; hendleView: any }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return data?.length === 0 ? (
    <div className="min-h-[50vh] w-full flex justify-center items-center text-gray-400">
      {t('Hiện chưa có thông báo mới nào')}
    </div>
  ) : (
    data?.map((i, id) => (
      <div
        className="bg-[var(--color-background-opacity-1)] p-2 rounded-sm shadow-sm shadow-gray-300 min-h-[76px] w-full"
        key={id}
      >
        <div className="flex justify-between items-start gap-1 text-sm">
          <div className="">
            <div className="font-bold">
              {i.symbol} <span className={i.profit > 0 ? 'text-blue-600' : 'text-red-600'}>{i.profit}</span>{' '}
              <span className="text-[12px] font-semibold">
                |{' '}
                <>
                  {i.type_notification === 'daily' ? (
                    <>
                      {t('Vượt lỗ theo ngày')}: <span className="text-red-600 font-bold">{i.daily_risk}%</span>
                    </>
                  ) : (
                    <>
                      {t('Vượt lỗ theo lệnh')}: <span className="text-red-600 font-bold">{i.risk}%</span>
                    </>
                  )}
                </>
              </span>
            </div>
            <div className="flex justify-start items-center gap-1">
              Volume: <span className="text-[var(--color-background)] font-bold">{i.total_volume.toFixed(5)}</span>
              <span className="text-[13px]">
                {' '}
                | {t('Tài khoản')}: {i.account_transaction_id}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-end items-end gap-1">
            <div className="flex justify-end items-center gap-3 text-[12px]">
              {i?.isRead ? (
                t('Đã xem')
              ) : (
                <>
                  <div className="notify-dot"></div>
                  {t('Chưa xem')}
                </>
              )}
            </div>
            <div className="text-[12px]">{i.is_send ? t('Lệnh đã được vào') : t('Lệnh chưa được vào')}</div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[12px] md:text-[14px]">
            <div className="">
              {t('Loại')} TKGD:{' '}
              <span className="font-semibold text-black">{i.monney_acctransaction?.toLocaleString('de-DE')}usd</span>
            </div>
            <div className="">
              {t('Tổng số lệnh')}: <span className="font-semibold text-black">{i.total_order}</span>
            </div>
          </div>
          <div className="text-[12px] mt-2 flex justify-end items-end gap-2">
            {!i.is_send && (
              <Button
                onClick={() => {
                  hendleView(i, 'order');
                }}
                className="bg-[var(--color-background)] p-1.5 cursor-pointer shadow-sm shadow-gray-400 rounded-sm"
              >
                {t('Vào lệnh ngay')}
              </Button>
            )}

            <Button
              onClick={() => {
                hendleView(i, 'view');
                navigate(PathName.NOTIFICATION_DETAIL(i.id));
              }}
              className="text-[var(--color-background)] p-1.5 cursor-pointer shadow-sm shadow-gray-400 rounded-sm bg-white hover:bg-[var(--color-background-opacity-2)]"
            >
              {t('Xem chi tiết')}
            </Button>
          </div>
        </div>
        <span className="text-[12px]">{timeAgo(adjustToUTCPlus7(Math.floor(new Date(i.time).getTime() / 1000)))}</span>
      </div>
    ))
  );
}
