# ARMi

Artificial Relationship Management Intelligence - A smart app to help you maintain meaningful connections with the people in your life.

## Subscriptions

ARMi uses RevenueCat for in-app subscriptions on iOS. The subscription system includes:

### Configuration
- **RevenueCat iOS Public Key**: `appl_hojAymPIuDWMsoZMLmFuRwkgakC`
- **Entitlement ID**: `ARMi Pro` (note the space)
- **Offering ID**: `default`
- **Product IDs**: 
  - Monthly: `armi_pro_monthly`
  - Annual: `armi_pro_yearly`

### Free Plan Limits
- 1 custom list total (All list is always available)
- 5 profiles total
- 5 active reminders per month
- 5 scheduled texts per month

### Testing with Apple Sandbox/TestFlight
1. Ensure you're using a sandbox Apple ID for testing
2. Build and install via TestFlight or development build
3. Test purchase flows using sandbox accounts
4. Use the Debug Subscriptions screen (enable `DEBUG_SUBSCRIPTIONS` flag in `flags.ts`)

### Changing Free Limits
To modify free plan limits, update the constants in `components/ProGate.tsx`:
- `MAX_LISTS_FREE`
- `MAX_PROFILES_FREE` 
- `MAX_REMINDERS_FREE`
- `MAX_SCHEDULED_TEXTS_FREE`

### Paywall Customization
Update the paywall copy and features list in `screens/PaywallScreen.tsx`.

## Development

### Debug Subscriptions Screen
To access the debug screen for testing subscriptions:
1. Set `DEBUG_SUBSCRIPTIONS = true` in `flags.ts`
2. Navigate to Settings → Debug Subscriptions
3. Test purchase flows, restore purchases, and view raw subscription data

### RevenueCat Integration
The subscription system automatically:
- Initializes when user signs in
- Logs out when user signs out
- Syncs Pro status across the app
- Enforces limits for free users
- Shows paywall when limits are exceeded