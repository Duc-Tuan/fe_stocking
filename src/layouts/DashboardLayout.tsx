import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import TooltipNavigate from './TooltipNavigate';
import FilterServer from './FilterServer';
import { dataHeader } from './type';
import TooltipCustom from '../components/tooltip';
import Icon from '../assets/icon';
import toast from 'react-hot-toast';
import { downloadFileExApi } from '../api/downloadFile';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import { logout } from '../auth/authSlice';

export default function DashboardLayout() {
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
        </div>
    );
}


const Logout = ({ handleclick }: { handleclick: () => void }) => {
    return <TooltipCustom classNameButton='shadow-md shadow-gray-500' w="w-[40px]" h='h-[40px]' handleClick={handleclick} titleTooltip={"Đăng xuất"}><Icon name="icon-logout" className="text-white " width={22} height={22} /></TooltipCustom>
}