import React from 'react';
import { useTranslation } from 'react-i18next';

function NotDecent() {
  const { t } = useTranslation();
  return <div>{t('Bạn không có quyền để vào trang này')}</div>;
}

export default NotDecent;
