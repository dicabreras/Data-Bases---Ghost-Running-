import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TextInput, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles } from '../config/commonStyles';
import { theme } from '../config/designSystem';
import { apiUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import GRButton from '../components/GRButton';
import FollowButton from '../components/FollowButton';
import OtherUserProfileScreen from './OtherUserProfileScreen';

interface FeedItem {
  publicationId: number;
  authorEmail: string;
  authorUsername: string;
  authorName: string;
  authorPhoto?: string;
  routeImage?: string;
  privacy: number;
  datetime: string;
  trainingCounter: number;
  routeId: number;
  routeDistance: string | number;
  duration: string;
  avgSpeed: string | number;
  maxSpeed: string | number;
  rithm: string | number;
  calories: string | number;
  elevationGain: string | number;
  trainingType: string;
  isGhost: number;
}

interface UserSearchResult {
  user_Email: string;
  user_Username: string;
  user_Names: string;
  user_LastNames: string;
  user_ProfilePhoto?: string;
}

export default function FeedScreen() {
  const { user } = useAuth();
  const userEmail = user?.email;
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Search state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    if (!userEmail) return;
    try {
      setLoading(true);
      const resp = await fetch(apiUrl(`/api/feed/${encodeURIComponent(userEmail)}`));
      if (!resp.ok) throw new Error('Failed to load feed');
      const data = await resp.json();
      setFeed(data.feed || []);
    } catch (err) {
      console.warn('Error loading feed', err);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useFocusEffect(
    useCallback(() => {
      fetchFeed();
    }, [fetchFeed])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFeed();
    setRefreshing(false);
  }, [fetchFeed]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setSearchLoading(true);
      const resp = await fetch(apiUrl(`/api/users/search?q=${encodeURIComponent(searchQuery)}`));
      if (!resp.ok) throw new Error('Search failed');
      const data = await resp.json();
      setSearchResults(data.users || []);
    } catch (err) {
      console.warn('Error searching users', err);
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery]);

  const renderItem = ({ item }: { item: FeedItem }) => {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.authorUsername?.[0]?.toUpperCase() || '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.authorName}>{item.authorName || item.authorUsername}</Text>
            <Text style={styles.metaText}>{new Date(item.datetime).toLocaleString()}</Text>
          </View>
          {item.isGhost ? <Text style={styles.ghostBadge}>Ghost</Text> : null}
        </View>

        <View style={styles.body}>
          <Text style={styles.metricText}>Distance: {Number(item.routeDistance || 0).toFixed(2)} km</Text>
          <Text style={styles.metricText}>Duration: {item.duration}</Text>
          <Text style={styles.metricText}>Avg Speed: {Number(item.avgSpeed || 0).toFixed(2)} km/h</Text>
          <Text style={styles.metricText}>Calories: {Number(item.calories || 0).toFixed(0)} kcal</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.container} edges={['top', 'bottom']}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.headerText}>Feed</Text>
        <TouchableOpacity onPress={() => setShowSearchModal(true)} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={feed}
          keyExtractor={(item) => `${item.publicationId}-${item.trainingCounter}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptySub}>When you or people you follow publish, it will appear here.</Text>
            </View>
          }
        />
      )}

      {/* Search Modal */}
      <Modal visible={showSearchModal} animationType="slide" onRequestClose={() => setShowSearchModal(false)}>
        <SafeAreaView style={commonStyles.container} edges={['top', 'bottom']}>
          {selectedUserProfile ? (
            <OtherUserProfileScreen
              userEmail={selectedUserProfile}
              currentUserEmail={userEmail || ''}
              onGoBack={() => setSelectedUserProfile(null)}
            />
          ) : (
            <>
              <View style={commonStyles.header}>
                <Text style={commonStyles.headerText}>Search Users</Text>
                <TouchableOpacity onPress={() => setShowSearchModal(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by name or username..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                  autoFocus
                />
                <GRButton label="Search" variant="primary" onPress={handleSearch} style={styles.searchSubmitButton} />
              </View>

              {searchLoading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: theme.spacing.xl }} />
              ) : (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.user_Email}
                  renderItem={({ item }) => (
                    <View style={styles.userCard}>
                      <TouchableOpacity
                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => setSelectedUserProfile(item.user_Email)}
                      >
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarText}>{item.user_Username[0]?.toUpperCase() || '?'}</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: theme.spacing.m }}>
                          <Text style={styles.userName}>{item.user_Names} {item.user_LastNames}</Text>
                          <Text style={styles.userUsername}>@{item.user_Username}</Text>
                        </View>
                      </TouchableOpacity>
                      {userEmail && (
                        <FollowButton
                          targetUserEmail={item.user_Email}
                          currentUserEmail={userEmail}
                          style={styles.followButton}
                        />
                      )}
                    </View>
                  )}
                  contentContainerStyle={styles.searchListContent}
                  ListEmptyComponent={
                    searchQuery ? (
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🔍</Text>
                        <Text style={styles.emptyTitle}>No users found</Text>
                        <Text style={styles.emptySub}>Try a different search term</Text>
                      </View>
                    ) : null
                  }
                />
              )}
            </>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: theme.spacing.l,
    paddingBottom: theme.spacing.xl
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchButton: {
    padding: theme.spacing.s,
    marginLeft: theme.spacing.m
  },
  searchButtonText: {
    fontSize: 24
  },
  closeButton: {
    fontSize: 28,
    color: theme.colors.textPrimary,
    padding: theme.spacing.s
  },
  searchContainer: {
    flexDirection: 'row',
    padding: theme.spacing.m,
    gap: theme.spacing.s,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  searchInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.m,
    padding: theme.spacing.m,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.size.m
  },
  searchSubmitButton: {
    paddingHorizontal: theme.spacing.l
  },
  searchListContent: {
    padding: theme.spacing.m
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.s
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
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.l,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700'
  },
  authorName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.size.m,
    fontWeight: '700'
  },
  metaText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.s
  },
  ghostBadge: {
    color: theme.colors.primary,
    fontWeight: '700'
  },
  body: {
    marginTop: theme.spacing.s
  },
  metricText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.size.s,
    marginBottom: 2
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.xl
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.s
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.size.l,
    fontWeight: '700',
    marginBottom: theme.spacing.xs
  },
  emptySub: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.m,
    textAlign: 'center'
  }
});
