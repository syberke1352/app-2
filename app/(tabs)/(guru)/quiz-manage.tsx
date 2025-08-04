import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Brain, Target, Award } from 'lucide-react-native';

interface Quiz {
  id: string;
  question: string;
  options: string[];
  correct_option: string;
  poin: number;
  difficulty: 'mudah' | 'sedang' | 'sulit';
  category: string;
  is_active: boolean;
  created_at: string;
}

export default function QuizManageScreen() {
  const { profile } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correct_option: '',
    poin: '10',
    difficulty: 'mudah' as 'mudah' | 'sedang' | 'sulit',
    category: 'Pengetahuan Quran',
  });
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = async () => {
    if (!profile?.organize_id) return;

    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('organize_id', profile.organize_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quizzes:', error);
        return;
      }

      setQuizzes(data || []);
    } catch (error) {
      console.error('Error in fetchQuizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correct_option: '',
      poin: '10',
      difficulty: 'mudah',
      category: 'Pengetahuan Quran',
    });
    setEditingQuiz(null);
  };

  const handleSubmit = async () => {
    if (!formData.question || !formData.optionA || !formData.optionB || 
        !formData.optionC || !formData.optionD || !formData.correct_option) {
      Alert.alert('Error', 'Mohon lengkapi semua field');
      return;
    }

    const options = [formData.optionA, formData.optionB, formData.optionC, formData.optionD];
    
    if (!options.includes(formData.correct_option)) {
      Alert.alert('Error', 'Jawaban benar harus sesuai dengan salah satu opsi');
      return;
    }

    try {
      if (editingQuiz) {
        // Update existing quiz
        const { error } = await supabase
          .from('quizzes')
          .update({
            question: formData.question,
            options: JSON.stringify(options),
            correct_option: formData.correct_option,
            poin: parseInt(formData.poin),
            difficulty: formData.difficulty,
            category: formData.category,
          })
          .eq('id', editingQuiz.id);

        if (error) {
          Alert.alert('Error', 'Gagal mengupdate quiz');
          return;
        }

        Alert.alert('Sukses', 'Quiz berhasil diupdate!');
      } else {
        // Create new quiz
        const { error } = await supabase
          .from('quizzes')
          .insert([{
            question: formData.question,
            options: JSON.stringify(options),
            correct_option: formData.correct_option,
            poin: parseInt(formData.poin),
            difficulty: formData.difficulty,
            category: formData.category,
            organize_id: profile?.organize_id,
            created_by: profile?.id,
          }]);

        if (error) {
          Alert.alert('Error', 'Gagal membuat quiz');
          return;
        }

        Alert.alert('Sukses', 'Quiz berhasil dibuat!');
      }

      resetForm();
      setShowForm(false);
      fetchQuizzes();
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat menyimpan quiz');
    }
  };

  const editQuiz = (quiz: Quiz) => {
    setFormData({
      question: quiz.question,
      optionA: quiz.options[0] || '',
      optionB: quiz.options[1] || '',
      optionC: quiz.options[2] || '',
      optionD: quiz.options[3] || '',
      correct_option: quiz.correct_option,
      poin: quiz.poin.toString(),
      difficulty: quiz.difficulty,
      category: quiz.category,
    });
    setEditingQuiz(quiz);
    setShowForm(true);
  };

  const deleteQuiz = async (quizId: string) => {
    Alert.alert(
      'Hapus Quiz',
      'Apakah Anda yakin ingin menghapus quiz ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('quizzes')
                .delete()
                .eq('id', quizId);

              if (error) {
                Alert.alert('Error', 'Gagal menghapus quiz');
                return;
              }

              Alert.alert('Sukses', 'Quiz berhasil dihapus');
              fetchQuizzes();
            } catch (error) {
              Alert.alert('Error', 'Terjadi kesalahan saat menghapus quiz');
            }
          },
        },
      ]
    );
  };

  const toggleQuizStatus = async (quizId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({ is_active: !currentStatus })
        .eq('id', quizId);

      if (error) {
        Alert.alert('Error', 'Gagal mengubah status quiz');
        return;
      }

      fetchQuizzes();
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat mengubah status quiz');
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [profile]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'mudah': return '#10B981';
      case 'sedang': return '#F59E0B';
      case 'sulit': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Brain size={32} color="#8B5CF6" />
        <Text style={styles.headerTitle}>Kelola Quiz</Text>
        <Text style={styles.headerSubtitle}>Buat dan kelola quiz untuk siswa</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Target size={20} color="#3B82F6" />
          <Text style={styles.statNumber}>{quizzes.length}</Text>
          <Text style={styles.statLabel}>Total Quiz</Text>
        </View>
        <View style={styles.statCard}>
          <Award size={20} color="#10B981" />
          <Text style={styles.statNumber}>{quizzes.filter(q => q.is_active).length}</Text>
          <Text style={styles.statLabel}>Quiz Aktif</Text>
        </View>
      </View>

      {/* Add Quiz Button */}
      <Pressable 
        style={styles.addButton}
        onPress={() => {
          resetForm();
          setShowForm(true);
        }}
      >
        <Plus size={20} color="white" />
        <Text style={styles.addButtonText}>Tambah Quiz Baru</Text>
      </Pressable>

      {/* Quiz Form */}
      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {editingQuiz ? 'Edit Quiz' : 'Buat Quiz Baru'}
          </Text>
          
          <TextInput
            style={[styles.input, styles.questionInput]}
            placeholder="Pertanyaan quiz..."
            value={formData.question}
            onChangeText={(text) => setFormData({ ...formData, question: text })}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.optionsLabel}>Pilihan Jawaban:</Text>
          <TextInput
            style={styles.input}
            placeholder="A. Pilihan pertama"
            value={formData.optionA}
            onChangeText={(text) => setFormData({ ...formData, optionA: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="B. Pilihan kedua"
            value={formData.optionB}
            onChangeText={(text) => setFormData({ ...formData, optionB: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="C. Pilihan ketiga"
            value={formData.optionC}
            onChangeText={(text) => setFormData({ ...formData, optionC: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="D. Pilihan keempat"
            value={formData.optionD}
            onChangeText={(text) => setFormData({ ...formData, optionD: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Jawaban yang benar (tulis persis seperti di atas)"
            value={formData.correct_option}
            onChangeText={(text) => setFormData({ ...formData, correct_option: text })}
          />

          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <Text style={styles.inputLabel}>Poin</Text>
              <TextInput
                style={styles.input}
                placeholder="10"
                value={formData.poin}
                onChangeText={(text) => setFormData({ ...formData, poin: text })}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formColumn}>
              <Text style={styles.inputLabel}>Kategori</Text>
              <TextInput
                style={styles.input}
                placeholder="Pengetahuan Quran"
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
              />
            </View>
          </View>

          <View style={styles.difficultySelector}>
            <Text style={styles.inputLabel}>Tingkat Kesulitan:</Text>
            <View style={styles.difficultyButtons}>
              {['mudah', 'sedang', 'sulit'].map((level) => (
                <Pressable
                  key={level}
                  style={[
                    styles.difficultyButton,
                    formData.difficulty === level && styles.difficultyButtonActive,
                    { backgroundColor: formData.difficulty === level ? getDifficultyColor(level) : '#F3F4F6' }
                  ]}
                  onPress={() => setFormData({ ...formData, difficulty: level as any })}
                >
                  <Text style={[
                    styles.difficultyButtonText,
                    formData.difficulty === level && styles.difficultyButtonTextActive
                  ]}>
                    {level}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.formActions}>
            <Pressable 
              style={styles.cancelButton}
              onPress={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </Pressable>
            <Pressable 
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>
                {editingQuiz ? 'Update Quiz' : 'Buat Quiz'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Quiz List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daftar Quiz</Text>
        
        {quizzes.length === 0 ? (
          <View style={styles.emptyState}>
            <Brain size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Belum ada quiz</Text>
            <Text style={styles.emptySubtext}>Buat quiz pertama untuk siswa</Text>
          </View>
        ) : (
          <View style={styles.quizList}>
            {quizzes.map((quiz) => (
              <View key={quiz.id} style={[styles.quizCard, !quiz.is_active && styles.quizCardInactive]}>
                <View style={styles.quizHeader}>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(quiz.difficulty) }]}>
                    <Text style={styles.difficultyText}>{quiz.difficulty}</Text>
                  </View>
                  <Text style={styles.quizPoin}>+{quiz.poin} poin</Text>
                </View>
                
                <Text style={styles.quizQuestion} numberOfLines={2}>
                  {quiz.question}
                </Text>
                
                <Text style={styles.quizCategory}>{quiz.category}</Text>
                
                <View style={styles.quizActions}>
                  <Pressable 
                    style={[styles.actionButton, { backgroundColor: quiz.is_active ? '#F59E0B' : '#10B981' }]}
                    onPress={() => toggleQuizStatus(quiz.id, quiz.is_active)}
                  >
                    <Text style={styles.actionButtonText}>
                      {quiz.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </Text>
                  </Pressable>
                  
                  <Pressable 
                    style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
                    onPress={() => editQuiz(quiz)}
                  >
                    <Edit size={16} color="white" />
                  </Pressable>
                  
                  <Pressable 
                    style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                    onPress={() => deleteQuiz(quiz.id)}
                  >
                    <Trash2 size={16} color="white" />
                  </Pressable>
                </View>
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
    backgroundColor: '#8B5CF6',
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
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  questionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formColumn: {
    flex: 1,
  },
  difficultySelector: {
    marginBottom: 16,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  difficultyButtonActive: {
    // Color set dynamically
  },
  difficultyButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  difficultyButtonTextActive: {
    color: 'white',
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
  submitButton: {
    flex: 2,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
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
  quizList: {
    gap: 12,
  },
  quizCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quizCardInactive: {
    opacity: 0.6,
    backgroundColor: '#F9FAFB',
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  quizPoin: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  quizQuestion: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 8,
  },
  quizCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  quizActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});