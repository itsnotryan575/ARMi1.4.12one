import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Crown, RefreshCw, CreditCard, Smartphone } from 'lucide-react-native';
import { 
  isPro, 
  getCustomerInfo, 
  getOffering, 
  purchaseMonthly, 
  purchaseAnnual, 
  restorePurchases,
  CustomerInfoLike,
  OfferingLike
} from '@/services/subscriptions';
import { usePro } from '@/state/usePro';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function DebugSubscriptionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { isPro: globalIsPro } = usePro();
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfoLike | null>(null);
  const [offering, setOffering] = useState<OfferingLike | null>(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [customerData, offeringData] = await Promise.all([
        getCustomerInfo().catch(() => null),
        getOffering().catch(() => null)
      ]);
      
      setCustomerInfo(customerData);
      setOffering(offeringData);
    } catch (error) {
      console.error('Error loading debug data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseMonthly = async () => {
    try {
      setLoading(true);
      const success = await purchaseMonthly();
      Alert.alert('Purchase Result', success ? 'Success!' : 'Failed');
      await loadData();
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', error.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseAnnual = async () => {
    try {
      setLoading(true);
      const success = await purchaseAnnual();
      Alert.alert('Purchase Result', success ? 'Success!' : 'Failed');
      await loadData();
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', error.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      const success = await restorePurchases();
      Alert.alert('Restore Result', success ? 'Success!' : 'No purchases found');
      await loadData();
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Error', error.message || 'Restore failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Debug Subscriptions</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
          <RefreshCw size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Status */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Current Status</Text>
          
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: theme.primary }]}>App User ID:</Text>
            <Text style={[styles.statusValue, { color: theme.text }]}>
              {user?.id || 'Not logged in'}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: theme.primary }]}>Global isPro:</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: globalIsPro ? '#059669' : '#EF4444' }
            ]}>
              <Text style={styles.statusBadgeText}>
                {globalIsPro ? 'TRUE' : 'FALSE'}
              </Text>
            </View>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: theme.primary }]}>Service isPro:</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: isPro() ? '#059669' : '#EF4444' }
            ]}>
              <Text style={styles.statusBadgeText}>
                {isPro() ? 'TRUE' : 'FALSE'}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Customer Info</Text>
          
          {customerInfo ? (
            <View style={styles.jsonContainer}>
              <Text style={[styles.jsonText, { color: theme.primary }]}>
                {JSON.stringify(customerInfo, null, 2)}
              </Text>
            </View>
          ) : (
            <Text style={[styles.noDataText, { color: theme.primary }]}>
              No customer info available
            </Text>
          )}
        </View>

        {/* Offering Info */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Offering Info</Text>
          
          {offering ? (
            <View>
              <View style={styles.offeringItem}>
                <Text style={[styles.offeringLabel, { color: theme.primary }]}>Identifier:</Text>
                <Text style={[styles.offeringValue, { color: theme.text }]}>
                  {offering.identifier}
                </Text>
              </View>
              
              {offering.monthlyPackage && (
                <View style={styles.offeringItem}>
                  <Text style={[styles.offeringLabel, { color: theme.primary }]}>Monthly:</Text>
                  <Text style={[styles.offeringValue, { color: theme.text }]}>
                    {offering.monthlyPackage.storeProduct.priceString}
                  </Text>
                </View>
              )}
              
              {offering.annualPackage && (
                <View style={styles.offeringItem}>
                  <Text style={[styles.offeringLabel, { color: theme.primary }]}>Annual:</Text>
                  <Text style={[styles.offeringValue, { color: theme.text }]}>
                    {offering.annualPackage.storeProduct.priceString}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={[styles.noDataText, { color: theme.primary }]}>
              No offering available
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Actions</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.secondary }]}
            onPress={handlePurchaseMonthly}
            disabled={loading}
          >
            <CreditCard size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Purchase Monthly</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.secondary }]}
            onPress={handlePurchaseAnnual}
            disabled={loading}
          >
            <Crown size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Purchase Annual</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.accent, borderColor: theme.border }]}
            onPress={handleRestore}
            disabled={loading}
          >
            <RefreshCw size={20} color={theme.text} />
            <Text style={[styles.actionButtonText, { color: theme.text }]}>Restore Purchases</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.accent, borderColor: theme.border }]}
            onPress={loadData}
            disabled={loading}
          >
            <Smartphone size={20} color={theme.text} />
            <Text style={[styles.actionButtonText, { color: theme.text }]}>Refresh Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  jsonContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 12,
  },
  jsonText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  noDataText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  offeringItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  offeringLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  offeringValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // ProGate component styles
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