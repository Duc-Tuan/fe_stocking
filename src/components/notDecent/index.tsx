import { useTranslation } from 'react-i18next';

function NotDecent({ title = 'Bạn không có quyền để vào trang này' }: { title?: string }) {
  const { t } = useTranslation();
  return <div className="h-full flex justify-center items-center text-gray-400">{t(title)}</div>;
}

export default NotDecent;
