import { useTranslation } from 'react-i18next';

function NotDecent() {
  const { t } = useTranslation();
  return <div className='h-full flex justify-center items-center text-gray-400'>{t('Bạn không có quyền để vào trang này')}</div>;
}

export default NotDecent;
