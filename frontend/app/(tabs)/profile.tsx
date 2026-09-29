import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useGetProfileQuery, useGetProfileVisibilityQuery, useUpdateProfileVisibilityMutation } from '@/src/store/api/authApi';
import { BaseComponent } from '@/src/core/base/BaseComponent';
import { useThemeColors } from '@/src/theme/ThemeProvider';
import { ErrorHandler } from '@/src/core/exceptions/ErrorHandler';
import { Button } from '@/src/components/common/Button';
import { useAuth } from '@/src/core/auth/AuthProvider';
import { LogOut } from 'lucide-react-native';
import { IProfileVisibility, Visibility } from '@/src/types';


export default function ProfileScreen() {
  const colors = useThemeColors();
  const { user, signOut } = useAuth();
  const userId = user?.id;
  
  const { data, isLoading, isError, error, refetch, } = useGetProfileQuery(userId!, {skip: !userId,});
  
  const { data: visibilityData, isLoading: isVisibilityLoading, isError: isVisibilityError, error: visibilityError, } = useGetProfileVisibilityQuery();
  
  const [updateProfileVisibility, {isLoading: isUpdatingVisibility,},] = useUpdateProfileVisibilityMutation();
  
  const [visibility, setVisibility] = useState<IProfileVisibility | null>(null);

  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (visibilityData) {
      setVisibility(visibilityData);
    }
  }, [visibilityData]);

  if (isVisibilityError){
    ErrorHandler.log(visibilityError, 'ProfileScreen.getProfileVisibility');
  }

  const handleRetry= useCallback(() => refetch(), [refetch]);

  if (isError) {
    ErrorHandler.log(error, 'ProfileScreen.getProfile');
  }

  // change visibility

  const changeVisibility = (
    field: keyof IProfileVisibility,
    value: Visibility
  ) => {
    setVisibility((current) => {
      if (!current){
        return current;
      }
      return { ...current, [field]: value, };
    });
  };

  // save visibility

  const handleSaveVisibility = async () => {
    if (!visibility) {
      return;
    }
    
    try {
      
      const response = await updateProfileVisibility(visibility).unwrap();

      setSaveMessage({ type: 'success', message: response.message || 'Görünürlük ayarları başarıyla güncellendi.',});

      setTimeout(() => { setSaveMessage(null); }, 3000);

    } catch(error: any){
      ErrorHandler.log(error, 'ProfileScreen.updateProfileVisibility');

      setSaveMessage({ type: 'error', message: error?.data?.message || 'Görünürlük ayarları güncellenirken bir hata oluştu.'});

      setTimeout(() => { setSaveMessage(null); }, 3000);

    }
    
  };

  // visibility label

  const getVisibilityLabel = (value: Visibility) => {
    switch (value) {
      case 'public':
        return 'Herkese Açık';
      case 'friends':
        return 'Arkadaşlar';
      case 'private':
        return 'Gizli';
      default:
        return '';
    }
  };

  const VisibilitySelector = ({
      value,
      onChange,
    }: {
      value: Visibility;
      onChange: (value: Visibility) => void;
    }) => {
      return (
        <View style={styles.visibilityOptions}>
          {(['public', 'friends', 'private'] as Visibility[]).map(
            (option) => {
              const isSelected = value === option;
  
              return (
                <Pressable
                  key={option}
                  onPress={() => onChange(option)}
                  style={[
                    styles.visibilityOption,
                    {
                      borderColor: isSelected
                        ? colors.primary[600]
                        : colors.border,
  
                      backgroundColor: isSelected
                        ? colors.primary[600]
                        : colors.surface,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.visibilityOptionText,
                      {
                        color: isSelected
                          ? '#ffffff'
                          : colors.text,
                      },
                    ]}
                  >
                    {getVisibilityLabel(option)}
                  </Text>
                </Pressable>
              );
            }
          )}
        </View>
      );
    };

  return (
    <BaseComponent
      isLoading={isLoading}
      isError={isError}
      errorMessage={(error as Error)?.message ?? 'Profil yüklenemedi.'}
      onRetry={handleRetry}
      skeletonVariant="profile"
      skeletonCount={1}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Profil</Text>
      </View>

      {data && (
        <>
        {/* General public infos */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Profil Bilgileri</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.label, {color: colors.textMuted}]}>Ad</Text>
            <Text style={[styles.value, {color: colors.text}]}>{data.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, {color: colors.textMuted}]}>Soyad</Text>
            <Text style={[styles.value, {color: colors.text}]}>{data.surname}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, {color: colors.textMuted}]}>Kullanıcı Adı</Text>
            <Text style={[styles.value, {color: colors.text}]}>@{data.username}</Text>
          </View>
        </View>

        <View 
          style={[styles.card, {backgroundColor: colors.surface, borderColor: colors.border,},]}
        >
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Sadece Arkadaşlar</Text>
          
          <View style={styles.photoRow}>
            {data.profile_photo ? (
              <Image
                source={{ uri: data.profile_photo }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.primary[600] }, ]}
              >
                <Text style={styles.avatarText}>{data.name[0]}{data.surname[0]}
                </Text>
              </View>
            )}

            <View style={styles.profileInfo}>
              <Text style={[styles.label,{ color: colors.textMuted },]}> Profil Fotoğrafı</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {data.profile_photo ? 'Eklendi' : 'Eklenmedi'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, {color: colors.textMuted}]}>Doğum Tarihi</Text>
            <Text style={[styles.value, {color: colors.text}]}>{formatBirthDate(data.birth_date)}</Text>
          </View>

        </View>
          
        <View 
          style={[styles.card, {backgroundColor: colors.surface, borderColor: colors.border,},]}
        >
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Gizli Bilgiler</Text>
          
          <View style={styles.infoRow}>
            <Text style={[styles.label, {color: colors.textMuted}]}>E-posta</Text>
            <Text style={[styles.value, {color: colors.text}]}numberOfLines={1}>{data.email ?? 'Not added'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, {color: colors.textMuted}]}>Giriş Yöntemi</Text>
            <Text style={[styles.value, {color: colors.text}]}>{data.auth_provider ? data.auth_provider : 'Email'}</Text>
          </View>


        </View>
      </>
      )}

      {/* visibility settings */}

      {visibility && (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Görünürlük Ayarları </Text>

          <Text style={[styles.description, { color: colors.textMuted }]}>Profil bilgilerinin kimler tarafından görülebileceğini belirleyebilirsin.</Text>

          <View style={styles.visibilityRow}>
            <Text style={[styles.visibilityLabel, { color: colors.text }]}>Ad</Text>
            <VisibilitySelector
              value={visibility.name_visibility}
              onChange={(value) => changeVisibility('name_visibility', value)}
            />
          </View>

          <View style={styles.visibilityRow}>
            <Text style={[styles.visibilityLabel, { color: colors.text }]}>Soyad</Text>
            <VisibilitySelector
              value={visibility.surname_visibility}
              onChange={(value) => changeVisibility('surname_visibility', value)}
            />
          </View>

          <View style={styles.visibilityRow}>
            <Text style={[styles.visibilityLabel, { color: colors.text }]}>Kullanıcı Adı</Text>
            <VisibilitySelector
              value={visibility.username_visibility}
              onChange={(value) => changeVisibility('username_visibility', value)}
            />
          </View>

          <View style={styles.visibilityRow}>
            <Text style={[styles.visibilityLabel, { color: colors.text }]}>Uygulamaya Katılma</Text>
            <VisibilitySelector
              value={visibility.created_date_visibility}
              onChange={(value) => changeVisibility('created_date_visibility', value)}
            />
          </View>

          <View style={styles.visibilityRow}>
            <Text style={[styles.visibilityLabel, { color: colors.text }]}>Profil Fotoğrafı</Text>
            <VisibilitySelector
              value={visibility.profile_photo_visibility}
              onChange={(value) => changeVisibility('profile_photo_visibility', value)}
            />
          </View>

          <View style={styles.visibilityRow}>
            <Text style={[styles.visibilityLabel, { color: colors.text }]}>Doğum Tarihi</Text>
            <VisibilitySelector
              value={visibility.birth_date_visibility}
              onChange={(value) => changeVisibility('birth_date_visibility', value)}
            />
          </View>

          <View style={styles.visibilityRow}>
            <Text style={[styles.visibilityLabel, { color: colors.text }]}>E-posta</Text>
            <VisibilitySelector
              value={visibility.email_visibility}
              onChange={(value) => changeVisibility('email_visibility', value)}
            />
          </View>

          <Button
            label={isUpdatingVisibility ? 'Kaydediliyor...' : 'Görünürlükleri Kaydet'}
            onPress={handleSaveVisibility}
            disabled={isUpdatingVisibility}
            style={styles.saveVisibilityBtn}
          />
        </View>
      )}

     {saveMessage && (
        <View style={[ styles.saveMessage,  { backgroundColor: saveMessage.type === 'success' ? '#E8F5E9': '#FFEBEE', borderColor: saveMessage.type === 'success'? '#4CAF50': '#F44336', }, ]}> 
          <Text style={[styles.saveMessageText,
            { color: saveMessage.type === 'success' ? colors.primary[600] : colors.text,}, ]} > {saveMessage.message} 
          </Text>
        </View>
      )}

      <Button
        label="Çıkış Yap"
        variant="outline"
        onPress={() => signOut()}
        style={styles.logoutBtn}
      />
    </BaseComponent>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    gap: 20,
    borderWidth: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  email: {
    fontSize: 14,
    fontWeight: '400',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  logoutBtn: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  visibilityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  visibilityOption: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  visibilityOptionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  visibilityRow: {
    gap: 10,
  },
  visibilityLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: -10,
  },
  saveVisibilityBtn: {
    marginTop: 4,
  },

  saveMessage: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  saveMessageText: {
    fontSize: 14,
    fontWeight: '600',
  },

});

const formatBirthDate = (date?: string | null) => {
  if (!date) return 'Belirtilmemiş';

  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return 'Belirtilmemiş';
  }

  return parsedDate.toLocaleDateString('tr-TR');
};