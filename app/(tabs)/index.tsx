import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Award, Users, TrendingUp, Calendar, Star,Trophy } from 'lucide-react-native';

interface DashboardStats {
  totalSetoran?: number;
  setoranPending?: number;
  totalPoin?: number;
  labelCount?: number;
  totalSiswa?: number;
  recentActivity?: any[];
}

export default function HomeScreen() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    if (!profile) return;

    try {
      switch (profile.role) {
        case 'siswa':
          await fetchSiswaStats();
          break;
        case 'guru':
          await fetchGuruStats();
          break;
        case 'ortu':
          await fetchOrtuStats();
          break;
        case 'admin':
          await fetchAdminStats();
          break;
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSiswaStats = async () => {
    // Get student points
    const { data: pointsData } = await supabase
      .from('siswa_poin')
      .select('*')
      .eq('siswa_id', profile?.id)
      .single();

    // Get setoran count
    const { data: setoranData, count: setoranCount } = await supabase
      .from('setoran')
      .select('*', { count: 'exact', head: true })
      .eq('siswa_id', profile?.id);

    // Get labels count
    const { data: labelsData, count: labelsCount } = await supabase
      .from('labels')
      .select('*', { count: 'exact', head: true })
      .eq('siswa_id', profile?.id);

    setStats({
      totalSetoran: setoranCount || 0,
      totalPoin: pointsData?.total_poin || 0,
      labelCount: labelsCount || 0,
    });
  };

  const fetchGuruStats = async () => {
    // Get pending setoran count
    const { count: pendingCount } = await supabase
      .from('setoran')
      .select('*', { count: 'exact', head: true })
      .eq('organize_id', profile?.organize_id)
      .eq('status', 'pending');

    // Get total students in organize
    const { count: siswaCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('organize_id', profile?.organize_id)
      .eq('role', 'siswa');

    setStats({
      setoranPending: pendingCount || 0,
      totalSiswa: siswaCount || 0,
    });
  };

  const fetchOrtuStats = async () => {
    // Implementation for parent monitoring
    setStats({});
  };

  const fetchAdminStats = async () => {
    // Implementation for admin stats
    setStats({});
  };

  useEffect(() => {
    fetchDashboardData();
  }, [profile]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const renderStatsCard = (icon: any, title: string, value: string | number, color: string) => (
    <View style={styles.statsCard}>
      <View style={[styles.statsIcon, { backgroundColor: color }]}>
        {React.createElement(icon, { size: 24, color: 'white' })}
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
    </View>
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#10B981', '#3B82F6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{profile?.name}</Text>
            <Text style={styles.userRole}>
              {profile?.role === 'siswa' ? 'Siswa' :
               profile?.role === 'guru' ? 'Guru' :
               profile?.role === 'ortu' ? 'Orang Tua' : 'Admin'}
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <BookOpen size={32} color="white" />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {profile?.role === 'siswa' && (
            <>
              {renderStatsCard(TrendingUp, 'Total Poin', stats.totalPoin || 0, '#3B82F6')}
              {renderStatsCard(BookOpen, 'Setoran', stats.totalSetoran || 0, '#10B981')}
              {renderStatsCard(Award, 'Label Juz', stats.labelCount || 0, '#F59E0B')}
            </>
          )}
          
          {profile?.role === 'guru' && (
            <>
              {renderStatsCard(Calendar, 'Menunggu Penilaian', stats.setoranPending || 0, '#EF4444')}
              {renderStatsCard(Users, 'Total Siswa', stats.totalSiswa || 0, '#10B981')}
              {renderStatsCard(Award, 'Kelas Aktif', 1, '#3B82F6')}
            </>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aksi Cepat</Text>
          <View style={styles.quickActions}>
            {profile?.role === 'siswa' && (
              <>
                <Pressable style={[styles.actionCard, { backgroundColor: '#10B981' }]}>
                  <BookOpen size={24} color="white" />
                  <Text style={styles.actionText}>Setoran Baru</Text>
                </Pressable>
                <Pressable style={[styles.actionCard, { backgroundColor: '#3B82F6' }]}>
                  <Trophy size={24} color="white" />
                  <Text style={styles.actionText}>Ikuti Quiz</Text>
                </Pressable>
              </>
            )}
            
            {profile?.role === 'guru' && (
              <>
                <Pressable style={[styles.actionCard, { backgroundColor: '#EF4444' }]}>
                  <Award size={24} color="white" />
                  <Text style={styles.actionText}>Nilai Setoran</Text>
                </Pressable>
                <Pressable style={[styles.actionCard, { backgroundColor: '#8B5CF6' }]}>
                  <Users size={24} color="white" />
                  <Text style={styles.actionText}>Kelola Kelas</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Today's Quote */}
        <View style={styles.quoteCard}>
          <Star size={20} color="#F59E0B" />
          <Text style={styles.quoteText}>
            "Dan sungguhnya telah Kami mudahkan Al-Quran untuk pelajaran, 
            maka adakah orang yang mengambil pelajaran?"
          </Text>
          <Text style={styles.quoteSource}>- QS. Al-Qamar: 17</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  userRole: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    marginTop: 2,
  },
  headerIcon: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  quoteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteText: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    marginTop: 12,
    marginBottom: 8,
  },
  quoteSource: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
});