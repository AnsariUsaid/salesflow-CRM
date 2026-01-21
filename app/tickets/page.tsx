'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { Ticket as TicketIcon, User, Clock, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { GET_TICKETS, GET_ME } from '@/graphql/queries';
import { UPDATE_TICKET } from '@/graphql/mutations';
import { useState } from 'react';
import Link from 'next/link';

export default function TicketsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigningTicketId, setAssigningTicketId] = useState<string | null>(null);

  const { data: userData } = useQuery(GET_ME);
  const { data, loading, refetch } = useQuery(GET_TICKETS);
  const [updateTicket] = useMutation(UPDATE_TICKET);

  const handleAssignToMe = async (ticketId: string) => {
    if (!userData?.me?.user_id) {
      alert('User not found');
      return;
    }

    setAssigningTicketId(ticketId);
    try {
      await updateTicket({
        variables: {
          ticket_id: ticketId,
          assigned_to: userData.me.user_id,
          status: 'in_progress',
        },
      });
      
      await refetch();
      alert('Ticket assigned successfully!');
    } catch (error: any) {
      console.error('Error assigning ticket:', error);
      alert(error.message || 'Failed to assign ticket');
    } finally {
      setAssigningTicketId(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  const tickets = data?.tickets || [];
  
  // Apply filters
  const filteredTickets = tickets.filter((ticket: any) => {
    const statusMatch = statusFilter === 'all' || ticket.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const openTickets = tickets.filter((t: any) => t.status === 'open').length;
  const inProgressTickets = tickets.filter((t: any) => t.status === 'in_progress').length;
  const urgentTickets = tickets.filter((t: any) => t.priority === 'urgent').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Tickets</h1>
          <p className="text-gray-600">View and manage all support tickets</p>
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
              <User className="text-yellow-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-3xl font-bold text-red-600">{urgentTickets}</p>
              </div>
              <AlertCircle className="text-red-600" size={32} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="flex items-end">
              <Link
                href="/tickets/my-tickets"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                My Tickets
              </Link>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <TicketIcon className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tickets Found</h3>
              <p className="text-gray-600">No tickets match your current filters.</p>
            </div>
          ) : (
            filteredTickets.map((ticket: any) => (
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
                        <User size={16} />
                        <span>Created by: {ticket.user?.firstname} {ticket.user?.lastname}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                      {ticket.assigned_to && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle size={16} />
                          <span>Assigned</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    <Link
                      href={`/tickets/${ticket.ticket_id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                    >
                      View Details
                    </Link>
                    {!ticket.assigned_to && ticket.status === 'open' && (
                      <button
                        onClick={() => handleAssignToMe(ticket.ticket_id)}
                        disabled={assigningTicketId === ticket.ticket_id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {assigningTicketId === ticket.ticket_id ? (
                          <Loader2 className="animate-spin mx-auto" size={16} />
                        ) : (
                          'Assign to Me'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
