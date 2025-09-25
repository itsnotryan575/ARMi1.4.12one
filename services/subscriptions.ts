import Purchases, { 
  PurchasesConfiguration, 
  CustomerInfo, 
  PurchasesOffering,
  PurchasesPackage,
  LOG_LEVEL
} from 'react-native-purchases';
import { Platform } from 'react-native';

// Constants
const REVENUECAT_IOS_PUBLIC_KEY = 'appl_hojAymPIuDWMsoZMLmFuRwkgakC';
const ENTITLEMENT_ID = 'ARMi Pro'; // NOTE: includes a space
const OFFERING_ID = 'default';

// Product IDs for reference
export const PRODUCT_IDS = {
  MONTHLY: 'armi_pro_monthly',
  YEARLY: 'armi_pro_yearly',
} as const;

// Types
export interface CustomerInfoLike {
  activeSubscriptions: string[];
  entitlements: Record<string, any>;
  originalAppUserId: string;
}

export interface OfferingLike {
  identifier: string;
  monthlyPackage?: PurchasesPackage;
  annualPackage?: PurchasesPackage;
  availablePackages: PurchasesPackage[];
}

class SubscriptionService {
  private isInitialized = false;
  private cachedIsPro = false;
  private customerInfoListeners: ((isPro: boolean) => void)[] = [];

  async initRevenueCat(appUserId: string): Promise<void> {
    if (this.isInitialized) {
      console.log('RevenueCat already initialized');
      return;
    }

    try {
      console.log('Initializing RevenueCat with user ID:', appUserId);
      
      // Configure RevenueCat
      const configuration = new PurchasesConfiguration(REVENUECAT_IOS_PUBLIC_KEY);
      configuration.appUserID = appUserId;
      
      if (__DEV__) {
        configuration.logLevel = LOG_LEVEL.DEBUG;
      }

      Purchases.configure(configuration);

      // Set up customer info update listener
      Purchases.addCustomerInfoUpdateListener((customerInfo: CustomerInfo) => {
        console.log('Customer info updated:', customerInfo.entitlements.active);
        const newIsPro = this.checkProStatus(customerInfo);
        
        if (newIsPro !== this.cachedIsPro) {
          this.cachedIsPro = newIsPro;
          console.log('Pro status changed to:', newIsPro);
          
          // Notify all listeners
          this.customerInfoListeners.forEach(listener => {
            try {
              listener(newIsPro);
            } catch (error) {
              console.error('Error in customer info listener:', error);
            }
          });
        }
      });

      // Log in the user
      await Purchases.logIn(appUserId);
      
      // Get initial customer info
      const customerInfo = await Purchases.getCustomerInfo();
      this.cachedIsPro = this.checkProStatus(customerInfo);
      
      this.isInitialized = true;
      console.log('RevenueCat initialized successfully. Pro status:', this.cachedIsPro);
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      throw error;
    }
  }

  async logOutRevenueCat(): Promise<void> {
    try {
      if (this.isInitialized) {
        await Purchases.logOut();
        this.cachedIsPro = false;
        console.log('RevenueCat logged out');
      }
    } catch (error) {
      console.error('Error logging out of RevenueCat:', error);
    }
  }

  isPro(): boolean {
    return this.cachedIsPro;
  }

  private checkProStatus(customerInfo: CustomerInfo): boolean {
    const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
    return entitlement != null;
  }

  async getCustomerInfo(): Promise<CustomerInfoLike> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return {
        activeSubscriptions: Object.keys(customerInfo.activeSubscriptions),
        entitlements: customerInfo.entitlements.active,
        originalAppUserId: customerInfo.originalAppUserId,
      };
    } catch (error) {
      console.error('Error getting customer info:', error);
      throw error;
    }
  }

  async getOffering(): Promise<OfferingLike | null> {
    try {
      const offerings = await Purchases.getOfferings();
      const offering = offerings.all[OFFERING_ID];
      
      if (!offering) {
        console.warn(`Offering "${OFFERING_ID}" not found`);
        return null;
      }

      // Find monthly and annual packages
      const monthlyPackage = offering.availablePackages.find(pkg => 
        pkg.storeProduct.identifier === PRODUCT_IDS.MONTHLY
      );
      
      const annualPackage = offering.availablePackages.find(pkg => 
        pkg.storeProduct.identifier === PRODUCT_IDS.YEARLY
      );

      return {
        identifier: offering.identifier,
        monthlyPackage,
        annualPackage,
        availablePackages: offering.availablePackages,
      };
    } catch (error) {
      console.error('Error getting offering:', error);
      return null;
    }
  }

  async purchaseMonthly(): Promise<boolean> {
    try {
      const offering = await this.getOffering();
      if (!offering?.monthlyPackage) {
        throw new Error('Monthly package not available');
      }

      console.log('Purchasing monthly package:', offering.monthlyPackage.storeProduct.identifier);
      const { customerInfo } = await Purchases.purchasePackage(offering.monthlyPackage);
      
      const isPro = this.checkProStatus(customerInfo);
      this.cachedIsPro = isPro;
      
      console.log('Monthly purchase completed. Pro status:', isPro);
      return isPro;
    } catch (error) {
      console.error('Error purchasing monthly subscription:', error);
      throw error;
    }
  }

  async purchaseAnnual(): Promise<boolean> {
    try {
      const offering = await this.getOffering();
      if (!offering?.annualPackage) {
        throw new Error('Annual package not available');
      }

      console.log('Purchasing annual package:', offering.annualPackage.storeProduct.identifier);
      const { customerInfo } = await Purchases.purchasePackage(offering.annualPackage);
      
      const isPro = this.checkProStatus(customerInfo);
      this.cachedIsPro = isPro;
      
      console.log('Annual purchase completed. Pro status:', isPro);
      return isPro;
    } catch (error) {
      console.error('Error purchasing annual subscription:', error);
      throw error;
    }
  }

  async restorePurchases(): Promise<boolean> {
    try {
      console.log('Restoring purchases...');
      const customerInfo = await Purchases.restorePurchases();
      
      const isPro = this.checkProStatus(customerInfo);
      this.cachedIsPro = isPro;
      
      console.log('Purchases restored. Pro status:', isPro);
      return isPro;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    }
  }

  onCustomerInfoUpdate(callback: (isPro: boolean) => void): () => void {
    this.customerInfoListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.customerInfoListeners.indexOf(callback);
      if (index > -1) {
        this.customerInfoListeners.splice(index, 1);
      }
    };
  }
}

// Export singleton instance
const subscriptionService = new SubscriptionService();

// Export individual functions for easier importing
export const initRevenueCat = subscriptionService.initRevenueCat.bind(subscriptionService);
export const logOutRevenueCat = subscriptionService.logOutRevenueCat.bind(subscriptionService);
export const isPro = subscriptionService.isPro.bind(subscriptionService);
export const getCustomerInfo = subscriptionService.getCustomerInfo.bind(subscriptionService);
export const getOffering = subscriptionService.getOffering.bind(subscriptionService);
export const purchaseMonthly = subscriptionService.purchaseMonthly.bind(subscriptionService);
export const purchaseAnnual = subscriptionService.purchaseAnnual.bind(subscriptionService);
export const restorePurchases = subscriptionService.restorePurchases.bind(subscriptionService);
export const onCustomerInfoUpdate = subscriptionService.onCustomerInfoUpdate.bind(subscriptionService);

export default subscriptionService;