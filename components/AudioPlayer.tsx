import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Slider } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Play, Pause, RotateCcw, Volume2, SkipBack, SkipForward } from 'lucide-react-native';

interface AudioPlayerProps {
  fileUrl: string;
  title?: string;
  onPlaybackComplete?: () => void;
  autoPlay?: boolean;
}

export function AudioPlayer({ fileUrl, title, onPlaybackComplete, autoPlay = false }: AudioPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [position, setPosition] = useState<number>(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Configure audio session
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Error configuring audio:', error);
      }
    };

    configureAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (autoPlay && fileUrl) {
      loadAndPlayAudio();
    }
  }, [fileUrl, autoPlay]);

  const loadAndPlayAudio = async () => {
    try {
      setIsLoading(true);
      
      // Unload previous sound if exists
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fileUrl },
        { 
          shouldPlay: autoPlay,
          rate: playbackRate,
          volume: volume,
        },
        onPlaybackStatusUpdate
      );
      
      setSound(newSound);
      
      if (autoPlay) {
        setIsPlaying(true);
      }

    } catch (error) {
      console.error('Error loading audio:', error);
      Alert.alert('Error', 'Gagal memuat file audio. Pastikan file audio valid dan dapat diakses.');
    } finally {
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      setIsBuffering(status.isBuffering || false);

      // Check if playback completed
      if (status.didJustFinish && !status.isLooping) {
        setIsPlaying(false);
        onPlaybackComplete?.();
      }
    } else if (status.error) {
      console.error('Playback error:', status.error);
      Alert.alert('Error', 'Terjadi kesalahan saat memutar audio');
    }
  };

  const playPause = async () => {
    try {
      if (!sound) {
        await loadAndPlayAudio();
        return;
      }

      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error playing/pausing audio:', error);
      Alert.alert('Error', 'Gagal memutar/menjeda audio');
    }
  };

  const restart = async () => {
    try {
      if (sound) {
        await sound.setPositionAsync(0);
        if (!isPlaying) {
          await sound.playAsync();
        }
      }
    } catch (error) {
      console.error('Error restarting audio:', error);
      Alert.alert('Error', 'Gagal mengulang audio');
    }
  };

  const skipForward = async () => {
    try {
      if (sound && duration > 0) {
        const newPosition = Math.min(position + 10000, duration); // Skip 10 seconds
        await sound.setPositionAsync(newPosition);
      }
    } catch (error) {
      console.error('Error skipping forward:', error);
    }
  };

  const skipBackward = async () => {
    try {
      if (sound) {
        const newPosition = Math.max(position - 10000, 0); // Skip back 10 seconds
        await sound.setPositionAsync(newPosition);
      }
    } catch (error) {
      console.error('Error skipping backward:', error);
    }
  };

  const onSliderValueChange = async (value: number) => {
    try {
      if (sound && duration > 0) {
        const newPosition = value * duration;
        await sound.setPositionAsync(newPosition);
      }
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  };

  const changePlaybackRate = async (rate: number) => {
    try {
      if (sound) {
        await sound.setRateAsync(rate, true);
        setPlaybackRate(rate);
      }
    } catch (error) {
      console.error('Error changing playback rate:', error);
    }
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (duration === 0) return 0;
    return position / duration;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Volume2 size={16} color="#10B981" />
        <Text style={styles.title}>{title || 'Audio Setoran'}</Text>
        {isBuffering && (
          <Text style={styles.bufferingText}>Buffering...</Text>
        )}
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${getProgressPercentage() * 100}%` }]} 
          />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Main Controls */}
      <View style={styles.controls}>
        <Pressable 
          style={styles.controlButton}
          onPress={skipBackward}
          disabled={!sound}
        >
          <SkipBack size={16} color={sound ? "#6B7280" : "#D1D5DB"} />
        </Pressable>

        <Pressable 
          style={styles.controlButton}
          onPress={restart}
          disabled={!sound}
        >
          <RotateCcw size={16} color={sound ? "#6B7280" : "#D1D5DB"} />
        </Pressable>
        
        <Pressable 
          style={[styles.playButton, isLoading && styles.playButtonDisabled]}
          onPress={playPause}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.loadingText}>...</Text>
          ) : isPlaying ? (
            <Pause size={24} color="white" />
          ) : (
            <Play size={24} color="white" />
          )}
        </Pressable>

        <Pressable 
          style={styles.controlButton}
          onPress={skipForward}
          disabled={!sound}
        >
          <SkipForward size={16} color={sound ? "#6B7280" : "#D1D5DB"} />
        </Pressable>

        <View style={styles.rateContainer}>
          <Text style={styles.rateText}>{playbackRate}x</Text>
        </View>
      </View>

      {/* Playback Rate Controls */}
      <View style={styles.rateControls}>
        {[0.5, 0.75, 1.0, 1.25, 1.5].map((rate) => (
          <Pressable
            key={rate}
            style={[
              styles.rateButton,
              playbackRate === rate && styles.rateButtonActive
            ]}
            onPress={() => changePlaybackRate(rate)}
            disabled={!sound}
          >
            <Text style={[
              styles.rateButtonText,
              playbackRate === rate && styles.rateButtonTextActive
            ]}>
              {rate}x
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Load Audio Button if not loaded */}
      {!sound && !isLoading && (
        <Pressable style={styles.loadButton} onPress={loadAndPlayAudio}>
          <Play size={16} color="#10B981" />
          <Text style={styles.loadButtonText}>Muat Audio</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
    flex: 1,
  },
  bufferingText: {
    fontSize: 12,
    color: '#F59E0B',
    fontStyle: 'italic',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  playButtonDisabled: {
    opacity: 0.6,
  },
  loadingText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rateContainer: {
    minWidth: 32,
    alignItems: 'center',
  },
  rateText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  rateControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  rateButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rateButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  rateButtonText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  rateButtonTextActive: {
    color: 'white',
  },
  loadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  loadButtonText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
});