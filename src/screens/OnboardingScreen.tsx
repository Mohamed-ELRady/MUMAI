import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform, ScrollView, KeyboardAvoidingView, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { File, Paths } from 'expo-file-system';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/AppStore';
import { BLOOD_TYPES, BloodType } from '../store/persistedState';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, spacing, radii } from '../theme/theme';
import { parseCalendarDate, toDateInputValue, validBirthDate } from '../data/ageHelpers';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

type DatePart = 'day' | 'month' | 'year';

function WebBirthDateFields({
  value,
  onChange,
  isRTL,
  locale,
  labels,
}: {
  value: Date | null;
  onChange: (date: Date | null) => void;
  isRTL: boolean;
  locale: string;
  labels: { day: string; month: string; year: string; group: string };
}) {
  const today = new Date();
  const [parts, setParts] = useState(() => ({
    day: value ? String(value.getDate()) : '',
    month: value ? String(value.getMonth() + 1) : '',
    year: value ? String(value.getFullYear()) : '',
  }));
  const selectedYear = Number(parts.year) || today.getFullYear();
  const selectedMonth = Number(parts.month) || 1;
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const years = Array.from({ length: 11 }, (_, index) => today.getFullYear() - index);
  const months = Array.from({ length: 12 }, (_, index) => ({
    value: index + 1,
    label: new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2024, index, 1)),
  }));

  function updatePart(part: DatePart, rawValue: string) {
    const next = { ...parts, [part]: rawValue };
    if ((part === 'month' || part === 'year') && next.day && next.month && next.year) {
      const maximumDay = new Date(Number(next.year), Number(next.month), 0).getDate();
      if (Number(next.day) > maximumDay) next.day = String(maximumDay);
    }
    setParts(next);
    if (!next.day || !next.month || !next.year) {
      onChange(null);
      return;
    }
    const iso = `${next.year}-${next.month.padStart(2, '0')}-${next.day.padStart(2, '0')}`;
    const date = parseCalendarDate(iso);
    onChange(date && iso <= toDateInputValue(today) ? date : null);
  }

  const selectStyle: React.CSSProperties = {
    appearance: 'auto',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    border: `1px solid ${colors.border}`,
    padding: '12px 10px',
    minHeight: 48,
    fontSize: 15,
    color: colors.text,
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    direction: isRTL ? 'rtl' : 'ltr',
  };

  function selectField(part: DatePart, fieldLabel: string, options: { value: string; label: string }[], flex: number) {
    return (
      <View style={[styles.datePart, { flex }]} key={part}>
        <Text style={[styles.datePartLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{fieldLabel}</Text>
        {React.createElement('select', {
          'aria-label': fieldLabel,
          value: parts[part],
          onChange: (event: React.ChangeEvent<HTMLSelectElement>) => updatePart(part, event.target.value),
          style: selectStyle,
        }, [
          React.createElement('option', { key: 'placeholder', value: '', disabled: true }, fieldLabel),
          ...options.map((option) => React.createElement('option', { key: option.value, value: option.value }, option.label)),
        ])}
      </View>
    );
  }

  return (
    <View accessibilityLabel={labels.group} style={[styles.dateFields, { flexDirection: 'row', direction: isRTL ? 'rtl' : 'ltr' }]}>
      {selectField('day', labels.day, Array.from({ length: daysInMonth }, (_, index) => ({ value: String(index + 1), label: String(index + 1) })), 0.8)}
      {selectField('month', labels.month, months.map((month) => ({ value: String(month.value), label: month.label })), 1.35)}
      {selectField('year', labels.year, years.map((year) => ({ value: String(year), label: String(year) })), 1)}
    </View>
  );
}

function NativeDatePicker({
  value,
  onChange,
  locale,
  placeholder,
  doneLabel,
}: {
  value: Date | null;
  onChange: (date: Date | null) => void;
  locale: string;
  placeholder: string;
  doneLabel: string;
}) {
  // يُحمَّل ديناميكيًا لأنه مكتبة أصلية غير متاحة على الويب
  const DateTimePicker = require('@react-native-community/datetimepicker').default;
  const [showPicker, setShowPicker] = useState(false);
  const [draftDate, setDraftDate] = useState(() => {
    const fallback = new Date();
    fallback.setMonth(fallback.getMonth() - 6);
    return value ?? fallback;
  });

  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={placeholder} style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Text style={[styles.dateButtonText, !value && styles.dateButtonPlaceholder]}>{value ? value.toLocaleDateString(locale) : placeholder}</Text>
      </Pressable>
      {showPicker && (
        <>
          <DateTimePicker
            value={value ?? draftDate}
            mode="date"
            maximumDate={new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            locale={locale}
            onChange={(_: unknown, date?: Date) => {
              if (Platform.OS !== 'ios') setShowPicker(false);
              if (date) {
                setDraftDate(date);
                onChange(date);
              }
            }}
          />
          {Platform.OS === 'ios' && (
            <Pressable accessibilityRole="button" style={styles.dateDoneButton} onPress={() => setShowPicker(false)}>
              <Text style={styles.dateDoneText}>{doneLabel}</Text>
            </Pressable>
          )}
        </>
      )}
    </>
  );
}

export default function OnboardingScreen({ navigation, route }: Props) {
  const { profile, setProfile, createChild, loadDemoData } = useAppStore();
  const { t, isRTL } = useLanguage();
  const isEditing = !!route.params?.isEditing;
  const isAdding = !!route.params?.isAdding;
  const [name, setName] = useState(isEditing ? profile?.name ?? '' : '');
  const [photoUri, setPhotoUri] = useState(isEditing ? profile?.photoUri : undefined);
  const [bloodType, setBloodType] = useState<BloodType | undefined>(isEditing ? profile?.bloodType : undefined);
  const [photoError, setPhotoError] = useState(false);
  const [birthDate, setBirthDate] = useState<Date | null>(
    isEditing && profile ? parseCalendarDate(profile.birthDateISO) ?? new Date(profile.birthDateISO) : null
  );
  const [showDateError, setShowDateError] = useState(false);
  const textAlign = isRTL ? 'right' : 'left';

  function handleBirthDateChange(date: Date | null) {
    setBirthDate(date);
    if (date) setShowDateError(false);
  }

  async function pickPhoto() {
    setPhotoError(false);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.65,
        base64: Platform.OS === 'web',
      });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      const context = ImageManipulator.manipulate(asset.uri);
      context.resize({ width: 320, height: 320 });
      const rendered = await context.renderAsync();
      const optimized = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.7, base64: Platform.OS === 'web' });
      let savedUri = optimized.uri;
      if (Platform.OS === 'web' && optimized.base64) {
        savedUri = `data:image/jpeg;base64,${optimized.base64}`;
      } else if (Platform.OS !== 'web') {
        const source = new File(optimized.uri);
        const destination = new File(Paths.document, `child-profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`);
        await source.copy(destination);
        savedUri = destination.uri;
      }
      if (savedUri.length > 750_000) throw new Error('Photo is too large to store');
      setPhotoUri(savedUri);
    } catch {
      setPhotoError(true);
    }
  }

  function handleContinue() {
    const birthDateISO = birthDate ? validBirthDate(toDateInputValue(birthDate)) : null;
    if (!birthDateISO) { setShowDateError(true); return; }
    const nextProfile = {
      name: name.trim() || t('defaultChildName'),
      birthDateISO,
      ...(photoUri ? { photoUri } : {}),
      ...(bloodType ? { bloodType } : {}),
    };
    if (isAdding) createChild(nextProfile);
    else setProfile(nextProfile);
    if (isEditing || isAdding) navigation.goBack();
    else navigation.replace('Home');
  }

  function openDemo() {
    loadDemoData();
    navigation.replace('Home');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{isEditing ? t('editProfileTitle') : isAdding ? t('addChildTitle') : t('onboardingTitle')}</Text>
      {!isEditing && !isAdding && <Text style={styles.subtitle}>{t('onboardingSubtitle')}</Text>}

      <View style={[styles.optionalHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={styles.labelInline}>{t('childPhotoLabel')}</Text>
        <Text style={styles.optionalBadge}>{t('optionalLabel')}</Text>
      </View>
      <View style={[styles.photoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={photoUri ? t('changeChildPhoto') : t('addChildPhoto')}
          style={styles.photoButton}
          onPress={pickPhoto}
        >
          {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} /> : <Text style={styles.photoPlaceholder}>📷</Text>}
        </Pressable>
        <View style={[styles.photoActions, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Pressable accessibilityRole="button" onPress={pickPhoto}>
            <Text style={styles.photoActionText}>{photoUri ? t('changeChildPhoto') : t('addChildPhoto')}</Text>
          </Pressable>
          {photoUri && (
            <Pressable accessibilityRole="button" onPress={() => setPhotoUri(undefined)}>
              <Text style={styles.removePhotoText}>{t('removeChildPhoto')}</Text>
            </Pressable>
          )}
        </View>
      </View>
      {photoError && <Text accessibilityRole="alert" style={[styles.fieldError, { textAlign }]}>{t('photoPickerError')}</Text>}

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
      <Text style={[styles.dateHint, { textAlign }]}>{t('birthDateHint')}</Text>
      {Platform.OS === 'web' ? (
        <WebBirthDateFields
          value={birthDate}
          onChange={handleBirthDateChange}
          isRTL={isRTL}
          locale={isRTL ? 'ar-EG' : 'en-US'}
          labels={{ day: t('birthDayLabel'), month: t('birthMonthLabel'), year: t('birthYearLabel'), group: t('birthDateLabel') }}
        />
      ) : (
        <NativeDatePicker
          value={birthDate}
          onChange={handleBirthDateChange}
          locale={isRTL ? 'ar-EG' : 'en-US'}
          placeholder={t('chooseBirthDate')}
          doneLabel={t('datePickerDone')}
        />
      )}
      {showDateError && <Text accessibilityRole="alert" style={{ color: colors.urgent, marginTop: spacing.sm, textAlign }}>{t('invalidBirthDate')}</Text>}

      <View style={[styles.optionalHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={styles.labelInline}>{t('bloodTypeLabel')}</Text>
        <Text style={styles.optionalBadge}>{t('optionalLabel')}</Text>
      </View>
      <View style={[styles.bloodTypeGrid, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {BLOOD_TYPES.map((type) => {
          const selected = bloodType === type;
          return (
            <Pressable
              key={type}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              style={[styles.bloodTypeChip, selected && styles.bloodTypeChipSelected]}
              onPress={() => setBloodType(selected ? undefined : type)}
            >
              <Text style={[styles.bloodTypeText, selected && styles.bloodTypeTextSelected]}>{type}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.optionalHint, { textAlign }]}>{t('optionalProfileHint')}</Text>
      <Text style={[styles.privacyHint, { textAlign }]}>{t('profilePrivacyHint')}</Text>

      <Pressable accessibilityRole="button" style={styles.cta} onPress={handleContinue}>
        <Text style={styles.ctaText}>{isEditing ? t('saveChangesCta') : isAdding ? t('addChildCta') : t('startTrackingCta')}</Text>
      </Pressable>
      {!isEditing && !isAdding && <Pressable accessibilityRole="button" style={styles.demoButton} onPress={openDemo}>
        <Text style={styles.demoButtonText}>{t('tryDemoCta')}</Text>
      </Pressable>}
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, width: '100%', maxWidth: 680, alignSelf: 'center', backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { fontSize: 15, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
  label: { fontSize: 14, color: colors.text, marginBottom: spacing.xs, marginTop: spacing.md },
  labelInline: { fontSize: 14, color: colors.text, fontWeight: '600' },
  optionalHeader: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm, marginTop: spacing.md },
  optionalBadge: { color: colors.primaryDark, backgroundColor: colors.chipBg, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 3, fontSize: 11, fontWeight: '700' },
  photoRow: { alignItems: 'center', gap: spacing.md },
  photoButton: { width: 82, height: 82, borderRadius: 41, borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { fontSize: 28 },
  photoActions: { gap: spacing.sm },
  photoActionText: { color: colors.primaryDark, fontSize: 14, fontWeight: '700' },
  removePhotoText: { color: colors.textMuted, fontSize: 13, textDecorationLine: 'underline' },
  fieldError: { color: colors.urgent, marginTop: spacing.sm },
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
    minHeight: 50,
    justifyContent: 'center',
  },
  dateButtonText: { fontSize: 16, color: colors.text },
  dateButtonPlaceholder: { color: colors.textMuted },
  dateHint: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginBottom: spacing.sm },
  dateFields: { width: '100%', gap: spacing.sm, alignItems: 'flex-end' },
  datePart: { minWidth: 0 },
  datePartLabel: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.xs },
  dateDoneButton: { minHeight: 44, backgroundColor: colors.chipBg, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xs },
  dateDoneText: { color: colors.primaryDark, fontWeight: '800' },
  bloodTypeGrid: { flexWrap: 'wrap', gap: spacing.sm },
  bloodTypeChip: { minWidth: 58, alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: 10 },
  bloodTypeChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  bloodTypeText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  bloodTypeTextSelected: { color: '#fff' },
  optionalHint: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: spacing.sm },
  privacyHint: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: spacing.md, padding: spacing.sm, borderRadius: radii.sm, backgroundColor: colors.surface },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  demoButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  demoButtonText: { color: colors.primaryDark, fontSize: 15, fontWeight: '700', textDecorationLine: 'underline' },
});
