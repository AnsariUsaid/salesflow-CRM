import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { orderData, paymentData } = body;

    // Validate required fields
    if (!orderData || !paymentData) {
      return NextResponse.json(
        { success: false, error: 'Missing order or payment data' },
        { status: 400 }
      );
    }

    // Get Authorize.net credentials from environment
    const apiLoginId = process.env.AUTHORIZE_NET_API_LOGIN_ID;
    const transactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY;
    const environment = process.env.AUTHORIZE_NET_ENVIRONMENT || 'sandbox';

    if (!apiLoginId || !transactionKey) {
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Determine API URL based on environment
    const apiUrl = environment === 'production'
      ? 'https://api.authorize.net/xml/v1/request.api'
      : 'https://apitest.authorize.net/xml/v1/request.api';

    // Build line items from products
    const lineItems = orderData.products.map((product: any, index: number) => ({
      itemId: product.product_id || String(index + 1),
      name: product.product_name.substring(0, 31), // Max 31 chars
      description: `${product.make} ${product.model} ${product.year}`.substring(0, 255),
      quantity: String(product.quantity),
      unitPrice: product.price.toFixed(2),
    }));

    // Format expiration date (YYYY-MM)
    const expirationDate = `20${paymentData.expiryYear}-${paymentData.expiryMonth}`;

    // Build Authorize.net request
    const authorizeNetRequest = {
      createTransactionRequest: {
        merchantAuthentication: {
          name: apiLoginId,
          transactionKey: transactionKey,
        },
        refId: orderData.order_id,
        transactionRequest: {
          transactionType: 'authCaptureTransaction',
          amount: orderData.total_amount.toFixed(2),
          payment: {
            creditCard: {
              cardNumber: paymentData.cardNumber.replace(/\s/g, ''),
              expirationDate: expirationDate,
              cardCode: paymentData.cvv,
            },
          },
          lineItems: {
            lineItem: lineItems,
          },
          customer: {
            email: orderData.customer.email,
          },
          billTo: {
            firstName: orderData.customer.firstname,
            lastName: orderData.customer.lastname,
            address: paymentData.billingAddress,
            city: paymentData.city,
            state: paymentData.state,
            zip: paymentData.zipCode,
            country: 'US',
          },
          shipTo: {
            firstName: orderData.customer.firstname,
            lastName: orderData.customer.lastname,
            address: orderData.customer.address,
            city: orderData.customer.city,
            state: orderData.customer.state,
            zip: orderData.customer.pincode || paymentData.zipCode,
            country: 'US',
          },
          transactionSettings: {
            setting: {
              settingName: 'testRequest',
              settingValue: environment === 'sandbox' ? 'false' : 'false',
            },
          },
        },
      },
    };

    // Make request to Authorize.net
    const response = await axios.post(apiUrl, authorizeNetRequest, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Parse response
    const transactionResponse = response.data.transactionResponse;

    if (!transactionResponse) {
      return NextResponse.json(
        { 
          success: false, 
          error: response.data.messages?.message?.[0]?.text || 'Transaction failed' 
        },
        { status: 400 }
      );
    }

    // Check response code: 1 = Approved, 2 = Declined, 3 = Error
    if (transactionResponse.responseCode === '1') {
      // Success
      return NextResponse.json({
        success: true,
        transactionId: transactionResponse.transId,
        authCode: transactionResponse.authCode,
        responseCode: transactionResponse.responseCode,
        message: 'Payment processed successfully',
        accountNumber: transactionResponse.accountNumber, // Last 4 digits
        accountType: transactionResponse.accountType,
      });
    } else {
      // Declined or Error
      const errorMessage = transactionResponse.errors?.[0]?.errorText || 
                          transactionResponse.messages?.[0]?.description ||
                          'Transaction declined';
      
      return NextResponse.json(
        {
          success: false,
          responseCode: transactionResponse.responseCode,
          error: errorMessage,
        },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Payment processing error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.response?.data?.messages?.message?.[0]?.text || 
               error.message || 
               'An error occurred while processing payment',
      },
      { status: 500 }
    );
  }
}
