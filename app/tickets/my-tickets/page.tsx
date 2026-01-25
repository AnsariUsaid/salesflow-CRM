'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { Ticket as TicketIcon, Clock, AlertCircle, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { GET_MY_TICKETS, GET_ME } from '@/graphql/queries';
import { UPDATE_TICKET } from '@/graphql/mutations';
import { useState } from 'react';
import Link from 'next/link';

export default function MyTicketsPage() {
  const { data: userData } = useQuery(GET_ME) as any;
  const { data, loading, refetch } = useQuery(GET_MY_TICKETS) as any;
  const [updateTicket] = useMutation(UPDATE_TICKET) as any;
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    setUpdatingTicketId(ticketId);
    try {
      await updateTicket({
        variables: {
          ticket_id: ticketId,
          status: newStatus,
        },
      });
      
      await refetch();
      alert(`Ticket status updated to ${newStatus.replace('_', ' ')}!`);
    } catch (error: any) {
      console.error('Error updating ticket:', error);
      alert(error.message || 'Failed to update ticket');
    } finally {
      setUpdatingTicketId(null);
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

  const tickets = data?.myTickets || [];
  const openTickets = tickets.filter((t: any) => t.status === 'open').length;
  const inProgressTickets = tickets.filter((t: any) => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter((t: any) => t.status === 'resolved').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/tickets" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Back to All Tickets
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tickets</h1>
          <p className="text-gray-600">Tickets assigned to you</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-3xl font-bold text-gray-900">{tickets.length}</p>
              </div>
              <TicketIcon className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-3xl font-bold text-blue-600">{openTickets}</p>
              </div>
              <Clock className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600">{inProgressTickets}</p>
              </div>
              <AlertCircle className="text-yellow-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-3xl font-bold text-green-600">{resolvedTickets}</p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <TicketIcon className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tickets Assigned</h3>
              <p className="text-gray-600 mb-6">You don't have any tickets assigned to you yet.</p>
              <Link
                href="/tickets"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Tickets
              </Link>
            </div>
          ) : (
            tickets.map((ticket: any) => {
              const nextStatus = getNextStatus(ticket.status);
              const nextStatusLabel = getNextStatusLabel(ticket.status);

              return (
                <div
                  key={ticket.ticket_id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Link 
                          href={`/tickets/${ticket.ticket_id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {ticket.title}
                        </Link>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>

                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      <Link
                        href={`/tickets/${ticket.ticket_id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                      >
                        View Details
                      </Link>
                      {nextStatus && (
                        <button
                          onClick={() => handleStatusUpdate(ticket.ticket_id, nextStatus)}
                          disabled={updatingTicketId === ticket.ticket_id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                        >
                          {updatingTicketId === ticket.ticket_id ? (
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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
