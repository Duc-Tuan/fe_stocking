import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getCloseOrderBoot, postCloseOrderBoot } from '../../../api/boot';
import { Button } from '../../../components/button';
import { PathName } from '../../../routes/path';
import type { QueryLots } from '../../../types/global';
import { convertTimeDayjs } from '../../../utils/timeRange';
import { getNotificationId } from '../../Settings/type';
import { pathBoot, type IBootAcc } from '../type';
import DetailMonitorBoot from './DetailMonitorBoot';
import toast from 'react-hot-toast';

const initPara: QueryLots = {
  page: 1,
  limit: 10,
  status: undefined,
  acc_transaction: undefined,
  end_time: undefined,
  start_time: undefined,
};

export default function BootMonitor() {
  const { t } = useTranslation();
  const [isDetail, setIsDetail] = useState<boolean>(false);
  const [data, setData] = useState<IBootAcc[]>([]);
  const [open, setOpen] = useState(false);
  const [dataCurrent, setDataCurrent] = useState<IBootAcc>();
  const navigate = useNavigate();

  const [query, setQuery] = useState<QueryLots>(initPara);
  const href = window.location.pathname;
  useEffect(() => {
    const fetch = async () => {
      const resp = await getCloseOrderBoot(query);
      setData(resp.data);
      setQuery((prev) => ({ ...prev, totalPage: resp.total }));
    };
    fetch();
  }, [query.page, query.limit]);

  useEffect(() => {
    const id = getNotificationId(href, PathName.BOOT_ORDER_DETAIL());

    switch (href) {
      case PathName.BOOT_ORDER_DETAIL(Number(id)):
        setIsDetail(true);
        break;
      case pathBoot(PathName.MONITOR_BOOT):
        setIsDetail(false);
        break;
    }
  }, [href]);

  return (
    <>
      {isDetail ? (
        <DetailMonitorBoot setDataCurrent={setData}/>
      ) : (
        <div className={`flex justify-start flex-col items-start gap-2 h-full p-2`}>
          {data.length === 0 ? (
            <div className="col-span-2 w-full flex justify-center items-center h-full text-gray-400">
              {t('Hiện đang không có dữ liệu')}
            </div>
          ) : (
            data.map((item: IBootAcc, idx) => {
              return (
                <div key={idx} className="shadow rounded flex justify-start flex-col gap-2 items-start w-full p-2">
                  <div className="flex justify-between items-center gap-2 w-full">
                    <div className="flex justify-start items-center gap-2">
                      <div className="text-[12px] md:text-sm">
                        <span className="font-bold">{t('Mã')}: </span>
                        {idx + 1}
                      </div>

                      {item.type === 'CLOSE' ? (
                        <span className="font-semibold text-[12px] md:text-sm bg-red-600 py-0.5 px-2 rounded-md text-white">
                          {t('Đã đóng lệnh')}
                        </span>
                      ) : (
                        <span className="font-semibold text-[12px] md:text-sm bg-[#00ff24] py-0.5 px-2 rounded-md text-white">
                          {t('Lệnh đang được mở')}
                        </span>
                      )}
                    </div>

                    <div className="text-sm">{convertTimeDayjs(item.time)}</div>
                  </div>

                  <div className="flex justify-between md:items-end items-start gap-2 w-full">
                    <div className="">
                      <div className="text-[12px] md:text-sm">
                        <span className="font-bold mr-2">{t('Tài khoản tham chiếu (exness)')}: </span>
                        {item.acc_reference}
                      </div>
                      <div className="text-[12px] md:text-sm">
                        <span className="font-bold mr-2">{t('Tài khoản đối ứng (exness)')}: </span>
                        {item.acc_reciprocal}
                      </div>
                    </div>

                    <div className="flex justify-end items-center flex-col md:flex-row gap-2">
                      {item?.type === 'RUNNING' && (
                        <Button
                          onClick={() => {
                            setDataCurrent(item);
                            setOpen((prev: any) => !prev);
                          }}
                          className="bg-[var(--color-background)] cursor-pointer shadow-sm shadow-gray-400 rounded-sm py-0.5 px-4 text-[12px] md:text-[14px]"
                        >
                          {t('Đóng lệnh')}
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          setIsDetail(true);
                          navigate(PathName.BOOT_ORDER_DETAIL(item.id));
                        }}
                        className="bg-white cursor-pointer text-[var(--color-background)] shadow-sm shadow-gray-400 rounded-sm py-0.5 px-2 text-[12px] md:text-[14px]"
                      >
                        {t('Xem chi tiết')}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <Modal open={open} setOpen={setOpen} dataCurrent={dataCurrent} setDataCurrent={setData} />
        </div>
      )}
    </>
  );
}

export const Modal = ({
  open,
  setOpen,
  dataCurrent,
  setDataCurrent,
  setData,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  dataCurrent?: IBootAcc;
  setDataCurrent?: Dispatch<SetStateAction<IBootAcc[]>>;
  setData?: React.Dispatch<React.SetStateAction<IBootAcc | undefined>>;
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = async () => {
    if (!dataCurrent?.id) return;
    setLoading(true);
    await postCloseOrderBoot({ id: dataCurrent?.id })
      .then((data) => {
        setData && setData((prev) => ({ ...prev, type: 'CLOSE' } as any));
        setDataCurrent &&
          setDataCurrent((prev: any) =>
            prev.map((i: any) => {
              if (i.id) {
                return { ...i, type: 'CLOSE' };
              }
            }),
          );
        setLoading(false);
        if (data.data.status === 'success') {
          setOpen(false);
          toast.success('Đóng lệnh thành công!');
        } else {
          toast.error(`Đóng lệnh thất bại`);
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
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-white p-3">
              <div className="mt-3 text-center sm:mt-0 sm:text-left">
                <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                  {t('Bạn xác nhận muốn đóng cặp có mã')} {dataCurrent?.id}
                </DialogTitle>
                <div className="mt-2">
                  <div className="text-[12px] md:text-[16px]">
                    <div className="text-center font-bold">{t('Tài khoản')}</div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="flex justify-start items-center gap-1">
                        <div className="font-semibold">{t('Đối ứng (exness)')}:</div>
                        <div className="font-bold">{dataCurrent?.acc_reference}</div>
                      </div>
                      <div className="flex justify-start items-center gap-1">
                        <div className="font-semibold">{t('Tham chiếu (quỹ)')}:</div>
                        <div className="font-bold">{dataCurrent?.acc_reciprocal}</div>
                      </div>
                    </div>
                    <div className="flex justify-start items-center gap-1">
                      <div className="font-semibold">{t('Cặp tiền')}:</div>
                      <div className="font-bold">{dataCurrent?.dataOrder[0].symbol}</div>
                    </div>
                  </div>
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
                className="text-[12px] md:text-sm shadow-gray-400 cursor-pointer inline-flex w-full justify-center rounded-md bg-[var(--color-background)] px-3 py-2 font-semibold text-white shadow-md sm:ml-3 sm:w-auto"
              >
                {t('Xác nhận')}
              </Button>
              <Button
                type="button"
                data-autofocus
                onClick={() => setOpen(false)}
                className="text-[12px] md:text-sm shadow-gray-400 cursor-pointer mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 font-semibold text-gray-900 shadow-md inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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
