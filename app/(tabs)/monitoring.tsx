import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { User, TrendingUp, BookOpen, Award, Calendar, Target } from 'lucide-react-native';

interface ChildProgress {
  id: string;
  name: string;
  totalSetoran: number;
  setoranDiterima: number;
  totalPoin: number;
  labelCount: number;
  recentActivity: any[];
}

export default function MonitoringScreen() {
  const { profile } = useAuth();
  const [children, setChildren] = useState<ChildProgress[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildProgress | null>(null);
  const [loading, setLoading] = useState(true);

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
            .eq('siswa_id', student.id);

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

          return {
            id: student.id,
            name: student.name,
            totalSetoran: setoranData?.length || 0,
            setoranDiterima: setoranData?.filter(s => s.status === 'diterima').length || 0,
            totalPoin: pointsData?.total_poin || 0,
            labelCount: labelsData?.length || 0,
            recentActivity: setoranData?.slice(0, 5) || [],
          };
        })
      );

      setChildren(childrenProgress);
    } catch (error) {
      console.error('Error in fetchChildrenProgress:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildrenProgress();
  }, [profile]);

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
        <Text style={styles.childName}>{child.name}</Text>
      </View>

      <View style={styles.childStats}>
        <View style={styles.childStat}>
          <Text style={styles.childStatNumber}>{child.totalPoin}</Text>
          <Text style={styles.childStatLabel}>Poin</Text>
        </View>
        <View style={styles.childStat}>
          <Text style={styles.childStatNumber}>{child.setoranDiterima}</Text>
          <Text style={styles.childStatLabel}>Setoran Diterima</Text>
        </View>
        <View style={styles.childStat}>
          <Text style={styles.childStatNumber}>{child.labelCount}</Text>
          <Text style={styles.childStatLabel}>Label Juz</Text>
        </View>
      </View>

      <View style={styles.progressIndicator}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min((child.setoranDiterima / Math.max(child.totalSetoran, 1)) * 100, 100)}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {child.totalSetoran > 0 ? Math.round((child.setoranDiterima / child.totalSetoran) * 100) : 0}% setoran diterima
        </Text>
      </View>
    </Pressable>
  );

  if (selectedChild) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.detailHeader}>
          <Pressable onPress={() => setSelectedChild(null)}>
            <Text style={styles.backText}>Kembali</Text>
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
            <Text style={styles.detailStatNumber}>{selectedChild.totalSetoran}</Text>
            <Text style={styles.detailStatLabel}>Total Setoran</Text>
          </View>
          <View style={styles.detailStatCard}>
            <Award size={24} color="#F59E0B" />
            <Text style={styles.detailStatNumber}>{selectedChild.labelCount}</Text>
            <Text style={styles.detailStatLabel}>Label Juz</Text>
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
                  <View style={styles.activityIcon}>
                    <BookOpen size={16} color={activity.status === 'diterima' ? '#10B981' : '#F59E0B'} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>
                      {activity.jenis === 'hafalan' ? 'Hafalan' : 'Murojaah'} {activity.surah}
                    </Text>
                    <Text style={styles.activityDate}>
                      {new Date(activity.tanggal).toLocaleDateString('id-ID')}
                    </Text>
                  </View>
                  <View style={[
                    styles.activityStatus,
                    { backgroundColor: activity.status === 'diterima' ? '#DCFCE7' : '#FEF3C7' }
                  ]}>
                    <Text style={[
                      styles.activityStatusText,
                      { color: activity.status === 'diterima' ? '#10B981' : '#F59E0B' }
                    ]}>
                      {activity.status === 'pending' ? 'Menunggu' : 
                       activity.status === 'diterima' ? 'Diterima' : 'Ditolak'}
                    </Text>
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
    <ScrollView style={styles.container}>
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
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  childStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  childStat: {
    flex: 1,
    alignItems: 'center',
  },
  childStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  childStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  progressIndicator: {
    marginTop: 8,
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
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
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
    backgroundColor: '#F3F4F6',
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
});