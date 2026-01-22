'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { useParams } from 'next/navigation';
import { Package, User, Phone, Mail, MapPin, DollarSign, Loader2, MessageSquare, Plus } from 'lucide-react';
import { GET_ORDER } from '@/graphql/queries';
import { CREATE_TICKET } from '@/graphql/mutations';
import { useState } from 'react';
import Link from 'next/link';

export default function FollowupOrderDetailPage() {
  const params = useParams();
  const orderId = params?.orderId as string;

  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  const { data, loading, refetch } = useQuery(GET_ORDER, {
    variables: { orderId },
    skip: !orderId,
  }) as any;

  const [createTicket, { loading: creating }] = useMutation(CREATE_TICKET) as any;

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticketTitle.trim() || !ticketDescription.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await createTicket({
        variables: {
          order_id: orderId,
          title: ticketTitle,
          description: ticketDescription,
          priority: ticketPriority,
        },
      });
      
      alert('Ticket created successfully!');
      setTicketTitle('');
      setTicketDescription('');
      setTicketPriority('medium');
      setShowTicketForm(false);
      refetch();
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      alert(error.message || 'Failed to create ticket');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      unpaid: 'bg-red-100 text-red-700',
      partial: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-gray-100 text-gray-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!data?.order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <Link href="/followup/my-orders" className="text-blue-600 hover:underline">
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const order = data.order;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/followup/my-orders" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Back to My Orders
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order #{order.order_id.slice(-8).toUpperCase()}
              </h1>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.payment_status)}`}>
                  {order.payment_status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.fulfillment_status)}`}>
                  {order.fulfillment_status}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowTicketForm(!showTicketForm)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Create Ticket
            </button>
          </div>
        </div>

        {/* Ticket Creation Form */}
        {showTicketForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6" id="create-ticket">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Support Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  placeholder="Brief description of the issue"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="Detailed description of the issue or feedback"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Creating...
                    </>
                  ) : (
                    <>
                      <MessageSquare size={16} />
                      Create Ticket
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTicketForm(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Customer Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{order.customer_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-600" />
                <p className="font-medium text-gray-900">{order.customer_email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-600" />
                <p className="font-medium text-gray-900">{order.customer_phone}</p>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-gray-600 mt-1" />
                <p className="font-medium text-gray-900">{order.shipping_address}</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-green-600" />
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-gray-600">Total Amount</p>
                <p className="font-bold text-2xl text-gray-900">${order.total_amount.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Order Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Products</p>
                <p className="font-medium text-gray-900">{order.orderProducts.length} items</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={20} className="text-blue-600" />
            Products
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Code</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Details</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Qty</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.orderProducts.map((product: any) => (
                  <tr key={product.orderproduct_id} className="border-b border-gray-200">
                    <td className="px-4 py-3 text-sm text-gray-900">{product.product_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.product_code}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {product.make} {product.model} ({product.year})
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{product.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                      ${(product.quantity * product.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
