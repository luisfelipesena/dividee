import { FontAwesome } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateSubscriptionFormData,
  PartialUser,
  createSubscriptionSchema,
} from '@monorepo/types';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
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

import { Button, Card } from '@/components/ui';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCreateSubscription } from '@/hooks/useSubscriptions';
import { api } from '@/lib/api';

export default function CreateItemScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const createSubscriptionMutation = useCreateSubscription();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateSubscriptionFormData>({
    resolver: zodResolver(createSubscriptionSchema),
    defaultValues: {
      name: '',
      isPublic: false,
      billingCycle: 'monthly',
      participants: [],
      maxMembers: 1,
    },
  });

  const [itemType, setItemType] = useState<'subscription' | 'payment'>(
    'subscription'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PartialUser[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<PartialUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setValue('billingCycle', itemType === 'subscription' ? 'monthly' : 'once');
  }, [itemType, setValue]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const { data } = await api.get(`/users/search?query=${searchQuery}`);
          setSearchResults(data);
        } catch (error) {
          console.error('Error searching users:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    setValue(
      'participants',
      selectedMembers.map((m) => m.id)
    );
    setValue('maxMembers', selectedMembers.length + 1);
  }, [selectedMembers, setValue]);

  const handleSelectMember = (user: PartialUser) => {
    if (!selectedMembers.some((m) => m.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveMember = (userId: number) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== userId));
  };

  const onSubmit = async (data: CreateSubscriptionFormData) => {
    const submissionData = {
      ...data,
      totalCost: Number(data.totalCost),
    };

    try {
      await createSubscriptionMutation.mutateAsync(submissionData);
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o item.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Criar Novo Lançamento
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Adicione uma assinatura recorrente ou um pagamento único.
          </Text>
        </View>

        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              itemType === 'subscription' && {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => setItemType('subscription')}
          >
            <FontAwesome name="refresh" size={16} color="white" />
            <Text style={styles.typeButtonText}>Recorrente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              itemType === 'payment' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setItemType('payment')}
          >
            <FontAwesome name="money" size={16} color="white" />
            <Text style={styles.typeButtonText}>Pagamento Único</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.formCard}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Nome *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: errors.name ? colors.error : colors.border },
                  ]}
                  placeholder={
                    itemType === 'subscription'
                      ? 'Ex: Netflix, Spotify'
                      : 'Ex: Jantar, Cinema'
                  }
                  placeholderTextColor={colors.textTertiary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="totalCost"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Valor Total (R$) *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: errors.totalCost
                        ? colors.error
                        : colors.border,
                    },
                  ]}
                  placeholder="29.90"
                  placeholderTextColor={colors.textTertiary}
                  value={value?.toString()}
                  onChangeText={(text) =>
                    onChange(parseFloat(text.replace(',', '.')) || 0)
                  }
                  onBlur={onBlur}
                  keyboardType="decimal-pad"
                />
                {errors.totalCost && (
                  <Text style={styles.errorText}>
                    {errors.totalCost.message}
                  </Text>
                )}
              </View>
            )}
          />

          {itemType === 'subscription' && (
            <Controller
              control={control}
              name="billingCycle"
              render={({ field: { onChange, value } }) => (
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Ciclo de Cobrança *
                  </Text>
                  <View
                    style={[
                      styles.pickerContainer,
                      { borderColor: colors.border },
                    ]}
                  >
                    <Picker
                      selectedValue={value}
                      onValueChange={onChange}
                      style={{ color: colors.text }}
                    >
                      <Picker.Item label="Mensal" value="monthly" />
                      <Picker.Item label="Anual" value="yearly" />
                      <Picker.Item label="Semanal" value="weekly" />
                    </Picker>
                  </View>
                </View>
              )}
            />
          )}

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Dividir com
            </Text>
            <View style={styles.searchContainer}>
              <FontAwesome
                name="search"
                size={16}
                color={colors.textTertiary}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.input, styles.searchInput]}
                placeholder="Buscar usuário por nome..."
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            {isSearching && <ActivityIndicator style={{ marginTop: 8 }} />}
            {searchResults.length > 0 && (
              <View style={styles.searchResultsContainer}>
                {searchResults.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={styles.searchResultItem}
                    onPress={() => handleSelectMember(user)}
                  >
                    <Text style={{ color: colors.text }}>{user.fullName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={styles.selectedMembersContainer}>
              {selectedMembers.map((user) => (
                <View
                  key={user.id}
                  style={[
                    styles.memberTag,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.memberTagName}>{user.fullName}</Text>
                  <TouchableOpacity onPress={() => handleRemoveMember(user.id)}>
                    <FontAwesome name="times-circle" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <Controller
            control={control}
            name="isPublic"
            render={({ field: { onChange, value } }) => (
              <View style={styles.switchGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Deixar público
                </Text>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor={value ? '#ffffff' : '#f4f3f4'}
                />
              </View>
            )}
          />
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Cancelar"
            variant="outline"
            onPress={() => router.back()}
          />
          <Button
            title={
              createSubscriptionMutation.isPending
                ? 'Criando...'
                : 'Criar Lançamento'
            }
            onPress={handleSubmit(onSubmit)}
            loading={createSubscriptionMutation.isPending}
            variant="primary"
          />
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
    padding: 16,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  typeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  formCard: {
    padding: 20,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
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
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  errorText: {
    color: '#EF4444',
    marginTop: 4,
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 0,
    paddingVertical: 12,
  },
  searchResultsContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedMembersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  memberTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  memberTagName: {
    color: 'white',
    marginRight: 8,
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
});
