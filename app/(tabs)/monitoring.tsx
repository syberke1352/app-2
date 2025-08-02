import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { User, TrendingUp, BookOpen, Award, Calendar, Target,XCircle , Clock, CircleCheck as CheckCircle } from 'lucide-react-native';

interface ChildProgress {
  id: string;
  name: string;
  totalSetoran: number;
  setoranDiterima: number;
  setoranPending: number;
  totalPoin: number;
  labelCount: number;
  recentActivity: any[];
  hafalanProgress: number;
  murojaahProgress: number;
}

export default function MonitoringScreen() {
  const { profile } = useAuth();
  const [children, setChildren] = useState<ChildProgress[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChildrenProgress = async () => {
    if (!profile?.organize_id) return;

    try {
      // Get children (students) in same organize
      const { data: studentsData, error } = await supabase
        .from('users')
        .select('id, name')
        .eq('organize_id', profile.organize_id)
        .eq('role', 'siswa');

      if (error || !studentsData) {
        console.error('Error fetching children:', error);
        return;
      }

      const childrenProgress = await Promise.all(
        studentsData.map(async (student) => {
          // Get setoran stats
          const { data: setoranData } = await supabase
            .from('setoran')
            .select('*')
            .eq('siswa_id', student.id)
            .order('created_at', { ascending: false });

          // Get points
          const { data: pointsData } = await supabase
            .from('siswa_poin')
            .select('*')
            .eq('siswa_id', student.id)
            .single();

          // Get labels
          const { data: labelsData } = await supabase
            .from('labels')
            .select('*')
            .eq('siswa_id', student.id);

          const totalSetoran = setoranData?.length || 0;
          const setoranDiterima = setoranData?.filter(s => s.status === 'diterima').length || 0;
          const setoranPending = setoranData?.filter(s => s.status === 'pending').length || 0;
          const hafalanCount = setoranData?.filter(s => s.jenis === 'hafalan' && s.status === 'diterima').length || 0;
          const murojaahCount = setoranData?.filter(s => s.jenis === 'murojaah' && s.status === 'diterima').length || 0;

          return {
            id: student.id,
            name: student.name,
            totalSetoran,
            setoranDiterima,
            setoranPending,
            totalPoin: pointsData?.total_poin || 0,
            labelCount: labelsData?.length || 0,
            recentActivity: setoranData?.slice(0, 5) || [],
            hafalanProgress: hafalanCount,
            murojaahProgress: murojaahCount,
          };
        })
      );

      setChildren(childrenProgress);
    } catch (error) {
      console.error('Error in fetchChildrenProgress:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChildrenProgress();
  }, [profile]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchChildrenProgress();
  };

  const renderChildCard = (child: ChildProgress) => (
    <Pressable 
      key={child.id} 
      style={styles.childCard}
      onPress={() => setSelectedChild(child)}
    >
      <View style={styles.childHeader}>
        <View style={styles.childAvatar}>
          <Text style={styles.childInitial}>
            {child.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.childInfo}>
          <Text style={styles.childName}>{child.name}</Text>
          <Text style={styles.childStats}>
            {child.totalPoin} poin • {child.labelCount} label juz
          </Text>
        </View>
        {child.setoranPending > 0 && (
          <View style={styles.pendingIndicator}>
            <Text style={styles.pendingCount}>{child.setoranPending}</Text>
          </View>
        )}
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressItem}>
          <BookOpen size={16} color="#10B981" />
          <Text style={styles.progressLabel}>Hafalan</Text>
          <Text style={styles.progressValue}>{child.hafalanProgress}</Text>
        </View>
        <View style={styles.progressItem}>
          <Target size={16} color="#3B82F6" />
          <Text style={styles.progressLabel}>Murojaah</Text>
          <Text style={styles.progressValue}>{child.murojaahProgress}</Text>
        </View>
        <View style={styles.progressItem}>
          <Award size={16} color="#F59E0B" />
          <Text style={styles.progressLabel}>Akurasi</Text>
          <Text style={styles.progressValue}>
            {child.totalSetoran > 0 ? Math.round((child.setoranDiterima / child.totalSetoran) * 100) : 0}%
          </Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${Math.min((child.setoranDiterima / Math.max(child.totalSetoran, 1)) * 100, 100)}%` }
          ]} 
        />
      </View>
    </Pressable>
  );

  if (selectedChild) {
    return (
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.detailHeader}>
          <Pressable onPress={() => setSelectedChild(null)}>
            <Text style={styles.backText}>← Kembali</Text>
          </Pressable>
          <Text style={styles.detailTitle}>{selectedChild.name}</Text>
          <View />
        </View>

        {/* Detailed Stats */}
        <View style={styles.detailStatsContainer}>
          <View style={styles.detailStatCard}>
            <TrendingUp size={24} color="#3B82F6" />
            <Text style={styles.detailStatNumber}>{selectedChild.totalPoin}</Text>
            <Text style={styles.detailStatLabel}>Total Poin</Text>
          </View>
          <View style={styles.detailStatCard}>
            <BookOpen size={24} color="#10B981" />
            <Text style={styles.detailStatNumber}>{selectedChild.setoranDiterima}</Text>
            <Text style={styles.detailStatLabel}>Setoran Diterima</Text>
          </View>
          <View style={styles.detailStatCard}>
            <Award size={24} color="#F59E0B" />
            <Text style={styles.detailStatNumber}>{selectedChild.labelCount}</Text>
            <Text style={styles.detailStatLabel}>Label Juz</Text>
          </View>
        </View>

        {/* Progress Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail Progress</Text>
          <View style={styles.progressBreakdown}>
            <View style={styles.progressCard}>
              <BookOpen size={20} color="#10B981" />
              <Text style={styles.progressCardTitle}>Hafalan</Text>
              <Text style={styles.progressCardNumber}>{selectedChild.hafalanProgress}</Text>
              <Text style={styles.progressCardLabel}>Setoran Diterima</Text>
            </View>
            <View style={styles.progressCard}>
              <Target size={20} color="#3B82F6" />
              <Text style={styles.progressCardTitle}>Murojaah</Text>
              <Text style={styles.progressCardNumber}>{selectedChild.murojaahProgress}</Text>
              <Text style={styles.progressCardLabel}>Setoran Diterima</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
          {selectedChild.recentActivity.length === 0 ? (
            <View style={styles.emptyActivity}>
              <Calendar size={32} color="#9CA3AF" />
              <Text style={styles.emptyActivityText}>Belum ada aktivitas</Text>
            </View>
          ) : (
            <View style={styles.activityList}>
              {selectedChild.recentActivity.map((activity) => (
                <View key={activity.id} style={styles.activityCard}>
                  <View style={[styles.activityIcon, { 
                    backgroundColor: activity.status === 'diterima' ? '#DCFCE7' : 
                                   activity.status === 'pending' ? '#FEF3C7' : '#FEE2E2'
                  }]}>
                    {activity.status === 'diterima' ? (
                      <CheckCircle size={16} color="#10B981" />
                    ) : activity.status === 'pending' ? (
                      <Clock size={16} color="#F59E0B" />
                    ) : (
                      <XCircle size={16} color="#EF4444" />
                    )}
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>
                      {activity.jenis === 'hafalan' ? 'Hafalan' : 'Murojaah'} {activity.surah}
                    </Text>
                    <Text style={styles.activitySubtitle}>
                      Juz {activity.juz}
                      {activity.ayat_mulai && activity.ayat_selesai && 
                        ` • Ayat ${activity.ayat_mulai}-${activity.ayat_selesai}`
                      }
                    </Text>
                    <Text style={styles.activityDate}>
                      {new Date(activity.tanggal).toLocaleDateString('id-ID')}
                    </Text>
                  </View>
                  <View style={styles.activityStatus}>
                    <Text style={[
                      styles.activityStatusText,
                      { color: activity.status === 'diterima' ? '#10B981' : 
                               activity.status === 'pending' ? '#F59E0B' : '#EF4444' }
                    ]}>
                      {activity.status === 'pending' ? 'Menunggu' : 
                       activity.status === 'diterima' ? 'Diterima' : 'Ditolak'}
                    </Text>
                    {activity.poin > 0 && (
                      <Text style={styles.activityPoin}>+{activity.poin} poin</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <User size={32} color="#8B5CF6" />
        <Text style={styles.headerTitle}>Monitoring Anak</Text>
        <Text style={styles.headerSubtitle}>Pantau perkembangan pembelajaran anak</Text>
      </View>

      {/* Children List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daftar Anak</Text>
        
        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <User size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Belum ada data anak</Text>
            <Text style={styles.emptySubtext}>
              Pastikan anak sudah terdaftar di kelas yang sama
            </Text>
          </View>
        ) : (
          <View style={styles.childrenList}>
            {children.map(renderChildCard)}
          </View>
        )}
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
    backgroundColor: 'white',
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  childrenList: {
    gap: 16,
  },
  childCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  childAvatar: {
    width: 48,
    height: 48,
    backgroundColor: '#8B5CF6',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  childStats: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  pendingIndicator: {
    width: 24,
    height: 24,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  // Detail View Styles
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  detailStatsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  detailStatCard: {
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
  detailStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  detailStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  progressBreakdown: {
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
  progressCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  progressCardNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  progressCardLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
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
  activitySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  activityStatus: {
    alignItems: 'flex-end',
  },
  activityStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityPoin: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: 'bold',
    marginTop: 2,
  },
});