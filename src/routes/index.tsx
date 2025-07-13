import { createBrowserRouter } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout';
import HomePage from '../pages/Home/HomePage';
import NotFoundPage from '../pages/NotFoundPage';
import ProductPage from '../pages/Product/ProductPage';
import LoginPage from '../pages/auth/LoginPage';
import GuestRoute from './guestRoute';
import ProtectedRoute from './protectedRoute';

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
    <GuestRoute>
      <LoginPage />
    </GuestRoute>),
  },
  {
    path: '/',
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
        path: 'products',
        element: <ProductPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
