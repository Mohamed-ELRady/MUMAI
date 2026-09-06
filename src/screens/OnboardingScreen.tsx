import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/AppStore';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, spacing, radii } from '../theme/theme';
import { parseCalendarDate, toDateInputValue, validBirthDate } from '../data/ageHelpers';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

function WebDateInput({ value, onChange, isRTL, label }: { value: Date; onChange: (date: Date) => void; isRTL: boolean; label: string }) {
  return React.createElement('input', {
    type: 'date',
    'aria-label': label,
    value: toDateInputValue(value),
    max: toDateInputValue(new Date()),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseCalendarDate(e.target.value) ?? new Date(NaN));
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
        locale={locale}
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

export default function OnboardingScreen({ navigation, route }: Props) {
  const { profile, setProfile } = useAppStore();
  const { t, isRTL } = useLanguage();
  const isEditing = !!route.params?.isEditing;
  const [name, setName] = useState(isEditing ? profile?.name ?? '' : '');
  const [birthDate, setBirthDate] = useState<Date>(
    isEditing && profile ? parseCalendarDate(profile.birthDateISO) ?? new Date(profile.birthDateISO) : new Date()
  );
  const [showDateError, setShowDateError] = useState(false);
  const textAlign = isRTL ? 'right' : 'left';

  function handleContinue() {
    const birthDateISO = validBirthDate(toDateInputValue(birthDate));
    if (!birthDateISO) { setShowDateError(true); return; }
    setProfile({ name: name.trim() || t('defaultChildName'), birthDateISO });
    if (isEditing) navigation.goBack();
    else navigation.replace('Home');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{isEditing ? t('editProfileTitle') : t('onboardingTitle')}</Text>
      {!isEditing && <Text style={styles.subtitle}>{t('onboardingSubtitle')}</Text>}

      <Text style={[styles.label, { textAlign }]}>{t('childNameLabel')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('childNamePlaceholder')}
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
        textAlign={textAlign}
        maxLength={80}
        accessibilityLabel={t('childNameLabel')}
      />

      <Text style={[styles.label, { textAlign }]}>{t('birthDateLabel')}</Text>
      {Platform.OS === 'web' ? (
        <WebDateInput value={birthDate} onChange={setBirthDate} isRTL={isRTL} label={t('birthDateLabel')} />
      ) : (
        <NativeDatePicker value={birthDate} onChange={setBirthDate} locale={isRTL ? 'ar-EG' : 'en-US'} />
      )}
      {showDateError && <Text accessibilityRole="alert" style={{ color: colors.urgent, marginTop: spacing.sm, textAlign }}>{t('invalidBirthDate')}</Text>}

      <Pressable accessibilityRole="button" style={styles.cta} onPress={handleContinue}>
        <Text style={styles.ctaText}>{isEditing ? t('saveChangesCta') : t('startTrackingCta')}</Text>
      </Pressable>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
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
