import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import Filter from '../components/Filter';
import type { IOptions, IPagination, QueryLots } from '../../../types/global';
import {
  deleteDecentralozitionAccMonitor,
  deleteDecentralozitionAccTransaction,
  deleteUserApi,
  getMeUserApi,
  getUserApi,
  postDecentralozitionAccMonitor,
  postDecentralozitionAccTransaction,
  regiterUserApi,
  type RespontPostRegiter,
} from '../../../api/user';
import { getNotificationId, pathSetting, type IDataUser, type IDetailUser } from '../type';
import { Loading } from '../../../components/loading';
import { useTranslation } from 'react-i18next';
import { PathName } from '../../../routes/path';
import { useNavigate } from 'react-router-dom';
import ButtonBack from '../../../components/buttonBack';
import { useAppInfo } from '../../../hooks/useAppInfo';
import NotDecent from '../../../components/notDecent';
import CheckBox from '../../../components/checkBox';
import toast from 'react-hot-toast';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { Button } from '../../../components/button';
import { useToggle } from '../../../hooks/useToggle';
import Icon from '../../../assets/icon';

const initPara: IPagination = {
  limit: 20,
  page: 1,
  total: 100,
  totalPage: 1,
  is_last_page: false,
  search: undefined,
};

function Decentralization() {
  const { user } = useAppInfo();
  const [query, setQuery] = useState<QueryLots>(initPara);
  const [data, setData] = useState<IDataUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDetail, setIsDetail] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const href = window.location.pathname;

  useEffect(() => {
    (async () => {
      if (user?.role === 200) {
        setLoading(true);
        await getUserApi({ limit: query.limit, page: query.page, search: query.search })
          .then((i) => {
            setQuery((prev) => ({ ...prev, is_last_page: i.is_last_page, total: i.total }));
            setData(i.data);
          })
          .finally(() => setLoading(false));
      }
    })();
  }, [query.page, query.search, user]);

  useEffect(() => {
    const id = getNotificationId(href, PathName.DECENTRAIZATION_DETAIL());
    switch (href) {
      case PathName.DECENTRAIZATION_DETAIL(Number(id)):
        setIsDetail(true);
        break;
      case pathSetting(PathName.DECENTRAIZATION):
        setIsDetail(false);
        break;
    }
  }, [href]);

  return (
    <div className="h-full">
      {user?.role === 200 ? (
        <>
          {isDetail ? (
            <DetailView setDataUser={setData} setIsDetail={setIsDetail} />
          ) : (
            <>
              <Filter query={query} setQuery={setQuery} setOpen={setOpen} />

              {loading ? (
                <Loading />
              ) : (
                <section className="p-1 grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2 mt-2">
                  {data.map((i, idx) => (
                    <ViewItem data={i} key={idx} setIsDetail={setIsDetail} />
                  ))}
                </section>
              )}
            </>
          )}
        </>
      ) : (
        <NotDecent />
      )}

      <Modal open={open} setOpen={setOpen} setDataUser={setData} />
    </div>
  );
}

export default Decentralization;

const ViewItem = ({ data, setIsDetail }: { data: IDataUser; setIsDetail: Dispatch<SetStateAction<boolean>> }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div
      className="bg-[var(--color-background-opacity-2)] p-2 rounded-sm cursor-pointer hover:bg-[var(--color-background)] transition-all hover:text-white"
      onClick={() => {
        setIsDetail(true);
        navigate(PathName.DECENTRAIZATION_DETAIL(data.id));
      }}
    >
      <div className="flex justify-start items-center gap-2">
        <div className="text-[14px] md:text-base">{t('Tài khoản')}:</div>
        <div className="font-semibold">{data.username}</div>
      </div>
      <div className="flex justify-start items-center gap-2">
        <div className="text-[14px] md:text-base">{t('Mật khẩu')}:</div>
        <div className="font-semibold">*******</div>
      </div>
      <div className="flex justify-start items-center gap-2">
        <div className="text-[14px] md:text-base">{t('Loại TK')}:</div>
        <div className="font-semibold">{data.role}</div>
      </div>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
        <div className="flex justify-start items-center gap-2">
          <div className="text-[14px] md:text-base">{t('Quyền TKGD')}:</div>
          <div className="font-semibold">{data.isTransaction}</div>
        </div>
        <div className="flex justify-start items-center gap-2">
          <div className="text-[14px] md:text-base">{t('Quyền TKTD')}:</div>
          <div className="font-semibold">{data.isTransaction}</div>
        </div>
      </div>
    </div>
  );
};

