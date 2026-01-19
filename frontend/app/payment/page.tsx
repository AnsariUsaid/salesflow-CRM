'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { GET_ORDER, GET_USER } from '@/lib/graphql/queries';
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
  const router = useRouter();
  const [orderId, setOrderId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch order and user data from backend
  const { data: orderDataResponse, loading: orderLoading } = useQuery(GET_ORDER, {
    variables: { id: orderId },
    skip: !orderId,
  });

  const { data: userDataResponse, loading: userLoading } = useQuery(GET_USER, {
    variables: { id: userId },
    skip: !userId,
  });

  const orderData = orderDataResponse?.order;
  const userData = userDataResponse?.user;

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
      setOrderId(order.orderId);
      setUserId(order.userId);
      setFormData(prev => ({
        ...prev,
        order_id: order.orderId,
        amount: order.totalAmount
      }));
    } else {
      // Redirect back to orders if no pending order
      router.push('/orders');
    }
  }, [router]);

  // --- Handlers ---

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate API Call
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      sessionStorage.removeItem('pendingOrder');
    }, 2000);
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
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 mb-8">
            Transaction ID: <span className="font-mono text-gray-700">TXN-{Math.floor(Math.random() * 10000)}-XJ</span><br/>
            Amount: <span className="font-semibold text-gray-800">${formData.amount.toFixed(2)}</span>
          </p>
          <button 
            onClick={() => router.push('/orders')} 
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create New Order
          </button>
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
                
                {/* Loading State */}
                {(orderLoading || userLoading) && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                    <p className="mt-2 text-slate-400">Loading order details...</p>
                  </div>
                )}

                {/* Customer */}
                {userData && (
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                      <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Customer</div>
                      <div className="text-white font-medium">
                        {userData.firstName} {userData.lastName || ''}
                      </div>
                      <div className="text-sm text-slate-400 mt-1">{userData.email}</div>
                      {userData.phone && (
                        <div className="text-sm text-slate-400">{userData.phone}</div>
                      )}
                  </div>
                )}

                {/* Order Details */}
                {orderData && (
                  <>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Shipping Address</div>
                        <div className="text-white text-sm">
                          {orderData.shippingAddress}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="border-t border-slate-700 pt-4 mt-4">
                        <div className="flex justify-between items-end">
                            <span className="text-slate-400 text-sm">Total Due</span>
                            <span className="text-2xl font-bold text-blue-400">
                              ${orderData.totalAmount?.toFixed(2)}
                            </span>
                        </div>
                    </div>
                  </>
                )}
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
