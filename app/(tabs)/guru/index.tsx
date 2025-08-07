import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Award, Users, Clock, Calendar, Star } from 'lucide-react-native';

interface GuruStats {
  setoranPending: number;
  totalSiswa: number;
  recentActivity: any[];
}

export default function GuruHomeScreen() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<GuruStats>({
    setoranPending: 0,
    totalSiswa: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGuruStats = async () => {
    if (!profile?.organize_id) return;

    try {
      // Get pending setoran count
      const { count: pendingCount } = await supabase
        .from('setoran')
        .select('*', { count: 'exact', head: true })
        .eq('organize_id', profile.organize_id)
        .eq('status', 'pending');

      // Get total students in organize
      const { count: siswaCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('organize_id', profile.organize_id)
        .eq('role', 'siswa');

      // Get recent setoran for review
      const { data: recentSetoran } = await supabase
        .from('setoran')
        .select(`
          *,
          siswa:siswa_id(name)
        `)
        .eq('organize_id', profile.organize_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(3);

      setStats({
        setoranPending: pendingCount || 0,
        totalSiswa: siswaCount || 0,
        recentActivity: recentSetoran || [],
      });
    } catch (error) {
      console.error('Error fetching guru stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGuruStats();
  }, [profile]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGuruStats();
  };

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
            <Text style={styles.userRole}>Guru</Text>
          </View>
          <View style={styles.headerIcon}>
            <BookOpen size={32} color="white" />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Pressable 
            style={styles.statsCard}
            onPress={() => router.push('/(tabs)/guru/penilaian')}
          >
            <View style={[styles.statsIcon, { backgroundColor: '#EF4444' }]}>
              <Clock size={24} color="white" />
            </View>
            <Text style={styles.statsValue}>{stats.setoranPending}</Text>
            <Text style={styles.statsTitle}>Menunggu Penilaian</Text>
          </Pressable>
          
          <View style={styles.statsCard}>
            <View style={[styles.statsIcon, { backgroundColor: '#10B981' }]}>
              <Users size={24} color="white" />
            </View>
            <Text style={styles.statsValue}>{stats.totalSiswa}</Text>
            <Text style={styles.statsTitle}>Total Siswa</Text>
          </View>
          
          <View style={styles.statsCard}>
            <View style={[styles.statsIcon, { backgroundColor: '#3B82F6' }]}>
              <Award size={24} color="white" />
            </View>
            <Text style={styles.statsValue}>1</Text>
            <Text style={styles.statsTitle}>Kelas Aktif</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aksi Cepat</Text>
          <View style={styles.quickActions}>
            <Pressable 
              style={[styles.actionCard, { backgroundColor: '#EF4444' }]}
              onPress={() => router.push('/(tabs)/guru/penilaian')}
            >
              <Award size={24} color="white" />
              <Text style={styles.actionText}>Nilai Setoran</Text>
            </Pressable>
            <Pressable 
              style={[styles.actionCard, { backgroundColor: '#8B5CF6' }]}
              onPress={() => router.push('/(tabs)/guru/organize')}
            >
              <Users size={24} color="white" />
              <Text style={styles.actionText}>Kelola Kelas</Text>
            </Pressable>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Setoran Menunggu Penilaian</Text>
          {stats.recentActivity && stats.recentActivity.length > 0 ? (
            <View style={styles.activityList}>
              {stats.recentActivity.map((activity, index) => (
                <Pressable 
                  key={activity.id || index} 
                  style={styles.activityCard}
                  onPress={() => router.push('/(tabs)/guru/penilaian')}
                >
                  <View style={styles.activityIcon}>
                    <BookOpen size={16} color="#10B981" />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>
                      {activity.siswa?.name} - {activity.jenis === 'hafalan' ? 'Hafalan' : 'Murojaah'} {activity.surah}
                    </Text>
                    <Text style={styles.activityDate}>
                      {new Date(activity.tanggal || activity.created_at).toLocaleDateString('id-ID')}
                    </Text>
                  </View>
                  <View style={styles.activityStatus}>
                    <Clock size={12} color="#F59E0B" />
                    <Text style={styles.activityStatusText}>Menunggu</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyActivity}>
              <Calendar size={32} color="#9CA3AF" />
              <Text style={styles.emptyActivityText}>Semua setoran sudah dinilai</Text>
            </View>
          )}
        </View>

        {/* Today's Quote */}
        <View style={styles.quoteCard}>
          <Star size={20} color="#F59E0B" />
          <Text style={styles.quoteText}>
            "Sebaik-baik manusia adalah yang belajar Al-Quran dan mengajarkannya"
          </Text>
          <Text style={styles.quoteSource}>- HR. Bukhari</Text>
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
  activityList: {
    gap: 8,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  activityDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  activityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FEF3C7',
  },
  activityStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  emptyActivity: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyActivityText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
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