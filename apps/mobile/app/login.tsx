import { FontAwesome } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormData, loginSchema } from '@monorepo/types';

import { Button, Card, Input } from '@/components/ui';
import Colors from '@/constants/Colors';
import { useLogin } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const loginMutation = useLogin();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View
            style={[styles.logoContainer, { backgroundColor: colors.primary }]}
          >
            <FontAwesome
              name="credit-card"
              size={48}
              color={colors.textInverse}
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Carteira</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Economize compartilhando assinaturas
          </Text>
        </View>

        <Card variant="filled" style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="E-mail"
                placeholder="seu@email.com"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="envelope"
                error={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Senha"
                placeholder="Digite sua senha"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                leftIcon="lock"
                error={errors.password?.message}
              />
            )}
          />
          <Button
            title="Entrar"
            onPress={handleSubmit(onSubmit)}
            loading={loginMutation.isPending}
            fullWidth
            size="large"
            icon="sign-in"
          />
        </Card>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Não tem uma conta?
          </Text>
          <Link href="/register" asChild>
            <Button title="Cadastre-se" variant="ghost" size="medium" />
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    marginBottom: 8,
  },
});
