import IconCandle from './icons/IconChartCandle.svg?react';
import IconLine from './icons/IconChartLine.svg?react';
import IconExport from './icons/IconExport.svg?react';
import IconEye from './icons/IconEye.svg?react';
import IconEyeNo from './icons/IconEyeNo.svg?react';
import IconClose from './icons/IconClose.svg?react';
import IconMenu from './icons/IconMenu.svg?react';
import IconLogout from './icons/Iconlogout.svg?react';
import IconHome from './icons/IconHome.svg?react';
import IconTransaction from './icons/IconTransaction.svg?react';
import IconArrowUp from './icons/IconArrowUp.svg?react';
import IconCheck from './icons/IconCheck.svg?react';
import IconHistory from './icons/IconHistory.svg?react';
import IconServer from './icons/IconServer.svg?react';
import IconMore from './icons/IconMore.svg?react';

export default function Icon(props: any) {
    switch (props?.name?.toLowerCase()) {
        case 'icon-candle':
            return <IconCandle {...props} />;
        case 'icon-line':
            return <IconLine {...props} />;
        case 'icon-export':
            return <IconExport {...props} />;
        case 'icon-eye':
            return <IconEye {...props} />;
        case 'icon-no-eye':
            return <IconEyeNo {...props} />;
        case 'icon-close':
            return <IconClose {...props} />;
        case 'icon-menu':
            return <IconMenu {...props} />;
        case 'icon-logout':
            return <IconLogout {...props} />;
        case 'icon-home':
            return <IconHome {...props} />;
        case 'icon-transaction':
            return <IconTransaction {...props} />;
        case 'icon-up':
            return <IconArrowUp {...props} />;
        case 'icon-check':
            return <IconCheck {...props} />;
        case 'icon-history':
            return <IconHistory {...props} />;
        case 'icon-server':
            return <IconServer {...props} />;
        case 'icon-more':
            return <IconMore {...props} />;
        default:
            return null;
    }
}