import { useCallback, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Tabs from '../components/tabs';
import { useAppInfo } from '../hooks/useAppInfo';
import { useClickOutside } from '../hooks/useClickOutside';
import type { AppDispatch } from '../store';
import { setServerMonitor } from '../store/transaction/transactionSlice';
import type { IOptions } from '../types/global';
import TooltipNavigate from './TooltipNavigate';

export default function FilterServer() {
    const { loadingServerMonitor, serverMonitor, serverMonitorActive } = useAppInfo()
    const dispatch = useDispatch<AppDispatch>();
    const popupRef: any = useRef(null);
    const [open, setOpen] = useState(false);
    const [visible, setVisible] = useState(false); // để delay unmount

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

    const handleClickServer = (selected: IOptions) => {
        dispatch(setServerMonitor(selected))
    };

    useClickOutside(popupRef, () => {
        setOpen(false);
        setTimeout(() => setVisible(false), 200);
    }, visible);


    const TabsServer = useCallback(() => <Tabs handleClick={handleClickServer} options={serverMonitor} isLoading={loadingServerMonitor} serverMonitorActive={serverMonitorActive} />, [serverMonitorActive])

    return (
        <div ref={popupRef} className="z-10 col-span-2 font-semibold shadow-xs shadow-gray-500 rounded-md text-sm relative">
            <TooltipNavigate handle={handleToggle} iconName='icon-server' path='#' title='Tài khoản theo dõi' />

            {visible && (
                <div className={`flex flex-row justify-center items-start gap-1 transition-all duration-200 absolute top-full -left-24 mt-2 bg-white shadow-sm shadow-gray-300 rounded-lg border border-gray-300 p-2 ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                    <TabsServer />
                </div>
            )}
        </div>
    )
}
