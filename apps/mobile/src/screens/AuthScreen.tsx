import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, typography } from '../styles/theme';

interface AuthScreenProps {
  route?: {
    params?: {
      mode?: 'login' | 'signup';
    };
  };
  navigation?: any;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function AuthScreen({ route, navigation }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(route?.params?.mode || 'login');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const auth = useAuth();

  useEffect(() => {
    if (auth.user) {
      navigation?.goBack();
    }
  }, [auth.user, navigation]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Signup-specific validations
    if (mode === 'signup') {
      if (!formData.name.trim()) {
        newErrors.name = 'Nome é obrigatório';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não coincidem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (mode === 'login') {
        await auth.loginAsync({
          email: formData.email.trim(),
          password: formData.password,
        });
        
        Alert.alert('Sucesso', 'Login realizado com sucesso!');
      } else {
        await auth.signupAsync({
          email: formData.email.trim(),
          password: formData.password,
          name: formData.name.trim(),
        });
        
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      setErrors({});
      
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Ocorreu um erro inesperado'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setErrors({});
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>💳</Text>
            </View>
            <Text style={styles.title}>
              {mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'login' 
                ? 'Entre para acessar suas assinaturas compartilhadas'
                : 'Comece a economizar compartilhando suas assinaturas'
              }
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {mode === 'signup' && (
              <Input
                label="Nome completo"
                placeholder="Seu nome"
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                error={errors.name}
                autoCapitalize="words"
                textContentType="name"
              />
            )}

            <Input
              label="E-mail"
              placeholder="seu@email.com"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
              leftIcon={<Text style={styles.inputIcon}>📧</Text>}
            />

            <Input
              label="Senha"
              placeholder="Sua senha"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              error={errors.password}
              secureTextEntry
              textContentType="password"
              leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
            />

            {mode === 'signup' && (
              <Input
                label="Confirmar senha"
                placeholder="Confirme sua senha"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                error={errors.confirmPassword}
                secureTextEntry
                textContentType="password"
                leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
              />
            )}

            <Button
              title={mode === 'login' ? 'Entrar' : 'Criar conta'}
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              size="lg"
              fullWidth
            />
          </View>

          {/* Toggle Mode */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            </Text>
            <Button
              title={mode === 'login' ? 'Criar conta' : 'Fazer login'}
              onPress={toggleMode}
              variant="ghost"
              disabled={isSubmitting}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Ao continuar, você concorda com nossos{'\n'}
              <Text style={styles.footerLink}>Termos de Uso</Text> e{' '}
              <Text style={styles.footerLink}>Política de Privacidade</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,

  keyboardView: {
    flex: 1,
  } as ViewStyle,

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  } as ViewStyle,

  header: {
    alignItems: 'center',
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['2xl'],
  } as ViewStyle,

  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  } as ViewStyle,

  logoIcon: {
    fontSize: 40,
  } as TextStyle,

  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '800',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  } as TextStyle,

  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * 1.4,
    paddingHorizontal: spacing.md,
  } as TextStyle,

  form: {
    marginBottom: spacing.xl,
  } as ViewStyle,

  inputIcon: {
    fontSize: 16,
  } as TextStyle,

  toggleContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  } as ViewStyle,

  toggleText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  } as TextStyle,

  footer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  } as ViewStyle,

  footerText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: typography.fontSize.xs * 1.4,
  } as TextStyle,

  footerLink: {
    color: colors.primary[500],
    textDecorationLine: 'underline',
  } as TextStyle,
}); 