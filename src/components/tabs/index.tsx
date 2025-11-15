import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { IOptions } from '../../types/global';
import { Button } from '../button';
import TooltipCustom from '../tooltip';

interface IProps {
  options: IOptions[];
  handleClick: (data: any) => void;
  isLoading?: boolean;
  serverMonitorActive: IOptions | null;
}

const Tabs = (props: IProps) => {
  const { options, handleClick, isLoading, serverMonitorActive } = props;
  const { t } = useTranslation();

  const groupedOptions = options.reduce((acc, item) => {
    const len = item.data?.length || 0;
    if (!acc[len]) acc[len] = [];
    acc[len].push(item);
    return acc;
  }, {} as Record<number, IOptions[]>);

  return (
    <div className="flex flex-row justify-center items-start gap-1">
      <div className="flex flex-col gap-2">
        {options.length === 0 ? (
          <div className="min-w-[340px] h-20 flex justify-center items-center text-gray-400">
            {t('Hiện đang không có TKTD nào')}
          </div>
        ) : (
          Object.entries(groupedOptions)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([length, items]) => (
              <div key={length}>
                <div className="font-semibold mb-2 text-sm md:text-base">
                  {t('Các dãy')} {length}
                </div>
                <div className="flex justify-start items-center gap-2">
                  {items.map((item: IOptions) => (
                    <React.Fragment key={item.value}>
                      <TooltipCustom
                        isButton
                        titleTooltip={
                          <>
                            <div className="text-[12px] md:text-sm">
                              {t('Tài khoản')}: {item?.value}
                            </div>
                            <div className="text-[12px] md:text-sm">
                              {t('Máy chủ')}: {item?.label}
                            </div>
                            <div className="font-bold text-[12px] md:text-sm">
                              {t('Cặp tiền')}: {JSON.stringify(item?.data)}
                            </div>
                          </>
                        }
                      >
                        <Button
                          disabled={isLoading}
                          isLoading={isLoading}
                          onClick={() => handleClick(item)}
                          className={`flex justify-center items-center h-[32px] md:h-[36px] w-[70px] md:w-[90px] rounded-sm ${
                            item.value === serverMonitorActive?.value
                              ? 'text-[var(--color-text)] bg-[var(--color-background)] active'
                              : 'bg-gray-200 text-black hover:bg-[var(--color-background-opacity-5)] hover:text-[var(--color-text)] border border-rose-100 dark:hover:border-rose-200'
                          } cursor-pointer text-[12px] md:text-sm p-0`}
                          aria-current="page"
                        >
                          T {String(item?.value).slice(-6)}
                        </Button>
                      </TooltipCustom>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default memo(Tabs);
