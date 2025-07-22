import { FontAwesome } from '@expo/vector-icons';
import { PartialUser } from '@monorepo/types';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Body, Button, Card, Row, Tag } from '@/components/ui';
import { useDesignSystem } from '@/hooks/useDesignSystem';

interface UserSelectorProps {
  selectedUsers: PartialUser[];
  onUsersChange: (users: PartialUser[]) => void;
  allUsers: PartialUser[];
  isLoading?: boolean;
  placeholder?: string;
}

export function UserSelector({
  selectedUsers,
  onUsersChange,
  allUsers,
  isLoading = false,
  placeholder = 'Buscar usuário por nome...',
}: UserSelectorProps) {
  const { colors } = useDesignSystem();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<PartialUser[]>([]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = allUsers.filter(
        (user) =>
          (user.fullName || '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) &&
          !selectedUsers.some((selected) => selected.id === user.id)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(
        allUsers.filter(
          (user) => !selectedUsers.some((selected) => selected.id === user.id)
        )
      );
    }
  }, [searchQuery, allUsers, selectedUsers]);

  const handleSelectUser = (user: PartialUser) => {
    onUsersChange([...selectedUsers, user]);
    setSearchQuery('');
  };

  const handleRemoveUser = (userId: number) => {
    onUsersChange(selectedUsers.filter((user) => user.id !== userId));
  };

  const renderUserItem = ({ item }: { item: PartialUser }) => (
    <TouchableOpacity
      style={[styles.userItem, { borderBottomColor: colors.border }]}
      onPress={() => handleSelectUser(item)}
    >
      <View style={styles.userInfo}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Body style={{ color: colors.surface }}>
            {item.fullName?.charAt(0).toUpperCase()}
          </Body>
        </View>
        <Body>{item.fullName}</Body>
      </View>
      <FontAwesome name="plus-circle" size={20} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[
          styles.selectorButton,
          {
            borderColor: colors.border,
            backgroundColor: colors.surface,
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Body color="textSecondary">
          {selectedUsers.length > 0
            ? `${selectedUsers.length} usuário(s) selecionado(s)`
            : 'Toque para selecionar usuários'}
        </Body>
        <FontAwesome name="users" size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      {selectedUsers.length > 0 && (
        <Row wrap style={{ marginTop: 8 }}>
          {selectedUsers.map((user) => (
            <Tag
              key={user.id}
              variant="primary"
              onRemove={() => handleRemoveUser(user.id)}
            >
              {user.fullName}
            </Tag>
          ))}
        </Row>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
        >
          <Card
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Body weight="semibold">Selecionar Usuários</Body>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome name="times" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.searchContainer,
                { borderColor: colors.border, backgroundColor: colors.surface },
              ]}
            >
              <FontAwesome
                name="search"
                size={16}
                color={colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder={placeholder}
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <FlatList
                data={filteredUsers}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.userList}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Body color="textSecondary">
                      {searchQuery
                        ? 'Nenhum usuário encontrado'
                        : 'Todos os usuários já foram selecionados'}
                    </Body>
                  </View>
                }
              />
            )}

            <View style={styles.modalFooter}>
              <Button
                title="Concluir"
                onPress={() => setModalVisible(false)}
                variant="primary"
                fullWidth
              />
            </View>
          </Card>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  userList: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 40,
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
});
