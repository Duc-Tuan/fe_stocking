import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSettingDailyNotificationApi, getSettingNotificationApi } from '../../../api/notification';
import { Button } from '../../../components/button';
import { Loading } from '../../../components/loading';
import { useAppInfo } from '../../../hooks/useAppInfo';
import { dataTabsAccTransaction, type IChangColor, type IOptionAccTransaction } from '../type';
import ViewAccTransaction from './ViewAccTransaction';

export default function AccTransaction() {
  const { t } = useTranslation();
  const { dataServerTransaction, loadingserverTransaction } = useAppInfo();
  const [dataRisk, setDataRisk] = useState<IOptionAccTransaction[]>([]);
  const [dataDailtRisk, setDataDailyRisk] = useState<IOptionAccTransaction[]>([]);

  const [tabs, setTabs] = useState<IChangColor[]>(dataTabsAccTransaction);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const fetch = async () => {
    const req = await getSettingNotificationApi({ page: 1, limit: 10 });
    const data = req.data.map((i: any) => {
      return { active: false, label: String(i.risk), value: i?.id };
    });
    setDataRisk(data);
  };

  const fetchDailyRisk = async () => {
    const req = await getSettingDailyNotificationApi({ page: 1, limit: 20 });
    const data = req.data.map((i: any) => {
      return { active: false, label: String(i.risk), value: i?.id };
    });
    setDataDailyRisk(data);
  };

  useEffect(() => {
    fetch();
    fetchDailyRisk();
  }, []);

  const handlelick = (d: any, index: number, active: boolean) => {
    if (active) return;
    const dataNew = [...tabs].map((i) => ({
      ...i,
      active: i.value === d.value,
    }));
    setActiveIdx(index);
    setTabs(dataNew);
  };

  useEffect(() => {
    if (containerRef.current) {
      const activeBtn = containerRef.current.querySelectorAll('button')[activeIdx] as HTMLElement;
      if (activeBtn) {
        setIndicatorStyle({
          left: activeBtn.offsetLeft,
          width: activeBtn.offsetWidth,
        });
      }
    }
  }, [activeIdx, tabs]);

  const activeType = tabs.find((d) => d.active);

  const screen = useMemo(() => {
    let content: React.ReactNode;
    switch (activeType?.value) {
      case 'QUY':
        content = (
          <ViewAccTransaction
            data={dataServerTransaction.filter((i) => i.type_acc === 'QUY')}
            dataRisk={dataRisk}
            dataDailtRisk={dataDailtRisk}
          />
        );
        break;
      case 'USD':
        content = (
          <ViewAccTransaction
            data={dataServerTransaction.filter((i) => i.type_acc === 'USD')}
            dataRisk={dataRisk}
            dataDailtRisk={dataDailtRisk}
          />
        );
        break;
      case 'COPY':
        content = (
          <ViewAccTransaction
            data={dataServerTransaction.filter((i) => i.type_acc === 'COPY')}
            dataRisk={dataRisk}
            dataDailtRisk={dataDailtRisk}
          />
        );
        break;
      case 'DEPOSIT':
        content = (
          <ViewAccTransaction
            data={dataServerTransaction.filter((i) => i.type_acc === 'DEPOSIT')}
            dataRisk={dataRisk}
            dataDailtRisk={dataDailtRisk}
          />
        );
        break;
      case 'RECIPROCAL':
        content = (
          <ViewAccTransaction
            data={dataServerTransaction.filter((i) => i.type_acc === 'RECIPROCAL')}
            dataRisk={dataRisk}
            dataDailtRisk={dataDailtRisk}
          />
        );
        break;
      case 'COM':
        content = (
          <ViewAccTransaction
            data={dataServerTransaction.filter((i) => i.type_acc === 'COM')}
            dataRisk={dataRisk}
            dataDailtRisk={dataDailtRisk}
          />
        );
        break;
      case 'SWWING':
        content = (
          <ViewAccTransaction
            data={dataServerTransaction.filter((i) => i.type_acc === 'SWWING')}
            dataRisk={dataRisk}
            dataDailtRisk={dataDailtRisk}
          />
        );
        break;
      case 'VAY':
        content = (
          <ViewAccTransaction
            data={dataServerTransaction.filter((i) => i.type_acc === 'VAY')}
            dataRisk={dataRisk}
            dataDailtRisk={dataDailtRisk}
          />
        );
        break;
      default:
        content = (
          <ViewAccTransaction
            data={dataServerTransaction.filter((i) => i.type_acc === 'QUY')}
            dataRisk={dataRisk}
            dataDailtRisk={dataDailtRisk}
          />
        );
        break;
    }
    
    return (
      <div key={activeType?.value} className="animate-fade-in w-full grid grid-cols-2 gap-2">
        {content}
      </div>
    );
  }, [activeType, dataServerTransaction, dataRisk, dataDailtRisk]);

  const readAccTransaction: (s: string) => number = (s: string) => {
    switch (s) {
      case 'QUY':
        return dataServerTransaction.filter((i) => i.type_acc === 'QUY').length;
      case 'USD':
        return dataServerTransaction.filter((i) => i.type_acc === 'USD').length;
      case 'COPY':
        return dataServerTransaction.filter((i) => i.type_acc === 'COPY').length;
      case 'DEPOSIT':
        return dataServerTransaction.filter((i) => i.type_acc === 'DEPOSIT').length;
      case 'COM':
        return dataServerTransaction.filter((i) => i.type_acc === 'COM').length;
      case 'RECIPROCAL':
        return dataServerTransaction.filter((i) => i.type_acc === 'RECIPROCAL').length;
      case 'VAY':
        return dataServerTransaction.filter((i) => i.type_acc === 'VAY').length;
      case 'SWWING':
        return dataServerTransaction.filter((i) => i.type_acc === 'SWWING').length;
      default:
        return 0;
    }
  };

  return (
    <div className="">
      <div className="flex justify-start items-center p-2 pb-0 sticky top-0 bg-white z-20 shadow" ref={containerRef}>
        {tabs.map((d, idx) => {
          return (
            <Button
              id="button-history"
              onClick={() => handlelick(d, idx, d.active)}
              key={d.value}
              className={`${idx !== tabs.length && idx !== 0 ? 'right-line' : ''} ${
                d.active ? 'text-[var(--color-background)]' : 'text-black hover:text-[var(--color-background)]'
              } hover:bg-[var(--color-background-opacity-2)] cursor-pointer shadow-none px-3 py-1 md:px-6 md:py-3 text-[10px] md:text-[14px] text-center rounded-none flex justify-center items-center gap-1`}
            >
              {t(d.label)}
              <span
                className={`h-4 ${
                  readAccTransaction(d.value) > 100 ? 'w-6' : 'w-4'
                }  bg-[var(--color-background)] text-white rounded-xl flex justify-center items-center text-[10px]`}
              >
                {readAccTransaction(d.value) > 100 ? '+99' : readAccTransaction(d.value)}
              </span>
            </Button>
          );
        })}

        {/* underline indicator */}
        <div
          className="absolute bottom-0 h-[calc(100%-8px)] bg-[var(--color-background-opacity-1)] transition-all duration-300"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
        >
          <div className="w-full h-[3px] bg-[var(--color-background)] absolute bottom-0" />
        </div>
      </div>

      <div className="p-2 mt-2">{loadingserverTransaction ? <Loading /> : screen}</div>
    </div>
  );
}
