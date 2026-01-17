'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Plus, 
  Trash2, 
  Save, 
  Package, 
  User as UserIcon, 
  Truck, 
  ShoppingCart,
} from 'lucide-react';
import { OrderProduct, Product, Order } from '@/types';
import { GET_PRODUCTS, GET_ORDERS } from '@/lib/graphql/queries';

export default function OrdersPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Fetch products and orders from database
  const { data: productsData, loading: productsLoading } = useQuery(GET_PRODUCTS);
  const { data: ordersData, loading: ordersLoading } = useQuery(GET_ORDERS);
  
  const dbProducts = productsData?.products || [];
  const dbOrders = ordersData?.orders || [];
  
  // Form States
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<OrderProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- Handlers ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProductSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(!!query);
  };

  const addProduct = (product: any) => {
    const newOrderProduct: OrderProduct = {
      product_id: product.id,
      product_name: product.productName,
      product_code: `PC-${product.id.slice(0, 8)}`,
      make: product.make,
      model: product.model,
      year: product.year.toString(),
      quantity: 1,
      price: 50.00, // Default price, should come from backend
    };

    const exists = selectedProducts.find(p => p.product_id === product.id);
    if (exists) {
      setSelectedProducts(prev => prev.map(p => 
        p.product_id === product.id 
          ? { ...p, quantity: p.quantity + 1 } 
          : p
      ));
    } else {
      setSelectedProducts(prev => [...prev, newOrderProduct]);
    }
    setSearchQuery('');
    setIsSearching(false);
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.product_id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setSelectedProducts(prev => prev.map(p => {
      if (p.product_id === productId) {
        const newQty = Math.max(1, p.quantity + delta);
        return { ...p, quantity: newQty };
      }
      return p;
    }));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  };

  const handleCreateOrder = () => {
    if (selectedProducts.length === 0) {
      alert('Please add at least one product');
      return;
    }
    
    const orderData = {
      customer: {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
      },
      vehicle: {
        make: formData.vehicleMake,
        model: formData.vehicleModel,
        year: formData.vehicleYear,
      },
      products: selectedProducts,
      total_amount: calculateTotal(),
    };
    
    sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));
    router.push('/payment');
  };

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return [];
    return dbProducts.filter((p: any) => 
      p.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.model?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, dbProducts]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-800">
      
      {/* --- Sidebar --- */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-72' : 'w-16'
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
        <div className="p-4 border-b border-slate-700 flex items-center justify-center h-16">
          {isSidebarOpen ? (
            <h2 className="text-xl font-bold tracking-wider text-blue-400">SalesFlow</h2>
          ) : (
             <Package size={24} className="text-blue-400" />
          )}
        </div>

        {/* Recent Orders List */}
        <div className="flex-1 overflow-y-auto py-4">
            {isSidebarOpen && (
                <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Recent Orders
                </div>
            )}
            
            {ordersLoading ? (
              <div className="px-4 py-3 text-slate-400 text-sm">Loading orders...</div>
            ) : dbOrders.length === 0 ? (
              <div className="px-4 py-3 text-slate-400 text-sm">No orders yet</div>
            ) : (
              <div className="space-y-1">
                  {dbOrders.slice(0, 10).map((order: any) => (
                      <div 
                          key={order.id} 
                          className={`flex items-center px-4 py-3 hover:bg-slate-800 cursor-pointer transition-colors ${!isSidebarOpen && 'justify-center'}`}
                      >
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                              order.orderStatus === 'PENDING' ? 'bg-yellow-400' :
                              order.orderStatus === 'CONFIRMED' ? 'bg-blue-400' :
                              order.orderStatus === 'SHIPPED' ? 'bg-purple-400' :
                              order.orderStatus === 'DELIVERED' ? 'bg-green-400' :
                              'bg-red-400'
                          }`} />
                          
                          {isSidebarOpen && (
                              <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate text-slate-200">
                                    {order.user?.firstName || 'Customer'} {order.user?.lastName || ''}
                                  </p>
                                  <div className="flex justify-between text-xs text-slate-400">
                                      <span>{order.id.slice(0, 8)}</span>
                                      <span>${order.totalAmount?.toFixed(2) || '0.00'}</span>
                                  </div>
                              </div>
                          )}
                      </div>
                  ))}
              </div>
            )}
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
           <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
             <Plus className="text-blue-600" /> New Order
           </h1>
           <div className="flex gap-3">
              <button 
                onClick={() => router.push('/')}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                  Cancel
              </button>
              <button 
                onClick={handleCreateOrder}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
              >
                  <Save size={16} /> Create Order
              </button>
           </div>
        </header>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* 1. Customer Information */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-2">
                <UserIcon className="text-blue-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Customer Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="First Name" name="firstname" value={formData.firstname} onChange={handleInputChange} required />
                <InputField label="Last Name" name="lastname" value={formData.lastname} onChange={handleInputChange} required />
                <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                <InputField label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
                <div className="md:col-span-2">
                  <InputField label="Address" name="address" value={formData.address} onChange={handleInputChange} required />
                </div>
                <InputField label="City" name="city" value={formData.city} onChange={handleInputChange} required />
                <InputField label="State" name="state" value={formData.state} onChange={handleInputChange} required />
              </div>
            </section>

            {/* 2. Vehicle Information */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-2">
                <Truck className="text-blue-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Vehicle Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="Make" name="vehicleMake" placeholder="e.g., Toyota" value={formData.vehicleMake} onChange={handleInputChange} required />
                <InputField label="Model" name="vehicleModel" placeholder="e.g., Camry" value={formData.vehicleModel} onChange={handleInputChange} required />
                <InputField label="Year" name="vehicleYear" placeholder="e.g., 2020" value={formData.vehicleYear} onChange={handleInputChange} required />
              </div>
            </section>

            {/* 3. Products Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-2">
                <ShoppingCart className="text-blue-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Products</h3>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search products by name or code..."
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => handleProductSearch(e.target.value)}
                    />
                </div>

                {/* Search Results Dropdown */}
                {isSearching && (
                  <>
                    {productsLoading && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-gray-500">
                        Loading products...
                      </div>
                    )}
                    {!productsLoading && filteredProducts.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                          {filteredProducts.map((product: any) => (
                              <div 
                                  key={product.id}
                                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-0"
                                  onClick={() => addProduct(product)}
                              >
                                  <div>
                                      <div className="font-medium text-gray-800">{product.productName}</div>
                                      <div className="text-sm text-gray-500">
                                        {product.make} {product.model} ({product.year})
                                      </div>
                                  </div>
                                  <Plus size={16} className="text-blue-600" />
                              </div>
                          ))}
                      </div>
                    )}
                    {!productsLoading && filteredProducts.length === 0 && searchQuery && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-gray-500">
                        No products found
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Selected Products Table */}
              {selectedProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 text-gray-600 uppercase font-semibold">
                              <tr>
                                  <th className="px-4 py-3">Product Info</th>
                                  <th className="px-4 py-3 text-center">Vehicle</th>
                                  <th className="px-4 py-3 text-center">Price</th>
                                  <th className="px-4 py-3 text-center">Quantity</th>
                                  <th className="px-4 py-3 text-right">Total</th>
                                  <th className="px-4 py-3"></th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {selectedProducts.map(item => (
                                  <tr key={item.product_id} className="hover:bg-gray-50">
                                      <td className="px-4 py-3">
                                          <div className="font-medium text-gray-900">{item.product_name}</div>
                                          <div className="text-xs text-gray-500">{item.product_code}</div>
                                      </td>
                                      <td className="px-4 py-3 text-center text-gray-600">
                                          {item.make} {item.model} {item.year}
                                      </td>
                                      <td className="px-4 py-3 text-center font-medium">
                                          ${item.price.toFixed(2)}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                          <div className="inline-flex items-center border border-gray-300 rounded-md">
                                              <button 
                                                onClick={() => updateQuantity(item.product_id, -1)}
                                                className="px-2 py-1 hover:bg-gray-100 text-gray-600"
                                              >-</button>
                                              <span className="px-2 py-1 min-w-[30px] text-center font-medium">{item.quantity}</span>
                                              <button 
                                                onClick={() => updateQuantity(item.product_id, 1)}
                                                className="px-2 py-1 hover:bg-gray-100 text-gray-600"
                                              >+</button>
                                          </div>
                                      </td>
                                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                                          ${(item.price * item.quantity).toFixed(2)}
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                          <button 
                                            onClick={() => removeProduct(item.product_id)}
                                            className="text-red-400 hover:text-red-600 p-1"
                                          >
                                              <Trash2 size={16} />
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                          <tfoot className="bg-gray-50 border-t border-gray-200">
                              <tr>
                                  <td colSpan={4} className="px-4 py-4 text-right font-bold text-gray-600">Total Amount:</td>
                                  <td className="px-4 py-4 text-right font-bold text-xl text-blue-600">
                                      ${calculateTotal().toFixed(2)}
                                  </td>
                                  <td></td>
                              </tr>
                          </tfoot>
                      </table>
                  </div>
              ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-400">
                      Search and add products to this order
                  </div>
              )}
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}

// --- Helper Components ---

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const InputField = ({ label, required, className, ...props }: InputFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 ${className}`}
      {...props}
    />
  </div>
);
