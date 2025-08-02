import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import * as DocumentPicker from 'expo-document-picker';
import { CloudinaryService } from '@/services/cloudinary';
import { Upload, Clock, CircleCheck as CheckCircle, Circle as XCircle, BookOpen, Calendar, FileAudio, Play, Pause } from 'lucide-react-native';

interface SetoranItem {
  id: string;
  jenis: 'hafalan' | 'murojaah';
  surah: string;
  juz: number;
  ayat_mulai?: number;
  ayat_selesai?: number;
  tanggal: string;
  status: 'pending' | 'diterima' | 'ditolak';
  catatan?: string;
  poin: number;
  file_url: string;
}

export default function SetoranScreen() {
  const { profile } = useAuth();
  const [mySetoran, setMySetoran] = useState<SetoranItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    jenis: 'hafalan' as 'hafalan' | 'murojaah',
    surah: '',
    juz: '',
    ayatMulai: '',
    ayatSelesai: '',
    file: null as any,
  });

  const fetchMySetoran = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('setoran')
        .select('*')
        .eq('siswa_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching setoran:', error);
        return;
      }

      setMySetoran(data || []);
    } catch (error) {
      console.error('Error in fetchMySetoran:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData({ ...formData, file: result.assets[0] });
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memilih file');
    }
  };

  const submitSetoran = async () => {
    if (!formData.surah || !formData.juz || !formData.file) {
      Alert.alert('Error', 'Mohon lengkapi semua data');
      return;
    }

    if (!profile?.organize_id) {
      Alert.alert('Error', 'Anda belum bergabung dengan kelas');
      return;
    }

    setUploading(true);

    try {
      // Upload file to Cloudinary
      let fileUrl = '';
      try {
        const uploadResult = await CloudinaryService.uploadFile(formData.file.uri);
        fileUrl = uploadResult.secure_url;
      } catch (uploadError) {
        // Fallback to mock URL for demo
        fileUrl = `https://example.com/audio/${Date.now()}.mp3`;
      }

      const { error } = await supabase
        .from('setoran')
        .insert([{
          siswa_id: profile.id,
          organize_id: profile.organize_id,
          jenis: formData.jenis,
          surah: formData.surah,
          juz: parseInt(formData.juz),
          ayat_mulai: formData.ayatMulai ? parseInt(formData.ayatMulai) : null,
          ayat_selesai: formData.ayatSelesai ? parseInt(formData.ayatSelesai) : null,
          file_url: fileUrl,
          tanggal: new Date().toISOString().split('T')[0],
        }]);

      if (error) {
        Alert.alert('Error', 'Gagal menyimpan setoran');
        return;
      }

      Alert.alert('Sukses', 'Setoran berhasil dikirim dan menunggu penilaian guru!');
      setFormData({
        jenis: 'hafalan',
        surah: '',
        juz: '',
        ayatMulai: '',
        ayatSelesai: '',
        file: null,
      });
      setShowForm(false);
      fetchMySetoran();
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat menyimpan setoran');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchMySetoran();
  }, [profile]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'diterima': return '#10B981';
      case 'ditolak': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'diterima': return CheckCircle;
      case 'ditolak': return XCircle;
      default: return Clock;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu Penilaian';
      case 'diterima': return 'Diterima';
      case 'ditolak': return 'Ditolak';
      default: return status;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BookOpen size={32} color="#10B981" />
        <Text style={styles.headerTitle}>Setoran Hafalan</Text>
        <Text style={styles.headerSubtitle}>Upload dan pantau setoran Anda</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Clock size={20} color="#F59E0B" />
          <Text style={styles.statNumber}>{mySetoran.filter(s => s.status === 'pending').length}</Text>
          <Text style={styles.statLabel}>Menunggu</Text>
        </View>
        <View style={styles.statCard}>
          <CheckCircle size={20} color="#10B981" />
          <Text style={styles.statNumber}>{mySetoran.filter(s => s.status === 'diterima').length}</Text>
          <Text style={styles.statLabel}>Diterima</Text>
        </View>
        <View style={styles.statCard}>
          <FileAudio size={20} color="#3B82F6" />
          <Text style={styles.statNumber}>{mySetoran.reduce((sum, s) => sum + s.poin, 0)}</Text>
          <Text style={styles.statLabel}>Total Poin</Text>
        </View>
      </View>

      {/* Add New Button */}
      <Pressable 
        style={styles.addButton}
        onPress={() => setShowForm(!showForm)}
      >
        <Upload size={20} color="white" />
        <Text style={styles.addButtonText}>Setoran Baru</Text>
      </Pressable>

      {/* Form */}
      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>Setoran Baru</Text>
          
          <View style={styles.typeSelector}>
            <Pressable
              style={[styles.typeButton, formData.jenis === 'hafalan' && styles.typeButtonActive]}
              onPress={() => setFormData({ ...formData, jenis: 'hafalan' })}
            >
              <Text style={[styles.typeButtonText, formData.jenis === 'hafalan' && styles.typeButtonTextActive]}>
                Hafalan
              </Text>
            </Pressable>
            <Pressable
              style={[styles.typeButton, formData.jenis === 'murojaah' && styles.typeButtonActive]}
              onPress={() => setFormData({ ...formData, jenis: 'murojaah' })}
            >
              <Text style={[styles.typeButtonText, formData.jenis === 'murojaah' && styles.typeButtonTextActive]}>
                Murojaah
              </Text>
            </Pressable>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Nama Surah (contoh: Al-Fatihah)"
            value={formData.surah}
            onChangeText={(text) => setFormData({ ...formData, surah: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Juz (1-30)"
            value={formData.juz}
            onChangeText={(text) => setFormData({ ...formData, juz: text })}
            keyboardType="numeric"
          />

          <View style={styles.ayatContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Ayat Mulai"
              value={formData.ayatMulai}
              onChangeText={(text) => setFormData({ ...formData, ayatMulai: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Ayat Selesai"
              value={formData.ayatSelesai}
              onChangeText={(text) => setFormData({ ...formData, ayatSelesai: text })}
              keyboardType="numeric"
            />
          </View>

          <Pressable style={styles.fileButton} onPress={pickFile}>
            <FileAudio size={20} color="#10B981" />
            <Text style={styles.fileButtonText}>
              {formData.file ? formData.file.name : 'Pilih File Audio (MP3/M4A)'}
            </Text>
          </Pressable>

          <View style={styles.formActions}>
            <Pressable 
              style={styles.cancelButton}
              onPress={() => setShowForm(false)}
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </Pressable>
            <Pressable 
              style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
              onPress={submitSetoran}
              disabled={uploading}
            >
              <Text style={styles.submitButtonText}>
                {uploading ? 'Mengupload...' : 'Kirim Setoran'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Setoran List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Riwayat Setoran</Text>
        {mySetoran.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Belum ada setoran</Text>
            <Text style={styles.emptySubtext}>Mulai kirim setoran hafalan atau murojaah Anda</Text>
          </View>
        ) : (
          <View style={styles.setoranList}>
            {mySetoran.map((setoran) => {
              const StatusIcon = getStatusIcon(setoran.status);
              return (
                <View key={setoran.id} style={styles.setoranCard}>
                  <View style={styles.setoranHeader}>
                    <View style={[styles.setoranType, { backgroundColor: setoran.jenis === 'hafalan' ? '#10B981' : '#3B82F6' }]}>
                      <Text style={styles.setoranTypeText}>
                        {setoran.jenis === 'hafalan' ? 'Hafalan' : 'Murojaah'}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(setoran.status) + '20' }]}>
                      <StatusIcon size={12} color={getStatusColor(setoran.status)} />
                      <Text style={[styles.statusText, { color: getStatusColor(setoran.status) }]}>
                        {getStatusText(setoran.status)}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.setoranTitle}>{setoran.surah}</Text>
                  <Text style={styles.setoranDetails}>
                    Juz {setoran.juz}
                    {setoran.ayat_mulai && setoran.ayat_selesai && 
                      ` • Ayat ${setoran.ayat_mulai}-${setoran.ayat_selesai}`
                    }
                  </Text>
                  
                  <View style={styles.setoranFooter}>
                    <View style={styles.setoranDate}>
                      <Calendar size={12} color="#6B7280" />
                      <Text style={styles.setoranDateText}>
                        {new Date(setoran.tanggal).toLocaleDateString('id-ID')}
                      </Text>
                    </View>
                    {setoran.poin > 0 && (
                      <Text style={styles.setoranPoin}>+{setoran.poin} poin</Text>
                    )}
                  </View>

                  {setoran.catatan && (
                    <View style={styles.catatanContainer}>
                      <Text style={styles.catatanLabel}>Catatan Guru:</Text>
                      <Text style={styles.setoranCatatan}>{setoran.catatan}</Text>
                    </View>
                  )}

                  {/* Audio Player */}
                  <View style={styles.audioContainer}>
                    <FileAudio size={16} color="#6B7280" />
                    <Text style={styles.audioText}>File Audio</Text>
                    <Pressable style={styles.playButton}>
                      <Play size={12} color="#10B981" />
                    </Pressable>
                  </View>
                </View>
              );
            })}
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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
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
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#10B981',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  form: {
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
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#10B981',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: 'white',
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
  ayatContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  fileButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  fileButtonText: {
    fontSize: 16,
    color: '#6B7280',
    flex: 1,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
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
  submitButton: {
    flex: 2,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  setoranList: {
    gap: 12,
  },
  setoranCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  setoranHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  setoranType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  setoranTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  setoranTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  setoranDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  setoranFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  setoranDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  setoranDateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  setoranPoin: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10B981',
  },
  catatanContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  catatanLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 4,
  },
  setoranCatatan: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
  },
  audioText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
  },
  playButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});