const DetailView = ({
  setDataUser,
  setIsDetail,
}: {
  setDataUser: Dispatch<SetStateAction<IDataUser[]>>;
  setIsDetail: Dispatch<SetStateAction<boolean>>;
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { serverMonitor, dataServerTransaction } = useAppInfo();
  const href = window.location.pathname;
  const id = getNotificationId(href, PathName.DECENTRAIZATION_DETAIL());
  const handleClickBack = () => navigate(PathName.DECENTRAIZATION);
  const [data, setData] = useState<IDetailUser>();
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const handleClickAccMonitor = (isCheck: boolean, id_acc_monitor: number) => {
    const idViewAccMonitor = data?.viewAccMonitor.find((i) => i.account_mt5_id === id_acc_monitor)?.id;
    if (isCheck) {
      postDecentralozitionAccMonitor({ user_id: Number(id), account_id: id_acc_monitor })
        .then((res) => {
          setData((prev: any) => ({
            ...prev,
            viewAccMonitor: [...prev?.viewAccMonitor, { id: Number(res.id), account_mt5_id: Number(id_acc_monitor) }],
          }));
          toast.success('Thêm quyền thàn công');
        })
        .catch((e) => console.log(e));
    } else {
      deleteDecentralozitionAccMonitor({ id: Number(idViewAccMonitor) })
        .then(() => {
          setData((prev: any) => ({
            ...prev,
            viewAccMonitor: prev?.viewAccMonitor.filter(
              (i: any) => Number(i?.account_mt5_id) !== Number(id_acc_monitor),
            ),
          }));
          toast.success('xóa quyền thàn công');
        })
        .catch((e) => console.log(e));
    }
  };

  const handleClickAccTransaction = (isCheck: boolean, id_acc_transaction: number) => {
    const idViewAccMonitor = data?.viewAccTransaction.find((i) => i.acc_transaction_id === id_acc_transaction)?.id;
    if (isCheck) {
      postDecentralozitionAccTransaction({ user_id: Number(id), account_id: id_acc_transaction })
        .then((res) => {
          setData((prev: any) => ({
            ...prev,
            viewAccTransaction: [
              ...prev?.viewAccTransaction,
              { id: Number(res.id), acc_transaction_id: Number(id_acc_transaction) },
            ],
          }));
          toast.success('Thêm quyền thàn công');
        })
        .catch((e) => console.log(e));
    } else {
      deleteDecentralozitionAccTransaction({ id: Number(idViewAccMonitor) })
        .then(() => {
          setData((prev: any) => ({
            ...prev,
            viewAccTransaction: prev?.viewAccTransaction.filter(
              (i: any) => Number(i?.acc_transaction_id) !== Number(id_acc_transaction),
            ),
          }));
          toast.success('xóa quyền thàn công');
        })
        .catch((e) => console.log(e));
    }
  };

  useEffect(() => {
    if (id !== ':id') {
      (async () => {
        setLoading(true);
        await getMeUserApi(Number(id))
          .then((res) => {
            setData(res);
          })
          .then(() => setLoading(false));
      })();
    }
  }, [id]);

  const groupedOptions = serverMonitor.reduce((acc, item) => {
    const len = item.data?.length || 0;
    if (!acc[len]) acc[len] = [];
    acc[len].push(item);
    return acc;
  }, {} as Record<number, IOptions[]>);

  return (
    <div className="relative h-full">
      <ButtonBack
        handleClick={handleClickBack}
        componentSp={
          <div className="flex justify-start items-center gap-2">
            <div className="flex justify-start items-center gap-1 bg-white p-1.5 shadow">
              <div className="text-[12px] md:text-[16px]">{t('ID người dùng')}:</div>
              <div className="text-[12px] md:text-[16px] font-bold">{id}</div>
            </div>

            <Button
              onClick={() => setOpen(true)}
              className="shadow-gray-200 cursor-pointer inline-flex justify-center items-center gap-1 rounded-sm bg-[var(--color-background)] px-3 py-2 text-sm font-semibold text-white shadow-md w-auto"
            >
              <Icon name="icon-trash" className="w-4 h-4" />
              {t('Xóa tài khoản')}
            </Button>
          </div>
        }
      />

      {loading ? (
        <Loading />
      ) : (
        <div className="mt-6 grid md:grid-cols-2 grid-cols-1 gap-1 p-2">
          <div className="md:col-span-2 col-span-1 shadow-sm shadow-gray-200 rounded-sm p-2 border border-gray-200">
            <div className="border-b pb-2 border-gray-300 mb-2">{t('Thông tin tài khoản')}</div>
            <div className="flex justify-start items-center gap-1">
              <div className="">{t('Tài khoản')}:</div>
              <div className="font-semibold">{data?.username}</div>
            </div>
            <div className="flex justify-start items-center gap-1">
              <div className="">{t('Mật khẩu')}:</div>
              <div className="font-semibold">*******</div>
            </div>
            <div className="flex justify-start items-center gap-1">
              <div className="">{t('Loại tài khoản')}:</div>
              <div className="font-semibold">{data?.role}</div>
            </div>
          </div>
          <div className="shadow-sm shadow-gray-200 rounded-sm p-2 border border-gray-200">
            <div className="border-b pb-2 border-gray-300">{t('Cấp quyền xem TKTD')}</div>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {Object.entries(groupedOptions)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([length, items]) => {
                  return (
                    <div key={length} className="bg-white p-1">
                      <div className="font-semibold mb-2 text-sm md:text-base border-b pb-2 border-gray-200">
                        {t('Các dãy')} {length}
                      </div>
                      <div className="grid xl:grid-cols-2 grid-cols-1 gap-1">
                        {items.map((item: IOptions, idx: number) => (
                          <CheckBox
                            handle={handleClickAccMonitor}
                            id={item.id}
                            title={item?.value}
                            key={idx}
                            init={data?.viewAccMonitor.some((i) => i.account_mt5_id === item.id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="shadow-sm shadow-gray-200 rounded-sm p-2 border border-gray-200">
            <div className="border-b pb-2 border-gray-300">{t('Cấp quyền xem và giao dịch TKGD')}</div>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {dataServerTransaction.map((i, idx) => (
                <CheckBox
                  handle={handleClickAccTransaction}
                  id={i.id}
                  key={idx}
                  title={i.name}
                  init={data?.viewAccTransaction.some((d) => d.acc_transaction_id === i.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <ModalDeleteUser open={open} setOpen={setOpen} id={id} setDataUser={setDataUser} setIsDetail={setIsDetail} />
    </div>
  );
};

const initRegiter: RespontPostRegiter = {
  password: '',
  username: '',
};

export const Modal = ({
  open,
  setOpen,
  setDataUser,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setDataUser: Dispatch<SetStateAction<IDataUser[]>>;
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, toggleOpen] = useToggle(false);
  const [data, setData] = useState<RespontPostRegiter>(initRegiter);

  const handleClick = async () => {
    if (data.password !== '' && data.username !== '') {
      setLoading(true);
      await regiterUserApi(data)
        .then((res) => {
          toast.success(t('Đăng ký tài khoản thành công!'));
          setDataUser((prev) => [
            { id: res.id, isMonitor: 0, isTransaction: 0, role: 'viewer', username: data.username },
            ...prev,
          ]);
          setOpen(false);
        })
        .catch((e) => toast.error(e.response.data.detail))
        .finally(() => setLoading(false));
    } else {
      toast.error(t('Vui lòng nhập đủ thông tin trước khi đăng ký!'));
    }
  };

  const classInputBorder =
    'text-[12px] md:text-sm border border-gray-300 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none p-1 rounded w-full h-10 pl-2 shadow-sm shadow-gray-200 focus:outline-none focus:border-[var(--color-background)]';

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
                <DialogTitle as="h1" className="text-base font-semibold text-center text-gray-900">
                  {t('Đăng ký tài khoản người dùng')}
                </DialogTitle>
                <div className="mt-2">
                  <div className="w-sm max-w-[350px] mx-auto">
                    <div className="">
                      <label htmlFor="" className="text-left w-full block">
                        {t('Tài khoản')}:
                      </label>
                      <input
                        value={data.username}
                        onChange={(e) => setData((prev) => ({ ...prev, username: e.target.value }))}
                        className={classInputBorder}
                        placeholder="Username"
                      />
                    </div>

                    <div className="mt-2">
                      <label htmlFor="" className="text-left w-full block">
                        {t('Mật khẩu')}:
                      </label>
                      <div className="relative">
                        <input
                          type={isOpen ? 'text' : 'password'}
                          value={data.password}
                          onChange={(e) => setData((prev) => ({ ...prev, password: e.target.value }))}
                          className={classInputBorder}
                          placeholder="Password"
                        />
                        <button
                          onClick={toggleOpen}
                          type="button"
                          className="h-min absolute top-[50%] right-0 translate-y-[-50%] flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-hidden focus:text-blue-600 dark:text-neutral-600 dark:focus:text-blue-500"
                        >
                          {isOpen ? (
                            <Icon name="icon-eye" className="text-neutral-500 w-5 h-5" />
                          ) : (
                            <Icon name="icon-no-eye" className="text-neutral-500 w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-2 flex justify-end items-center gap-2">
              <Button
                type="button"
                data-autofocus
                onClick={() => setOpen(false)}
                className="text-[12px] md:text-sm shadow-gray-400 cursor-pointer inline-flex w-full justify-center rounded-md bg-white px-3 py-2 font-semibold text-gray-900 shadow-md inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:w-auto"
              >
                {t('Hủy')}
              </Button>
              <Button
                isLoading={loading}
                onClick={() => {
                  !loading && handleClick();
                }}
                type="button"
                className="text-[12px] md:text-sm shadow-gray-400 cursor-pointer inline-flex w-full justify-center rounded-md bg-[var(--color-background)] px-3 py-2 font-semibold text-white shadow-md sm:w-auto"
              >
                {t('Xác nhận')}
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export const ModalDeleteUser = ({
  open,
  setOpen,
  setDataUser,
  setIsDetail,
  id,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setDataUser: Dispatch<SetStateAction<IDataUser[]>>;
  id?: string;
  setIsDetail: Dispatch<SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = async () => {
    setLoading(true);
    await deleteUserApi({ id: Number(id) })
      .then(() => {
        setDataUser((prev) => prev.filter((i) => Number(i.id) !== Number(id)));
        toast.success(t('Xóa thành công'));
        setOpen(false);
        setIsDetail(false);
        navigate(PathName.DECENTRAIZATION);
      })
      .catch((e) => console.log(e))
      .finally(() => setLoading(false));
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
                <DialogTitle as="h1" className="text-base font-semibold text-center text-gray-900">
                  {t('Xóa tài khoản người dùng có mã ')} {id}
                </DialogTitle>
                <div className="mt-2">
                  <h1>
                    {t(
                      'Sau khi thực hiện chức năng xóa sẽ không khôi phục được tài khoản này nữa. Bạn xác nhận muốn xóa tài khoản?',
                    )}
                  </h1>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-2 flex justify-end items-center gap-2">
              <Button
                type="button"
                data-autofocus
                isLoading={loading}
                onClick={() => setOpen(false)}
                className="text-[12px] md:text-sm shadow-gray-400 cursor-pointer inline-flex w-full justify-center rounded-md bg-white px-3 py-2 font-semibold text-gray-900 shadow-md inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:w-auto"
              >
                {t('Hủy')}
              </Button>
              <Button
                isLoading={loading}
                onClick={() => {
                  !loading && handleClick();
                }}
                type="button"
                className="text-[12px] md:text-sm shadow-gray-400 cursor-pointer inline-flex w-full justify-center rounded-md bg-[var(--color-background)] px-3 py-2 font-semibold text-white shadow-md sm:w-auto"
              >
                {t('Xác nhận')}
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};
