import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../config/designSystem';
import { apiUrl } from '../config/api';

interface FollowButtonProps {
  targetUserEmail: string;
  currentUserEmail: string;
  onFollowChange?: (isFollowing: boolean) => void;
  style?: any;
}

export default function FollowButton({
  targetUserEmail,
  currentUserEmail,
  onFollowChange,
  style
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Check if current user follows target user on mount
  useEffect(() => {
    checkFollowStatus();
  }, [targetUserEmail, currentUserEmail]);

  const checkFollowStatus = async () => {
    try {
      const response = await fetch(
        apiUrl(`/api/users/is-following?follower=${currentUserEmail}&followed=${targetUserEmail}`)
      );
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    setIsLoading(true);
    try {
      const endpoint = isFollowing ? '/api/users/unfollow' : '/api/users/follow';
      const response = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followerEmail: currentUserEmail,
          followedEmail: targetUserEmail
        })
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        onFollowChange?.(!isFollowing);
      } else {
        const error = await response.json();
        console.error('Follow error:', error);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <TouchableOpacity style={[styles.button, styles.loading, style]} disabled>
        <ActivityIndicator color={theme.colors.textPrimary} size="small" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isFollowing ? styles.following : styles.notFollowing,
        style
      ]}
      onPress={handleToggleFollow}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={isFollowing ? theme.colors.textPrimary : '#FFFFFF'} size="small" />
      ) : (
        <Text style={[
          styles.text,
          isFollowing ? styles.followingText : styles.notFollowingText
        ]}>
          {isFollowing ? '✓ Following' : '+ Follow'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.radii.m,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
    minHeight: 42
  },
  notFollowing: {
    backgroundColor: theme.colors.primary,
    borderWidth: 0
  },
  following: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.textSecondary
  },
  loading: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  text: {
    fontSize: theme.typography.size.s,
    fontWeight: theme.typography.weight.semibold
  },
  notFollowingText: {
    color: '#FFFFFF'
  },
  followingText: {
    color: theme.colors.textPrimary
  }
});
