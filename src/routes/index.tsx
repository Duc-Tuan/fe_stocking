import { createBrowserRouter } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout';
import HomePage from '../pages/Home/HomePage';
import NotFoundPage from '../pages/NotFoundPage';
import LoginPage from '../pages/auth/LoginPage';
import ProtectedRoute from './protectedRoute';
import TransactionPage from '../pages/Transaction/TransactionPage';
import HistoryTransaction from '../pages/History/HistoryTransaction';
import { PathName } from './path';
import SettingTransaction from '../pages/Settings/SettingTransaction';

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
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
