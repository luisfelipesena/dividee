import React from 'react';
import { ScrollView, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/ui/Button';
import { borderRadius, colors, spacing, typography } from '../styles/theme';

interface LandingScreenProps {
  navigation?: any;
}

export default function LandingScreen({ navigation }: LandingScreenProps) {
  const navigateToLogin = () => {
    navigation?.navigate('Auth', { mode: 'login' });
  };

  const navigateToSignup = () => {
    navigation?.navigate('Auth', { mode: 'signup' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>💳 Carteira</Text>
          <Text style={styles.tagline}>Divida. Economize. Aproveite.</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroIconText}>💰</Text>
          </View>
          
          <Text style={styles.heroTitle}>
            Compartilhe assinaturas{'\n'}
            <Text style={styles.heroTitleAccent}>com segurança</Text>
          </Text>
          
          <Text style={styles.heroSubtitle}>
            Divida os custos das suas assinaturas favoritas com pessoas de confiança e economize até 80% todo mês.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>🔒</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Totalmente Seguro</Text>
              <Text style={styles.featureDescription}>
                Suas credenciais ficam protegidas com criptografia avançada
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>📊</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Controle Total</Text>
              <Text style={styles.featureDescription}>
                Acompanhe sua economia em tempo real e gerencie tudo pelo app
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>⚡</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Fácil de Usar</Text>
              <Text style={styles.featureDescription}>
                Convide amigos, aprove novos membros e renove senhas em poucos toques
              </Text>
            </View>
          </View>
        </View>

        {/* How it works */}
        <View style={styles.howItWorks}>
          <Text style={styles.sectionTitle}>Como funciona</Text>
          
          <View style={styles.steps}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Crie seu grupo e adicione suas assinaturas</Text>
            </View>
            
            <View style={styles.stepDivider} />
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Convide pessoas ou encontre grupos públicos</Text>
            </View>
            
            <View style={styles.stepDivider} />
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Divida os custos e economize todo mês</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>80%</Text>
            <Text style={styles.statLabel}>economia média</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>seguro</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>5min</Text>
            <Text style={styles.statLabel}>para começar</Text>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          <Button
            title="Começar agora"
            onPress={navigateToSignup}
            size="lg"
            fullWidth
          />
          
          <Button
            title="Já tenho conta"
            onPress={navigateToLogin}
            variant="ghost"
            size="lg"
            fullWidth
          />
        </View>

        <Text style={styles.footer}>
          Seus dados estão seguros conosco 🔐
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  } as ViewStyle,

  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
  } as ViewStyle,

  logo: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  } as TextStyle,

  tagline: {
    fontSize: typography.fontSize.base,
    color: colors.text.muted,
    fontWeight: '500',
  } as TextStyle,

  hero: {
    alignItems: 'center',
    paddingBottom: spacing['3xl'],
  } as ViewStyle,

  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  } as ViewStyle,

  heroIconText: {
    fontSize: 40,
  } as TextStyle,

  heroTitle: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: '800',
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: typography.fontSize['4xl'] * 1.2,
    marginBottom: spacing.lg,
  } as TextStyle,

  heroTitleAccent: {
    color: colors.primary[500],
  } as TextStyle,

  heroSubtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.lg * 1.5,
    paddingHorizontal: spacing.md,
  } as TextStyle,

  features: {
    paddingBottom: spacing['3xl'],
  } as ViewStyle,

  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  } as ViewStyle,

  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[500] + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  } as ViewStyle,

  featureIconText: {
    fontSize: 24,
  } as TextStyle,

  featureContent: {
    flex: 1,
  } as ViewStyle,

  featureTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  } as TextStyle,

  featureDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * 1.4,
  } as TextStyle,

  howItWorks: {
    paddingBottom: spacing['3xl'],
  } as ViewStyle,

  sectionTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  } as TextStyle,

  steps: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  } as ViewStyle,

  step: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  } as ViewStyle,

  stepNumberText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.text.primary,
  } as TextStyle,

  stepText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.4,
  } as TextStyle,

  stepDivider: {
    height: 1,
    backgroundColor: colors.slate[600],
    marginVertical: spacing.md,
    marginLeft: 48,
  } as ViewStyle,

  stats: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing['3xl'],
  } as ViewStyle,

  stat: {
    flex: 1,
    alignItems: 'center',
  } as ViewStyle,

  statNumber: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '800',
    color: colors.primary[500],
    marginBottom: spacing.xs,
  } as TextStyle,

  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.muted,
    textAlign: 'center',
  } as TextStyle,

  statDivider: {
    width: 1,
    backgroundColor: colors.slate[600],
    marginHorizontal: spacing.lg,
  } as ViewStyle,

  cta: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  } as ViewStyle,

  footer: {
    fontSize: typography.fontSize.sm,
    color: colors.text.muted,
    textAlign: 'center',
  } as TextStyle,
}); 