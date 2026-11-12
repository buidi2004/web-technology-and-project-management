import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { LoadingScreen } from '../components/LoadingScreen';
import { AuthProvider, useAuth } from '../features/auth/AuthContext';

function useAuthRedirect() {
  const { user, checking } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (checking) return;

    const current = segments[0];
    const inAuthGroup = current === 'login' || current === 'register';

    if (!user && !inAuthGroup) {
      router.replace('/login');
      return;
    }

    if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, checking, segments, router]);
}

function RootNavigator() {
  const { checking } = useAuth();
  useAuthRedirect();

  if (checking) return <LoadingScreen label="Đang kiểm tra phiên đăng nhập..." />;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#f8fafc' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="scan" />
      <Stack.Screen name="activities/[id]" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
