import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles } from '../config/commonStyles';
import { theme } from '../config/designSystem';
import { apiUrl } from '../config/api';
import FollowButton from '../components/FollowButton';
import { useNavigation } from '@react-navigation/native';

interface TrainingItem {
  counter: number;
  distance: string | number;
  duration: string;
  avgSpeed: string | number;
  calories: string | number;
}

interface OtherUserProfile {
  email: string;
  username: string;
  names: string;
  lastNames: string;
  age: number;
  description?: string;
  profilePhoto?: string;
  followersCount: number;
  followingCount: number;
}

interface OtherUserProfileScreenProps {
  userEmail: string;
  currentUserEmail: string;
  onGoBack: () => void;
}

export default function OtherUserProfileScreen({
  userEmail,
  currentUserEmail,
  onGoBack
}: OtherUserProfileScreenProps) {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<OtherUserProfile | null>(null);
  const [trainings, setTrainings] = useState<TrainingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [canViewTrainings, setCanViewTrainings] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [userEmail, currentUserEmail]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);

      // Get user profile
      const profileResp = await fetch(
        apiUrl(`/api/users/${encodeURIComponent(userEmail)}/profile`)
      );
      if (profileResp.ok) {
        const profileData = await profileResp.json();
        setProfile(profileData);
      }

      // Check if current user follows this user
      let shouldLoadTrainings = true; // Default to public access
      const followResp = await fetch(
        apiUrl(
          `/api/users/is-following?follower=${encodeURIComponent(
            currentUserEmail
          )}&followed=${encodeURIComponent(userEmail)}`
        )
      );
      if (followResp.ok) {
        const followData = await followResp.json();
        setIsFollowing(followData.isFollowing);
        shouldLoadTrainings = followData.isFollowing || true; // Always allow for now
        setCanViewTrainings(shouldLoadTrainings);
      }

      // Get trainings - always load them
      const trainingsResp = await fetch(
        apiUrl(`/api/trainings/${encodeURIComponent(userEmail)}`)
      );
      if (trainingsResp.ok) {
        const trainingsData = await trainingsResp.json();
        setTrainings(trainingsData.trainings || []);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseDurationToSeconds = (dur: string | undefined | null) => {
    if (!dur) {
      return 0;
    }
    const parts = dur.split(':').map(p => Number(p));
    if (parts.length === 3) {
      return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    }
    if (parts.length === 2) {
      return (parts[0] || 0) * 60 + (parts[1] || 0);
    }
    return 0;
  };

  const formatSecondsToHrs = (secs: number) => {
    if (!secs) {
      return '0h';
    }
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const calculateStats = () => {
    let totalDistance = 0;
    let totalSeconds = 0;

    for (const training of trainings) {
      totalDistance += Number(training.distance) || 0;
      totalSeconds += parseDurationToSeconds(training.duration);
    }

    return { totalDistance, totalSeconds };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User profile not found</Text>
        <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack} style={styles.backHeaderButton}>
          <Text style={styles.backHeaderText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profile.names}'s Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {profile.username[0]?.toUpperCase() || '?'}
            </Text>
          </View>

          <Text style={styles.userName}>
            {profile.names} {profile.lastNames}
          </Text>
          <Text style={styles.userUsername}>@{profile.username}</Text>
          {profile.age && (
            <Text style={styles.userAge}>{profile.age} years old</Text>
          )}
          {profile.description && (
            <Text style={styles.userDescription}>{profile.description}</Text>
          )}
        </View>

        {/* Follow Button */}
        <View style={styles.followButtonContainer}>
          <FollowButton
            targetUserEmail={userEmail}
            currentUserEmail={currentUserEmail}
            onFollowChange={(following) => {
              setIsFollowing(following);
              loadUserProfile();
            }}
            style={styles.followButtonLarge}
          />
        </View>

        {/* Follow Stats */}
        <View style={styles.followStatsContainer}>
          <TouchableOpacity style={styles.followStatCard}>
            <Text style={styles.followStatValue}>{profile.followersCount || 0}</Text>
            <Text style={styles.followStatLabel}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.followStatCard}>
            <Text style={styles.followStatValue}>{profile.followingCount || 0}</Text>
            <Text style={styles.followStatLabel}>Following</Text>
          </TouchableOpacity>
        </View>

        {/* Training Stats */}
        {canViewTrainings && (
          <>
            <View style={styles.statsSection}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{trainings.length}</Text>
                <Text style={styles.statLabel}>Trainings</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.totalDistance.toFixed(2)} km</Text>
                <Text style={styles.statLabel}>Distance</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{formatSecondsToHrs(stats.totalSeconds)}</Text>
                <Text style={styles.statLabel}>Time</Text>
              </View>
            </View>

            {/* Trainings List */}
            {trainings.length > 0 && (
              <View style={styles.trainingsSection}>
                <Text style={styles.sectionTitle}>Recent Trainings</Text>
                <FlatList
                  data={trainings.slice(0, 5)}
                  scrollEnabled={false}
                  keyExtractor={(item) => `${item.counter}`}
                  renderItem={({ item }) => (
                    <View style={styles.trainingCard}>
                      <View style={styles.trainingInfo}>
                        <Text style={styles.trainingDistance}>
                          {Number(item.distance).toFixed(2)} km
                        </Text>
                        <Text style={styles.trainingDuration}>{item.duration}</Text>
                      </View>
                      <View style={styles.trainingStats}>
                        <Text style={styles.trainingStat}>
                          Avg: {Number(item.avgSpeed).toFixed(1)} km/h
                        </Text>
                        <Text style={styles.trainingStat}>
                          {Number(item.calories).toFixed(0)} kcal
                        </Text>
                      </View>
                    </View>
                  )}
                />
              </View>
            )}
          </>
        )}

        {!canViewTrainings && (
          <View style={styles.privateContainer}>
            <Text style={styles.privateIcon}>🔒</Text>
            <Text style={styles.privateText}>
              Follow {profile.names} to see their trainings
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  backHeaderButton: {
    padding: theme.spacing.s
  },
  backHeaderText: {
    color: theme.colors.primary,
    fontSize: theme.typography.size.m,
    fontWeight: '600'
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.size.l,
    fontWeight: '700'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.m,
    marginBottom: theme.spacing.m
  },
  backButton: {
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m
  },
  backButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.size.m,
    fontWeight: '600'
  },
  content: {
    flex: 1
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.l
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.l
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700'
  },
  userName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.size.xxl,
    fontWeight: '700',
    marginBottom: theme.spacing.xs
  },
  userUsername: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.m,
    marginBottom: theme.spacing.s
  },
  userAge: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.s,
    marginBottom: theme.spacing.xs
  },
  userDescription: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.size.s,
    textAlign: 'center',
    marginTop: theme.spacing.m,
    marginHorizontal: theme.spacing.l
  },
  followButtonContainer: {
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.l
  },
  followButtonLarge: {
    paddingVertical: theme.spacing.m
  },
  followStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.l,
    gap: theme.spacing.m
  },
  followStatCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.m,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.s,
    alignItems: 'center'
  },
  followStatValue: {
    color: theme.colors.primary,
    fontSize: theme.typography.size.l,
    fontWeight: '700',
    marginBottom: theme.spacing.xs
  },
  followStatLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.s
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.l,
    marginHorizontal: theme.spacing.l,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.l,
    marginBottom: theme.spacing.l
  },
  statCard: {
    alignItems: 'center'
  },
  statValue: {
    color: theme.colors.primary,
    fontSize: theme.typography.size.xl,
    fontWeight: '700',
    marginBottom: theme.spacing.xs
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.s
  },
  trainingsSection: {
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.l
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.size.l,
    fontWeight: '700',
    marginBottom: theme.spacing.m
  },
  trainingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.s
  },
  trainingInfo: {
    flex: 1
  },
  trainingDistance: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.size.m,
    fontWeight: '700'
  },
  trainingDuration: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.s,
    marginTop: theme.spacing.xs
  },
  trainingStats: {
    alignItems: 'flex-end'
  },
  trainingStat: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.s,
    marginBottom: 2
  },
  privateContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.l
  },
  privateIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.m
  },
  privateText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.m,
    textAlign: 'center'
  }
});
