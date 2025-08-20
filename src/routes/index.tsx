import { createBrowserRouter } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout';
import HistoryTransaction from '../pages/History/HistoryTransaction';
import HomePage from '../pages/Home/HomePage';
import NotFoundPage from '../pages/NotFoundPage';
import SettingTransaction from '../pages/Settings/SettingTransaction';
import TransactionPage from '../pages/Transaction/TransactionPage';
import LoginPage from '../pages/auth/LoginPage';
import { PathName } from './path';
import ProtectedRoute from './protectedRoute';
import ChartWithRSI from '../pages/orther/Orther';

const router = createBrowserRouter([
  {
    path: PathName.LOGIN,
    element: <LoginPage />
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
      },
      {
        path: PathName.ORTHER,
        element: <ChartWithRSI />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
