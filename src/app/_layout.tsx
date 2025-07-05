import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useSessionStore } from '@/stores/session.store';
import { LoadingScreen } from '@/components/ui';

export default function RootLayout() {
  const { isAuthenticated, isLoading, checkAuthState } = useSessionStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkAuthState();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      // Usuario autenticado pero en pantallas de auth, redirigir a app
      router.replace('/(app)/');
    } else if (!isAuthenticated && !inAuthGroup) {
      // Usuario no autenticado pero en app, redirigir a login
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, segments, isLoading]);

  if (isLoading) {
    // Mostrar loading mientras se verifica autenticación
    return <LoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}