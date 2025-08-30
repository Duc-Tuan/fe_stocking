import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import { downloadFileExApi } from '../api/downloadFile';
import Icon from '../assets/icon';
import { logout } from '../auth/authSlice';
import TooltipCustom from '../components/tooltip';
import type { AppDispatch } from '../store';
import FilterServer from './FilterServer';
import TooltipNavigate from './TooltipNavigate';
import { dataHeader } from './type';
import { useSocket } from '../hooks/useWebSocket';
import { useAppInfo } from '../hooks/useAppInfo';
import { Bounce, ToastContainer, toast as toastNotifi } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { titleSatusLot } from '../pages/Transaction/type';
import { Button } from '../components/button';
import { PathName } from '../routes/path';

export default function DashboardLayout() {
    const { serverMonitorActive } = useAppInfo()
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [loadingDownload, setLoadingDownload] = useState<boolean>(false);

    const handleClickDownload = async () => {
        if (!loadingDownload) {
            try {
                setLoadingDownload(true)
                await downloadFileExApi()
                return toast.success('Tải file xuống thành công!');
            } catch (error) {
                return toast.error('Tải file xuống thất bại!');
            } finally {
                setLoadingDownload(false)
            }
        }
    }

    const handleLogout = () => {
        dispatch(logout())
        navigate('/login');
    }

    const { dataOrder } = useSocket(
        import.meta.env.VITE_URL_API,
        "order_filled",
        Number(serverMonitorActive?.value),
    );

    useEffect(() => {
        if (dataOrder) {
            if (dataOrder?.status === "open_order") {
                // dataOrder.data
                toastNotifi(() => <CustomComponent data={dataOrder.data} status={"open_order"}/>, {
                    autoClose: 5000,
                    icon: false,
                })
            } else {
                toastNotifi(() => <CustomComponent data={dataOrder.data} status={"close_order"} />, {
                    autoClose: 5000,
                    icon: false,
                })
            }
        }
    }, [dataOrder])

    return (
        <div >
            <header className='w-full p-4 flex justify-between items-center fixed top-0 backdrop-blur-2xl z-50'>
                <div className="flex gap-2">
                    {dataHeader.map((a) => <TooltipNavigate iconName={a.nameIcon} path={a.path} title={a.title} key={a.nameIcon} />)}
                    <FilterServer />

                </div>
                <div className="flex flex-wrap gap-2">
                    <TooltipCustom classNameButton='shadow-md shadow-gray-500' w="w-[40px]" h='h-[40px]' handleClick={handleClickDownload} loading={loadingDownload} titleTooltip={"Xuất file"}><Icon name="icon-export" className="text-white" width={22} height={22} /></TooltipCustom>

                    <Logout handleclick={handleLogout} />
                </div>
            </header>
            {/* Main Content */}
            <main className="flex-1 p-4 mt-15 ">
                <Outlet />
            </main>

            <ToastContainer position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce} />
        </div>
    );
}


const Logout = ({ handleclick }: { handleclick: () => void }) => {
    return <TooltipCustom classNameButton='shadow-md shadow-gray-500' w="w-[40px]" h='h-[40px]' handleClick={handleclick} titleTooltip={"Đăng xuất"}><Icon name="icon-logout" className="text-white " width={22} height={22} /></TooltipCustom>
}

function CustomComponent({ data, status }: { data: any, status: "open_order" | "close_order" }) {
    const { t } = useTranslation()
    const navigate = useNavigate(); // ⬅️ bạn bị thiếu dòng này
    return (
        <div className="flex w-full flex-col justify-center items-start gap-[2px] text-black">
            <h1 className='font-bold text-[var(--color-background)]'>{status === "open_order" ? t("Lô đã vào lệnh thành công") : t("Lô đã đóng lệnh thành công")}</h1>
            <div className="text-sm grid grid-cols-2 w-full">
                <h2 className='col-span-2 font-bold'>{t("Tài khoản")}:</h2>
                <div className="flex justify-start items-center gap-2 text-sm col-span-1 border-r border-r-gray-300">
                    <span>{t("Theo dõi")}:</span>
                    <span className='font-semibold'>{data.account_monitor_id}</span>
                </div>

                <div className="flex justify-end items-center gap-2 text-sm col-span-1">
                    <span>{t("Giao dịch")}:</span>
                    <div className="flex justify-start items-center gap-1">
                        <span className='font-semibold'>{data.account_transaction_id}</span>
                        <Icon name="icon-chart-transaction" className="text-[var(--color-background)]" width={18} height={18} />
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center w-full mt-2">
                <div className="flex justify-start items-center gap-2 text-sm">
                    <span>{t("Trạng thái")}: </span>
                    <span className='font-semibold'>{t(titleSatusLot(data.status_sl_tp))}</span>
                </div>

                <Button className='px-4 py-1 cursor-pointer bg-[var(--color-background)] rounded-sm text-sm shadow-gray-400' onClick={() => navigate(PathName.HISTORY)}>{t("Xem chi tiết")}</Button>
            </div>
        </div>
    );
}