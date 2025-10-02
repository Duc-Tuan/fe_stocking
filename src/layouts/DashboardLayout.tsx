import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import Icon from '../assets/icon';
import { logout } from '../auth/authSlice';
import TooltipCustom from '../components/tooltip';
import type { AppDispatch } from '../store';
import FilterServer from './FilterServer';
import TooltipNavigate from './TooltipNavigate';
import { dataHeader, dataNotification, dataTabsNotification, timeAgo, type INotifi, type INotification } from './type';
import { useSocket } from '../hooks/useWebSocket';
import { useAppInfo } from '../hooks/useAppInfo';
import { Bounce, ToastContainer, toast as toastNotifi } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { titleSatusLot } from '../pages/Transaction/type';
import { Button } from '../components/button';
import { PathName } from '../routes/path';
import { useClickOutside } from '../hooks/useClickOutside';
import ScreenOrderSend from '../components/sendOrder';
import type { Option } from '../pages/History/type';
import ViewNotification from './screenNotifioction/View';
import { getNotification, getReadNotifcation, setNotificationView } from '../store/notification/notification';
import { adjustToUTCPlus7 } from '../pages/Home/options';
import { pathSetting } from '../pages/Settings/type';

export default function DashboardLayout() {
  const { serverMonitorActive } = useAppInfo();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // const handleClickDownload = async () => {
  //     if (!loadingDownload) {
  //         try {
  //             setLoadingDownload(true)
  //             await downloadFileExApi()
  //             return toast.success('Tải file xuống thành công!');
  //         } catch (error) {
  //             return toast.error('Tải file xuống thất bại!');
  //         } finally {
  //             setLoadingDownload(false)
  //         }
  //     }
  // }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const { dataOrder } = useSocket(import.meta.env.VITE_URL_API, 'order_filled', Number(serverMonitorActive?.value));

  const { dataNotification } = useSocket(
    import.meta.env.VITE_URL_API,
    'notification_message',
    Number(serverMonitorActive?.value),
  );

  const mp3Notification = () => {
    const audio = new Audio('/src/assets/sounds/notifications-sound-127856.mp3'); // thay bằng path file audio của bạn
    audio.play().catch((err) => {
      console.warn('Không phát được audio:', err);
    });
  };

  useEffect(() => {
    if (dataOrder) {
      mp3Notification();
      if (dataOrder?.status === 'open_order') {
        // dataOrder.data
        toastNotifi(() => <CustomComponent data={dataOrder.data} status={'open_order'} />, {
          autoClose: 5000,
          icon: false,
        });
      } else {
        toastNotifi(() => <CustomComponent data={dataOrder.data} status={'close_order'} />, {
          autoClose: 5000,
          icon: false,
        });
      }
    }
  }, [dataOrder]);

  useEffect(() => {
    if (dataNotification) {
      mp3Notification();
      dispatch(setNotificationView(dataNotification));
      toastNotifi(({ closeToast }) => <CustomComponentNotifiacation data={dataNotification} onClose={closeToast} />, {
        autoClose: 5000,
        icon: false,
      });
    }
  }, [dataNotification]);

  useEffect(() => {
    dispatch(getNotification({ page: 1, limit: 10 }));
  }, []);

  return (
    <div>
      <header className="w-full px-4 md:pt-3 py-2 flex justify-between items-center fixed top-0 backdrop-blur-2xl z-50">
        <div className="flex gap-2">
          {dataHeader.map((a) => (
            <TooltipNavigate iconName={a.nameIcon} path={a.path} title={a.title} key={a.nameIcon} />
          ))}
          <FilterServer />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* <TooltipCustom classNameButton='shadow-md shadow-gray-500' w="w-[40px]" h='h-[40px]' handleClick={handleClickDownload} loading={loadingDownload} titleTooltip={"Xuất file"}><Icon name="icon-export" className="text-white" width={22} height={22} /></TooltipCustom> */}

          <Notification />

          <Logout handleclick={handleLogout} />
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 p-4 py-2 md:mt-14 mt-10">
        <Outlet />
      </main>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </div>
  );
}

const Logout = ({ handleclick }: { handleclick: () => void }) => {
  return (
    <TooltipCustom
      classNameButton="shadow-md shadow-gray-500 text-white p-0"
      handleClick={handleclick}
      titleTooltip={'Đăng xuất'}
    >
      <Icon name="icon-logout" className="md:w-[22px] md:h-[22px] w-[18px] h-[18px]" />
    </TooltipCustom>
  );
};

