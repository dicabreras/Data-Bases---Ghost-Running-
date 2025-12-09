import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../config/designSystem';
import { commonStyles } from '../config/commonStyles';
import { apiUrl } from '../config/api';
import GRButton from './GRButton';
import FollowButton from './FollowButton';

interface FollowerUser {
  user_Email: string;
  user_Username: string;
  user_Names: string;
  user_LastNames: string;
  user_ProfilePhoto?: string;
}

interface FollowersListModalProps {
  visible: boolean;
  onClose: () => void;
  currentUserEmail: string;
  type: 'followers' | 'following'; // followers = quienes te siguen, following = a quienes sigues
  onUserPress: (userEmail: string) => void;
}

export default function FollowersListModal({
  visible,
  onClose,
  currentUserEmail,
  type,
  onUserPress
}: FollowersListModalProps) {
  const [users, setUsers] = useState<FollowerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [localUsers, setLocalUsers] = useState<FollowerUser[]>([]);

  useEffect(() => {
    if (visible) {
      loadFollowList();
    }
  }, [visible, currentUserEmail, type]);

  const loadFollowList = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        apiUrl(`/api/users/${encodeURIComponent(currentUserEmail)}/follow-stats`)
      );
      if (response.ok) {
        const data = await response.json();
        const list = type === 'followers' ? data.followers : data.following;
        setUsers(list || []);
        setLocalUsers(list || []);
      }
    } catch (error) {
      console.error('Error loading follow list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = (userEmail: string) => {
    // Don't remove from list - just let the button state change
    // List will refresh when modal is reopened
  };

  const handleRemoveFollower = (followerEmail: string, followerName: string) => {
    Alert.alert(
      'Remove Follower',
      `Are you sure you want to remove ${followerName} from your followers?`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel'
        },
        {
          text: 'Remove',
          onPress: async () => {
            try {
              const response = await fetch(apiUrl('/api/users/remove-follower'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  currentUserEmail: currentUserEmail,
                  followerEmailToRemove: followerEmail
                })
              });

              if (response.ok) {
                // Don't remove from list - just let UI update
                // List will refresh when modal is reopened
                // Force a re-render by reloading the list
                loadFollowList();
              } else {
                const error = await response.json();
                Alert.alert('Error', error.error || 'Failed to remove follower');
              }
            } catch (error) {
              console.error('Error removing follower:', error);
              Alert.alert('Error', 'Failed to remove follower');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: FollowerUser }) => {
    return (
      <View style={styles.userCard}>
        <TouchableOpacity
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
          onPress={() => onUserPress(item.user_Email)}
        >
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.user_Username[0]?.toUpperCase() || '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{item.user_Names} {item.user_LastNames}</Text>
            <Text style={styles.userUsername}>@{item.user_Username}</Text>
          </View>
        </TouchableOpacity>
        {type === 'following' && (
          <FollowButton
            targetUserEmail={item.user_Email}
            currentUserEmail={currentUserEmail}
            onFollowChange={(isFollowing) => {
              if (!isFollowing) {
                handleUnfollow(item.user_Email);
              }
            }}
            style={styles.followButton}
          />
        )}
        {type === 'followers' && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFollower(item.user_Email, item.user_Names)}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={commonStyles.container} edges={['top', 'bottom']}>
        <View style={commonStyles.header}>
          <Text style={commonStyles.headerText}>
            {type === 'followers' ? 'Followers' : 'Following'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : localUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>
              {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
            </Text>
            <Text style={styles.emptySub}>
              {type === 'followers'
                ? 'When people follow you, they will appear here.'
                : 'Find and follow users to see their posts.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={localUsers}
            keyExtractor={(item) => item.user_Email}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.m
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.size.l,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
    textAlign: 'center'
  },
  emptySub: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.m,
    textAlign: 'center'
  },
  closeButton: {
    padding: theme.spacing.s
  },
  closeButtonText: {
    fontSize: 24,
    color: theme.colors.textPrimary
  },
  listContent: {
    padding: theme.spacing.m,
    paddingBottom: theme.spacing.xl
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.s
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: theme.typography.size.l
  },
  userName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.size.m,
    fontWeight: '700'
  },
  userUsername: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.s
  },
  followButton: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.m
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700'
  }
});
