import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Crown, Lock } from 'lucide-react-native';
import { router } from 'expo-router';
import { usePro } from '@/state/usePro';
import { useTheme } from '@/context/ThemeContext';

// Free plan limits
const MAX_LISTS_FREE = 1;
const MAX_PROFILES_FREE = 5;
const MAX_REMINDERS_FREE = 5;
const MAX_SCHEDULED_TEXTS_FREE = 5;

interface ProGateProps {
  children: React.ReactNode;
  reason?: string;
}

export function ProGate({ children, reason }: ProGateProps) {
  const { isPro } = usePro();
  const { isDark } = useTheme();

  const theme = {
    text: '#f0f0f0',
    background: isDark ? '#0B0909' : '#003C24',
    primary: isDark ? '#8C8C8C' : '#f0f0f0',
    secondary: isDark ? '#4A5568' : '#012d1c',
    accent: isDark ? '#44444C' : '#002818',
    cardBackground: isDark ? '#1A1A1A' : '#002818',
    border: isDark ? '#333333' : '#012d1c',
    isDark,
  };

  if (isPro) {
    return <>{children}</>;
  }

  const handleUpgrade = () => {
    router.push('/screens/PaywallScreen');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <View style={[styles.lockIcon, { backgroundColor: theme.secondary }]}>
        <Lock size={24} color="#FFFFFF" />
      </View>
      
      <Text style={[styles.title, { color: theme.text }]}>
        Unlock unlimited with ARMi Pro
      </Text>
      
      {reason && (
        <Text style={[styles.reason, { color: theme.primary }]}>
          {reason}
        </Text>
      )}
      
      <TouchableOpacity
        style={[styles.upgradeButton, { backgroundColor: theme.secondary }]}
        onPress={handleUpgrade}
      >
        <Crown size={20} color="#FFFFFF" />
        <Text style={styles.upgradeButtonText}>Open Paywall</Text>
      </TouchableOpacity>
    </View>
  );
}

// Helper functions for enforcing limits
export function enforceProfileLimit(currentCount: number): boolean {
  const { isPro } = usePro.getState();
  
  if (isPro) return true;
  
  if (currentCount >= MAX_PROFILES_FREE) {
    showLimitAlert('profiles', MAX_PROFILES_FREE);
    return false;
  }
  
  return true;
}

export function enforceListLimit(currentCount: number): boolean {
  const { isPro } = usePro.getState();
  
  if (isPro) return true;
  
  if (currentCount >= MAX_LISTS_FREE) {
    showLimitAlert('custom lists', MAX_LISTS_FREE);
    return false;
  }
  
  return true;
}

export function enforceReminderLimit(currentMonthCount: number): boolean {
  const { isPro } = usePro.getState();
  
  if (isPro) return true;
  
  if (currentMonthCount >= MAX_REMINDERS_FREE) {
    showLimitAlert('active reminders per month', MAX_REMINDERS_FREE);
    return false;
  }
  
  return true;
}

export function enforceScheduledTextLimit(currentMonthCount: number): boolean {
  const { isPro } = usePro.getState();
  
  if (isPro) return true;
  
  if (currentMonthCount >= MAX_SCHEDULED_TEXTS_FREE) {
    showLimitAlert('scheduled texts per month', MAX_SCHEDULED_TEXTS_FREE);
    return false;
  }
  
  return true;
}

function showLimitAlert(limitType: string, maxCount: number) {
  Alert.alert(
    'Upgrade to ARMi Pro',
    `Free plan includes ${maxCount} ${limitType}. Upgrade for unlimited.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Upgrade', 
        onPress: () => router.push('/screens/PaywallScreen')
      }
    ]
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    margin: 20,
  },
  lockIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  reason: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});