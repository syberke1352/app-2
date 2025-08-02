import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Users, Plus, Settings, UserPlus, Copy, Eye, Calendar } from 'lucide-react-native';

interface OrganizeData {
  id: string;
  name: string;
  description?: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

interface StudentData {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export default function OrganizeScreen() {
  const { profile } = useAuth();
  const [organize, setOrganize] = useState<OrganizeData | null>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);

  const fetchOrganize = async () => {
    if (!profile) return;

    try {
      if (profile.organize_id) {
        // Get existing organize
        const { data: organizeData, error } = await supabase
          .from('organizes')
          .select('*')
          .eq('id', profile.organize_id)
          .single();

        if (error) {
          console.error('Error fetching organize:', error);
          return;
        }

        setOrganize(organizeData);
        await fetchStudents(profile.organize_id);
      }
    } catch (error) {
      console.error('Error in fetchOrganize:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (organizeId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, created_at')
        .eq('organize_id', organizeId)
        .eq('role', 'siswa')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching students:', error);
        return;
      }

      setStudents(data || []);
    } catch (error) {
      console.error('Error in fetchStudents:', error);
    }
  };

  const generateClassCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createOrganize = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Nama kelas harus diisi');
      return;
    }

    try {
      const classCode = generateClassCode();

      const { data, error } = await supabase
        .from('organizes')
        .insert([{
          name: formData.name,
          description: formData.description,
          guru_id: profile?.id,
          code: classCode,
        }])
        .select()
        .single();

      if (error) {
        Alert.alert('Error', 'Gagal membuat kelas');
        return;
      }

      // Update user's organize_id
      await supabase
        .from('users')
        .update({ organize_id: data.id })
        .eq('id', profile?.id);

      Alert.alert('Sukses', `Kelas berhasil dibuat dengan kode: ${classCode}`);
      setShowCreateForm(false);
      setFormData({ name: '', description: '' });
      fetchOrganize();
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat membuat kelas');
    }
  };

  const copyClassCode = () => {
    if (organize?.code) {
      // In real app, copy to clipboard
      Alert.alert('Kode Disalin', `Kode kelas: ${organize.code}`);
    }
  };

  useEffect(() => {
    fetchOrganize();
  }, [profile]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Memuat...</Text>
      </View>
    );
  }

  if (!organize) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Users size={32} color="#3B82F6" />
          <Text style={styles.headerTitle}>Kelola Kelas</Text>
          <Text style={styles.headerSubtitle}>Buat kelas untuk mengelola siswa</Text>
        </View>

        {showCreateForm ? (
          <View style={styles.createForm}>
            <Text style={styles.formTitle}>Buat Kelas Baru</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nama Kelas"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Deskripsi Kelas (opsional)"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={3}
            />

            <View style={styles.formActions}>
              <Pressable 
                style={styles.cancelButton}
                onPress={() => setShowCreateForm(false)}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </Pressable>
              <Pressable 
                style={styles.createButton}
                onPress={createOrganize}
              >
                <Text style={styles.createButtonText}>Buat Kelas</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.noOrganizeContainer}>
            <Users size={64} color="#9CA3AF" />
            <Text style={styles.noOrganizeTitle}>Belum Ada Kelas</Text>
            <Text style={styles.noOrganizeSubtitle}>
              Buat kelas pertama Anda untuk mulai mengelola siswa
            </Text>
            <Pressable 
              style={styles.createFirstButton}
              onPress={() => setShowCreateForm(true)}
            >
              <Plus size={20} color="white" />
              <Text style={styles.createFirstButtonText}>Buat Kelas</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Users size={32} color="#3B82F6" />
        <Text style={styles.headerTitle}>Kelola Kelas</Text>
        <Text style={styles.headerSubtitle}>{organize.name}</Text>
      </View>

      {/* Class Info */}
      <View style={styles.classInfoCard}>
        <View style={styles.classHeader}>
          <Text style={styles.className}>{organize.name}</Text>
          <Pressable style={styles.settingsButton}>
            <Settings size={20} color="#6B7280" />
          </Pressable>
        </View>
        
        {organize.description && (
          <Text style={styles.classDescription}>{organize.description}</Text>
        )}

        <View style={styles.classStats}>
          <View style={styles.statItem}>
            <Users size={16} color="#3B82F6" />
            <Text style={styles.statText}>{students.length} Siswa</Text>
          </View>
          <View style={styles.statItem}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.statText}>
              Dibuat {new Date(organize.created_at).toLocaleDateString('id-ID')}
            </Text>
          </View>
        </View>

        <View style={styles.classCodeContainer}>
          <View style={styles.classCodeInfo}>
            <Text style={styles.classCodeLabel}>Kode Kelas</Text>
            <Text style={styles.classCode}>{organize.code}</Text>
          </View>
          <Pressable style={styles.copyButton} onPress={copyClassCode}>
            <Copy size={16} color="#10B981" />
          </Pressable>
        </View>
      </View>

      {/* Students List */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daftar Siswa</Text>
          <Pressable style={styles.addStudentButton}>
            <UserPlus size={16} color="#3B82F6" />
          </Pressable>
        </View>

        {students.length === 0 ? (
          <View style={styles.emptyStudents}>
            <UserPlus size={48} color="#9CA3AF" />
            <Text style={styles.emptyStudentsText}>Belum ada siswa</Text>
            <Text style={styles.emptyStudentsSubtext}>
              Bagikan kode kelas untuk mengundang siswa
            </Text>
          </View>
        ) : (
          <View style={styles.studentsList}>
            {students.map((student) => (
              <View key={student.id} style={styles.studentCard}>
                <View style={styles.studentAvatar}>
                  <Text style={styles.studentInitial}>
                    {student.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentEmail}>{student.email}</Text>
                  <Text style={styles.joinDate}>
                    Bergabung {new Date(student.created_at).toLocaleDateString('id-ID')}
                  </Text>
                </View>

                <Pressable style={styles.viewButton}>
                  <Eye size={16} color="#6B7280" />
                </Pressable>
              </View>
            ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  noOrganizeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 400,
  },
  noOrganizeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
  },
  noOrganizeSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  createFirstButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createForm: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  createButton: {
    flex: 2,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  classInfoCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  className: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  classDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  classStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
  },
  classCodeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
  },
  classCodeInfo: {
    flex: 1,
  },
  classCodeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  classCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  copyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    margin: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addStudentButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStudents: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyStudentsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStudentsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  studentsList: {
    gap: 12,
  },
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
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
  studentAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#10B981',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  studentEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  joinDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  viewButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});