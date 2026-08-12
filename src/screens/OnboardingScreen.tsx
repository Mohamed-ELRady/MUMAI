import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/AppStore';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, spacing, radii } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function WebDateInput({ value, onChange, isRTL }: { value: Date; onChange: (date: Date) => void; isRTL: boolean }) {
  return React.createElement('input', {
    type: 'date',
    value: toDateInputValue(value),
    max: toDateInputValue(new Date()),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value) onChange(new Date(`${e.target.value}T00:00:00`));
    },
    style: {
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      border: `1px solid ${colors.border}`,
      padding: spacing.md,
      fontSize: 16,
      color: colors.text,
      textAlign: isRTL ? 'right' : 'left',
      width: '100%',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
    },
  });
}

function NativeDatePicker({
  value,
  onChange,
  locale,
}: {
  value: Date;
  onChange: (date: Date) => void;
  locale: string;
}) {
  // يُحمَّل ديناميكيًا لأنه مكتبة أصلية غير متاحة على الويب
  const DateTimePicker = require('@react-native-community/datetimepicker').default;
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={value}
        mode="date"
        maximumDate={new Date()}
        display="spinner"
        onChange={(_: unknown, date?: Date) => date && onChange(date)}
      />
    );
  }

  return (
    <>
      <Pressable style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateButtonText}>{value.toLocaleDateString(locale)}</Text>
      </Pressable>
      {showPicker && (
        <DateTimePicker
          value={value}
          mode="date"
          maximumDate={new Date()}
          display="default"
          onChange={(_: unknown, date?: Date) => {
            setShowPicker(false);
            if (date) onChange(date);
          }}
        />
      )}
    </>
  );
}

export default function OnboardingScreen({ navigation }: Props) {
  const { setProfile } = useAppStore();
  const { t, isRTL } = useLanguage();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState<Date>(new Date());
  const textAlign = isRTL ? 'right' : 'left';

  function handleContinue() {
    setProfile({ name: name.trim() || t('defaultChildName'), birthDateISO: birthDate.toISOString() });
    navigation.replace('Home');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('onboardingTitle')}</Text>
      <Text style={styles.subtitle}>{t('onboardingSubtitle')}</Text>

      <Text style={[styles.label, { textAlign }]}>{t('childNameLabel')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('childNamePlaceholder')}
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
        textAlign={textAlign}
      />

      <Text style={[styles.label, { textAlign }]}>{t('birthDateLabel')}</Text>
      {Platform.OS === 'web' ? (
        <WebDateInput value={birthDate} onChange={setBirthDate} isRTL={isRTL} />
      ) : (
        <NativeDatePicker value={birthDate} onChange={setBirthDate} locale={isRTL ? 'ar-EG' : 'en-US'} />
      )}

      <Pressable style={styles.cta} onPress={handleContinue}>
        <Text style={styles.ctaText}>{t('startTrackingCta')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { fontSize: 15, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
  label: { fontSize: 14, color: colors.text, marginBottom: spacing.xs, marginTop: spacing.md },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  dateButton: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  dateButtonText: { fontSize: 16, color: colors.text },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
