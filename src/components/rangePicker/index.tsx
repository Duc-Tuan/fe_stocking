import type { TimeRangePickerProps } from 'antd';
import { ConfigProvider, DatePicker, Space } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { getColorChart } from '../../utils/timeRange';
import { useTranslation } from 'react-i18next';
import viVN from "antd/locale/vi_VN";
import enUS from "antd/locale/en_US";
import "dayjs/locale/vi";
import "dayjs/locale/en";
import { useEffect, useState } from 'react';

const { RangePicker } = DatePicker;

interface IProps {
    onRangeChange: (dates: null | (Dayjs | null)[], dateStrings: string[]) => void;
    value: [start: Dayjs | null | undefined, end: Dayjs | null | undefined]
}

const RangePickerCustom = ({ onRangeChange, value }: IProps) => {
    const { t } = useTranslation();
    const [antdLocale, setAntdLocale] = useState(viVN);

    const rangePresets: TimeRangePickerProps['presets'] = [
        { label: t('1 tuần trước'), value: [dayjs().add(-7, 'd').hour(0).minute(0).second(0), dayjs().hour(0).minute(0).second(0)] },
        { label: t('2 tuần trước'), value: [dayjs().add(-14, 'd').hour(0).minute(0).second(0), dayjs().hour(0).minute(0).second(0)] },
        { label: t('1 tháng trước'), value: [dayjs().add(-30, 'd').hour(0).minute(0).second(0), dayjs().hour(0).minute(0).second(0)] },
        { label: t('3 tháng trước'), value: [dayjs().add(-90, 'd').hour(0).minute(0).second(0), dayjs().hour(0).minute(0).second(0)] },
    ]

    useEffect(() => {
        let language = localStorage.getItem('language')
        setAntdLocale(language === "vi" ? viVN : enUS)
    }, [])

    return (
        <Space direction="vertical" size={50} className='w-full'>
            <ConfigProvider
                locale={antdLocale}
                theme={{
                    components: {
                        DatePicker: {
                            colorPrimary: getColorChart(), // màu viền focus
                            colorText: 'black',    // màu chữ
                        },
                    },
                }}
            >
                <RangePicker
                    value={value}
                    presets={rangePresets}
                    onChange={onRangeChange}
                    format="HH:mm:ss DD/MM/YYYY"
                    placeholder={[t("Ngày bắt đầu"), t("Ngày kết thúc")]}
                    className='w-full'
                />
            </ConfigProvider>
        </Space>
    )
};

export default RangePickerCustom;