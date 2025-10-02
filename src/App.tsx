import { useEffect, useMemo, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import './App.css';
import { getMe } from './auth/authSlice';
import SplashScreen from './components/SplashScreen';
import { useAppInfo } from './hooks/useAppInfo';
import { useSocket } from './hooks/useWebSocket';
import './i18n';
import I18nApp from './i18n';
import router from './routes';
import type { AppDispatch } from './store';
import { getServer, getServerTransaction, setCurrentPnl } from './store/transaction/transactionSlice';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);
dayjs.extend(timezone);

function App() {
  const { serverMonitorActive } = useAppInfo();
  const [showSplash, setShowSplash] = useState(true);
  const dispatch = useDispatch<AppDispatch>();

  const token = useMemo(() => localStorage.getItem('token'), []);

  useEffect(() => {
    if (token) {
      dispatch(getMe());
      dispatch(getServer());
      dispatch(getServerTransaction());
    }
  }, [dispatch]);

  const { dataCurrent } = useSocket(import.meta.env.VITE_URL_API, 'chat_message', Number(serverMonitorActive?.value));

  useEffect(() => {
    if (dataCurrent) {
      dispatch(setCurrentPnl(dataCurrent));
    }
  }, [dataCurrent]);

  useEffect(() => {
    let language = localStorage.getItem('language');
    if (!language) {
      language = 'vi';
      localStorage.setItem('language', language);
    }
    I18nApp.changeLanguage(language?.toString());

    const color = localStorage.getItem('theme-color');

    if (color && color !== '') {
      document.documentElement.classList.add(color);
    }

    const timer = setTimeout(() => setShowSplash(false), 2500); // tổng thời gian splash
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <RouterProvider router={router} />
      {showSplash && <SplashScreen />}
    </>
  );
}

export default App;
