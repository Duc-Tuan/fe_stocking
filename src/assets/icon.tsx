import IconCandle from './icons/IconChartCandle.svg?react';
import IconChartLine from './icons/IconChartLine.svg?react';
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
import Iconfilter from './icons/Iconfilter.svg?react';
import IconChartTransaction from './icons/IconChartTransaction.svg?react';
import IconCloseTransaction from './icons/IconCloseTransaction.svg?react';
import IconArrowLeft from './icons/IconArrowLeft.svg?react';
import IconArrowRight from './icons/IconArrowRight.svg?react';
import IconTaskSquare from './icons/IconTaskSquare.svg?react';
import IconArrowRightV2 from './icons/IconArrowRightV2.svg?react';
import IconFibonacci from './icons/IconFibonacci.svg?react';
import IconDelete from './icons/IconDelete.svg?react';
import IconRsi from './icons/IconRsi.svg?react';
import IconEditLot from './icons/IconEditLot.svg?react';
import IconBoundaryLine from './icons/IconBoundaryLine.svg?react';
import IconLine from './icons/IconLine.svg?react';
import IconTrendLine from './icons/IconTrendLine.svg?react';

export default function Icon(props: any) {
    switch (props?.name?.toLowerCase()) {
        case 'icon-candle':
            return <IconCandle {...props} />;
        case 'icon-line':
            return <IconChartLine {...props} />;
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
        case 'icon-filter':
            return <Iconfilter {...props} />;
        case 'icon-chart-transaction':
            return <IconChartTransaction {...props} />;
        case 'icon-close-transaction':
            return <IconCloseTransaction {...props} />;
        case 'icon-left':
            return <IconArrowLeft {...props} />;
        case 'icon-right':
            return <IconArrowRight {...props} />;
        case 'icon-task-square':
            return <IconTaskSquare {...props} />;
        case 'icon-right-v2':
            return <IconArrowRightV2 {...props} />;
        case 'icon-fibonacci':
            return <IconFibonacci {...props} />;
        case 'icon-delete':
            return <IconDelete {...props} />;
        case 'icon-rsi':
            return <IconRsi {...props} />;
        case 'icon-edit-lot':
            return <IconEditLot {...props} />;
        case 'icon-boundary-line':
            return <IconBoundaryLine {...props} />;
        case 'icon-line-v2':
            return <IconLine {...props} />;
        case 'icon-trend-line':
            return <IconTrendLine {...props} />;
        default:
            return null;
    }
}