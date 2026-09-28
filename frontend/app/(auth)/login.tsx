import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import { router } from 'expo-router';
import { Music2 } from 'lucide-react-native';
import { AuthScreenWrapper } from '@/src/components/common/AuthScreenWrapper';
import { FormInput } from '@/src/components/common/FormInput';
import { Button } from '@/src/components/common/Button';
import { useThemeColors } from '@/src/theme/ThemeProvider';
import { useAuth } from '@/src/core/auth/AuthProvider';
import {
  loginValidationSchema,
  loginInitialValues,
  ILoginFormValues,
} from '@/src/utils/validation';
import { showToast } from '@/src/components/common/Toast';

export default function LoginScreen() {
  const colors = useThemeColors();
  const { signIn, googleSignIn } = useAuth();

  const handleSubmit = async (values: ILoginFormValues) => {
    try {
      await signIn(values.email, values.password);
      showToast('Giriş başarılı.');
    } catch (error) {
      showToast((error as Error).message);
    }
  };

  return (
    <AuthScreenWrapper>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primary[50] }]}>
          <Music2 size={32} color={colors.primary[600]} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Music Room'a Hoş Geldiniz</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Hesabınıza giriş yapın
        </Text>
      </View>

      <Formik
        initialValues={loginInitialValues}
        validationSchema={loginValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <View style={styles.form}>
            <FormInput
              label="E-posta"
              placeholder="ornek@email.com"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              error={errors.email}
              touched={touched.email}
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
            />
            <FormInput
              label="Şifre"
              placeholder="••••••••"
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              error={errors.password}
              touched={touched.password}
              secureTextEntry
              returnKeyType="done"
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotRow}
            >
              <Text style={[styles.forgotText, { color: colors.primary[600] }]}>
                Şifremi unuttum
              </Text>
            </TouchableOpacity>

            <Button
              label="Giriş Yap"
              onPress={() => handleSubmit()}
              loading={isSubmitting}
              style={styles.submitBtn}
            />

            <Button
              label="Google ile giriş yap"
              onPress={async () => {
                try {
                  await googleSignIn();
                } catch (error) {
                  showToast((error as Error).message);
                }
              }}
            />
          </View>
        )}
      </Formik>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Hesabınız yok mu?{' '}
        </Text>
        <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
          <Text style={[styles.footerLink, { color: colors.primary[600] }]}>
            Kayıt Olun
          </Text>
        </TouchableOpacity>
      </View>
    </AuthScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
  },
  form: {
    gap: 16,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitBtn: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 15,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '600',
  },
});
