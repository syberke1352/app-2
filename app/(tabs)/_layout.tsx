import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import React from 'react';

export default function TabsLayout() {
  const { profile, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!profile) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // Route to appropriate role-based tabs
  switch (profile.role) {
    case 'siswa':
      return <Redirect href="/(tabs)/(siswa)" />;
    case 'guru':
      return <Redirect href="/(tabs)/(guru)" />;
    case 'ortu':
      return <Redirect href="/(tabs)/(ortu)" />;
    case 'admin':
      return <Redirect href="/(tabs)/(admin)" />;
    default:
      return <Redirect href="/(auth)/welcome" />;
  }
}