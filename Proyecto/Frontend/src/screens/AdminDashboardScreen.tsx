import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiUrl } from '../config/api';
import { commonStyles } from '../config/commonStyles';
import { theme } from '../config/designSystem';
import { useAuth } from '../context/AuthContext';
import GRButton from '../components/GRButton';

interface AdminStatsResponse {
  topRoutes: any[];
  activeChallenges: any[];
  globalStats: any | null;
  userSummary: any[];
  trainingPerformance: any[];
  publicationsActivity: any[];
  monthlyChallengeParticipation: any[];
  userPhysicalState: any[];
  activityBySportAndAge: any[];
  mostUsedRoutes: any[];
  trainingActivityByMonth: any[];
}

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch(apiUrl('/api/admin/stats'));
        if (resp.ok) {
          const data = await resp.json();
          setStats(data);
        }
      } catch (err) {
        console.warn('Error loading admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.centered}>
          <Text style={styles.title}>No data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderRows = (rows: any[]) => {
    if (rows.length === 0) {
      return <Text style={styles.empty}>No records</Text>;
    }

    return (
      <View style={styles.table}>
        {rows.slice(0, 10).map((row, idx) => (
          <View key={idx} style={styles.card}>
            {Object.entries(row).map(([key, value]) => (
              <View key={key} style={styles.field}>
                <Text style={styles.fieldLabel}>{key}:</Text>
                <Text style={styles.fieldValue}>{String(value)}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <GRButton label="🚪 Logout" variant="primary" onPress={logout} style={styles.logoutBtn} />
      </View>
      <ScrollView style={styles.scroll}>
        <Section title="Top Routes">{renderRows(stats.topRoutes)}</Section>
        <Section title="Active Challenges">{renderRows(stats.activeChallenges)}</Section>
        <Section title="Global Stats">{renderRows(stats.globalStats ? [stats.globalStats] : [])}</Section>
        <Section title="User Summary">{renderRows(stats.userSummary)}</Section>
        <Section title="Training Performance">{renderRows(stats.trainingPerformance)}</Section>
        <Section title="Publications Activity">{renderRows(stats.publicationsActivity)}</Section>
        <Section title="Monthly Challenge Participation">{renderRows(stats.monthlyChallengeParticipation)}</Section>
        <Section title="User Physical State">{renderRows(stats.userPhysicalState)}</Section>
        <Section title="Activity by Sport & Age">{renderRows(stats.activityBySportAndAge)}</Section>
        <Section title="Most Used Routes">{renderRows(stats.mostUsedRoutes)}</Section>
        <Section title="Training Activity by Month">{renderRows(stats.trainingActivityByMonth)}</Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    backgroundColor: '#1a1a1a',
  },
  logoutBtn: {
    paddingHorizontal: theme.spacing.m,
    minWidth: 100,
  },
  scroll: {
    paddingHorizontal: theme.spacing.l,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    marginBottom: theme.spacing.l,
    padding: theme.spacing.m,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: theme.spacing.s,
    color: '#fff',
  },
  table: {
    gap: theme.spacing.s,
  },
  card: {
    padding: theme.spacing.m,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: theme.spacing.s,
  },
  field: {
    flexDirection: 'row',
    paddingVertical: 4,
    flexWrap: 'wrap',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginRight: 8,
    minWidth: 120,
  },
  fieldValue: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
  },
  empty: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    padding: theme.spacing.m,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
