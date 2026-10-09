import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeContext } from '../../context/ThemeContext';
import { AppTheme } from '../../constants/theme';
import { BlurView } from 'expo-blur';

export interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string | null;
  iconName?: keyof typeof Feather.glyphMap;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  iconName = 'alert-triangle',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  
  const [internalVisible, setInternalVisible] = useState(visible);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.9, duration: 200, useNativeDriver: true })
      ]).start(({ finished }) => {
        if (finished) {
          setInternalVisible(false);
        }
      });
    }
  }, [visible]);

  if (!internalVisible) return null;

  const getVariantColors = () => {
    switch (variant) {
      case 'danger': return { color: theme.colors.error, bg: theme.colors.error + '15' };
      case 'warning': return { color: theme.colors.stats.orange.color, bg: theme.colors.stats.orange.bg };
      case 'info': return { color: theme.colors.primary, bg: theme.colors.primaryGlow };
      default: return { color: theme.colors.error, bg: theme.colors.error + '15' };
    }
  };

  const vColors = getVariantColors();

  return (
    <Modal transparent visible={internalVisible} animationType="none" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
        )}
        
        <Animated.View style={[styles.modalCard, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.iconContainer, { backgroundColor: vColors.bg }]}>
            <Feather name={iconName} size={28} color={vColors.color} />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            {cancelText !== null && (
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel} activeOpacity={0.7}>
                <Text style={styles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.button, styles.confirmButton, { backgroundColor: vColors.color }]} 
              onPress={onConfirm} 
              activeOpacity={0.7}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderHighlight,
    ...theme.shadows.medium,
    elevation: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    ...theme.typography.h1,
    fontSize: 22,
    color: theme.colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.iconBg,
  },
  confirmButton: {
    // Background color set dynamically
  },
  cancelText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  confirmText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: '#ffffff',
  },
});
