import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import HRLayout from './HRLayout';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, approved, rejected
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [formData, setFormData] = useState({
    type: 'CASUAL_LEAVE',
    startDate: '',
    endDate: '',
    reason: '',
  });
  
  const { showSuccess, showError, showWarning } = useToast();
  const hrUser = JSON.parse(localStorage.getItem('hr_user') || 'null');
  const isHR = hrUser?.role === 'ADMIN' || hrUser?.role === 'HR' || hrUser?.role === 'MANAGER';

  useEffect(() => {
    fetchLeaves();
    fetchLeaveBalance();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const endpoint = isHR ? '/leaves' : '/leaves/my-leaves';
      const response = await api.get(endpoint);
      setLeaves(response.data.leaves || []);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
      showError('Failed to fetch leave records');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const response = await api.get('/leaves/balance');
      setLeaveBalance(response.data.balances);
    } catch (error) {
      console.log('Leave balance not available');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setProcessing(true);
      await api.post('/leaves', formData);
      showSuccess('Leave request submitted successfully! Awaiting approval.');
      setShowForm(false);
      setFormData({ type: 'CASUAL_LEAVE', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to apply leave');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async (leaveId) => {
    try {
      setProcessing(true);
      await api.put(`/leaves/${leaveId}/status`, { status: 'APPROVED' });
      showSuccess('Leave approved successfully! Employee will be notified.');
      setShowApprovalModal(false);
      setSelectedLeave(null);
      fetchLeaves();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to approve leave');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (leaveId) => {
    if (!rejectionReason.trim()) {
      showWarning('Please provide a reason for rejection');
      return;
    }
    try {
      setProcessing(true);
      await api.put(`/leaves/${leaveId}/status`, { 
        status: 'REJECTED',
        rejectedReason: rejectionReason 
      });
      showSuccess('Leave rejected. Employee will be notified.');
      setShowApprovalModal(false);
      setSelectedLeave(null);
      setRejectionReason('');
      fetchLeaves();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to reject leave');
    } finally {
      setProcessing(false);
    }
  };

  const openApprovalModal = (leave) => {
    setSelectedLeave(leave);
    setShowApprovalModal(true);
    setRejectionReason('');
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
      CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getLeaveTypeLabel = (type) => {
    const labels = {
      CASUAL_LEAVE: 'Casual Leave',
      SICK_LEAVE: 'Sick Leave',
      EARNED_LEAVE: 'Earned Leave',
      MATERNITY_LEAVE: 'Maternity Leave',
      PATERNITY_LEAVE: 'Paternity Leave',
      COMP_OFF: 'Compensatory Off',
      LOP: 'Loss of Pay',
    };
    return labels[type] || type;
  };

  const filteredLeaves = leaves.filter(leave => {
    if (activeTab === 'all') return true;
    return leave.status === activeTab.toUpperCase();
  });

  const pendingCount = leaves.filter(l => l.status === 'PENDING').length;

  return (
    <HRLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isHR ? "Leave Management" : "My Leaves"}</h1>
            <p className="text-gray-500">{isHR ? "Manage and approve employee leave requests" : "View and apply for leaves"}</p>
          </div>
        </div>
        {/* Leave Balance Card (for employees) */}
        {!isHR && leaveBalance && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Leave Balance</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(leaveBalance).map(([type, balance]) => (
                <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">{getLeaveTypeLabel(type)}</p>
                  <p className="text-xl font-bold text-accent-600">{balance.remaining}</p>
                  <p className="text-xs text-gray-400">of {balance.total}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats for HR */}
        {isHR && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-xl">⏳</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                <p className="text-sm text-gray-500">Pending Approval</p>
              </div>
            </div>
            <div className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {leaves.filter(l => l.status === 'APPROVED').length}
                </p>
                <p className="text-sm text-gray-500">Approved</p>
              </div>
            </div>
            <div className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-xl">❌</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {leaves.filter(l => l.status === 'REJECTED').length}
                </p>
                <p className="text-sm text-gray-500">Rejected</p>
              </div>
            </div>
            <div className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{leaves.length}</p>
                <p className="text-sm text-gray-500">Total Requests</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'approved', 'rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'bg-accent-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'pending' && pendingCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            {showForm ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Apply Leave
              </>
            )}
          </button>
        </div>

        {/* Apply Leave Form */}
        {showForm && (
          <div className="card p-6 border-2 border-accent-200 bg-accent-50/30">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Apply for Leave
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Leave Type</label>
                  <select
                    className="form-input"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="CASUAL_LEAVE">Casual Leave</option>
                    <option value="SICK_LEAVE">Sick Leave</option>
                    <option value="EARNED_LEAVE">Earned Leave</option>
                    <option value="MATERNITY_LEAVE">Maternity Leave</option>
                    <option value="PATERNITY_LEAVE">Paternity Leave</option>
                    <option value="COMP_OFF">Compensatory Off</option>
                    <option value="LOP">Loss of Pay</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="form-label">Reason for Leave</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Please provide a reason for your leave request..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="btn-primary"
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Leave Requests Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading leave records...</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {isHR && (
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Employee
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Days
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Reason
                    </th>
                    {isHR && (
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredLeaves.length > 0 ? (
                    filteredLeaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                        {isHR && (
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {leave.employee?.firstName} {leave.employee?.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{leave.employee?.employeeId}</p>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">
                            {getLeaveTypeLabel(leave.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div>
                            <p>{new Date(leave.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            <p className="text-gray-400">to</p>
                            <p>{new Date(leave.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">{leave.days}</span>
                          <span className="text-gray-500 text-sm"> day{leave.days > 1 ? 's' : ''}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(leave.status)}`}>
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="text-sm text-gray-600 truncate" title={leave.reason}>
                            {leave.reason || '-'}
                          </p>
                          {leave.rejectedReason && (
                            <p className="text-xs text-red-500 mt-1" title={leave.rejectedReason}>
                              Rejection: {leave.rejectedReason}
                            </p>
                          )}
                        </td>
                        {isHR && (
                          <td className="px-6 py-4">
                            {leave.status === 'PENDING' ? (
                              <button
                                onClick={() => openApprovalModal(leave)}
                                className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors text-sm font-medium"
                              >
                                Review
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm">—</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isHR ? 7 : 5} className="px-6 py-12 text-center">
                        <div className="text-5xl mb-4">📅</div>
                        <p className="text-gray-500">No {activeTab !== 'all' ? activeTab : ''} leave requests found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedLeave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Review Leave Request</h3>
              <p className="text-gray-500 mt-1">Approve or reject this leave application</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Employee Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center text-accent-600 font-bold text-lg">
                    {selectedLeave.employee?.firstName?.charAt(0)}{selectedLeave.employee?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedLeave.employee?.firstName} {selectedLeave.employee?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedLeave.employee?.designation || 'Employee'} • {selectedLeave.employee?.employeeId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Leave Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Leave Type</p>
                  <p className="font-medium text-gray-900">{getLeaveTypeLabel(selectedLeave.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">{selectedLeave.days} day{selectedLeave.days > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">From</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedLeave.startDate).toLocaleDateString('en-IN', { 
                      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">To</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedLeave.endDate).toLocaleDateString('en-IN', { 
                      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Reason</p>
                <p className="text-gray-900 bg-gray-50 rounded-lg p-3">
                  {selectedLeave.reason || 'No reason provided'}
                </p>
              </div>

              {/* Rejection Reason Input */}
              <div>
                <label className="form-label">Rejection Reason (required if rejecting)</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Provide a reason if you're rejecting this request..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedLeave(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedLeave.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                disabled={processing}
              >
                {processing ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                Reject
              </button>
              <button
                onClick={() => handleApprove(selectedLeave.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                disabled={processing}
              >
                {processing ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </HRLayout>
  );
};

export default Leaves;
