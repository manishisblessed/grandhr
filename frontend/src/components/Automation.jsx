import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { api } from '../utils/api';

const Automation = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'AUTO_PAYROLL',
    schedule: '0 0 1 * *', // Monthly on 1st
    config: {},
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/automation');
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      alert('Failed to load automation jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await api.post('/automation', formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        type: 'AUTO_PAYROLL',
        schedule: '0 0 1 * *',
        config: {},
      });
      loadJobs();
      alert('Automation job created successfully!');
    } catch (error) {
      console.error('Error creating job:', error);
      alert(error.response?.data?.message || 'Failed to create automation job');
    }
  };

  const handleRunJob = async (jobId) => {
    if (!confirm('Are you sure you want to run this job now?')) return;

    try {
      const response = await api.post(`/automation/${jobId}/run`);
      alert(`Job executed successfully!\n\n${JSON.stringify(response.data.result, null, 2)}`);
      loadJobs();
    } catch (error) {
      console.error('Error running job:', error);
      alert(error.response?.data?.message || 'Failed to run job');
    }
  };

  const handleToggleJob = async (jobId, currentStatus) => {
    try {
      await api.patch(`/automation/${jobId}/toggle`, {
        isActive: !currentStatus,
      });
      loadJobs();
    } catch (error) {
      console.error('Error toggling job:', error);
      alert('Failed to update job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this automation job?')) return;

    try {
      await api.delete(`/automation/${jobId}`);
      loadJobs();
      alert('Job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    }
  };

  const formatNextRun = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      RUNNING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout title="Automation" description="Manage automated HR tasks">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white text-xl">Loading automation jobs...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Automation (Autobots)" description="Automate HR tasks and processes">
      <div className="w-full px-[1%]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">🤖 Automation Jobs</h1>
            <p className="text-gray-300">Automate repetitive HR tasks to save time and reduce errors</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <span>➕</span>
            <span>Create Automation</span>
          </button>
        </div>

        <div className="card shadow-xl">
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">No Automation Jobs</h3>
              <p className="text-gray-500 mb-4">Create your first automation job to get started</p>
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                Create Automation Job
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 font-semibold">Name</th>
                    <th className="text-left p-4 font-semibold">Type</th>
                    <th className="text-left p-4 font-semibold">Schedule</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Last Run</th>
                    <th className="text-left p-4 font-semibold">Next Run</th>
                    <th className="text-left p-4 font-semibold">Runs</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium">{job.name}</td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600">{job.type.replace('AUTO_', '').replace('_', ' ')}</span>
                      </td>
                      <td className="p-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{job.schedule}</code>
                      </td>
                      <td className="p-4">{getStatusBadge(job.status)}</td>
                      <td className="p-4 text-sm text-gray-600">
                        {job.lastRun ? formatNextRun(job.lastRun) : 'Never'}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {formatNextRun(job.nextRun)}
                      </td>
                      <td className="p-4 text-sm text-gray-600">{job.runCount || 0}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRunJob(job.id)}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                            title="Run Now"
                          >
                            ▶️
                          </button>
                          <button
                            onClick={() => handleToggleJob(job.id, job.isActive)}
                            className={`text-xs px-2 py-1 rounded ${
                              job.isActive
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            title={job.isActive ? 'Disable' : 'Enable'}
                          >
                            {job.isActive ? '⏸️' : '▶️'}
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create Automation Job</h2>
              <form onSubmit={handleCreateJob} className="space-y-4">
                <div>
                  <label className="form-label">Job Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Monthly Payroll Processing"
                  />
                </div>
                <div>
                  <label className="form-label">Job Type</label>
                  <select
                    className="form-input"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="AUTO_PAYROLL">Auto Payroll Processing</option>
                    <option value="AUTO_ATTENDANCE">Auto Attendance Marking</option>
                    <option value="AUTO_LEAVE_BALANCE">Auto Leave Balance Update</option>
                    <option value="AUTO_REMINDER">Auto Reminders</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Schedule (Cron Expression)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    required
                    placeholder="0 0 1 * * (Monthly on 1st)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Examples: "0 0 * * *" (daily), "0 0 1 * *" (monthly), "0 0 * * 0" (weekly)
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1">
                    Create Job
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

export default Automation;

