import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/button';
import { PathName } from '../../routes/path';
import Acc from './Screens/Acc';
import AccTracking from './Screens/AccTracking';
import AccTransaction from './Screens/AccTransaction';
import Decentralization from './Screens/Decentralization';
import Email from './Screens/Email';
import Language from './Screens/Language';
import Notifition from './Screens/Notifition';
import { datafunctionSetting, pathSetting, type IOptionDatafunctionSetting } from './type';

export default function SettingTransaction() {
  const { t } = useTranslation();
  const [highlightStyle, setHighlightStyle] = useState({ top: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const href = window.location.pathname;
  const [data, setData] = useState<IOptionDatafunctionSetting[]>(datafunctionSetting);

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

  const handlelick = (d: IOptionDatafunctionSetting, index: number, active: boolean, path?: string) => {
    if (active) return;
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
      case 'Info':
        content = <Acc />;
        break;
      case 'Acc_tracking':
        content = <AccTracking />;
        break;
      case 'Acc_transaction':
        content = <AccTransaction />;
        break;
      case 'Email':
        content = <Email />;
        break;
      case 'Language':
        content = <Language />;
        break;
      case 'Notifition':
        content = <Notifition />;
        break;
      case 'Decentralization':
        content = <Decentralization />;
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
    const notificationBase = PathName.NOTIFICATION_DETAIL().replace('/:id', '');
    const DecentralizationBase = PathName.DECENTRAIZATION_DETAIL().replace('/:id', '');

    switch (true) {
      case href.startsWith(notificationBase):
      case href === pathSetting(PathName.NOTIFICATION):
        handlelick(data[5], 5, false);
        break;
      case href === `/${PathName.SETTING}`:
      case href === pathSetting(PathName.INFOACC):
        handlelick(data[0], 0, false);
        break;
      case href === pathSetting(PathName.ACCMONITOR):
        handlelick(data[1], 1, false);
        break;
      case href === pathSetting(PathName.ACCTRANSACTION):
        handlelick(data[2], 2, false);
        break;
      case href === pathSetting(PathName.LANGUAGE):
        handlelick(data[3], 3, false);
        break;
      case href === pathSetting(PathName.EMAIL):
        handlelick(data[4], 4, false);
        break;
      case href.startsWith(DecentralizationBase):
      case href === pathSetting(PathName.DECENTRAIZATION):
        handlelick(data[6], 6, false);
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
              onClick={() => handlelick(d, idx, d.active, d.path)}
              key={d.type}
              className={`${
                d.active ? 'text-white' : 'text-[var(--color-background)] hover:bg-[var(--color-background-opacity-2)]'
              } cursor-pointer w-full text-left block shadow-none p-2 mb-1 text-[10px] md:text-[16px]`}
            >
              {t(d.title)}
            </Button>
          );
        })}
      </div>
      {/* h-[calc(100vh-65px)] */}
      <div className="col-span-5 lg:col-span-4 shadow-md shadow-gray-500 rounded-lg overflow-y-scroll my-scroll h-[calc(60vh)] md:h-[calc(100vh-80px)]">
        {screen}
      </div>
    </div>
  );
}
