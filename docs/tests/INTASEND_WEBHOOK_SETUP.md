# IntaSend Webhook Setup Guide

## 🎯 Overview

This guide walks you through setting up IntaSend webhooks to automatically process course enrollments when payments are completed.

## 📋 Prerequisites

- ✅ IntaSend account (sandbox for testing)
- ✅ IntaSend API keys configured in `.env.local`
- ✅ Next.js application running
- ✅ ngrok or similar tool for local development

## 🔧 Environment Variables

Ensure these variables are set in your `.env.local`:

```env
# IntaSend Configuration
INSTASEND_API_KEY=ISPubKey_test_...
INSTASEND_API_SECRET=ISSecretKey_test_...
INTASEND_WEBHOOK_CHALLENGE=testnet

# Base URL for webhook
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🚀 Setup Steps

### 1. Start Your Development Server

```bash
npm run dev
```

Your webhook endpoint will be available at:
`http://localhost:3000/api/intasend/webhook`

### 2. Expose Your Local Server (Development)

Using ngrok:
```bash
# Install ngrok if you haven't already
npm install -g ngrok

# Expose your local server
ngrok http 3000
```

This will give you a public URL like: `https://abc123.ngrok.io`

Your webhook URL will be: `https://abc123.ngrok.io/api/intasend/webhook`

### 3. Configure Webhook in IntaSend Dashboard

1. **Login to IntaSend Dashboard**
   - Sandbox: https://sandbox.intasend.com
   - Production: https://payment.intasend.com

2. **Navigate to Webhooks**
   - Go to Settings → Webhooks
   - Click "Add Webhook" or "Configure Webhook"

3. **Set Webhook URL**
   ```
   https://your-ngrok-url.ngrok.io/api/intasend/webhook
   ```

4. **Set Challenge**
   ```
   testnet
   ```
   (This must match `INTASEND_WEBHOOK_CHALLENGE` in your `.env.local`)

5. **Save Configuration**

### 4. Test the Webhook

Run the webhook test script:
```bash
npm run test:instasend:webhook
```

This will test various webhook scenarios:
- ✅ Successful payment
- ❌ Failed payment  
- 🔄 Processing payment
- 🚫 Invalid challenge

## 📊 Webhook Payload Structure

IntaSend sends webhooks with this structure:

```json
{
  "invoice_id": "BRZKGPR",
  "state": "COMPLETE",
  "provider": "M-PESA",
  "charges": "0.00",
  "net_amount": "1300.00",
  "currency": "KES",
  "value": "1300.00",
  "account": "user@example.com",
  "api_ref": "course-courseId-userId-timestamp",
  "host": "https://sandbox.intasend.com",
  "failed_reason": null,
  "failed_code": null,
  "created_at": "2024-01-01T12:00:00.000000+03:00",
  "updated_at": "2024-01-01T12:01:00.000000+03:00",
  "challenge": "testnet"
}
```

## 🔄 Payment States

| State | Description | Action |
|-------|-------------|--------|
| `PENDING` | Payment initiated | Log only |
| `PROCESSING` | Payment in progress | Log only |
| `COMPLETE` | Payment successful | ✅ Create enrollment |
| `FAILED` | Payment failed | ❌ Log error |

## 🛡️ Security Features

### Challenge Verification
- Webhook verifies the `challenge` field matches your configured value
- Prevents unauthorized webhook calls

### API Reference Validation
- Validates `api_ref` format: `course-{courseId}-{userId}-{timestamp}`
- Ensures webhook is for a valid course enrollment

### Error Handling
- Comprehensive logging for debugging
- Graceful error responses
- Student validation before enrollment creation

## 🧪 Testing Scenarios

### Local Testing
```bash
# Test basic IntaSend setup
npm run test:instasend

# Test webhook endpoint
npm run test:instasend:webhook
```

### Manual Testing
1. Create a test course in your Sanity CMS
2. Use the IntaSend checkout flow
3. Complete payment in sandbox mode
4. Verify enrollment is created automatically

## 🔍 Debugging

### Check Webhook Logs
Monitor your Next.js console for webhook events:
```
IntaSend webhook received: {
  invoice_id: "TEST123",
  state: "COMPLETE",
  api_ref: "course-...",
  amount: "1300.00",
  currency: "KES"
}
```

### Common Issues

1. **Webhook not receiving calls**
   - Check ngrok is running and URL is correct
   - Verify webhook URL in IntaSend dashboard
   - Ensure development server is running

2. **Challenge verification failed**
   - Check `INTASEND_WEBHOOK_CHALLENGE` matches dashboard setting
   - Verify environment variables are loaded

3. **Student not found**
   - Ensure user exists in Clerk
   - Check Sanity student creation logic
   - Verify `api_ref` format is correct

4. **Enrollment creation failed**
   - Check Sanity permissions
   - Verify course ID exists
   - Check enrollment schema

## 🚀 Production Deployment

### 1. Update Environment Variables
```env
# Production IntaSend keys
INSTASEND_API_KEY=ISPubKey_live_...
INSTASEND_API_SECRET=ISSecretKey_live_...
INTASEND_WEBHOOK_CHALLENGE=your_production_challenge

# Production URL
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 2. Configure Production Webhook
- Use your production domain: `https://yourdomain.com/api/intasend/webhook`
- Set a secure challenge string (not "testnet")
- Test with small amounts first

### 3. Monitor Webhooks
- Set up logging/monitoring for webhook events
- Monitor enrollment creation success rates
- Set up alerts for failed payments

## 📚 Next Steps

After webhook setup is complete:
1. ✅ **Currency Configuration** - Update Sanity to use KES as default
2. ✅ **Currency Conversion** - Implement USD to KES conversion
3. ✅ **UI Updates** - Make IntaSend the default payment method
4. ✅ **Testing** - Comprehensive end-to-end testing

## 🆘 Support

If you encounter issues:
1. Check the debugging section above
2. Review IntaSend documentation: https://developers.intasend.com
3. Test with the provided test scripts
4. Check webhook logs in both your app and IntaSend dashboard
