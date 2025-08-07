import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Award, TrendingUp, Calendar, Star, Trophy, Target, CirclePlus as PlusCircle } from 'lucide-react-native';

interface SiswaStats {
  totalSetoran: number;
  setoranPending: number;
  setoranDiterima: number;
  totalPoin: number;
  labelCount: number;
  recentActivity: any[];
  hafalanProgress: number;
  murojaahProgress: number;
}

export default function SiswaHomeScreen() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<SiswaStats>({
    totalSetoran: 0,
    setoranPending: 0,
    setoranDiterima: 0,
    totalPoin: 0,
    labelCount: 0,
    recentActivity: [],
    hafalanProgress: 0,
    murojaahProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSiswaStats = async () => {
    if (!profile) return;

    try {
      // Get student points
      const { data: pointsData } = await supabase
        .from('siswa_poin')
        .select('*')
        .eq('siswa_id', profile.id)
        .single();

      // Get setoran stats
      const { data: setoranData } = await supabase
        .from('setoran')
        .select('*')
        .eq('siswa_id', profile.id)
        .order('created_at', { ascending: false });

      // Get labels count
      const { data: labelsData } = await supabase
        .from('labels')
        .select('*')
        .eq('siswa_id', profile.id);

      const totalSetoran = setoranData?.length || 0;
      const setoranDiterima = setoranData?.filter(s => s.status === 'diterima').length || 0;
      const setoranPending = setoranData?.filter(s => s.status === 'pending').length || 0;
      const hafalanProgress = setoranData?.filter(s => s.jenis === 'hafalan' && s.status === 'diterima').length || 0;
      const murojaahProgress = setoranData?.filter(s => s.jenis === 'murojaah' && s.status === 'diterima').length || 0;

      setStats({
        totalSetoran,
        setoranDiterima,
        setoranPending,
        totalPoin: pointsData?.total_poin || 0,
        labelCount: labelsData?.length || 0,
        recentActivity: setoranData?.slice(0, 3) || [],
        hafalanProgress,
        murojaahProgress,
      });
    } catch (error) {
      console.error('Error fetching siswa stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSiswaStats();
  }, [profile]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSiswaStats();
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
            <Text style={styles.userRole}>Siswa</Text>
          </View>
          <View style={styles.headerIcon}>
            <BookOpen size={32} color="white" />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <View style={[styles.statsIcon, { backgroundColor: '#3B82F6' }]}>
              <TrendingUp size={24} color="white" />
            </View>
            <Text style={styles.statsValue}>{stats.totalPoin}</Text>
            <Text style={styles.statsTitle}>Total Poin</Text>
          </View>
          
          <View style={styles.statsCard}>
            <View style={[styles.statsIcon, { backgroundColor: '#10B981' }]}>
              <BookOpen size={24} color="white" />
            </View>
            <Text style={styles.statsValue}>{stats.setoranDiterima}</Text>
            <Text style={styles.statsTitle}>Setoran Diterima</Text>
          </View>
          
          <View style={styles.statsCard}>
            <View style={[styles.statsIcon, { backgroundColor: '#F59E0B' }]}>
              <Award size={24} color="white" />
            </View>
            <Text style={styles.statsValue}>{stats.labelCount}</Text>
            <Text style={styles.statsTitle}>Label Juz</Text>
          </View>
        </View>

        {/* Progress Cards */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Progress Pembelajaran</Text>
          <View style={styles.progressCards}>
            <View style={styles.progressCard}>
              <BookOpen size={20} color="#10B981" />
              <Text style={styles.progressTitle}>Hafalan</Text>
              <Text style={styles.progressNumber}>{stats.hafalanProgress}</Text>
              <Text style={styles.progressLabel}>Setoran Diterima</Text>
            </View>
            <View style={styles.progressCard}>
              <Target size={20} color="#3B82F6" />
              <Text style={styles.progressTitle}>Murojaah</Text>
              <Text style={styles.progressNumber}>{stats.murojaahProgress}</Text>
              <Text style={styles.progressLabel}>Setoran Diterima</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aksi Cepat</Text>
          <View style={styles.quickActions}>
            <Pressable 
              style={[styles.actionCard, { backgroundColor: '#10B981' }]}
              onPress={() => router.push('/(tabs)/siswa/setoran')}
            >
              <PlusCircle size={24} color="white" />
              <Text style={styles.actionText}>Setoran Baru</Text>
            </Pressable>
            <Pressable 
              style={[styles.actionCard, { backgroundColor: '#3B82F6' }]}
              onPress={() => router.push('/(tabs)/siswa/quiz')}
            >
              <Trophy size={24} color="white" />
              <Text style={styles.actionText}>Ikuti Quiz</Text>
            </Pressable>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
          {stats.recentActivity && stats.recentActivity.length > 0 ? (
            <View style={styles.activityList}>
              {stats.recentActivity.map((activity, index) => (
                <View key={activity.id || index} style={styles.activityCard}>
                  <View style={styles.activityIcon}>
                    <BookOpen size={16} color="#10B981" />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>
                      {activity.jenis === 'hafalan' ? 'Hafalan' : 'Murojaah'} {activity.surah}
                    </Text>
                    <Text style={styles.activityDate}>
                      {new Date(activity.tanggal || activity.created_at).toLocaleDateString('id-ID')}
                    </Text>
                  </View>
                  <View style={[
                    styles.activityStatus,
                    { backgroundColor: activity.status === 'diterima' ? '#DCFCE7' : 
                                     activity.status === 'pending' ? '#FEF3C7' : '#FEE2E2' }
                  ]}>
                    <Text style={[
                      styles.activityStatusText,
                      { color: activity.status === 'diterima' ? '#10B981' : 
                               activity.status === 'pending' ? '#F59E0B' : '#EF4444' }
                    ]}>
                      {activity.status === 'pending' ? 'Menunggu' : 
                       activity.status === 'diterima' ? 'Diterima' : 'Ditolak'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyActivity}>
              <Calendar size={32} color="#9CA3AF" />
              <Text style={styles.emptyActivityText}>Belum ada aktivitas</Text>
            </View>
          )}
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
  progressSection: {
    marginBottom: 24,
  },
  progressCards: {
    flexDirection: 'row',
    gap: 12,
  },
  progressCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  progressLabel: {
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activityStatusText: {
    fontSize: 12,
    fontWeight: '600',
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