'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { 
  ChevronLeft, 
  ChevronRight, 
  CreditCard, 
  Calendar, 
  Lock, 
  User, 
  MapPin, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  FileText,
  ShieldCheck
} from 'lucide-react';

interface PaymentFormData {
  order_id: string;
  amount: number;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  billingAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function PaymentPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  
  // Redirect if not signed in
  if (isLoaded && !isSignedIn) {
    router.push('/sign-in');
    return null;
  }

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <PaymentPageContent />;
}

function PaymentPageContent() {
  const router = useRouter();
  const [orderData, setOrderData] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [showSavedCards, setShowSavedCards] = useState(false);

  // Form State
  const [formData, setFormData] = useState<PaymentFormData>({
    order_id: '',
    amount: 0,
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: ''
  });

  useEffect(() => {
    // Retrieve order data from session storage
    const pendingOrder = sessionStorage.getItem('pendingOrder');
    if (pendingOrder) {
      const order = JSON.parse(pendingOrder);
      setOrderData(order);
      setFormData(prev => ({
        ...prev,
        order_id: 'ORD-' + Math.floor(Math.random() * 10000),
        amount: order.total_amount
      }));
    } else {
      // Redirect back to orders if no pending order
      router.push('/orders');
    }

    // Fetch saved cards
    async function fetchCards() {
      try {
        const res = await fetch('/api/cards');
        const data = await res.json();
        if (data.cards) {
          setSavedCards(data.cards);
        }
      } catch (error) {
        console.error('Error fetching cards:', error);
      }
    }
    fetchCards();
  }, [router]);

  // --- Handlers ---

  const useSavedCard = (card: any) => {
    setFormData(prev => ({
      ...prev,
      cardNumber: card.cardNumber.replace(/(\d{4})(?=\d)/g, '$1 '),
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cvv: '', // Don't pre-fill CVV for security
      cardholderName: card.cardholderName,
      billingAddress: card.billingAddress,
      city: card.city,
      state: card.state,
      zipCode: card.zipCode,
    }));
    setShowSavedCards(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Simple formatter for Card Number (add space every 4 digits)
    if (name === 'cardNumber') {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const parts = [];
      for (let i = 0; i < v.length; i += 4) {
        parts.push(v.substr(i, 4));
      }
      const formatted = parts.length > 1 ? parts.join(' ') : value;
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Call payment API
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderData,
          paymentData: formData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Store transaction details
        const transactionData = {
          transactionId: result.transactionId,
          authCode: result.authCode,
          accountNumber: result.accountNumber,
          amount: formData.amount,
          orderId: formData.order_id,
        };
        
        setTransactionDetails(transactionData);
        sessionStorage.setItem('lastTransaction', JSON.stringify(transactionData));
        sessionStorage.removeItem('pendingOrder');
        
        setIsSuccess(true);
      } else {
        // Show error
        alert(`Payment Failed: ${result.error}`);
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(`Payment Error: ${error.message || 'Unable to process payment'}`);
      setIsProcessing(false);
    }
  };

  if (!orderData) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          
          {transactionDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-gray-900 font-semibold">
                  {transactionDetails.transactionId}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Auth Code:</span>
                <span className="font-mono text-gray-900 font-semibold">
                  {transactionDetails.authCode}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Card:</span>
                <span className="font-mono text-gray-900">
                  •••• {transactionDetails.accountNumber}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-green-600 text-lg">
                  ${transactionDetails.amount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/orders')} 
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create New Order
            </button>
            <button 
              onClick={() => router.push('/')} 
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-800">
      
      {/* --- Sidebar (Order Context) --- */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-80' : 'w-16'
        } bg-slate-900 text-white transition-all duration-300 ease-in-out flex flex-col shadow-xl relative z-20`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-6 bg-blue-600 rounded-full p-1 text-white shadow-lg hover:bg-blue-500 transition-colors border-2 border-slate-900"
        >
          {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-center min-h-[4rem]">
          {isSidebarOpen ? (
            <div className="text-center">
                <h2 className="text-sm uppercase tracking-widest text-slate-400 font-semibold">Order Summary</h2>
                <div className="text-xl font-bold text-white mt-1">{formData.order_id}</div>
            </div>
          ) : (
             <FileText size={24} className="text-slate-400" />
          )}
        </div>

        {/* Order Details (Only visible when open) */}
        {isSidebarOpen && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Customer */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Customer</div>
                    <div className="text-white font-medium">
                      {orderData.customer.firstname} {orderData.customer.lastname}
                    </div>
                    <div className="text-sm text-slate-400 mt-1">{orderData.customer.email}</div>
                </div>

                {/* Vehicle */}
                {orderData.vehicle && (orderData.vehicle.year !== 'N/A' || orderData.vehicle.make !== 'N/A' || orderData.vehicle.model !== 'N/A') && (
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                      <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Vehicle</div>
                      <div className="text-white font-medium">
                        {orderData.vehicle.year} {orderData.vehicle.make} {orderData.vehicle.model}
                      </div>
                  </div>
                )}

                {/* Items List */}
                <div>
                    <div className="text-xs text-slate-400 uppercase font-semibold mb-3">
                      Items ({orderData.products.length})
                    </div>
                    <div className="space-y-3">
                        {orderData.products.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <div className="flex-1">
                                  <span className="text-slate-300">{item.product_name}</span>
                                  <div className="text-xs text-slate-500">Qty: {item.quantity}</div>
                                </div>
                                <span className="text-white font-mono">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals */}
                <div className="border-t border-slate-700 pt-4 mt-4">
                    <div className="flex justify-between items-end">
                        <span className="text-slate-400 text-sm">Total Due</span>
                        <span className="text-2xl font-bold text-blue-400">
                          ${orderData.total_amount.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        )}
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm flex-shrink-0">
           <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
             <CreditCard className="text-blue-600" /> Process Payment
           </h1>
           <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
              <ShieldCheck size={14} className="text-green-600" />
              Secure 256-bit SSL Encrypted
           </div>
        </header>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
            
            {/* Amount Banner */}
            <div className="bg-blue-600 text-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row justify-between items-center">
                <div>
                    <h2 className="text-lg font-medium opacity-90">Transaction Amount</h2>
                    <p className="text-sm opacity-75">Order #{formData.order_id}</p>
                </div>
                <div className="text-4xl font-bold mt-2 md:mt-0">
                    ${formData.amount.toFixed(2)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Payment Details */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-2">
                        <CreditCard className="text-blue-600" size={20} />
                        <h3 className="text-lg font-semibold text-gray-800">Card Information</h3>
                    </div>

                    <div className="space-y-5">
                        {savedCards.length > 0 && (
                          <div className="mb-4">
                            <button
                              type="button"
                              onClick={() => setShowSavedCards(!showSavedCards)}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              {showSavedCards ? 'Hide' : 'Use'} Saved Cards ({savedCards.length})
                            </button>
                            
                            {showSavedCards && (
                              <div className="mt-3 space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                                {savedCards.map((card) => (
                                  <button
                                    key={card.card_id}
                                    type="button"
                                    onClick={() => useSavedCard(card)}
                                    className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                                  >
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <div className="font-medium text-sm">{card.cardholderName}</div>
                                        <div className="text-xs text-gray-500">
                                          •••• {card.cardNumber.slice(-4)} - Exp {card.expiryMonth}/{card.expiryYear}
                                        </div>
                                      </div>
                                      <CreditCard size={20} className="text-gray-400" />
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <InputField 
                            label="Cardholder Name" 
                            name="cardholderName" 
                            icon={<User size={18} />}
                            placeholder="Name as on card"
                            value={formData.cardholderName} 
                            onChange={handleInputChange} 
                            required 
                        />

                        <InputField 
                            label="Card Number" 
                            name="cardNumber" 
                            icon={<CreditCard size={18} />}
                            placeholder="0000 0000 0000 0000"
                            value={formData.cardNumber} 
                            onChange={handleInputChange} 
                            maxLength={19}
                            required 
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">Expiry Date <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    <select 
                                        name="expiryMonth"
                                        value={formData.expiryMonth}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        required
                                    >
                                        <option value="" disabled>MM</option>
                                        {Array.from({length: 12}, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    <select 
                                        name="expiryYear"
                                        value={formData.expiryYear}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        required
                                    >
                                        <option value="" disabled>YY</option>
                                        {Array.from({length: 10}, (_, i) => String(new Date().getFullYear() + i).slice(-2)).map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <InputField 
                                label="CVV / CVC" 
                                name="cvv" 
                                icon={<Lock size={18} />}
                                placeholder="123"
                                maxLength={4}
                                type="password"
                                value={formData.cvv} 
                                onChange={handleInputChange} 
                                required 
                            />
                        </div>
                    </div>
                </section>

                {/* 2. Billing Address */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-2">
                        <MapPin className="text-blue-600" size={20} />
                        <h3 className="text-lg font-semibold text-gray-800">Billing Address</h3>
                    </div>

                    <div className="space-y-5">
                        <InputField 
                            label="Street Address" 
                            name="billingAddress" 
                            placeholder="123 Main St"
                            value={formData.billingAddress} 
                            onChange={handleInputChange} 
                            required 
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <InputField 
                                label="City" 
                                name="city" 
                                value={formData.city} 
                                onChange={handleInputChange} 
                                required 
                            />
                            <InputField 
                                label="State" 
                                name="state" 
                                value={formData.state} 
                                onChange={handleInputChange} 
                                required 
                            />
                        </div>

                        <div className="w-1/2 pr-2">
                             <InputField 
                                label="Zip Code" 
                                name="zipCode" 
                                value={formData.zipCode} 
                                onChange={handleInputChange} 
                                required 
                            />
                        </div>
                    </div>
                    
                    <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-100 flex gap-3">
                        <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                        <p className="text-xs text-yellow-700 leading-relaxed">
                            Please ensure the billing address matches the address associated with the card to avoid transaction failure.
                        </p>
                    </div>
                </section>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 pb-12">
                <button 
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                    Cancel Transaction
                </button>
                <button 
                    type="submit"
                    disabled={isProcessing}
                    className={`
                        px-8 py-3 bg-blue-600 text-white rounded-lg font-medium shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2
                        ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}
                    `}
                >
                    {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                    ) : (
                        <>
                            Pay <span className="opacity-90">${formData.amount.toFixed(2)}</span>
                        </>
                    )}
                </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}

// --- Helper Components ---

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

const InputField = ({ label, required, className, icon, ...props }: InputFieldProps) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
        {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                {icon}
            </div>
        )}
        <input
            className={`
                w-full ${icon ? 'pl-10' : 'px-3'} py-2 border border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none 
                transition-all placeholder:text-gray-400
                ${className || ''}
            `}
            {...props}
        />
    </div>
  </div>
);
