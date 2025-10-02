import { useLayoutEffect, useRef, useState } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useTranslation } from 'react-i18next';
import type { IMenuSub } from './type';
import { Button } from '../button';

type ContextMenuProps = {
  x: number;
  y: number;
  onClose: () => void;
  dataMenu: IMenuSub[];
  activate: boolean;
  activateSub?: boolean;
};

export default function MenuSetupIndicator({ x, y, onClose, dataMenu, activate, activateSub }: ContextMenuProps) {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ left: x, top: y });

  useLayoutEffect(() => {
    const menuEl = menuRef.current;
    if (menuEl) {
      const rect = menuEl.getBoundingClientRect();
      setCoords({
        left: x, // mép trái menu khớp chuột
        top: y - rect.height, // đẩy lên trên con trỏ
      });
    }
  }, [x, y]);

  useClickOutside(menuRef, onClose, x ? true : false);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: 6,
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        padding: '6px',
        zIndex: 10,
        fontSize: 14,
      }}
      className="grid grid-cols-1 gap-1 min-w-48"
    >
      {dataMenu.map((i, idx) => (
        <Button
          key={idx}
          onClick={() => {
            onClose();
            i.onClick();
          }}
          className={`cursor-pointer hover:bg-[var(--color-background-opacity-5)] shadow-none text-black hover:text-white text-left p-1 pl-2 transition-all font-medium rounded-sm ${
            (i.value === 'activate' && activate) || (activateSub && i.value === 'ADX actiave')
              ? 'bg-[var(--color-background)] text-white hover:bg-[var(--color-background)]'
              : ''
          }`}
        >
          {t(i.label)}{' '}
          {i.value === 'activate' || i.value === 'indication' || i.value === 'ADX actiave' || i.value === 'ADX setting'
            ? ''
            : i.value}
        </Button>
      ))}
    </div>
  );
}
