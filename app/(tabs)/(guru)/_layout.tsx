import { Tabs } from 'expo-router';
import { Chrome as Home, BookOpen, Trophy, ClipboardCheck, GraduationCap, User, Plus } from 'lucide-react-native';

export default function GuruTabsLayout() {
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
      />
    </Tabs>
  );
}