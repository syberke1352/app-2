import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Users, Award, PenTool } from 'lucide-react-native';

export default function WelcomeScreen() {
  return (
    <LinearGradient
      colors={['#10B981', '#3B82F6']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <BookOpen size={64} color="white" />
          <Text style={styles.title}>Ngaji App</Text>
          <Text style={styles.subtitle}>
            Platform Pembelajaran Quran Digital untuk Hafalan dan Murojaah
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <PenTool size={24} color="white" />
            <Text style={styles.featureText}>Setoran Hafalan & Murojaah</Text>
          </View>
          <View style={styles.feature}>
            <Award size={24} color="white" />
            <Text style={styles.featureText}>Penilaian & Label Pencapaian</Text>
          </View>
          <View style={styles.feature}>
            <Users size={24} color="white" />
            <Text style={styles.featureText}>Monitoring Orang Tua</Text>
          </View>
          <View style={styles.feature}>
            <BookOpen size={24} color="white" />
            <Text style={styles.featureText}>Baca Quran Digital</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.primaryButtonText}>Masuk</Text>
          </Pressable>
          
          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.secondaryButtonText}>Daftar</Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  features: {
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
  },
  featureText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  buttons: {
    gap: 12,
    marginBottom: 40,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: 'white',
  },
  primaryButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'white',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});