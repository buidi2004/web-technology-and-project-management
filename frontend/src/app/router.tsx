import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ActivitiesPage } from '../features/activities/ActivitiesPage';
import { ActivityDetailPage } from '../features/activities/ActivityDetailPage';
import { CreateActivityPage } from '../features/activities/CreateActivityPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { MyParticipationsPage } from '../features/participations/MyParticipationsPage';
import { AppLayout } from '../routes/AppLayout';
import { ProtectedRoute } from '../routes/ProtectedRoute';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <ActivitiesPage /> },
          { path: 'activities/new', element: <CreateActivityPage /> },
          { path: 'activities/:id', element: <ActivityDetailPage /> },
          { path: 'me', element: <MyParticipationsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
