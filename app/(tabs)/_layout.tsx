import { useAuth } from '@/contexts/AuthContext';
import { Tabs, router } from 'expo-router';
import { ChartBar as BarChart3, BookOpen, ClipboardCheck, CloudUpload, GraduationCap, Home, HousePlus, ListChecks, ShieldCheck, Trophy, User } from 'lucide-react-native';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const { user, profile, loading } = useAuth();
  const insets = useSafeAreaInsets();
  const role = profile?.role;

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/(auth)/welcome');
    }
  }, [user, loading]);

  if (loading || !user || !profile) {
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
         {
            name: 'leaderboard',
            title: 'Leaderboard',
            icon: Trophy,
          },
    ];

    switch (role) {
      case 'siswa':
        return [
          ...commonTabs,
          {
            name: 'setoran',
            title: 'Setoran',
            icon: CloudUpload,
          },
          {
            name: 'quiz',
            title: 'Quiz',
            icon: ListChecks,
          },
          {
            name: 'join-organize',
            title: 'Gabung Kelas',
            icon: HousePlus ,
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
            icon: ClipboardCheck ,
          },
          {
            name: 'organize',
            title: 'Kelas',
            icon: GraduationCap,
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
            icon: BarChart3,
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
            icon: ShieldCheck,
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
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 70 + insets.bottom : 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
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