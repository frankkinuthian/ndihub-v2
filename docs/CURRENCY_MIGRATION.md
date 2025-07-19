# Currency Migration: USD to KSh Default

## Overview

This document outlines the migration from USD to Kenyan Shillings (KSh) as the default currency for the NDIHub platform, while maintaining support for multiple currencies and payment methods.

## Changes Made

### 1. Sanity Schema Updates

#### Course Schema (`sanity/schemaTypes/courseType.ts`)
- **Updated price field**: Changed from "Price (USD)" to "Price (KSh)"
- **Added currency field**: New dropdown with KES as default
- **Supported currencies**: KES, USD, EUR, GBP

#### Enrollment Schema (`sanity/schemaTypes/enrollmentType.tsx`)
- **Updated amount field**: Removed "in cents" description
- **Added currency field**: Tracks payment currency
- **Updated paymentId**: Now supports both Stripe and IntaSend

### 2. Currency Utility (`lib/currency.ts`)

#### Features
- **Multi-currency conversion**: Convert between KES, USD, EUR, GBP
- **IntaSend integration**: Convert any currency to KES
- **Stripe integration**: Convert any currency to USD cents
- **Formatting utilities**: Proper currency display with symbols
- **Exchange rates**: Built-in rates (should be replaced with real-time API)

#### Key Functions
```typescript
convertToKes(amount, fromCurrency)     // For IntaSend payments
convertToUsdCents(amount, fromCurrency) // For Stripe payments
formatCurrency(amount, currency)       // Display formatting
getCurrencySymbol(currency)           // Get currency symbols
```

### 3. Payment Action Updates

#### IntaSend Checkout (`actions/createIntaSendCheckout.ts`)
- **Currency conversion**: Automatically converts course price to KES
- **Multi-currency support**: Handles USD, EUR, GBP courses
- **Default currency**: Uses KES for new courses

#### Stripe Checkout (`actions/createStripeCheckout.ts`)
- **Currency conversion**: Converts course price to USD cents
- **Backward compatibility**: Maintains existing USD functionality
- **Multi-currency support**: Handles KES, EUR, GBP courses

### 4. Webhook Updates

#### IntaSend Webhook (`app/api/intasend/webhook/route.ts`)
- **Currency tracking**: Records payment currency from IntaSend
- **KES amounts**: Stores amounts in KES as received

#### Stripe Webhook (`app/api/stripe/webhook/route.ts`)
- **Currency tracking**: Records payment currency from Stripe
- **USD amounts**: Stores amounts in USD as received

### 5. Database Function Updates

#### Create Enrollment (`sanity/lib/student/createEnrollment.ts`)
- **Added currency parameter**: Optional, defaults to KES
- **Multi-currency support**: Stores both amount and currency

## Migration Strategy

### Phase 1: Schema Migration ✅
- [x] Update Sanity schemas
- [x] Add currency fields
- [x] Regenerate TypeScript types
- [x] Update database functions

### Phase 2: Payment Integration ✅
- [x] Create currency utility
- [x] Update payment actions
- [x] Update webhook handlers
- [x] Test currency conversion

### Phase 3: UI Updates (Next)
- [ ] Update course display components
- [ ] Show prices in KSh by default
- [ ] Add currency conversion display
- [ ] Update enrollment components

### Phase 4: Data Migration (Future)
- [ ] Migrate existing course prices
- [ ] Update existing enrollments
- [ ] Validate data consistency

## Currency Conversion Rates

Current built-in rates (approximate):
```
USD to KES: 130
EUR to KES: 140
GBP to KES: 160
```

**⚠️ Production Note**: Replace with real-time currency API like:
- ExchangeRate-API
- Fixer.io
- CurrencyAPI

## Testing

### Currency Conversion Tests
```bash
# Test basic IntaSend setup
npm run test:instasend

# Test webhook functionality
npm run test:instasend:webhook
```

### Manual Testing Scenarios
1. **KES Course**: Create course with KES price → IntaSend checkout
2. **USD Course**: Create course with USD price → Auto-convert to KES
3. **Mixed Payments**: Test both Stripe (USD) and IntaSend (KES)
4. **Free Courses**: Verify currency handling for free enrollments

## Backward Compatibility

### Existing Courses
- **USD courses**: Will be converted to KES for IntaSend payments
- **Stripe payments**: Continue to work with USD
- **Database**: Old enrollments without currency default to USD

### API Compatibility
- **Course API**: Returns both price and currency
- **Enrollment API**: Includes currency information
- **Payment webhooks**: Handle both USD and KES amounts

## Future Enhancements

### Real-time Currency Conversion
```typescript
// Future implementation
async function updateExchangeRates() {
  const rates = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
  // Update conversion rates
}
```

### Multi-currency Display
- Show prices in user's preferred currency
- Real-time conversion on course pages
- Currency selection in user preferences

### Regional Payment Routing
- Kenyan users → IntaSend (M-Pesa)
- International users → Stripe (Cards)
- Automatic payment method selection

## Environment Variables

No new environment variables required. Existing IntaSend and Stripe configurations remain the same.

## Rollback Plan

If rollback is needed:
1. Revert schema changes
2. Remove currency fields
3. Update payment actions to use USD only
4. Regenerate types

## Support

For issues related to currency conversion:
1. Check exchange rates in `lib/currency.ts`
2. Verify course currency field in Sanity
3. Test payment flows with different currencies
4. Monitor webhook logs for currency handling
