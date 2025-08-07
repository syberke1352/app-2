import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';

export default function TabsLayout() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // Will be handled by index.tsx
    }
  }, [user, loading]);

  if (loading || !user || !profile) {
    return null;
  }

  // Redirect to role-specific tabs
  switch (profile.role) {
    case 'siswa':
      return <Redirect href="/(tabs)/siswa" />;
    case 'guru':
      return <Redirect href="/(tabs)/guru" />;
    case 'ortu':
      return <Redirect href="/(tabs)/ortu" />;
    case 'admin':
      return <Redirect href="/(tabs)/admin" />;
    default:
      return <Redirect href="/(auth)/welcome" />;
  }
}