import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useThemeContext } from '../../context/ThemeContext';
import { AppTheme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';

interface Props {
  total: number;
  done: number;
  inProgress: number;
  onPress?: () => void;
}

export default function TaskProgressBar({ total, done, inProgress, onPress }: Props) {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);

  const doneAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const donePercent = total > 0 ? (done / total) * 100 : 0;
    const progPercent = total > 0 ? (inProgress / total) * 100 : 0;

    Animated.parallel([
      Animated.timing(doneAnim, { toValue: donePercent, duration: 1000, useNativeDriver: false }),
      Animated.timing(progressAnim, { toValue: progPercent, duration: 1000, useNativeDriver: false }),
    ]).start();
  }, [total, done, inProgress]);

  const doneWidth = doneAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  const progWidth = progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} disabled={!onPress}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Overall Task Progress</Text>
            <Text style={styles.subtitle}>Tap to view all tasks</Text>
          </View>
          <Text style={styles.percentage}>{completionRate}%</Text>
        </View>
        
        <View style={styles.barBackground}>
          <Animated.View style={[styles.barSegment, { width: doneWidth, backgroundColor: theme.colors.success }]} />
          <Animated.View style={[styles.barSegment, { width: progWidth, backgroundColor: theme.colors.primary }]} />
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: theme.colors.success }]} />
            <Text style={styles.legendText}>Done ({done})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
            <Text style={styles.legendText}>Active ({inProgress})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: theme.colors.border }]} />
            <Text style={styles.legendText}>Pending ({total - done - inProgress})</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.glass,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { ...theme.typography.h3, color: theme.colors.textPrimary },
  subtitle: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 },
  percentage: { ...theme.typography.h2, color: theme.colors.primary },
  
  barBackground: { height: 10, backgroundColor: theme.colors.iconBg, borderRadius: 5, flexDirection: 'row', overflow: 'hidden', marginBottom: 16 },
  barSegment: { height: '100%' },
  
  legend: { flexDirection: 'row', justifyContent: 'space-between' },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { ...theme.typography.caption, color: theme.colors.textSecondary, fontWeight: '500' },
});
