import { useAuth } from '@/contexts/AuthContext';
import { Tabs, router } from 'expo-router';
import React, { useEffect } from 'react';

export default function TabsLayout() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/(auth)/welcome');
    }
  }, [user, loading]);

  if (loading || !user || !profile) {
    return null;
  }

  // Redirect to role-specific tabs
  useEffect(() => {
    if (profile?.role) {
      switch (profile.role) {
        case 'siswa':
          router.replace('/(tabs)/(siswa)');
          break;
        case 'guru':
          router.replace('/(tabs)/(guru)');
          break;
        case 'ortu':
          router.replace('/(tabs)/(ortu)');
          break;
        case 'admin':
          router.replace('/(tabs)/(admin)');
          break;
      }
    }
  }, [profile?.role]);

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="(siswa)" options={{ href: null }} />
      <Tabs.Screen name="(guru)" options={{ href: null }} />
      <Tabs.Screen name="(ortu)" options={{ href: null }} />
      <Tabs.Screen name="(admin)" options={{ href: null }} />
    </Tabs>
  );
}