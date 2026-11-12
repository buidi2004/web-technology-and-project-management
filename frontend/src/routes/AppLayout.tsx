import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, ClipboardList, House, UserRound } from 'lucide-react';
import { AppLayout as KitAppLayout, type AppLayoutGroup } from '@/components/blocks/app-layout';
import { AccountMenuItems, SignOutDialog } from '@/components/blocks/auth';
import { useAuth } from '@/features/auth/AuthContext';
import { roleLabels } from '@/lib/api';
import { useTheme } from '@/lib/theme';

function Brand({ wide = false }: { wide?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className="grid size-8 flex-none place-items-center rounded-lg bg-primary text-body font-bold text-primary-foreground">
        C
      </span>
      {wide && (
        <span className="min-w-0 leading-tight">
          <strong className="block truncate text-body font-bold text-foreground">CTXH</strong>
          <small className="block truncate text-micro text-muted-foreground">
            Ngày công tác xã hội
          </small>
        </span>
      )}
    </span>
  );
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { dark, toggle } = useTheme();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const isStaff = user?.role === 'Organizer' || user?.role === 'Admin';

  const nav = useMemo<AppLayoutGroup[]>(() => {
    const groups: AppLayoutGroup[] = [
      {
        id: 'hoat-dong',
        label: 'Hoạt động',
        icon: <House />,
        items: [{ label: 'Danh sách hoạt động', to: '/' }],
      },
    ];

    if (user?.role === 'Student') {
      groups.push({
        id: 'ca-nhan',
        label: 'Cá nhân',
        icon: <UserRound />,
        section: 'Của tôi',
        items: [
          { label: 'Tiến độ của tôi', to: '/me' },
          { label: 'Thông tin cá nhân', to: '/thong-tin-ca-nhan' },
        ],
      });
    }

    if (isStaff) {
      groups.push({
        id: 'quan-ly',
        label: 'Quản lý',
        icon: <ClipboardList />,
        section: 'Dành cho cán bộ',
        items: [{ label: 'Tạo hoạt động', to: '/activities/new' }],
      });
    }

    return groups;
  }, [isStaff, user?.role]);

  function signOut() {
    logout();
    setConfirmSignOut(false);
    navigate('/da-dang-xuat', { replace: true });
  }

  const initials = (user?.fullName ?? '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <KitAppLayout
        nav={nav}
        route={location.pathname}
        onNavigate={(to) => navigate(to)}
        homeRoute="/"
        homeIcon={<House />}
        brand={<Brand />}
        brandWide={<Brand wide />}
        defaultMenuExpanded
        searchPlaceholder="Tìm hoạt động, sinh viên..."
        user={{
          name: user?.fullName ?? '',
          username: user?.studentCode ?? '',
          initials,
        }}
        userMenu={
          <AccountMenuItems
            name={user ? `${user.fullName} · ${roleLabels[user.role]}` : ''}
            onProfile={() => navigate('/thong-tin-ca-nhan')}
            dark={dark}
            onToggleTheme={toggle}
            onSignOut={() => setConfirmSignOut(true)}
          />
        }
        shortcuts={[
          { to: '/', label: 'Hoạt động', icon: <CalendarDays /> },
          ...(user?.role === 'Student'
            ? [{ to: '/me', label: 'Tiến độ của tôi', icon: <ClipboardList /> }]
            : []),
        ]}
      >
        <Outlet />
      </KitAppLayout>

      <SignOutDialog
        open={confirmSignOut}
        onOpenChange={setConfirmSignOut}
        onConfirm={signOut}
      />
    </>
  );
}
