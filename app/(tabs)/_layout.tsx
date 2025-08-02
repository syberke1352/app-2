import React, { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Chrome as Home, BookOpen, Trophy, Users, User, CirclePlus as PlusCircle, Settings } from 'lucide-react-native';

export default function TabsLayout() {
const { user, profile, loading } = useAuth();
const role = profile?.role;

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/(auth)/welcome');
    }
  }, [user, loading]);

  if (loading || !user || !role) {
    return null;
  }


  // Different tabs based on user role
  const getTabsForRole = () => {
    const commonTabs = [
      {
        name: 'index',
        title: 'Beranda',
        icon: Home,
      },
      {
        name: 'quran',
        title: 'Al-Quran',
        icon: BookOpen,
      },
    ];

    switch (role) {
      case 'siswa':
        return [
          ...commonTabs,
          {
            name: 'setoran',
            title: 'Setoran',
            icon: PlusCircle,
          },
          {
            name: 'quiz',
            title: 'Quiz',
            icon: Trophy,
          },
          {
            name: 'profile',
            title: 'Profil',
            icon: User,
          },
        ];
      case 'guru':
        return [
          ...commonTabs,
          {
            name: 'penilaian',
            title: 'Penilaian',
            icon: Trophy,
          },
          {
            name: 'organize',
            title: 'Kelas',
            icon: Users,
          },
          {
            name: 'profile',
            title: 'Profil',
            icon: User,
          },
        ];
      case 'ortu':
        return [
          ...commonTabs,
          {
            name: 'monitoring',
            title: 'Monitoring',
            icon: Trophy,
          },
          {
            name: 'profile',
            title: 'Profil',
            icon: User,
          },
        ];
      case 'admin':
        return [
          ...commonTabs,
          {
            name: 'admin',
            title: 'Admin',
            icon: Settings,
          },
          {
            name: 'profile',
            title: 'Profil',
            icon: User,
          },
        ];
      default:
        return commonTabs;
    }
  };

  const tabs = getTabsForRole();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ size, color }) => (
              <tab.icon size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
