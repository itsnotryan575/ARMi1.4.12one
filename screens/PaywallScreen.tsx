import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X, Crown, Check, RefreshCw } from 'lucide-react-native';
import { getOffering, purchaseMonthly, purchaseAnnual, restorePurchases, OfferingLike } from '@/services/subscriptions';
import { usePro } from '@/state/usePro';
import { useTheme } from '@/context/ThemeContext';

export default function PaywallScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { isPro } = usePro();
  
  const [offering, setOffering] = useState<OfferingLike | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<'monthly' | 'annual' | null>(null);
  const [restoring, setRestoring] = useState(false);

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
    loadOffering();
  }, []);

  useEffect(() => {
    // If user becomes Pro, close the paywall
    if (isPro) {
      router.back();
    }
  }, [isPro]);

  const loadOffering = async () => {
    try {
      setLoading(true);
      const offeringData = await getOffering();
      setOffering(offeringData);
    } catch (error) {
      console.error('Error loading offering:', error);
      Alert.alert('Error', 'Failed to load subscription options. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseMonthly = async () => {
    if (!offering?.monthlyPackage) return;
    
    try {
      setPurchasing('monthly');
      const success = await purchaseMonthly();
      
      if (success) {
        Alert.alert('Welcome to ARMi Pro!', 'You now have unlimited access to all features.');
        router.back();
      }
    } catch (error) {
      console.error('Monthly purchase error:', error);
      Alert.alert('Purchase Failed', 'Unable to complete purchase. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const handlePurchaseAnnual = async () => {
    if (!offering?.annualPackage) return;
    
    try {
      setPurchasing('annual');
      const success = await purchaseAnnual();
      
      if (success) {
        Alert.alert('Welcome to ARMi Pro!', 'You now have unlimited access to all features.');
        router.back();
      }
    } catch (error) {
      console.error('Annual purchase error:', error);
      Alert.alert('Purchase Failed', 'Unable to complete purchase. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setRestoring(true);
      const success = await restorePurchases();
      
      if (success) {
        Alert.alert('Success', 'Purchases restored successfully!');
        router.back();
      } else {
        Alert.alert('No Purchases Found', 'No previous purchases found to restore.');
      }
    } catch (error) {
      console.error('Restore purchases error:', error);
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  const formatPrice = (price: string, currencyCode: string) => {
    return `${price}/${currencyCode}`;
  };

  const getAnnualSavings = () => {
    if (!offering?.monthlyPackage || !offering?.annualPackage) return null;
    
    const monthlyPrice = parseFloat(offering.monthlyPackage.storeProduct.price);
    const annualPrice = parseFloat(offering.annualPackage.storeProduct.price);
    const annualMonthlyEquivalent = annualPrice / 12;
    const savings = ((monthlyPrice - annualMonthlyEquivalent) / monthlyPrice) * 100;
    
    return Math.round(savings);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading subscription options...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!offering) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>ARMi Pro</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: theme.text }]}>Unable to Load Subscriptions</Text>
          <Text style={[styles.errorSubtitle, { color: theme.primary }]}>
            Please check your internet connection and try again.
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.secondary }]}
            onPress={loadOffering}
          >
            <RefreshCw size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const savings = getAnnualSavings();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>ARMi Pro</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.crownContainer, { backgroundColor: theme.secondary }]}>
            <Crown size={48} color="#FFFFFF" />
          </View>
          <Text style={[styles.heroTitle, { color: theme.text }]}>Unlock ARMi Pro</Text>
          <Text style={[styles.heroSubtitle, { color: theme.primary }]}>
            Get unlimited access to all features and manage unlimited connections
          </Text>
        </View>

        {/* Features List */}
        <View style={[styles.featuresContainer, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.featuresTitle, { color: theme.text }]}>What's Included</Text>
          
          {[
            'Unlimited profiles and connections',
            'Unlimited custom lists (Roster, Network, People)',
            'Unlimited reminders per month',
            'Unlimited scheduled texts per month',
            'Priority customer support',
            'Early access to new features'
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Check size={20} color="#059669" />
              <Text style={[styles.featureText, { color: theme.text }]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* Subscription Options */}
        <View style={styles.subscriptionOptions}>
          {/* Annual Option */}
          {offering.annualPackage && (
            <TouchableOpacity
              style={[
                styles.subscriptionOption,
                styles.recommendedOption,
                { backgroundColor: theme.secondary, borderColor: theme.secondary }
              ]}
              onPress={handlePurchaseAnnual}
              disabled={purchasing === 'annual'}
            >
              {savings && (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>Save {savings}%</Text>
                </View>
              )}
              
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Continue — Annual</Text>
                <Text style={styles.optionPrice}>
                  {offering.annualPackage.storeProduct.priceString}/year
                </Text>
                <Text style={styles.optionSubtitle}>
                  Best value • Cancel anytime
                </Text>
              </View>
              
              {purchasing === 'annual' && (
                <ActivityIndicator size="small" color="#FFFFFF" style={styles.purchaseLoader} />
              )}
            </TouchableOpacity>
          )}

          {/* Monthly Option */}
          {offering.monthlyPackage && (
            <TouchableOpacity
              style={[
                styles.subscriptionOption,
                { backgroundColor: theme.cardBackground, borderColor: theme.border }
              ]}
              onPress={handlePurchaseMonthly}
              disabled={purchasing === 'monthly'}
            >
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: theme.text }]}>Continue — Monthly</Text>
                <Text style={[styles.optionPrice, { color: theme.text }]}>
                  {offering.monthlyPackage.storeProduct.priceString}/month
                </Text>
                <Text style={[styles.optionSubtitle, { color: theme.primary }]}>
                  Cancel anytime
                </Text>
              </View>
              
              {purchasing === 'monthly' && (
                <ActivityIndicator size="small" color={theme.text} style={styles.purchaseLoader} />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Restore Purchases */}
        <TouchableOpacity
          style={[styles.restoreButton, { backgroundColor: theme.accent, borderColor: theme.border }]}
          onPress={handleRestorePurchases}
          disabled={restoring}
        >
          {restoring ? (
            <ActivityIndicator size="small" color={theme.text} />
          ) : (
            <RefreshCw size={20} color={theme.text} />
          )}
          <Text style={[styles.restoreButtonText, { color: theme.text }]}>
            {restoring ? 'Restoring...' : 'Restore Purchases'}
          </Text>
        </TouchableOpacity>

        {/* Fine Print */}
        <View style={styles.finePrint}>
          <Text style={[styles.finePrintText, { color: theme.primary }]}>
            Cancel anytime in Settings. Prices shown are localized. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  crownContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  subscriptionOptions: {
    gap: 16,
    marginBottom: 32,
  },
  subscriptionOption: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    position: 'relative',
  },
  recommendedOption: {
    // Additional styles for recommended option
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  optionContent: {
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  optionPrice: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    color: '#FFFFFF',
  },
  optionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  purchaseLoader: {
    position: 'absolute',
    right: 24,
    top: '50%',
    marginTop: -10,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 32,
    gap: 8,
  },
  restoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  finePrint: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  finePrintText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});