function CustomComponent({ data, status }: { data: any; status: 'open_order' | 'close_order' }) {
  const { t } = useTranslation();
  const navigate = useNavigate(); // ⬅️ bạn bị thiếu dòng này
  return (
    <div className="flex w-full flex-col justify-center items-start gap-[2px] text-black">
      <h1 className="font-bold text-[var(--color-background)]">
        {status === 'open_order' ? t('Lô đã vào lệnh thành công') : t('Lô đã đóng lệnh thành công')}
      </h1>
      <div className="text-sm grid grid-cols-2 w-full">
        <h2 className="col-span-2 font-bold">{t('Tài khoản')}:</h2>
        <div className="flex justify-start items-center gap-2 text-sm col-span-1 border-r border-r-gray-300">
          <span>{t('Theo dõi')}:</span>
          <span className="font-semibold">{data.account_monitor_id}</span>
        </div>

        <div className="flex justify-end items-center gap-2 text-sm col-span-1">
          <span>{t('Giao dịch')}:</span>
          <div className="flex justify-start items-center gap-1">
            <span className="font-semibold">{data.account_transaction_id}</span>
            <Icon name="icon-chart-transaction" className="text-[var(--color-background)]" width={18} height={18} />
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center w-full mt-2">
        <div className="flex justify-start items-center gap-2 text-sm">
          <span>{t('Trạng thái')}: </span>
          <span className="font-semibold">{t(titleSatusLot(data.status_sl_tp))}</span>
        </div>

        <Button
          className="px-4 py-1 cursor-pointer bg-[var(--color-background)] rounded-sm text-sm shadow-gray-400"
          onClick={() => navigate(PathName.HISTORY)}
        >
          {t('Xem chi tiết')}
        </Button>
      </div>
    </div>
  );
}

