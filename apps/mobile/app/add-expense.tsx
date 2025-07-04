import { FontAwesome } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateExpenseFormData, createExpenseSchema } from '@monorepo/types';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
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

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateExpenseFormData>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      subscriptionId: subscriptionId ? parseInt(subscriptionId, 10) : undefined,
      description: '',
      amount: undefined,
      category: 'Outros',
      participants: [],
    },
  });

  const watchedSubscriptionId = watch('subscriptionId');
  const watchedParticipants = watch('participants') || [];

  const selectedSubscription = subscriptions?.find(
    (sub) => sub.id === watchedSubscriptionId
  );
  const currentGroupId =
    selectedSubscription?.groupId ?? (groupId ? parseInt(groupId) : undefined);

  const { data: groupDetails } = useGroupDetails(currentGroupId as number);

  useEffect(() => {
    if (groupDetails?.members) {
      setValue(
        'participants',
        groupDetails.members.map((m) => m.id)
      );
    }
  }, [groupDetails, setValue]);

  // Filter subscriptions by group if groupId is provided
  const filteredSubscriptions = groupId
    ? subscriptions?.filter((sub) => sub.groupId === parseInt(groupId, 10))
    : subscriptions;

  const handleToggleMember = (memberId: number) => {
    const currentParticipants = watchedParticipants;
    const newParticipants = currentParticipants.includes(memberId)
      ? currentParticipants.filter((id) => id !== memberId)
      : [...currentParticipants, memberId];
    setValue('participants', newParticipants, { shouldValidate: true });
  };

  const onSubmit = async (data: CreateExpenseFormData) => {
    try {
      await createExpenseMutation.mutateAsync({
        ...data,
        amount: Number(data.amount),
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
            <Controller
              control={control}
              name="subscriptionId"
              render={({ field: { onChange, value } }) => (
                <View
                  style={[
                    styles.pickerContainer,
                    {
                      borderColor: errors.subscriptionId
                        ? colors.error
                        : colors.border,
                    },
                  ]}
                >
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={[styles.picker, { color: colors.text }]}
                  >
                    <Picker.Item label="Selecione uma assinatura" value={0} />
                    {filteredSubscriptions?.map((sub) => (
                      <Picker.Item
                        key={sub.id}
                        label={sub.name}
                        value={sub.id}
                      />
                    ))}
                  </Picker>
                </View>
              )}
            />
            {errors.subscriptionId && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.subscriptionId.message}
              </Text>
            )}
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
                      watchedParticipants.includes(member.id)
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
              {errors.participants && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.participants.message}
                </Text>
              )}
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Descrição *
            </Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: errors.description
                        ? colors.error
                        : colors.border,
                      color: colors.text,
                      backgroundColor: colors.card,
                    },
                  ]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Ex: Renovação mensal, Taxa de cancelamento"
                  placeholderTextColor={colors.tint}
                  maxLength={200}
                />
              )}
            />
            {errors.description && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.description.message}
              </Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Valor (R$) *
            </Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: errors.amount ? colors.error : colors.border,
                      color: colors.text,
                      backgroundColor: colors.card,
                    },
                  ]}
                  value={value?.toString()}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9.]/g, '');
                    onChange(
                      numericValue ? parseFloat(numericValue) : undefined
                    );
                  }}
                  placeholder="0.00"
                  placeholderTextColor={colors.tint}
                  keyboardType="decimal-pad"
                />
              )}
            />
            {errors.amount && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.amount.message}
              </Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Categoria
            </Text>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <View
                  style={[
                    styles.pickerContainer,
                    {
                      borderColor: errors.category
                        ? colors.error
                        : colors.border,
                    },
                  ]}
                >
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
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
              )}
            />
            {errors.category && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.category.message}
              </Text>
            )}
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
              createExpenseMutation.isPending && styles.disabledButton,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={createExpenseMutation.isPending}
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
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 4,
  },
});
