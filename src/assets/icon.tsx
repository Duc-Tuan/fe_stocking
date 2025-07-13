import IconCandle from './icons/IconChartCandle.svg?react';
import IconLine from './icons/IconChartLine.svg?react';
import IconExport from './icons/IconExport.svg?react';
import IconEye from './icons/IconEye.svg?react';
import IconEyeNo from './icons/IconEyeNo.svg?react';
import IconClose from './icons/IconClose.svg?react';

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
        default:
            return null;
    }
}