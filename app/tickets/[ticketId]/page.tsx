'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { useParams } from 'next/navigation';
import { Ticket as TicketIcon, User, Clock, AlertCircle, Loader2, CheckCircle, Package, ArrowRight } from 'lucide-react';
import { GET_TICKET, GET_ME } from '@/graphql/queries';
import { UPDATE_TICKET, RESOLVE_TICKET } from '@/graphql/mutations';
import { useState } from 'react';
import Link from 'next/link';

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params?.ticketId as string;

  const { data: userData } = useQuery(GET_ME);
  const { data, loading, refetch } = useQuery(GET_TICKET, {
    variables: { ticketId },
    skip: !ticketId,
  });

  const [updateTicket] = useMutation(UPDATE_TICKET);
  const [resolveTicket] = useMutation(RESOLVE_TICKET);
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      if (newStatus === 'resolved') {
        await resolveTicket({
          variables: { ticket_id: ticketId },
        });
      } else {
        await updateTicket({
          variables: {
            ticket_id: ticketId,
            status: newStatus,
          },
        });
      }
      
      await refetch();
      alert(`Ticket status updated to ${newStatus}!`);
    } catch (error: any) {
      console.error('Error updating ticket:', error);
      alert(error.message || 'Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignToMe = async () => {
    if (!userData?.me?.user_id) {
      alert('User not found');
      return;
    }

    setUpdating(true);
    try {
      await updateTicket({
        variables: {
          ticket_id: ticketId,
          assigned_to: userData.me.user_id,
          status: 'in_progress',
        },
      });
      
      await refetch();
      alert('Ticket assigned to you!');
    } catch (error: any) {
      console.error('Error assigning ticket:', error);
      alert(error.message || 'Failed to assign ticket');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityBadgeColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow: Record<string, string> = {
      open: 'in_progress',
      in_progress: 'resolved',
      resolved: 'closed',
    };
    return statusFlow[currentStatus];
  };

  const getNextStatusLabel = (currentStatus: string) => {
    const labels: Record<string, string> = {
      open: 'Start Progress',
      in_progress: 'Mark Resolved',
      resolved: 'Close Ticket',
    };
    return labels[currentStatus];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!data?.ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket Not Found</h2>
          <Link href="/tickets" className="text-blue-600 hover:underline">
            Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  const ticket = data.ticket;
  const nextStatus = getNextStatus(ticket.status);
  const nextStatusLabel = getNextStatusLabel(ticket.status);
  const isAssignedToMe = ticket.assigned_to === userData?.me?.user_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/tickets" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Back to Tickets
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{ticket.title}</h1>
              <div className="flex gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(ticket.status)}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {!ticket.assigned_to && ticket.status === 'open' && (
                <button
                  onClick={handleAssignToMe}
                  disabled={updating}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {updating ? (
                    <Loader2 className="animate-spin mx-auto" size={16} />
                  ) : (
                    'Assign to Me'
                  )}
                </button>
              )}
              {isAssignedToMe && nextStatus && (
                <button
                  onClick={() => handleStatusUpdate(nextStatus)}
                  disabled={updating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updating ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      {nextStatusLabel}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {/* Linked Order */}
            {ticket.order && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package size={20} className="text-blue-600" />
                  Linked Order
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID</span>
                    <Link 
                      href={`/orders/${ticket.order.order_id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      #{ticket.order.order_id.slice(-8).toUpperCase()}
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer</span>
                    <span className="font-medium text-gray-900">{ticket.order.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-medium text-gray-900">${ticket.order.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(ticket.order.fulfillment_status)}`}>
                      {ticket.order.fulfillment_status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ticket Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User size={16} />
                  <div>
                    <p className="text-xs text-gray-500">Created By</p>
                    <p className="font-medium text-gray-900">
                      {ticket.user?.firstname} {ticket.user?.lastname}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <div>
                    <p className="text-xs text-gray-500">Created At</p>
                    <p className="font-medium text-gray-900">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {ticket.assigned_to && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle size={16} className="text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500">Assigned To</p>
                      <p className="font-medium text-gray-900">
                        {isAssignedToMe ? 'You' : 'Another Agent'}
                      </p>
                    </div>
                  </div>
                )}

                {ticket.resolvedAt && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle size={16} className="text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500">Resolved At</p>
                      <p className="font-medium text-gray-900">
                        {new Date(ticket.resolvedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-600">
                  <AlertCircle size={16} />
                  <div>
                    <p className="text-xs text-gray-500">Priority</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {isAssignedToMe && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Status Workflow</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p className="flex items-center gap-2">
                    <span className={ticket.status === 'open' ? 'font-bold' : ''}>Open</span>
                    <ArrowRight size={14} />
                  </p>
                  <p className="flex items-center gap-2">
                    <span className={ticket.status === 'in_progress' ? 'font-bold' : ''}>In Progress</span>
                    <ArrowRight size={14} />
                  </p>
                  <p className="flex items-center gap-2">
                    <span className={ticket.status === 'resolved' ? 'font-bold' : ''}>Resolved</span>
                    <ArrowRight size={14} />
                  </p>
                  <p>
                    <span className={ticket.status === 'closed' ? 'font-bold' : ''}>Closed</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
