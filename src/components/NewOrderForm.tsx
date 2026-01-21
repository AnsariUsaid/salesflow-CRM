'use client';

import { useState } from 'react';
import { Product, OrderProduct } from '@/types';
import { mockProducts } from '@/lib/mockData';

interface NewOrderFormProps {
  onSubmit: (orderData: any) => void;
}

export default function NewOrderForm({ onSubmit }: NewOrderFormProps) {
  const [customerInfo, setCustomerInfo] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [vehicleInfo, setVehicleInfo] = useState({
    make: '',
    model: '',
    year: '',
  });

  const [selectedProducts, setSelectedProducts] = useState<OrderProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = mockProducts.filter((product) =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addProduct = (product: Product) => {
    const existing = selectedProducts.find((p) => p.product_id === product.product_id);
    if (existing) {
      setSelectedProducts(
        selectedProducts.map((p) =>
          p.product_id === product.product_id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      );
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          ...product,
          quantity: 1,
          price: 0, // Will be set by user
        },
      ]);
    }
    setSearchTerm('');
  };

  const updateProductPrice = (productId: string, price: number) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.product_id === productId ? { ...p, price } : p
      )
    );
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedProducts(selectedProducts.filter((p) => p.product_id !== productId));
    } else {
      setSelectedProducts(
        selectedProducts.map((p) =>
          p.product_id === productId ? { ...p, quantity } : p
        )
      );
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.product_id !== productId));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderData = {
      customer: customerInfo,
      vehicle: vehicleInfo,
      products: selectedProducts,
      total_amount: calculateTotal(),
    };
    onSubmit(orderData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Customer Information */}
      <section className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              required
              value={customerInfo.firstname}
              onChange={(e) => setCustomerInfo({ ...customerInfo, firstname: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              required
              value={customerInfo.lastname}
              onChange={(e) => setCustomerInfo({ ...customerInfo, lastname: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              required
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <input
              type="text"
              required
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              required
              value={customerInfo.city}
              onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <input
              type="text"
              required
              value={customerInfo.state}
              onChange={(e) => setCustomerInfo({ ...customerInfo, state: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Vehicle Information */}
      <section className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Make *
            </label>
            <input
              type="text"
              required
              value={vehicleInfo.make}
              onChange={(e) => setVehicleInfo({ ...vehicleInfo, make: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Toyota"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model *
            </label>
            <input
              type="text"
              required
              value={vehicleInfo.model}
              onChange={(e) => setVehicleInfo({ ...vehicleInfo, model: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Camry"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year *
            </label>
            <input
              type="text"
              required
              value={vehicleInfo.year}
              onChange={(e) => setVehicleInfo({ ...vehicleInfo, year: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 2020"
            />
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Products</h3>
        
        {/* Product Search */}
        <div className="mb-4 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredProducts.map((product) => (
                <button
                  key={product.product_id}
                  type="button"
                  onClick={() => addProduct(product)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <p className="font-medium text-gray-900">{product.product_name}</p>
                  <p className="text-sm text-gray-600">
                    {product.make} {product.model} ({product.year})
                  </p>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <div className="px-4 py-2 text-gray-500">No products found</div>
              )}
            </div>
          )}
        </div>

        {/* Selected Products */}
        {selectedProducts.length > 0 ? (
          <div className="space-y-3">
            {selectedProducts.map((product) => (
              <div key={product.product_id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.product_name}</p>
                  <p className="text-sm text-gray-600">
                    {product.make} {product.model} ({product.year})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={product.quantity}
                      onChange={(e) => updateProductQuantity(product.product_id, parseInt(e.target.value))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.price}
                      onChange={(e) => updateProductPrice(product.product_id, parseFloat(e.target.value))}
                      className="w-28 px-2 py-1 border border-gray-300 rounded"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProduct(product.product_id)}
                    className="mt-5 p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Search and add products to this order
          </div>
        )}
      </section>

      {/* Order Summary */}
      {selectedProducts.length > 0 && (
        <section className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Total Amount</h3>
            <p className="text-2xl font-bold text-gray-900">${calculateTotal().toFixed(2)}</p>
          </div>
        </section>
      )}

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={selectedProducts.length === 0}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Create Order & Proceed to Payment
        </button>
      </div>
    </form>
  );
}
