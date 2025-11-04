import { createBrowserRouter } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout';
import HistoryTransaction from '../pages/History/HistoryTransaction';
import HomePage from '../pages/Home/HomePage';
import NotFoundPage from '../pages/NotFoundPage';
import SettingTransaction from '../pages/Settings/SettingTransaction';
import TransactionPage from '../pages/Transaction/TransactionPage';
import LoginPage from '../pages/auth/LoginPage';
import ChartWithHorizontalLines from '../pages/orther/Orther';
import { PathName } from './path';
import ProtectedRoute from './protectedRoute';
import SymmetricalOrder from '../pages/BootSymmetricalOrder';

// ✅ Tạo mảng children path
const settingChildren = [
  PathName.NOTIFICATION,
  PathName.ACCMONITOR,
  PathName.EMAIL,
  PathName.ACCTRANSACTION,
  PathName.LANGUAGE,
  PathName.INFOACC,
  PathName.NOTIFICATION_DETAIL(),
].map((path) => ({
  path,
  element: <SettingTransaction />,
}));

const bootChildren = [
  PathName.MONITOR_ACC_BOOT,
  PathName.TRANSACTION_BOOT,
  PathName.MONITOR_BOOT,
  PathName.TRANSACTION_ACC_MONITOR_BOOT,
  PathName.BOOT_ORDER_DETAIL(),
  PathName.BOOT_ACC_ORDER_DETAIL(),
].map((path) => ({
  path,
  element: <SymmetricalOrder />,
}));

const router = createBrowserRouter([
  {
    path: PathName.LOGIN,
    element: <LoginPage />,
  },
  {
    path: PathName.HOME,
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: PathName.TRANSACTION,
        element: <TransactionPage />,
      },
      {
        path: PathName.HISTORY,
        element: <HistoryTransaction />,
      },
      {
        path: PathName.SETTING,
        element: <SettingTransaction />,
        children: settingChildren,
      },
      {
        path: PathName.ORTHER,
        element: <ChartWithHorizontalLines />,
      },
      {
        path: PathName.SYMMETRICAL_ORDER,
        element: <SymmetricalOrder />,
        children: bootChildren,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
