import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { datafunctionBoot, pathBoot, type IOptionDatafunctionBoot } from './type';
import BootMonitor from './Screens/BootMonitor';
import BootTransactionMonitor from './Screens/BootTransaction_monitor';
import BootTransaction from './Screens/BootTransaction';
import { Button } from '../../components/button';
import { PathName } from '../../routes/path';
import { useNavigate } from 'react-router-dom';
import BootTransaction_AccMonitor from './Screens/BootTransaction_accmonitor';

function SymmetricalOrder() {
  const { t } = useTranslation();
  const [data, setData] = useState<IOptionDatafunctionBoot[]>(datafunctionBoot);
  const [highlightStyle, setHighlightStyle] = useState({ top: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const href = window.location.pathname;

  useEffect(() => {
    const activeIndex = data.findIndex((d) => d.active);
    moveHighlight(activeIndex);
  }, []);

  const moveHighlight = (index: number) => {
    if (!containerRef.current) return;
    const btn = containerRef.current.querySelectorAll<HTMLButtonElement>('#button-history')[index];
    if (btn) {
      setHighlightStyle({
        top: btn.offsetTop,
        height: btn.offsetHeight,
      });
    }
  };

  const handlelick = (d: IOptionDatafunctionBoot, index: number, path?: string) => {
    const dataNew = [...data].map((i) => ({
      ...i,
      active: i.type === d.type,
    }));
    setData(dataNew);
    moveHighlight(index);
    path && navigate(path);
  };

  const activeType = data.find((d) => d.active);

  const screen = useMemo(() => {
    let content: React.ReactNode;
    switch (activeType?.type) {
      case 'transaction_acc_monitor':
        content = <BootTransaction_AccMonitor />;
        break;
      case 'transaction':
        content = <BootTransaction />;
        break;
      case 'monitor_acc_boot':
        content = <BootTransactionMonitor />;
        break;
      case 'monitor':
        content = <BootMonitor />;
        break;
      default:
        null;
    }
    return (
      <div key={activeType?.type} className="animate-fade-in h-full">
        {content}
      </div>
    );
  }, [activeType]);

  useEffect(() => {
    const bootBase = PathName.BOOT_ORDER_DETAIL().replace('/:id', '');

    switch (true) {
      case href.startsWith(bootBase):
      case href === pathBoot(PathName.MONITOR_BOOT):
        handlelick(data[3], 3);
        break;
      case href === `/${PathName.SYMMETRICAL_ORDER}`:
      case href === pathBoot(PathName.TRANSACTION_BOOT):
        handlelick(data[0], 0);
        break;
      case href === pathBoot(PathName.TRANSACTION):
        handlelick(data[1], 1);
        break;
      case href === pathBoot(PathName.MONITOR_ACC_BOOT):
        handlelick(data[2], 2);
        break;
      default:
        break;
    }
  }, [href]);

  return (
    <div className="grid grid-cols-5 gap-2">
      <div className="col-span-5 md:col-span-1 shadow-md shadow-gray-500 rounded-lg p-2 relative" ref={containerRef}>
        <div
          className="animate absolute left-2 w-[calc(100%-16px)] text-[var(--color-text)] bg-[var(--color-background)] rounded-md transition-all duration-300 -z-10 shadow-md shadow-gray-300"
          style={{
            top: highlightStyle.top,
            height: highlightStyle.height,
          }}
        />
        {data.map((d, idx) => {
          return (
            <Button
              id="button-history"
              onClick={() => handlelick(d, idx, d.path)}
              key={d.type}
              className={`${
                d.active ? 'text-white' : 'text-[var(--color-background)] hover:bg-[var(--color-background-opacity-2)]'
              } cursor-pointer  w-full text-left block shadow-none p-2 mb-1 text-[12px] md:text-base`}
            >
              {t(d.title)}
            </Button>
          );
        })}
      </div>
      <div className="col-span-5 md:col-span-4 shadow-md shadow-gray-500 rounded-lg relative overflow-y-scroll my-scroll h-[calc(100vh-200px)] md:h-[calc(100vh-80px)]">
        {screen}
      </div>
    </div>
  );
}

export default SymmetricalOrder;
