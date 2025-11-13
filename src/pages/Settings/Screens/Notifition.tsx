import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import Icon from '../../../assets/icon';
import { Button } from '../../../components/button';
import { Loading } from '../../../components/loading';
import ScreenOrderSend from '../../../components/sendOrder';
import TooltipCustom from '../../../components/tooltip';
import { useAppInfo } from '../../../hooks/useAppInfo';
import ViewNotification from '../../../layouts/screenNotifioction/View';
import TooltipNavigate from '../../../layouts/TooltipNavigate';
import { dataTabsNotification, dataTabsNotificationSp, type INotifi } from '../../../layouts/type';
import { PathName } from '../../../routes/path';
import type { AppDispatch } from '../../../store';
import { getNotification, getReadNotifcation } from '../../../store/notification/notification';
import type { QueryLots } from '../../../types/global';
import type { Option } from '../../History/type';
import { getNotificationId, pathSetting } from '../type';
import DetailNotification from './DetailNotification';
import NotDecent from '../../../components/notDecent';

const initPara: QueryLots = {
  page: 1,
  limit: 10,
  status: undefined,
  acc_transaction: undefined,
  end_time: undefined,
  start_time: undefined,
};

export default function Notifition() {
  const { t } = useTranslation();
  const { notificationReducer, totalNotifcation, pagani, loadingNotification, user } = useAppInfo();
  const [dataCurrent, setDataCurrent] = useState<INotifi>();
  const [openModal, setOpenModal] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [query, setQuery] = useState<QueryLots>(initPara);
  const [tabs, setTabs] = useState<(Option<string> & { active: boolean })[]>([
    ...dataTabsNotification.filter((item) => item.value !== 'View all'),
    ...dataTabsNotificationSp,
  ]);
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const [isDetail, setIsDetail] = useState<boolean>(false);

  const href = window.location.pathname;

  const hendleView = (i?: INotifi, type?: 'view' | 'order') => {
    setDataCurrent(i);
    if (i && !i.isRead) {
      dispatch(getReadNotifcation({ data: [{ id: i?.id }] }));
    }
    if (!i) {
      dispatch(getReadNotifcation({ data: [] }));
    }
    if (type === 'order') {
      setOpenModal((prev: any) => !prev);
    }
  };

  const isDataView = notificationReducer.filter((i) => !i.isRead).length;

  useEffect(() => {
    if (containerRef.current) {
      const activeBtn = containerRef.current.querySelectorAll('button')[activeIdx] as HTMLElement;
      if (activeBtn) {
        setIndicatorStyle({
          left: activeBtn.offsetLeft,
          width: activeBtn.offsetWidth,
        });
      }
    }
  }, [activeIdx, tabs]);

  const handlelick = (d: any, index: number, active: boolean) => {
    if (active) return;
    const dataNew = [...tabs].map((i) => ({
      ...i,
      active: i.value === d.value,
    }));
    setActiveIdx(index);
    setTabs(dataNew);
  };

  const readNotification = (s: string) => {
    switch (s) {
      case "Haven't seen":
        return isDataView;
      case 'View':
        return notificationReducer.filter((i) => i.isRead).length;
      case 'View all':
        return notificationReducer.length;
      case 'Order':
        return notificationReducer.filter((i) => i.is_send).length;
      case 'Close':
        return notificationReducer.filter((i) => !i.is_send).length;
      default:
        return 0;
    }
  };

  const activeType = tabs.find((d) => d.active);

  const screen = useMemo(() => {
    let content: React.ReactNode;
    switch (activeType?.value) {
      case 'View':
        content = <ViewNotification data={notificationReducer.filter((i) => i.isRead)} hendleView={hendleView} />;
        break;
      case "Haven't seen":
        content = <ViewNotification data={notificationReducer.filter((i) => !i.isRead)} hendleView={hendleView} />;
        break;
      case 'Order':
        content = <ViewNotification data={notificationReducer.filter((i) => i.is_send)} hendleView={hendleView} />;
        break;
      case 'Close':
        content = <ViewNotification data={notificationReducer.filter((i) => !i.is_send)} hendleView={hendleView} />;
        break;
      default:
        null;
    }
    return (
      <div key={activeType?.value} className="animate-fade-in w-full flex flex-col justify-center items-start gap-2">
        {content}
      </div>
    );
  }, [activeType, notificationReducer]);

  useEffect(() => {
    const id = getNotificationId(href, PathName.NOTIFICATION_DETAIL());
    switch (href) {
      case PathName.NOTIFICATION_DETAIL(Number(id)):
        setIsDetail(true);
        break;
      case pathSetting(PathName.NOTIFICATION):
        setIsDetail(false);
        break;
    }
  }, [href]);

  useEffect(() => {
    setQuery((prev) => ({
      ...prev,
      page: pagani.page,
      limit: pagani.limit,
      total: pagani.total,
      totalPage: Math.ceil(pagani.total / pagani.limit),
    }));
  }, [pagani]);

  return user?.role === 200 ? (
    <>
      {isDetail ? (
        <DetailNotification handlelick={hendleView} />
      ) : (
        <>
          <div className="md:flex-row flex-col-reverse flex justify-between items-center w-full text-[12px] md:text-sm sticky top-0 bg-white p-2 z-10 shadow-md shadow-gray-300">
            <div className="flex justify-start items-center md:mt-0 mt-2" ref={containerRef}>
              {tabs.map((d, idx) => {
                return (
                  <Button
                    id="button-history"
                    onClick={() => handlelick(d, idx, d.active)}
                    key={d.value}
                    className={`${idx !== tabs.length && idx !== 0 ? 'right-line' : ''} ${
                      d.active ? 'text-[var(--color-background)]' : 'text-black hover:text-[var(--color-background)]'
                    } hover:bg-[var(--color-background-opacity-2)] cursor-pointer shadow-none px-3 py-1 md:px-6 md:py-3 text-[10px] md:text-[14px] text-center rounded-none flex justify-center items-center gap-1`}
                  >
                    {t(d.label)}{' '}
                    <span
                      className={`h-4 ${
                        readNotification(d.value) > 100 ? 'w-6' : 'w-4'
                      }  bg-[var(--color-background)] text-white rounded-xl flex justify-center items-center text-[10px]`}
                    >
                      {readNotification(d.value) > 100 ? '+99' : readNotification(d.value)}
                    </span>
                  </Button>
                );
              })}

              {/* underline indicator */}
              <div
                className="absolute bottom-0 h-[3px] bg-[var(--color-background)] transition-all duration-300"
                style={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                }}
              />
            </div>

            <div className="flex justify-center items-center gap-4 md:flex-row flex-col">
              <div className="flex justify-center items-center gap-4">
                <TooltipNavigate
                  disabled={query?.page === 1}
                  handle={() => {
                    const dataPage = query?.page === 1 ? 1 : (query.page ?? 0) - 1;
                    dispatch(getNotification({ page: dataPage, limit: query.limit }));
                  }}
                  iconName="icon-left"
                  path="#"
                  title="Trang trước"
                  className="w-[30px] md:w-[36px] h-[30px] md:h-[36px] p-0 flex justify-center items-center"
                />
                <div className="flex justify-between items-center gap-1">
                  <div className="font-semibold w-[30px] md:w-[36px] h-[30px] md:h-[36px] shadow-md shadow-gray-500 flex justify-center items-center rounded-lg">
                    {query?.page}
                  </div>
                  <div className="">/</div>
                  <div className="font-semibold w-[30px] md:w-[36px] h-[30px] md:h-[36px] shadow-md shadow-gray-500 flex justify-center items-center rounded-lg">
                    {query?.totalPage ?? 0}
                  </div>
                </div>

                <TooltipNavigate
                  disabled={query?.page === query?.totalPage || query?.totalPage === 0}
                  handle={() => {
                    const dataPage = query?.page === query?.totalPage ? query.page : (query.page ?? 0) + 1;
                    dispatch(getNotification({ page: dataPage, limit: query.limit }));
                  }}
                  iconName="icon-right"
                  path="#"
                  title="Trang sau"
                  className="w-[30px] md:w-[36px] h-[30px] md:h-[36px] p-0 flex justify-center items-center"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <TooltipCustom
                  titleTooltip={`${t('Tổng số bản ghi trên 1 trang')}: ${query.limit} ${t('bản')}`}
                  isButton
                >
                  <div className="md:h-[36px] h-[32px] px-2 mx-2 shadow-md shadow-gray-500 flex justify-center items-center rounded-lg font-semibold">
                    {t('Tổng số bản')}: {query?.total ?? 0}
                  </div>
                </TooltipCustom>

                <TooltipCustom
                  titleTooltip={`${t('Đọc tất cả')} ${isDataView}`}
                  handleClick={() => {
                    totalNotifcation !== 0 && hendleView();
                  }}
                  classNameButton={`shadow-md shadow-gray-400 md:w-auto w-auto ${
                    totalNotifcation !== 0 ? 'bg-[var(--color-background)]' : 'bg-gray-300'
                  } p-1 px-2 cursor-pointer rounded-lg text-[10px] md:text-[14px] flex justify-center items-center gap-1`}
                >
                  <>
                    {t('Đọc tất cả')} <Icon name="icon-check" className="h-4 w-4" />
                  </>
                </TooltipCustom>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center items-start gap-2 p-2 mt-2">
            {loadingNotification ? <Loading /> : screen}
          </div>
        </>
      )}

      <ScreenOrderSend open={openModal} setOpen={setOpenModal} data={dataCurrent} setDataCurrent={setDataCurrent} />
    </>
  ) : (
    <NotDecent />
  );
}