const Notification = () => {
  const popupRef: any = useRef(null);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false); // để delay unmount
  const { notificationReducer, totalNotifcation } = useAppInfo();
  const [openModal, setOpenModal] = useState(false);
  const [dataCurrent, setDataCurrent] = useState<INotifi>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const [tabs, setTabs] = useState<(Option<string> & { active: boolean })[]>(dataTabsNotification);

  const hendleView = (i?: INotifi, type?: 'view' | 'order') => {
    setDataCurrent(i);
    if (i && !i.isRead) {
      dispatch(getReadNotifcation({ data: [{ id: i?.id }] }));
    }
    if (!i) {
      dispatch(getReadNotifcation({ data: [] }));
    }
    if (type === 'view') {
      setOpen(false);
      setTimeout(() => setVisible(false), 200); // khớp với duration
    } else if (type === 'order') {
      setOpenModal((prev: any) => !prev);
    }
  };

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
    popupRef,
    () => {
      if (!openModal) {
        setOpen(false);
        setTimeout(() => setVisible(false), 200);
      }
    },
    visible,
  );

  const activeType = tabs.find((d) => d.active);

  const viewButtonAll = (
    <div className="sticky bottom-0 left-0 right-0 w-full pb-2 bg-white">
      <Button
        onClick={() => {
          // handleToggle();
          setOpen(false);
          setTimeout(() => setVisible(false), 200); // khớp với duration
          navigate(`${PathName.SETTING}/${PathName.NOTIFICATION}`);
        }}
        className="bg-[var(--color-background)] cursor-pointer shadow-sm shadow-gray-400 w-full rounded-sm py-1 md:py-2"
      >
        {t('Xem tất cả')}
      </Button>
    </div>
  );

  const isDataView = notificationReducer.filter((i) => !i.isRead).length;

  const screen = useMemo(() => {
    let content: React.ReactNode;
    switch (activeType?.value) {
      case 'View':
        content = (
          <>
            <ViewNotification data={notificationReducer.filter((i) => i.isRead)} hendleView={hendleView} />

            {notificationReducer.filter((i) => i.isRead).length !== 0 && viewButtonAll}
          </>
        );
        break;
      case "Haven't seen":
        content = (
          <>
            <ViewNotification data={notificationReducer.filter((i) => !i.isRead)} hendleView={hendleView} />

            {isDataView !== 0 && viewButtonAll}
          </>
        );
        break;
      case 'View all':
        content = (
          <>
            <ViewNotification data={notificationReducer} hendleView={hendleView} />

            {notificationReducer.length !== 0 && viewButtonAll}
          </>
        );
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

  const handlelick = (d: any, index: number, active: boolean) => {
    if (active) return;
    const dataNew = [...tabs].map((i) => ({
      ...i,
      active: i.value === d.value,
    }));
    setActiveIdx(index);
    setTabs(dataNew);
  };

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
  }, [activeIdx, tabs, containerRef, open]);

  const readNotification = (s: string) => {
    switch (s) {
      case "Haven't seen":
        return isDataView;
      case 'View':
        return notificationReducer.filter((i) => i.isRead).length;
      case 'View all':
        return notificationReducer.length;
      default:
        return 0;
    }
  };

  return (
    <div ref={popupRef} className="z-50 col-span-2 font-semibold rounded-md text-sm relative">
      <TooltipNavigate
        handle={handleToggle}
        iconName="icon-notification"
        path="#"
        title="Thông báo"
        className={` ${open ? '' : 'bg-white text-[var(--color-background)]'}`}
      />

      {totalNotifcation !== 0 && (
        <div
          className={`absolute top-0.5 right-0.5 ${totalNotifcation > 100 ? 'w-[22px]' : 'w-[14px]'}  h-[14px] ${
            open ? 'bg-white text-[var(--color-background)]' : 'bg-[var(--color-background)] text-white'
          }  rounded-2xl text-[10px] flex justify-center items-center`}
        >
          {totalNotifcation > 100 ? '+99' : totalNotifcation}
        </div>
      )}

      {visible && (
        <div
          className={`overflow-y-scroll my-scroll max-h-[80vh] transition-all duration-200 absolute top-full -right-11 min-w-[420px] mt-2 bg-white shadow-md shadow-gray-500 rounded-lg border border-gray-300 ${
            open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <div className="flex justify-between items-center gap-1 sticky top-0 right-0 left-0 bg-white z-10 p-2 pb-0">
            <div className="flex justify-start items-center" ref={containerRef}>
              {tabs.map((d, idx) => {
                return (
                  <Button
                    id="button-history"
                    onClick={() => handlelick(d, idx, d.active)}
                    key={d.value}
                    className={`${idx !== tabs.length && idx !== 0 ? 'right-line' : ''} ${
                      d.active ? 'text-[var(--color-background)]' : 'text-black hover:text-[var(--color-background)]'
                    } hover:bg-[var(--color-background-opacity-2)] cursor-pointer shadow-none p-2 mb-1 text-[10px] md:text-[14px] text-center rounded-none flex justify-center items-center gap-1`}
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
                className="absolute bottom-0.5 h-[2px] bg-[var(--color-background)] transition-all duration-300"
                style={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                }}
              />
            </div>

            <Button
              onClick={() => {
                totalNotifcation !== 0 && hendleView();
              }}
              className={`${
                totalNotifcation !== 0 ? 'bg-[var(--color-background)]' : 'bg-gray-300'
              } p-1 px-2 cursor-pointer rounded-md text-[10px] md:text-[14px] flex justify-center items-center gap-1`}
            >
              {t('Đọc tất cả')} {totalNotifcation} <Icon name="icon-check" className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative w-full p-2 pb-0 pr-1">{screen}</div>
        </div>
      )}

      <ScreenOrderSend open={openModal} setOpen={setOpenModal} data={dataCurrent} setDataCurrent={setDataCurrent} />
    </div>
  );
};

function CustomComponentNotifiacation({ data, onClose }: { data: INotifi; onClose: any }) {
  const { t } = useTranslation();
  const navigate = useNavigate(); // ⬅️ bạn bị thiếu dòng này
  return (
    <div className="flex w-full flex-col justify-center items-start gap-[2px] text-black">
      <h1 className="font-bold text-[var(--color-background)] text-[14px]">
        {data.type_notification === 'daily' ? (
          <>
            {t('Lệnh đã đóng vì vượt lỗ ở mức trong ngày')} {data.daily_risk}%
          </>
        ) : (
          <>
            {t('Lệnh đã đóng vì vượt lỗ ở mức theo lệnh')} {data.risk}%
          </>
        )}
      </h1>
      <div className="flex justify-end items-center gap-2 text-[13px] col-span-1">
        <span>{t('Tài khoản giao dịch')}:</span>
        <div className="flex justify-start items-center gap-1">
          <span className="font-semibold">{data.account_transaction_id}</span>
          <Icon name="icon-chart-transaction" className="text-[var(--color-background)]" width={18} height={18} />
        </div>
      </div>

      <div className="grid grid-cols-2 w-full">
        <div className="flex justify-start items-center gap-2 text-[13px] col-span-1">
          <span>{t('Cặp tiền')}:</span>
          <span className="font-semibold">{data.symbol}</span>
        </div>
        <div className="flex justify-start items-center gap-2 text-[13px] col-span-1">
          <span>{t('Tổng lợi nhận')}:</span>
          <span className="font-semibold">{data.profit}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 w-full">
        <div className="flex justify-start items-center gap-2 text-[13px] col-span-1">
          <span>{t('Tổng số volume đã cắt')}:</span>
          <span className="font-semibold">{data.total_volume}</span>
        </div>
        <div className="flex justify-start items-center gap-2 text-[13px] col-span-1">
          <span>{t('Tổng số lệnh đã cắt')}:</span>
          <span className="font-semibold">{data.total_order}</span>
        </div>
      </div>
      <div className="flex justify-between items-center w-full mt-2">
        <div className="text-[12px]">{timeAgo(adjustToUTCPlus7(Math.floor(new Date(data.time).getTime() / 1000)))}</div>
        <Button
          className="px-4 py-1 cursor-pointer bg-[var(--color-background)] rounded-sm text-sm shadow-gray-400"
          onClick={() => {
            onClose();
            navigate(pathSetting(PathName.NOTIFICATION));
          }}
        >
          {t('Xem chi tiết')}
        </Button>
      </div>
    </div>
  );
}
