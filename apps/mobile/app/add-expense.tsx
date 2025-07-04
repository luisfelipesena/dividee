import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Card } from '@/components/ui';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCreateExpense } from '@/hooks/useExpenses';
import { useGroupDetails } from '@/hooks/useGroups';
import { useSubscriptions } from '@/hooks/useSubscriptions';

const EXPENSE_CATEGORIES = [
  'Renovação',
  'Taxa Extra',
  'Upgrade',
  'Multa',
  'Outros',
];

export default function AddExpenseScreen() {
  const { subscriptionId, groupId } = useLocalSearchParams<{
    subscriptionId?: string;
    groupId?: string;
  }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const createExpenseMutation = useCreateExpense();
  const { data: subscriptions } = useSubscriptions();

  const [formData, setFormData] = useState({
    subscriptionId: subscriptionId ? parseInt(subscriptionId, 10) : 0,
    description: '',
    amount: '',
    category: 'Outros',
  });
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

  const selectedSubscription = subscriptions?.find(
    (sub) => sub.id === formData.subscriptionId
  );
  const currentGroupId =
    selectedSubscription?.groupId ?? (groupId ? parseInt(groupId) : undefined);

  const { data: groupDetails } = useGroupDetails(currentGroupId as number);

  useEffect(() => {
    if (groupDetails?.members) {
      setSelectedMembers(groupDetails.members.map((m) => m.id));
    }
  }, [groupDetails]);

  // Filter subscriptions by group if groupId is provided
  const filteredSubscriptions = groupId
    ? subscriptions?.filter((sub) => sub.groupId === parseInt(groupId, 10))
    : subscriptions;

  const handleToggleMember = (memberId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async () => {
    if (!formData.subscriptionId) {
      Alert.alert('Erro', 'Selecione uma assinatura');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Erro', 'A descrição é obrigatória');
      return;
    }

    if (!formData.amount || isNaN(Number(formData.amount))) {
      Alert.alert('Erro', 'O valor deve ser um número válido');
      return;
    }

    if (selectedMembers.length === 0) {
      Alert.alert(
        'Erro',
        'Selecione pelo menos um membro para dividir a despesa.'
      );
      return;
    }

    try {
      await createExpenseMutation.mutateAsync({
        subscriptionId: formData.subscriptionId,
        description: formData.description.trim(),
        amount: Number(formData.amount),
        category: formData.category,
        participants: selectedMembers,
      });
      router.back();
    } catch (error) {
      console.error('Error creating expense:', error);
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
            Adicionar Despesa
          </Text>
          <Text style={[styles.subtitle, { color: colors.tint }]}>
            Registre uma despesa relacionada a suas assinaturas
          </Text>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Assinatura *
            </Text>
            <View
              style={[styles.pickerContainer, { borderColor: colors.border }]}
            >
              <Picker
                selectedValue={formData.subscriptionId}
                onValueChange={(value: number) =>
                  setFormData((prev) => ({ ...prev, subscriptionId: value }))
                }
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Selecione uma assinatura" value={0} />
                {filteredSubscriptions?.map((sub) => (
                  <Picker.Item key={sub.id} label={sub.name} value={sub.id} />
                ))}
              </Picker>
            </View>
          </View>

          {groupDetails && groupDetails.members && (
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Dividir com
              </Text>
              {groupDetails.members.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={styles.memberRow}
                  onPress={() => handleToggleMember(member.id)}
                >
                  <FontAwesome
                    name={
                      selectedMembers.includes(member.id)
                        ? 'check-square-o'
                        : 'square-o'
                    }
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={[styles.memberName, { color: colors.text }]}>
                    {member.fullName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Descrição *
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
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              placeholder="Ex: Renovação mensal, Taxa de cancelamento"
              placeholderTextColor={colors.tint}
              maxLength={200}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Valor (R$) *
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
              value={formData.amount}
              onChangeText={(text) =>
                setFormData((prev) => ({
                  ...prev,
                  amount: formatCurrency(text),
                }))
              }
              placeholder="0.00"
              placeholderTextColor={colors.tint}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Categoria
            </Text>
            <View
              style={[styles.pickerContainer, { borderColor: colors.border }]}
            >
              <Picker
                selectedValue={formData.category}
                onValueChange={(value: string) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
                style={[styles.picker, { color: colors.text }]}
              >
                {EXPENSE_CATEGORIES.map((category) => (
                  <Picker.Item
                    key={category}
                    label={category}
                    value={category}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </Card>

        <View style={styles.infoCard}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            Sobre as Despesas
          </Text>
          <Text style={[styles.infoText, { color: colors.tint }]}>
            • As despesas são visíveis para todos os membros da assinatura{'\n'}
            • Use para registrar custos extras, renovações ou taxas{'\n'}• Ajuda
            a manter transparência nos gastos compartilhados{'\n'}• Valores são
            calculados automaticamente nos relatórios
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
              (!formData.subscriptionId ||
                !formData.description.trim() ||
                !formData.amount ||
                createExpenseMutation.isPending) &&
                styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={
              !formData.subscriptionId ||
              !formData.description.trim() ||
              !formData.amount ||
              createExpenseMutation.isPending ||
              selectedMembers.length === 0
            }
          >
            <Text style={styles.createButtonText}>
              {createExpenseMutation.isPending
                ? 'Adicionando...'
                : 'Adicionar Despesa'}
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
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  memberName: {
    marginLeft: 12,
    fontSize: 16,
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
