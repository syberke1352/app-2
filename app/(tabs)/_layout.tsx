import { useAuth } from '@/contexts/AuthContext';
import { Tabs } from 'expo-router';
import { Chrome as Home, BookOpen, Trophy, CloudUpload, ListChecks, HousePlus, User, ClipboardCheck, GraduationCap, Plus, ChartBar as BarChart3, ShieldCheck } from 'lucide-react-native';
import React, { useEffect } from 'react';

export default function TabsLayout() {
  const { profile, loading } = useAuth();

  if (loading || !profile) {
    return null;
  }

  // Render tabs based on user role
  const renderTabsForRole = () => {
    switch (profile.role) {
      case 'siswa':
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
            <Tabs.Screen
              name="index"
              options={{
                title: 'Beranda',
                tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="setoran"
              options={{
                title: 'Setoran',
                tabBarIcon: ({ size, color }) => <CloudUpload size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="quiz"
              options={{
                title: 'Quiz',
                tabBarIcon: ({ size, color }) => <ListChecks size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="quran"
              options={{
                title: 'Al-Quran',
                tabBarIcon: ({ size, color }) => <BookOpen size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="leaderboard"
              options={{
                title: 'Leaderboard',
                tabBarIcon: ({ size, color }) => <Trophy size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="join-organize"
              options={{
                title: 'Gabung Kelas',
                tabBarIcon: ({ size, color }) => <HousePlus size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                title: 'Profil',
                tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
              }}
            />
          </Tabs>
        );

      case 'guru':
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
            <Tabs.Screen
              name="index"
              options={{
                title: 'Beranda',
                tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="penilaian"
              options={{
                title: 'Penilaian',
                tabBarIcon: ({ size, color }) => <ClipboardCheck size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="organize"
              options={{
                title: 'Kelas',
                tabBarIcon: ({ size, color }) => <GraduationCap size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="quiz-manage"
              options={{
                title: 'Kelola Quiz',
                tabBarIcon: ({ size, color }) => <Plus size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="quran"
              options={{
                title: 'Al-Quran',
                tabBarIcon: ({ size, color }) => <BookOpen size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="leaderboard"
              options={{
                title: 'Leaderboard',
                tabBarIcon: ({ size, color }) => <Trophy size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                title: 'Profil',
                tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
              }}
      case 'ortu':
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
            <Tabs.Screen
              name="index"
              options={{
                title: 'Beranda',
                tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="monitoring"
              options={{
                title: 'Monitoring',
                tabBarIcon: ({ size, color }) => <BarChart3 size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="quran"
              options={{
                title: 'Al-Quran',
                tabBarIcon: ({ size, color }) => <BookOpen size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="leaderboard"
              options={{
                title: 'Leaderboard',
                tabBarIcon: ({ size, color }) => <Trophy size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                title: 'Profil',
                tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
              }}
            />
          </Tabs>
        );
            />
      case 'admin':
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
            <Tabs.Screen
              name="index"
              options={{
                title: 'Beranda',
                tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="admin"
              options={{
                title: 'Admin',
                tabBarIcon: ({ size, color }) => <ShieldCheck size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="quran"
              options={{
                title: 'Al-Quran',
                tabBarIcon: ({ size, color }) => <BookOpen size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="leaderboard"
              options={{
                title: 'Leaderboard',
                tabBarIcon: ({ size, color }) => <Trophy size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                title: 'Profil',
                tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
              }}
            />
          </Tabs>
        );
          </Tabs>
      default:
        return null;
    }
  };
        );
  return renderTabsForRole();
}