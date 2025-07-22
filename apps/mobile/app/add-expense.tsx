import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateExpenseFormData,
  PartialUser,
  createExpenseSchema,
} from '@monorepo/types';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { UserSelector } from '@/components/UserSelector';
import {
  Body,
  Button,
  Card,
  Checkbox,
  FormError,
  FormGroup,
  FormLabel,
  Heading,
  ScrollContainer,
  Section,
} from '@/components/ui';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { useCreateExpense } from '@/hooks/useExpenses';
import { useGroupDetails } from '@/hooks/useGroups';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { apiClient } from '@/lib/api-client';

const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Lazer',
  'Outros',
];

export default function AddExpenseScreen() {
  const { subscriptionId, groupId } = useLocalSearchParams<{
    subscriptionId?: string;
    groupId?: string;
  }>();
  const router = useRouter();
  const { colors } = useDesignSystem();

  const createExpenseMutation = useCreateExpense();
  const { data: subscriptions } = useSubscriptions();

  const [allUsers, setAllUsers] = useState<PartialUser[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<PartialUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

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
    selectedSubscription?.groupId ??
    (groupId ? parseInt(groupId, 10) : undefined);

  const { data: groupDetails } = useGroupDetails(currentGroupId as number);

  useEffect(() => {
    if (!watchedSubscriptionId && allUsers.length === 0) {
      const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
          const data = await apiClient.searchUsers('');
          setAllUsers(data);
        } catch (error) {
          console.error('Error fetching users:', error);
        } finally {
          setIsLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [watchedSubscriptionId, allUsers]);

  useEffect(() => {
    if (groupDetails?.members) {
      setValue(
        'participants',
        groupDetails.members.map((m) => m.id)
      );
    }
  }, [groupDetails, setValue]);

  useEffect(() => {
    if (!watchedSubscriptionId) {
      setValue(
        'participants',
        selectedMembers.map((m) => m.id)
      );
    }
  }, [selectedMembers, setValue, watchedSubscriptionId]);

  const handleToggleMember = (memberId: number) => {
    const currentParticipants = watchedParticipants;
    const newParticipants = currentParticipants.includes(memberId)
      ? currentParticipants.filter((id) => id !== memberId)
      : [...currentParticipants, memberId];
    setValue('participants', newParticipants, { shouldValidate: true });
  };

  const handleUsersChange = (users: PartialUser[]) => {
    setSelectedMembers(users);
  };

  const onSubmit = async (data: CreateExpenseFormData) => {
    try {
      await createExpenseMutation.mutateAsync({
        ...data,
        amount: Number(data.amount),
        subscriptionId: data.subscriptionId,
      });
      router.back();
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  return (
    <ScrollContainer>
      <Section>
        <Heading level={1}>Adicionar Despesa</Heading>
        <Body color="textSecondary">
          Registre um gasto e divida com seus amigos.
        </Body>
      </Section>

      <Card>
        <FormGroup>
          <FormLabel>Associar a uma Assinatura (Opcional)</FormLabel>
          <Controller
            control={control}
            name="subscriptionId"
            render={({ field: { onChange, value } }) => (
              <View
                style={[
                  localStyles.pickerContainer,
                  {
                    borderColor: errors.subscriptionId
                      ? colors.error
                      : colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <TouchableOpacity
                  style={localStyles.pickerTouchable}
                  activeOpacity={0.8}
                >
                  <Picker
                    selectedValue={value}
                    onValueChange={(itemValue) => {
                      onChange(itemValue === 0 ? undefined : itemValue);
                      setSelectedMembers([]);
                    }}
                    style={[localStyles.picker, { color: colors.text }]}
                    dropdownIconColor={colors.text}
                  >
                    <Picker.Item
                      label="Nenhuma assinatura selecionada"
                      value={0}
                    />
                    {subscriptions?.map((sub) => (
                      <Picker.Item
                        key={sub.id}
                        label={sub.name}
                        value={sub.id}
                      />
                    ))}
                  </Picker>
                </TouchableOpacity>
              </View>
            )}
          />
        </FormGroup>

        {groupDetails && groupDetails.members && watchedSubscriptionId ? (
          <FormGroup>
            <FormLabel>Dividir com (Membros do Grupo)</FormLabel>
            {groupDetails.members.map((member) => (
              <Checkbox
                key={member.id}
                checked={watchedParticipants.includes(member.id)}
                onPress={() => handleToggleMember(member.id)}
                label={member.fullName || ''}
              />
            ))}
          </FormGroup>
        ) : !watchedSubscriptionId ? (
          <FormGroup>
            <FormLabel>Dividir com</FormLabel>
            <UserSelector
              selectedUsers={selectedMembers}
              onUsersChange={handleUsersChange}
              allUsers={allUsers}
              isLoading={isLoadingUsers}
            />
          </FormGroup>
        ) : null}

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormGroup>
              <FormLabel required>Descrição</FormLabel>
              <TextInput
                style={[
                  localStyles.input,
                  {
                    borderColor: errors.description
                      ? colors.error
                      : colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface,
                  },
                ]}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Ex: Jantar de sexta, Compras do mercado"
                placeholderTextColor={colors.textSecondary}
                maxLength={200}
              />
              {errors.description && (
                <FormError>{errors.description.message}</FormError>
              )}
            </FormGroup>
          )}
        />

        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormGroup>
              <FormLabel required>Valor Total (R$)</FormLabel>
              <TextInput
                style={[
                  localStyles.input,
                  {
                    borderColor: errors.amount ? colors.error : colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface,
                  },
                ]}
                value={value?.toString() || ''}
                onBlur={onBlur}
                onChangeText={(text) => {
                  const numericValue = text.replace(/[^0-9.]/g, '');
                  onChange(numericValue ? parseFloat(numericValue) : undefined);
                }}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
              />
              {errors.amount && <FormError>{errors.amount.message}</FormError>}
            </FormGroup>
          )}
        />

        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <FormGroup>
              <FormLabel>Categoria</FormLabel>
              <View
                style={[
                  localStyles.pickerContainer,
                  {
                    borderColor: errors.category ? colors.error : colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <TouchableOpacity
                  style={localStyles.pickerTouchable}
                  activeOpacity={0.8}
                >
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={[localStyles.picker, { color: colors.text }]}
                    dropdownIconColor={colors.text}
                    itemStyle={{ fontSize: 16 }}
                  >
                    {EXPENSE_CATEGORIES.map((category) => (
                      <Picker.Item
                        key={category}
                        label={category}
                        value={category}
                        color={colors.text}
                      />
                    ))}
                  </Picker>
                </TouchableOpacity>
              </View>
            </FormGroup>
          )}
        />
      </Card>

      <Section>
        <Button
          title={
            createExpenseMutation.isPending
              ? 'Adicionando...'
              : 'Adicionar Despesa'
          }
          onPress={handleSubmit(onSubmit)}
          loading={createExpenseMutation.isPending}
          variant="primary"
          fullWidth
        />
      </Section>
    </ScrollContainer>
  );
}

const localStyles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pickerTouchable: {
    width: '100%',
  },
  picker: {
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});
