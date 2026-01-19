# Authorize.net Payment Integration

This document explains how the Authorize.net payment processing is integrated into the SalesFlow CRM.

## Overview

The CRM uses **Authorize.net Payment Gateway** to process credit card payments securely. The integration follows PCI-DSS best practices by:
- Never storing full card numbers
- Processing payments server-side only
- Using environment variables for API credentials
- Logging only transaction IDs and last 4 digits

## Architecture

```
┌──────────────┐      ┌─────────────────┐      ┌──────────────────┐
│  Payment UI  │─────▶│  Next.js API    │─────▶│  Authorize.net   │
│  (Frontend)  │◀─────│  Route          │◀─────│  API             │
└──────────────┘      └─────────────────┘      └──────────────────┘
```

### Flow:
1. Sales agent enters card details in `/payment` page
2. Frontend calls `/api/process-payment` (server-side)
3. API route validates data and calls Authorize.net
4. Authorize.net processes transaction
5. Response is returned to frontend
6. Transaction ID is stored in database

## Configuration

### 1. Environment Variables

Add to `.env.local`:

```bash
# Sandbox (Testing)
AUTHORIZE_NET_API_LOGIN_ID=your_sandbox_api_login_id
AUTHORIZE_NET_TRANSACTION_KEY=your_sandbox_transaction_key
AUTHORIZE_NET_ENVIRONMENT=sandbox

# Production
AUTHORIZE_NET_API_LOGIN_ID=your_production_api_login_id
AUTHORIZE_NET_TRANSACTION_KEY=your_production_transaction_key
AUTHORIZE_NET_ENVIRONMENT=production
```

### 2. Get Credentials

**Sandbox (Testing):**
1. Go to https://developer.authorize.net/
2. Sign up for a developer account
3. Get sandbox credentials from dashboard

**Production:**
1. Sign up at https://www.authorize.net/
2. Get production credentials from merchant dashboard

## API Route: `/api/process-payment`

### Request Body

```typescript
{
  orderData: {
    order_id: string;
    customer: {
      firstname: string;
      lastname: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state: string;
    };
    products: OrderProduct[];
    total_amount: number;
  };
  paymentData: {
    cardNumber: string;       // Will be sanitized
    expiryMonth: string;      // MM
    expiryYear: string;       // YY
    cvv: string;
    cardholderName: string;
    billingAddress: string;
    city: string;
    state: string;
    zipCode: string;
  };
}
```

### Response (Success)

```json
{
  "success": true,
  "transactionId": "60198364826",
  "authCode": "ABC123",
  "responseCode": "1",
  "message": "Payment processed successfully",
  "accountNumber": "XXXX0015",
  "accountType": "Visa"
}
```

### Response (Error)

```json
{
  "success": false,
  "error": "This transaction has been declined.",
  "responseCode": "2"
}
```

## Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| `1`  | Approved | Transaction successful |
| `2`  | Declined | Card declined by bank |
| `3`  | Error | System error occurred |
| `4`  | Held for Review | Fraud filter triggered |

## Testing

### Test Card Numbers (Sandbox)

| Card Type | Card Number | CVV | Expiry |
|-----------|-------------|-----|--------|
| Visa | `4111111111111111` | Any 3-4 digits | Any future date |
| Mastercard | `5424000000000015` | Any 3-4 digits | Any future date |
| Amex | `378282246310005` | Any 4 digits | Any future date |
| Discover | `6011000000000012` | Any 3-4 digits | Any future date |

### Testing Specific Responses

To trigger specific responses in sandbox:

| Amount | Response |
|--------|----------|
| `< $100` | Approved |
| `$100.01` | Declined (General) |
| `$100.02` | Declined (Insufficient Funds) |

## Security

### What We Store
- ✅ Transaction ID
- ✅ Authorization Code
- ✅ Last 4 digits of card
- ✅ Card type (Visa, Mastercard, etc.)
- ✅ Transaction amount
- ✅ Transaction date/time

### What We DON'T Store
- ❌ Full card number
- ❌ CVV code
- ❌ Card expiration date

### PCI Compliance
- Card data is transmitted directly to Authorize.net
- No card data touches our database
- All requests use HTTPS
- API credentials stored as environment variables

## Error Handling

Common errors and solutions:

### 1. "Payment gateway not configured"
- **Cause**: Missing environment variables
- **Fix**: Add `AUTHORIZE_NET_API_LOGIN_ID` and `AUTHORIZE_NET_TRANSACTION_KEY` to `.env.local`

### 2. "This transaction has been declined"
- **Cause**: Card declined by issuing bank
- **Fix**: Ask customer to use different payment method or contact their bank

### 3. "Invalid card number"
- **Cause**: Card number format incorrect
- **Fix**: Verify card number is correct and properly formatted

### 4. "AVS mismatch"
- **Cause**: Billing address doesn't match card
- **Fix**: Verify billing address with customer

## Next Steps

1. **Database Integration**: Store transactions in `Payment` table
2. **Refund Support**: Implement refund functionality
3. **Saved Cards**: Use Authorize.net Customer Profiles for repeat customers
4. **Webhooks**: Handle asynchronous events from Authorize.net
5. **Reporting**: Build transaction reports and reconciliation

## Support

- Authorize.net Documentation: https://developer.authorize.net/api/reference/
- Support: https://www.authorize.net/support/
- Sandbox Dashboard: https://sandbox.authorize.net/
