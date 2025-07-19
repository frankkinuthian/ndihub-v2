# Payment Integration Comparison: Stripe vs IntaSend

## Overview

This document compares your existing Stripe implementation with the new IntaSend integration, showing how they follow similar patterns for consistency.

## Architecture Comparison

### Configuration Layer

| Aspect                | Stripe (`lib/stripe.ts`)      | IntaSend (`lib/instasend.ts`)          |
| --------------------- | ----------------------------- | -------------------------------------- |
| **Import**            | `import Stripe from "stripe"` | `import IntaSend from 'intasend-node'` |
| **Validation**        | Single env var check          | Two env var checks                     |
| **Instance Creation** | Direct instantiation          | Factory function + lazy loading        |
| **Export**            | Default export                | Default + factory function             |

### Server Actions

| Aspect                | Stripe (`actions/createStripeCheckout.ts`) | IntaSend (`actions/createIntaSendCheckout.ts`) |
| --------------------- | ------------------------------------------ | ---------------------------------------------- |
| **Purpose**           | Create Stripe checkout session             | Create IntaSend checkout link                  |
| **Currency**          | USD (cents)                                | KES (whole units)                              |
| **Free Course Logic** | ✅ Bypass payment                          | ✅ Bypass payment                              |
| **User Management**   | ✅ Clerk integration                       | ✅ Clerk integration                           |
| **Metadata**          | Stripe metadata object                     | API reference string                           |
| **Return Value**      | `{ url }`                                  | `{ url, paymentId, apiRef }`                   |

### Webhook Handlers

| Aspect                  | Stripe (`app/api/stripe/webhook/route.ts`) | IntaSend (`app/api/intasend/webhook/route.ts`) |
| ----------------------- | ------------------------------------------ | ---------------------------------------------- |
| **Verification**        | Stripe signature verification              | IntaSend signature (TODO)                      |
| **Event Handling**      | `checkout.session.completed`               | `COMPLETE` state                               |
| **Metadata Extraction** | From `session.metadata`                    | From `api_ref` parsing                         |
| **Enrollment Creation** | ✅ Same pattern                            | ✅ Same pattern                                |

### UI Components

| Aspect              | Original (`EnrollButton.tsx`) | Enhanced (`EnrollButtonWithPaymentOptions.tsx`) |
| ------------------- | ----------------------------- | ----------------------------------------------- |
| **Payment Methods** | Stripe only                   | Stripe + IntaSend                               |
| **User Experience** | Single button                 | Payment method selection                        |
| **Loading States**  | ✅ Consistent                 | ✅ Consistent                                   |
| **Error Handling**  | ✅ Consistent                 | ✅ Consistent                                   |

## 💰 Currency & Pricing

### Stripe Implementation

- **Currency**: USD
- **Format**: Cents (multiply by 100)
- **Example**: $10.00 → 1000 cents

### IntaSend Implementation

- **Currency**: KES (Kenyan Shillings)
- **Format**: Whole units
- **Conversion**: USD × 130 (approximate rate)
- **Example**: $10.00 → 1,300 KES

## 🔄 Payment Flow Comparison

### Stripe Flow

1. User clicks "Enroll Now"
2. `createStripeCheckout()` called
3. Stripe session created with metadata
4. User redirected to Stripe checkout
5. Payment completed
6. Webhook receives `checkout.session.completed`
7. Enrollment created in Sanity

### IntaSend Flow

1. User selects payment method
2. `createIntaSendCheckout()` called
3. IntaSend checkout created with api_ref
4. User redirected to IntaSend checkout
5. Payment completed (M-Pesa/Card)
6. Webhook receives `COMPLETE` event
7. Enrollment created in Sanity

## 🛠️ Implementation Files

### Core Files Created/Modified

```
lib/
├── stripe.ts              # Existing Stripe config
└── instasend.ts           # New IntaSend config (matches pattern)

actions/
├── createStripeCheckout.ts    # Existing Stripe action
└── createIntaSendCheckout.ts  # New IntaSend action (same pattern)

app/api/
├── stripe/webhook/route.ts    # Existing Stripe webhook
└── intasend/webhook/route.ts  # New IntaSend webhook (same pattern)

components/
├── EnrollButton.tsx                    # Original (Stripe only)
└── EnrollButtonWithPaymentOptions.tsx  # Enhanced (both methods)
```

### Test Files

```
docs/tests/
├── test-instasend-basic.ts     # Basic integration test
├── test-instasend.ts          # Full API test
├── test-intasend-webhook.ts   # Webhook endpoint test
└── INTASEND_WEBHOOK_SETUP.md  # Webhook setup guide

PAYMENT_INTEGRATION_COMPARISON.md  # This document
```

## 🚀 Usage Examples

### Using Stripe (Existing)

```tsx
import { createStripeCheckout } from "@/actions/createStripeCheckout";

const { url } = await createStripeCheckout(courseId, userId);
router.push(url);
```

### Using IntaSend (New)

```tsx
import { createIntaSendCheckout } from "@/actions/createIntaSendCheckout";

const { url } = await createIntaSendCheckout(courseId, userId);
router.push(url);
```

### Using Both (Enhanced Component)

```tsx
<EnrollButtonWithPaymentOptions
  courseId={course._id}
  isEnrolled={isEnrolled}
  showPaymentOptions={true}
/>
```

## 🔧 Environment Variables

### Required Variables

```env
# Stripe (Existing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# IntaSend (New)
INSTASEND_API_KEY=ISPubKey_test_...
INSTASEND_API_SECRET=ISSecretKey_test_...
INTASEND_WEBHOOK_SECRET=optional_webhook_secret
```

## ✅ Testing

### Run Tests

```bash
# Test IntaSend basic setup
npm run test:instasend

# Test IntaSend with API calls
npm run test:instasend:full
```

## 🎯 Next Steps

1. **Choose Integration Approach**:

   - Replace Stripe with IntaSend
   - Use both payment methods
   - Regional payment routing

2. **Webhook Configuration**:

   - Set up IntaSend webhook URL
   - Implement signature verification
   - Test payment notifications

3. **Currency Handling**:

   - Implement real-time USD→KES conversion
   - Handle currency display in UI
   - Update pricing logic

4. **User Experience**:
   - A/B test payment methods
   - Optimize for Kenyan users
   - Add payment method preferences

## 🔍 Key Differences Summary

| Feature                    | Stripe                 | IntaSend                  |
| -------------------------- | ---------------------- | ------------------------- |
| **Target Market**          | Global                 | East Africa (Kenya focus) |
| **Payment Methods**        | Cards, Digital Wallets | M-Pesa, Cards, Bank       |
| **Currency**               | Multiple (USD primary) | KES primary               |
| **Integration Complexity** | Medium                 | Medium                    |
| **Webhook Events**         | Rich event system      | Basic state changes       |
| **Metadata Support**       | Full object support    | String-based api_ref      |
| **Documentation**          | Excellent              | Good                      |

Both implementations follow the same architectural patterns, making them easy to maintain and extend.
