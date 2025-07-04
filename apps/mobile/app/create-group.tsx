import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { useCreateGroup } from '@/hooks/useGroups';

export default function CreateGroupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const createGroupMutation = useCreateGroup();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'O nome do grupo é obrigatório');
      return;
    }

    try {
      await createGroupMutation.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });
      router.back();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Criar Novo Grupo
          </Text>
          <Text style={[styles.subtitle, { color: colors.tint }]}>
            Crie um grupo para compartilhar assinaturas com seus amigos
          </Text>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Nome do Grupo *
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
              placeholder="Digite o nome do grupo"
              placeholderTextColor={colors.tint}
              maxLength={50}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Descrição (Opcional)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.card,
                },
              ]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Adicione uma descrição para o grupo"
              placeholderTextColor={colors.tint}
              multiline
              numberOfLines={4}
              maxLength={200}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.characterCount}>
            <Text style={[styles.characterCountText, { color: colors.tint }]}>
              {formData.description.length}/200
            </Text>
          </View>
        </Card>

        <View style={styles.infoCard}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            Sobre os Grupos
          </Text>
          <Text style={[styles.infoText, { color: colors.tint }]}>
            • Você será automaticamente o administrador do grupo{'\n'}
            • Poderá convidar membros por email{'\n'}
            • Gerenciará as assinaturas compartilhadas{'\n'}
            • Todos os grupos são privados por padrão
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
              (!formData.name.trim() || createGroupMutation.isPending) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={!formData.name.trim() || createGroupMutation.isPending}
          >
            <Text style={styles.createButtonText}>
              {createGroupMutation.isPending ? 'Criando...' : 'Criar Grupo'}
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
  textArea: {
    minHeight: 100,
  },
  characterCount: {
    alignItems: 'flex-end',
  },
  characterCountText: {
    fontSize: 12,
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