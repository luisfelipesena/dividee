import { FontAwesome } from '@expo/vector-icons';
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
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Button,
  Card,
  ScrollContainer,
  Section,
  Heading,
  Body,
  FormGroup,
  FormLabel,
  FormError,
  Row,
  Tag,
  Checkbox,
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

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PartialUser[]>([]);
  const [allUsers, setAllUsers] = useState<PartialUser[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<PartialUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
        setIsSearching(true);
        try {
          const data = await apiClient.searchUsers('');
          setAllUsers(data);
          setSearchResults(data);
        } catch (error) {
          console.error('Error fetching users:', error);
        } finally {
          setIsSearching(false);
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
      if (searchQuery.length > 0) {
        const filtered = allUsers.filter((user) =>
          (user.fullName || '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
      } else {
        setSearchResults(allUsers);
      }
    }
  }, [searchQuery, allUsers, watchedSubscriptionId]);

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

  const handleSelectMember = (user: PartialUser) => {
    if (!selectedMembers.some((m) => m.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
    setSearchQuery('');
  };

  const handleRemoveMember = (userId: number) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== userId));
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
                <Picker
                  selectedValue={value}
                  onValueChange={(itemValue) => {
                    onChange(itemValue === 0 ? undefined : itemValue);
                    setSelectedMembers([]);
                  }}
                  style={[localStyles.picker, { color: colors.text }]}
                >
                  <Picker.Item label="Nenhuma" value={0} />
                  {subscriptions?.map((sub) => (
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
            <View
              style={[
                localStyles.searchContainer,
                { borderColor: colors.border },
              ]}
            >
              <FontAwesome
                name="search"
                size={16}
                color={colors.textSecondary}
                style={localStyles.searchIcon}
              />
              <TextInput
                style={[localStyles.searchInput, { color: colors.text }]}
                placeholder="Buscar usuário por nome..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            {isSearching && <ActivityIndicator style={{ marginTop: 8 }} />}
            <View
              style={[
                localStyles.searchResultsContainer,
                { borderColor: colors.border },
              ]}
            >
              {searchResults.map((user, index) => (
                <TouchableOpacity
                  key={user.id}
                  style={[
                    localStyles.searchResultItem,
                    {
                      borderBottomColor: colors.border,
                      borderBottomWidth:
                        index === searchResults.length - 1 ? 0 : 1,
                    },
                  ]}
                  onPress={() => handleSelectMember(user)}
                >
                  <Body>{user.fullName}</Body>
                </TouchableOpacity>
              ))}
            </View>
            <Row wrap>
              {selectedMembers.map((user) => (
                <Tag
                  key={user.id}
                  variant="primary"
                  onRemove={() => handleRemoveMember(user.id)}
                >
                  {user.fullName}
                </Tag>
              ))}
            </Row>
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
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={[localStyles.picker, { color: colors.text }]}
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
  picker: {
    height: 50,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 0,
    paddingVertical: 16,
    fontSize: 16,
  },
  searchResultsContainer: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 150,
    overflow: 'hidden',
  },
  searchResultItem: {
    padding: 16,
  },
});
