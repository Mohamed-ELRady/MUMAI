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
  const { profile, setProfile, createChild, loadDemoData } = useAppStore();
  const { t, isRTL } = useLanguage();
  const isEditing = !!route.params?.isEditing;
  const isAdding = !!route.params?.isAdding;
  const [name, setName] = useState(isEditing ? profile?.name ?? '' : '');
  const [photoUri, setPhotoUri] = useState(isEditing ? profile?.photoUri : undefined);
  const [bloodType, setBloodType] = useState<BloodType | undefined>(isEditing ? profile?.bloodType : undefined);
  const [photoError, setPhotoError] = useState(false);
  const [birthDate, setBirthDate] = useState<Date>(
    isEditing && profile ? parseCalendarDate(profile.birthDateISO) ?? new Date(profile.birthDateISO) : new Date()
  );
  const [showDateError, setShowDateError] = useState(false);
  const textAlign = isRTL ? 'right' : 'left';

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
    const birthDateISO = validBirthDate(toDateInputValue(birthDate));
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
      {Platform.OS === 'web' ? (
        <WebDateInput value={birthDate} onChange={setBirthDate} isRTL={isRTL} label={t('birthDateLabel')} />
      ) : (
        <NativeDatePicker value={birthDate} onChange={setBirthDate} locale={isRTL ? 'ar-EG' : 'en-US'} />
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
  },
  dateButtonText: { fontSize: 16, color: colors.text },
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
