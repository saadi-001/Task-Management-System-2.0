import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeContext } from '../../context/ThemeContext';
import { AppTheme } from '../../constants/theme';
import AppInput from '../common/AppInput';
import AppButton from '../common/AppButton';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, themeColor: string) => void;
  initialName: string;
  initialTheme: string;
  loading?: boolean;
}

export default function UpdateOrgModal({ visible, onClose, onSave, initialName, initialTheme, loading }: Props) {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  
  const [name, setName] = useState(initialName || '');
  const [themeColor, setThemeColor] = useState(initialTheme || '');

  const handleSave = () => {
    onSave(name, themeColor);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={styles.sheetContainer}>
          <View style={styles.dragHandle} />
          
          <View style={styles.header}>
            <Text style={styles.title}>Update Organization</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <AppInput label="Organization Name" value={name} onChangeText={setName} placeholder="Name" />
            <AppInput label="Theme Color" value={themeColor} onChangeText={setThemeColor} placeholder="#HexColor" />
            <View style={{ height: 20 }} />
          </ScrollView>

          <View style={styles.footer}>
            <AppButton title="SAVE CHANGES" onPress={handleSave} loading={loading} disabled={!name.trim()} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    minHeight: '40%',
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    ...theme.shadows.glass,
  },
  dragHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginTop: 12, marginBottom: 8,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  title: { ...theme.typography.h2, fontSize: 20, color: theme.colors.textPrimary },
  closeBtn: { padding: 8, backgroundColor: theme.colors.iconBg, borderRadius: 20 },
  content: { padding: theme.spacing.lg },
  footer: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, borderTopWidth: 1, borderTopColor: theme.colors.border }
});
