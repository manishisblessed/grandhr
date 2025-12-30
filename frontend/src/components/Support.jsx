import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const Support = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'TECHNICAL',
    priority: 'MEDIUM',
  });
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/support');
      setTickets(response.data.tickets || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
      alert('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await api.post('/support', formData);
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        category: 'TECHNICAL',
        priority: 'MEDIUM',
      });
      loadTickets();
      alert('Support ticket created successfully!');
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert(error.response?.data?.message || 'Failed to create ticket');
    }
  };

  const handleReply = async (ticketId) => {
    if (!replyMessage.trim()) {
      alert('Please enter a reply message');
      return;
    }

    try {
      await api.post(`/support/${ticketId}/reply`, {
        message: replyMessage,
        isInternal: false,
      });
      setReplyMessage('');
      loadTickets();
      if (selectedTicket?.id === ticketId) {
        const response = await api.get(`/support/${ticketId}`);
        setSelectedTicket(response.data.ticket);
      }
    } catch (error) {
      console.error('Error replying to ticket:', error);
      alert('Failed to add reply');
    }
  };

  const handleUpdateStatus = async (ticketId, status, resolution) => {
    try {
      await api.patch(`/support/${ticketId}/status`, {
        status,
        resolution,
      });
      loadTickets();
      if (selectedTicket?.id === ticketId) {
        const response = await api.get(`/support/${ticketId}`);
        setSelectedTicket(response.data.ticket);
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Failed to update ticket');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      OPEN: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority}
      </span>
    );
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR';

  if (loading) {
    return (
      <Layout title="Support" description="Get help and support">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white text-xl">Loading support tickets...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Support & Tickets" description="Get help and manage support tickets">
      <div className="w-full px-[1%]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">🎫 Support Tickets</h1>
            <p className="text-gray-300">Get help, report issues, or request features</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <span>➕</span>
            <span>Create Ticket</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tickets List */}
          <div className="lg:col-span-2">
            <div className="card shadow-xl">
              {tickets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎫</div>
                  <h3 className="text-xl font-semibold mb-2">No Support Tickets</h3>
                  <p className="text-gray-500 mb-4">Create a ticket to get help</p>
                  <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                    Create Ticket
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        selectedTicket?.id === ticket.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                      }`}
                      onClick={() => {
                        api.get(`/support/${ticket.id}`).then((response) => {
                          setSelectedTicket(response.data.ticket);
                        });
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{ticket.title}</h3>
                        <div className="flex gap-2">
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{ticket.description}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{ticket.category}</span>
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ticket Details */}
          <div className="lg:col-span-1">
            {selectedTicket ? (
              <div className="card shadow-xl">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-bold">{selectedTicket.title}</h2>
                    <div className="flex gap-2">
                      {getStatusBadge(selectedTicket.status)}
                      {getPriorityBadge(selectedTicket.priority)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{selectedTicket.description}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Category: {selectedTicket.category}</div>
                    <div>Created: {new Date(selectedTicket.createdAt).toLocaleString()}</div>
                    {selectedTicket.resolution && (
                      <div className="mt-2 p-2 bg-green-50 rounded">
                        <strong>Resolution:</strong> {selectedTicket.resolution}
                      </div>
                    )}
                  </div>
                </div>

                {/* Replies */}
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Replies ({selectedTicket.replies?.length || 0})</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedTicket.replies?.map((reply) => (
                      <div key={reply.id} className="p-2 bg-gray-50 rounded text-sm">
                        <div className="font-semibold mb-1">
                          {reply.user?.employee?.firstName} {reply.user?.employee?.lastName}
                          {reply.isInternal && <span className="text-xs text-gray-500"> (Internal)</span>}
                        </div>
                        <div className="text-gray-700">{reply.message}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(reply.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reply Form */}
                <div className="mb-4">
                  <textarea
                    className="form-input w-full"
                    rows="3"
                    placeholder="Type your reply..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                  />
                  <button
                    onClick={() => handleReply(selectedTicket.id)}
                    className="btn-primary w-full mt-2"
                  >
                    Send Reply
                  </button>
                </div>

                {/* Admin Actions */}
                {isAdmin && (
                  <div className="space-y-2">
                    {selectedTicket.status !== 'RESOLVED' && (
                      <button
                        onClick={() => {
                          const resolution = prompt('Enter resolution:');
                          if (resolution) {
                            handleUpdateStatus(selectedTicket.id, 'RESOLVED', resolution);
                          }
                        }}
                        className="btn-secondary w-full"
                      >
                        Mark as Resolved
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'CLOSED')}
                      className="btn-secondary w-full"
                    >
                      Close Ticket
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="card shadow-xl">
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p>Select a ticket to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create Support Ticket</h2>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Brief description of the issue"
                  />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    placeholder="Detailed description of the issue..."
                  />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="TECHNICAL">Technical Issue</option>
                    <option value="BILLING">Billing</option>
                    <option value="FEATURE_REQUEST">Feature Request</option>
                    <option value="BUG">Bug Report</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Priority</label>
                  <select
                    className="form-input"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    required
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1">
                    Create Ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Support;

