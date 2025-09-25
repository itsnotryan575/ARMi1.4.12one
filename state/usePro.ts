import { create } from 'zustand';
import { onCustomerInfoUpdate } from '@/services/subscriptions';

interface ProState {
  isPro: boolean;
  initialized: boolean;
  setIsPro: (isPro: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

export const usePro = create<ProState>((set, get) => {
  // Set up subscription to RevenueCat updates
  const unsubscribe = onCustomerInfoUpdate((isPro: boolean) => {
    console.log('Pro state updated from RevenueCat:', isPro);
    set({ isPro });
  });

  return {
    isPro: false,
    initialized: false,
    setIsPro: (isPro: boolean) => {
      console.log('Setting Pro status:', isPro);
      set({ isPro });
    },
    setInitialized: (initialized: boolean) => {
      set({ initialized });
    },
  };
});