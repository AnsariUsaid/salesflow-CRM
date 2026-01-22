'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { Package, Loader2, ArrowLeft, CheckCircle, AlertCircle, Truck } from 'lucide-react';
import { GET_ORDER } from '@/graphql/queries';
import { UPDATE_ORDER_PRODUCT_PROCUREMENT, COMPLETE_ORDER_PROCUREMENT } from '@/graphql/mutations';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProcessingOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  
  const { data, loading, refetch } = useQuery(GET_ORDER, {
    variables: { orderId },
  }) as any;

  const [updateProcurement] = useMutation(UPDATE_ORDER_PRODUCT_PROCUREMENT);
  const [completeOrderProcurement] = useMutation(COMPLETE_ORDER_PROCUREMENT);
  
  const [procurementData, setProcurementData] = useState<Record<string, { cost: string; source: string }>>({});
  const [submitting, setSubmitting] = useState(false);

  const order = data?.order;

  const handleInputChange = (productId: string, field: 'cost' | 'source', value: string) => {
    setProcurementData(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const handleSubmitProcurement = async () => {
    if (!order) return;

    setSubmitting(true);
    try {
      // Update each product's procurement info
      for (const product of order.orderProducts) {
        const data = procurementData[product.orderproduct_id];
        if (data?.cost && data?.source) {
          await updateProcurement({
            variables: {
              orderproduct_id: product.orderproduct_id,
              procurement_cost: parseFloat(data.cost),
              procurement_source: data.source,
            },
          });
        }
      }

      // Complete the procurement and move to shipped
      await completeOrderProcurement({
        variables: { order_id: orderId },
      });

      alert('Procurement completed successfully! Order moved to Shipped status.');
      router.push('/processing/my-orders');
    } catch (error: any) {
      console.error('Error submitting procurement:', error);
      alert(error.message || 'Failed to complete procurement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <Link href="/processing/my-orders" className="text-blue-600 hover:underline">
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const allProductsHaveProcurement = order.orderProducts.every(
    (product: any) => product.procurement_cost && product.procurement_source
  );

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      unpaid: 'bg-red-100 text-red-700',
      partial: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-gray-100 text-gray-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/processing/my-orders"
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="text-gray-600" size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Procurement Details</h1>
            <p className="text-gray-600">Fill in procurement information for each product</p>
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Order ID</p>
              <p className="font-mono text-sm font-semibold text-gray-900">{order.order_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Customer</p>
              <p className="font-medium text-gray-900">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.fulfillment_status)}`}>
                {order.fulfillment_status}
              </span>
            </div>
          </div>
        </div>

        {/* Products Procurement Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Products Procurement</h2>
          </div>
          <div className="p-6 space-y-6">
            {order.orderProducts.map((product: any) => {
              const hasProcurement = product.procurement_cost && product.procurement_source;
              const currentCost = procurementData[product.orderproduct_id]?.cost || product.procurement_cost?.toString() || '';
              const currentSource = procurementData[product.orderproduct_id]?.source || product.procurement_source || '';

              return (
                <div
                  key={product.orderproduct_id}
                  className={`p-6 rounded-lg border-2 ${hasProcurement ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{product.product_name}</h3>
                      <p className="text-sm text-gray-600">
                        {product.make} {product.model} ({product.year}) • Qty: {product.quantity}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Sale Price: <span className="font-semibold">${product.price.toLocaleString()}</span>
                      </p>
                    </div>
                    {hasProcurement && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle size={20} />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Procurement Cost *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentCost}
                        onChange={(e) => handleInputChange(product.orderproduct_id, 'cost', e.target.value)}
                        disabled={hasProcurement}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                        placeholder="Enter cost"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Procurement Source (Vendor) *
                      </label>
                      <input
                        type="text"
                        value={currentSource}
                        onChange={(e) => handleInputChange(product.orderproduct_id, 'source', e.target.value)}
                        disabled={hasProcurement}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                        placeholder="Enter vendor name"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        {!allProductsHaveProcurement && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Complete Procurement</h3>
                <p className="text-sm text-gray-600">
                  After filling all procurement details, submit to move order to Shipped status
                </p>
              </div>
              <button
                onClick={handleSubmitProcurement}
                disabled={submitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Truck size={20} />
                    Complete & Ship
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {allProductsHaveProcurement && (
          <div className="bg-green-50 rounded-xl border-2 border-green-200 p-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="text-green-600" size={32} />
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-1">Procurement Completed</h3>
                <p className="text-sm text-green-700">
                  All products have procurement details. Order is ready for shipping.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
