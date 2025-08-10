import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { getMe } from "./auth/authSlice";
import router from "./routes";
import type { AppDispatch } from "./store";
import { Toaster } from 'react-hot-toast';
import './App.css'
import { getServer, setCurrentPnl } from "./store/transaction/transactionSlice";
import { useSocket } from "./hooks/useWebSocket";
import { useAppInfo } from "./hooks/useAppInfo";
import SplashScreen from "./components/SplashScreen";
import "./i18n"
import I18nApp from "./i18n";

function App() {
  const { serverMonitorActive } = useAppInfo()
  const [showSplash, setShowSplash] = useState(true);
  const dispatch = useDispatch<AppDispatch>();

  const token = useMemo(() => localStorage.getItem('token'), []);

  useEffect(() => {
    if (token) {
      dispatch(getMe());
      dispatch(getServer());
    }
  }, [dispatch]);

  const data = useSocket(
    import.meta.env.VITE_URL_API,
    Number(serverMonitorActive?.value)
  );

  useEffect(() => {
    if (data) {
      dispatch(setCurrentPnl(data));
    }
  }, [data]);

  useEffect(() => {
    let language = localStorage.getItem('language')
    if (!language) {
      language = 'vi'
      localStorage.setItem('language', language)
    }
    I18nApp.changeLanguage(language?.toString());

    const color = localStorage.getItem('theme-color')

    if (color && color !== "") {
      document.documentElement.classList.add(color)
    }

    const timer = setTimeout(() => setShowSplash(false), 2500); // tổng thời gian splash
    return () => clearTimeout(timer);
  }, []);


  return <>
    <Toaster position="top-center" reverseOrder={false} />
    <RouterProvider router={router} />
    {showSplash && <SplashScreen />}
  </>
}

export default App;
