import { createBrowserRouter } from 'react-router-dom';
import { ActivitiesPage } from '../features/activities/ActivitiesPage';
import { ActivityDetailPage } from '../features/activities/ActivityDetailPage';
import { CreateActivityPage } from '../features/activities/CreateActivityPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { MyParticipationsPage } from '../features/participations/MyParticipationsPage';
import { ForbiddenPage, NotFoundPage, ServerErrorPage, SignedOutRoute } from '../pages/SystemPages';
import { ProfilePage } from '../pages/ProfilePage';
import { AppLayout } from '../routes/AppLayout';
import { ProtectedRoute } from '../routes/ProtectedRoute';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/da-dang-xuat', element: <SignedOutRoute /> },
  { path: '/loi/403', element: <ForbiddenPage /> },
  { path: '/loi/500', element: <ServerErrorPage /> },
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
          { path: 'thong-tin-ca-nhan', element: <ProfilePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
