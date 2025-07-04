import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Card } from '@/components/ui';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCreateSubscription } from '@/hooks/useSubscriptions';

export default function CreateSubscriptionScreen() {
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const createSubscriptionMutation = useCreateSubscription();

  const [formData, setFormData] = useState({
    name: '',
    iconUrl: '',
    totalCost: '',
    maxMembers: '4',
    isPublic: false,
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'O nome da assinatura é obrigatório');
      return;
    }

    if (!formData.totalCost || isNaN(Number(formData.totalCost))) {
      Alert.alert('Erro', 'O valor da assinatura deve ser um número válido');
      return;
    }

    if (!formData.maxMembers || isNaN(Number(formData.maxMembers)) || Number(formData.maxMembers) < 1) {
      Alert.alert('Erro', 'O número máximo de membros deve ser pelo menos 1');
      return;
    }

    try {
      await createSubscriptionMutation.mutateAsync({
        name: formData.name.trim(),
        iconUrl: formData.iconUrl.trim() || undefined,
        totalCost: Number(formData.totalCost),
        maxMembers: Number(formData.maxMembers),
        isPublic: formData.isPublic,
        groupId: groupId ? Number(groupId) : undefined,
      });
      router.back();
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d.,]/g, '');
    const normalizedValue = numericValue.replace(',', '.');
    return normalizedValue;
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Nova Assinatura
          </Text>
          <Text style={[styles.subtitle, { color: colors.tint }]}>
            Adicione uma nova assinatura para compartilhar
          </Text>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Nome da Assinatura *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.card,
                },
              ]}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Ex: Netflix, Spotify, Disney+"
              placeholderTextColor={colors.tint}
              maxLength={50}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              URL do Ícone (Opcional)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.card,
                },
              ]}
              value={formData.iconUrl}
              onChangeText={(text) => setFormData(prev => ({ ...prev, iconUrl: text }))}
              placeholder="https://exemplo.com/icon.png"
              placeholderTextColor={colors.tint}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Valor Total (R$) *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.card,
                },
              ]}
              value={formData.totalCost}
              onChangeText={(text) => setFormData(prev => ({ 
                ...prev, 
                totalCost: formatCurrency(text) 
              }))}
              placeholder="29.90"
              placeholderTextColor={colors.tint}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Número Máximo de Membros *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.card,
                },
              ]}
              value={formData.maxMembers}
              onChangeText={(text) => setFormData(prev => ({ ...prev, maxMembers: text }))}
              placeholder="4"
              placeholderTextColor={colors.tint}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchLabelContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Assinatura Pública
              </Text>
              <Text style={[styles.switchDescription, { color: colors.tint }]}>
                Outros usuários poderão solicitar acesso
              </Text>
            </View>
            <Switch
              value={formData.isPublic}
              onValueChange={(value) => setFormData(prev => ({ ...prev, isPublic: value }))}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={formData.isPublic ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </Card>

        <View style={styles.infoCard}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            Sobre as Assinaturas
          </Text>
          <Text style={[styles.infoText, { color: colors.tint }]}>
            • O valor será dividido entre todos os membros{'\n'}
            • Você será automaticamente incluído como membro{'\n'}
            • {groupId ? 'Assinatura será vinculada ao grupo' : 'Assinatura será independente'}{'\n'}
            • Membros receberão notificações sobre renovações
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.border }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>
              Cancelar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.createButton,
              { backgroundColor: colors.primary },
              (!formData.name.trim() || !formData.totalCost || createSubscriptionMutation.isPending) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={!formData.name.trim() || !formData.totalCost || createSubscriptionMutation.isPending}
          >
            <Text style={styles.createButtonText}>
              {createSubscriptionMutation.isPending ? 'Criando...' : 'Criar Assinatura'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  formCard: {
    padding: 20,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 48,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});