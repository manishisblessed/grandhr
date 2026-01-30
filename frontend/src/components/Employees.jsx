import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import Layout from './Layout';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    department: '',
    designation: '',
    salary: '',
    role: 'EMPLOYEE',
  });

  const { showSuccess, showError, showWarning } = useToast();
  const hrUser = JSON.parse(localStorage.getItem('hr_user') || 'null');
  const isHR = hrUser?.role === 'ADMIN' || hrUser?.role === 'HR' || hrUser?.role === 'MANAGER';

  useEffect(() => {
    fetchEmployees();
  }, [search]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      if (isHR) {
        const params = search ? { search } : {};
        const response = await api.get('/employees', { params });
        setEmployees(response.data.employees || []);
      } else {
        // Employees see only their own profile
        const response = await api.get('/auth/profile');
        setEmployees(response.data.user?.employee ? [response.data.user.employee] : []);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      showError('Failed to fetch employee data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      department: '',
      designation: '',
      salary: '',
      role: 'EMPLOYEE',
    });
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      showWarning('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      showWarning('Password must be at least 6 characters');
      return;
    }

    try {
      setProcessing(true);
      const payload = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
      };
      
      await api.post('/employees', payload);
      showSuccess('Employee added successfully! Welcome email sent with login credentials.');
      setShowAddModal(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to add employee');
    } finally {
      setProcessing(false);
    }
  };

  const handleEditEmployee = async (e) => {
    e.preventDefault();
    
    if (!selectedEmployee) return;

    try {
      setProcessing(true);
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth || undefined,
        department: formData.department,
        designation: formData.designation,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
      };
      
      await api.put(`/employees/${selectedEmployee.id}`, payload);
      showSuccess('Employee updated successfully!');
      setShowEditModal(false);
      setSelectedEmployee(null);
      resetForm();
      fetchEmployees();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update employee');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/employees/${employeeId}`);
      showSuccess('Employee removed successfully');
      fetchEmployees();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete employee');
    }
  };

  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      email: employee.user?.email || '',
      password: '',
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      phone: employee.phone || '',
      dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
      department: employee.department || '',
      designation: employee.designation || '',
      salary: employee.salary?.toString() || '',
      role: employee.user?.role || 'EMPLOYEE',
    });
    setShowEditModal(true);
  };

  const departments = ['Engineering', 'Human Resources', 'Sales', 'Marketing', 'Finance', 'Operations', 'Customer Support', 'Design', 'Product'];
  const designations = ['Software Engineer', 'Senior Software Engineer', 'Tech Lead', 'Manager', 'HR Executive', 'HR Manager', 'Sales Executive', 'Marketing Executive', 'Analyst', 'Team Lead', 'Director', 'Vice President'];

  return (
    <Layout 
      title={isHR ? "Employees" : "My Profile"} 
      description={isHR ? "Manage your organization's workforce" : "View your employee profile"} 
      icon="👥"
    >
      <div className="space-y-6">
        {/* Stats for HR */}
        {isHR && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{employees.length}</p>
                <p className="text-sm text-gray-500">Total Employees</p>
              </div>
            </div>
            <div className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {employees.filter(e => e.employmentStatus === 'ACTIVE' || e.employmentStatus === 'CONFIRMED').length}
                </p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
            <div className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-xl">⏳</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {employees.filter(e => e.employmentStatus === 'PROBATION').length}
                </p>
                <p className="text-sm text-gray-500">On Probation</p>
              </div>
            </div>
            <div className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🏢</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(employees.map(e => e.department).filter(Boolean)).size}
                </p>
                <p className="text-sm text-gray-500">Departments</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        {isHR && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search employees by name, email, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-10 w-full"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Add Employee
            </button>
          </div>
        )}

        {!isHR && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <strong>Employee View:</strong> You can view your profile information here. Contact HR for any updates.
            </p>
          </div>
        )}

        {/* Employees Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading employees...</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Designation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    {isHR && (
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {employees.length > 0 ? (
                    employees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center text-accent-600 font-bold">
                              {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {employee.firstName} {employee.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{employee.employeeId || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{employee.user?.email || employee.email || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{employee.phone || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {employee.department || 'Not assigned'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {employee.designation || 'Not assigned'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            employee.employmentStatus === 'ACTIVE' || employee.employmentStatus === 'CONFIRMED'
                              ? 'bg-green-100 text-green-800'
                              : employee.employmentStatus === 'PROBATION'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {employee.employmentStatus || 'ACTIVE'}
                          </span>
                        </td>
                        {isHR && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditModal(employee)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(employee.id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isHR ? 6 : 5} className="px-6 py-12 text-center">
                        <div className="text-5xl mb-4">👥</div>
                        <p className="text-gray-500">No employees found</p>
                        {isHR && (
                          <button
                            onClick={() => setShowAddModal(true)}
                            className="mt-4 text-accent-600 hover:text-accent-700 font-medium"
                          >
                            + Add your first employee
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                Add New Employee
              </h3>
              <p className="text-gray-500 mt-1">
                Enter employee details. Login credentials will be sent via email.
              </p>
            </div>

            <form onSubmit={handleAddEmployee} className="p-6 space-y-6">
              {/* Account Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Account Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="employee@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Employment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Department</label>
                    <select
                      className="form-input"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Designation</label>
                    <select
                      className="form-input"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    >
                      <option value="">Select Designation</option>
                      {designations.map(desig => (
                        <option key={desig} value={desig}>{desig}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Monthly Salary (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="50000"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Role</label>
                    <select
                      className="form-input"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
                      <option value="HR">HR</option>
                      <option value="COMPANY_ADMIN">Company Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={processing}
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
                      Adding...
                    </span>
                  ) : (
                    'Add Employee'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">✏️</span>
                Edit Employee
              </h3>
              <p className="text-gray-500 mt-1">
                Update {selectedEmployee.firstName} {selectedEmployee.lastName}'s information
              </p>
            </div>

            <form onSubmit={handleEditEmployee} className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Employment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Department</label>
                    <select
                      className="form-input"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Designation</label>
                    <select
                      className="form-input"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    >
                      <option value="">Select Designation</option>
                      {designations.map(desig => (
                        <option key={desig} value={desig}>{desig}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Monthly Salary (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedEmployee(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={processing}
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
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Employees;
