import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/button';
import I18nApp from '../../../i18n';
import { dataChangColor, dataLanguage as dataLanguageInit, type IChangColor, type ILanguage } from '../type';
import Icon from '../../../assets/icon';
import { useClickOutside } from '../../../hooks/useClickOutside';

export default function Language() {
  const { t } = useTranslation();

  return (
    <div className="m-2">
      <ChangColor t={t} />
      <LanguageComponent t={t} />
    </div>
  );
}

const ChangColor = ({ t }: any) => {
  const [isOpen, setIsOpen] = useState(true);
  const languageRef: any = useRef(null);
  const [dataColor, setDataColor] = useState<IChangColor[]>([]);
  const currentTheme: any = useRef(null);

  const handleActive = (color: string | null) => {
    const colorNew = [...dataChangColor].map((d) => ({
      ...d,
      active: d.value === color,
    }));
    setDataColor(colorNew);
    localStorage.setItem('theme-color', color ?? '');
  };

  useEffect(() => {
    const color = localStorage.getItem('theme-color');
    currentTheme.current = color ?? '';
    handleActive(color);
  }, []);

  const handleLanguage = (d: string) => {
    handleActive(d);
    const root = document.documentElement;

    // Xóa class cũ nếu có
    if (currentTheme.current && currentTheme.current !== '') {
      root.classList.remove(currentTheme.current);
    }

    // Thêm class mới
    if (d !== '') {
      root.classList.add(d);
    }

    // Cập nhật biến lưu class hiện tại
    currentTheme.current = d;
  };

  useClickOutside(
    languageRef,
    () => {
      setIsOpen((prev) => !prev);
    },
    isOpen,
  );

  return (
    <div className="mb-2" ref={languageRef}>
      <Button
        className={`text-black cursor-pointer w-full p-2 rounded-none ${
          isOpen
            ? 'bg-[var(--color-background)] text-[var(--color-text)]'
            : 'hover:bg-[var(--color-background-opacity-2)]'
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex justify-between items-center w-full text-[12px] md:text-sm">
          <span>{t('Đổi màu hệ thống')}</span>
          <Icon
            name="icon-up"
            width={14}
            height={14}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          />
        </div>
      </Button>

      <div
        className={`flex justify-start items-center gap-2 overflow-hidden transition-all duration-300 shadow-md shadow-gray-200 ${
          isOpen ? 'max-h-40 p-3' : 'max-h-0'
        }`}
      >
        {dataColor.map((a) => (
          <Button
            key={a.value}
            onClick={() => handleLanguage(a.value)}
            className={`${a.label} flex justify-center items-center md:w-[36px] md:h-[36px] h-[30px] w-[30px] cursor-pointer shadow-md shadow-gray-300 p-0 border border-white`}
          >
            {a.active ? <Icon name="icon-check" width={18} height={18} className="text-white" /> : ''}
          </Button>
        ))}
      </div>
    </div>
  );
};

const LanguageComponent = ({ t }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const languageRef: any = useRef(null);
  const [dataLanguage, setDataLanguage] = useState<ILanguage[]>([]);

  const handleActive = (language: string | null) => {
    const languageNew = [...dataLanguageInit].map((d) => ({
      ...d,
      active: d.value === language?.toString(),
    }));
    setDataLanguage(languageNew);
    localStorage.setItem('language', (language || 'vi')?.toString());
  };

  useEffect(() => {
    const language = localStorage.getItem('language');
    handleActive(language);
  }, []);

  const handleLanguage = (d: string) => {
    handleActive(d);
    return I18nApp.changeLanguage(d?.toString());
  };

  useClickOutside(
    languageRef,
    () => {
      setIsOpen((prev) => !prev);
    },
    isOpen,
  );

  return (
    <div className="" ref={languageRef}>
      <Button
        className={`text-black cursor-pointer w-full p-2 rounded-none text-[12px] md:text-sm ${
          isOpen
            ? 'bg-[var(--color-background)] text-[var(--color-text)]'
            : 'hover:bg-[var(--color-background-opacity-2)]'
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex justify-between items-center w-full">
          <span>{t('Chuyển đổi ngôn ngữ')}</span>
          <Icon
            name="icon-up"
            width={14}
            height={14}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          />
        </div>
      </Button>

      <div
        className={`overflow-hidden transition-all duration-300 shadow-md shadow-gray-200 ${
          isOpen ? 'max-h-40' : 'max-h-0'
        }`}
      >
        {dataLanguage.map((a) => (
          <Button
            key={a.value}
            onClick={() => handleLanguage(a.value)}
            className={`${
              a.active ? 'text-[var(--color-background)]' : 'text-black'
            } hover:bg-[var(--color-background-opacity-01)] cursor-pointer block w-full h-8 md:h-10 text-left shadow-none p-1 pl-2 md:p-2`}
          >
            <div className="flex justify-start items-center gap-2 text-[12px] md:text-sm">
              {a.label}
              {a.active && <Icon name="icon-check" width={18} height={18} />}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};
