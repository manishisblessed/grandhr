import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'companies', label: 'Companies' },
  { key: 'users', label: 'Users' },
  { key: 'subscriptions', label: 'Subscriptions' },
  { key: 'documents', label: 'Documents' },
  { key: 'activity', label: 'Activity Logs' },
  { key: 'settings', label: 'Settings' },
];

const ROLE_OPTIONS = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'];

const icons = {
  overview: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  companies: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  ),
  users: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  subscriptions: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  ),
  documents: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  activity: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  settings: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  signout: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  ),
  chevronLeft: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  ),
  chevronRight: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  ),
  search: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  close: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  refresh: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183" />
    </svg>
  ),
};

// ─── Toast Component ──────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`fixed top-6 right-6 z-[100] ${bg} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition">
        {icons.close}
      </button>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────
function StatusBadge({ active, label }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-red-400'}`} />
      {label || (active ? 'Active' : 'Inactive')}
    </span>
  );
}

// ─── Pagination ───────────────────────────────────────────────
function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-6 px-1">
      <span className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {icons.chevronLeft} Prev
        </button>
        {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
          let pageNum;
          if (totalPages <= 7) {
            pageNum = i + 1;
          } else if (page <= 4) {
            pageNum = i + 1;
          } else if (page >= totalPages - 3) {
            pageNum = totalPages - 6 + i;
          } else {
            pageNum = page - 3 + i;
          }
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 text-sm font-medium rounded-lg transition ${pageNum === page ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Next {icons.chevronRight}
        </button>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[85vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600">
            {icons.close}
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const hrUser = JSON.parse(localStorage.getItem('hr_user') || 'null');

  // ── Auth guard ────────────────────────────────────────────
  useEffect(() => {
    if (!hrUser || hrUser.role !== 'SUPER_ADMIN') {
      navigate('/hr-login', { replace: true });
    }
  }, []);

  // ── State ─────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Overview
  const [dashboardData, setDashboardData] = useState(null);

  // Companies
  const [companies, setCompanies] = useState([]);
  const [companiesPage, setCompaniesPage] = useState(1);
  const [companiesTotalPages, setCompaniesTotalPages] = useState(1);
  const [companiesSearch, setCompaniesSearch] = useState('');
  const [companiesStatus, setCompaniesStatus] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyDetailModal, setCompanyDetailModal] = useState(false);
  const [companyDetailLoading, setCompanyDetailLoading] = useState(false);

  // Users
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersRole, setUsersRole] = useState('');

  // Subscriptions
  const [subscriptions, setSubscriptions] = useState([]);
  const [subsPlanFilter, setSubsPlanFilter] = useState('');
  const [subsStatusFilter, setSubsStatusFilter] = useState('');

  // Documents
  const [documents, setDocuments] = useState([]);
  const [docsTypeFilter, setDocsTypeFilter] = useState('');

  // Activity
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotalPages, setActivityTotalPages] = useState(1);
  const [activityActionFilter, setActivityActionFilter] = useState('');

  // ── Toasts helper ─────────────────────────────────────────
  const showToast = (message, type = 'success') => setToast({ message, type });

  // ── Data fetching ─────────────────────────────────────────
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/super-admin/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async (page = companiesPage, search = companiesSearch, status = companiesStatus) => {
    setLoading(true);
    try {
      const res = await api.get('/super-admin/companies', { params: { page, limit: 10, search, status } });
      setCompanies(res.data.companies || res.data.data || []);
      setCompaniesTotalPages(res.data.totalPages || res.data.pages || 1);
      setCompaniesPage(res.data.currentPage || page);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load companies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyDetail = async (id) => {
    setCompanyDetailLoading(true);
    try {
      const res = await api.get(`/super-admin/companies/${id}`);
      setSelectedCompany(res.data.company || res.data);
      setCompanyDetailModal(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load company details', 'error');
    } finally {
      setCompanyDetailLoading(false);
    }
  };

  const toggleCompany = async (id) => {
    try {
      await api.put(`/super-admin/companies/${id}/toggle`);
      showToast('Company status updated');
      fetchCompanies();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to toggle company', 'error');
    }
  };

  const deleteCompany = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/super-admin/companies/${id}`);
      showToast('Company deleted successfully');
      fetchCompanies();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete company', 'error');
    }
  };

  const fetchUsers = async (page = usersPage, search = usersSearch, role = usersRole) => {
    setLoading(true);
    try {
      const res = await api.get('/super-admin/users', { params: { page, limit: 10, search, role } });
      setUsers(res.data.users || res.data.data || []);
      setUsersTotalPages(res.data.totalPages || res.data.pages || 1);
      setUsersPage(res.data.currentPage || page);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = async (id) => {
    try {
      await api.put(`/super-admin/users/${id}/toggle`);
      showToast('User status updated');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to toggle user', 'error');
    }
  };

  const changeUserRole = async (id, role) => {
    try {
      await api.put(`/super-admin/users/${id}/role`, { role });
      showToast(`Role changed to ${role}`);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change role', 'error');
    }
  };

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/super-admin/subscriptions');
      setSubscriptions(res.data.subscriptions || res.data.data || res.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/super-admin/documents');
      setDocuments(res.data.documents || res.data.data || res.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async (page = activityPage, action = activityActionFilter) => {
    setLoading(true);
    try {
      const res = await api.get('/super-admin/activity-logs', { params: { page, limit: 20, action } });
      setActivityLogs(res.data.logs || res.data.data || res.data || []);
      setActivityTotalPages(res.data.totalPages || res.data.pages || 1);
      setActivityPage(res.data.currentPage || page);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load activity logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Tab change → fetch data ───────────────────────────────
  useEffect(() => {
    if (!hrUser || hrUser.role !== 'SUPER_ADMIN') return;
    switch (activeTab) {
      case 'overview': fetchDashboard(); break;
      case 'companies': fetchCompanies(1); break;
      case 'users': fetchUsers(1); break;
      case 'subscriptions': fetchSubscriptions(); break;
      case 'documents': fetchDocuments(); break;
      case 'activity': fetchActivityLogs(1); break;
      default: break;
    }
  }, [activeTab]);

  const handleSignOut = () => {
    localStorage.removeItem('hr_token');
    localStorage.removeItem('hr_user');
    navigate('/hr-login', { replace: true });
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDateTime = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (!hrUser || hrUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Unauthorized Access</h2>
          <p className="text-gray-500">You must be a Super Admin to view this page.</p>
          <button onClick={() => navigate('/hr-login')} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  //  TAB VIEWS
  // ════════════════════════════════════════════════════════════

  // ── Overview ──────────────────────────────────────────────
  const renderOverview = () => {
    const stats = dashboardData?.stats || dashboardData || {};
    const recentCompanies = dashboardData?.recentCompanies || [];
    const recentActivity = dashboardData?.recentActivity || [];

    if (loading && !dashboardData) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
          <TableSkeleton />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Total Companies</span>
              <span className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                {icons.companies}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalCompanies ?? 0}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{stats.activeCompanies ?? 0} active</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />{stats.inactiveCompanies ?? 0} inactive</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Total Users</span>
              <span className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                {icons.users}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers ?? 0}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
              {stats.roleBreakdown ? Object.entries(stats.roleBreakdown).map(([role, count]) => (
                <span key={role} className="flex items-center gap-1">{count} {role.toLowerCase().replace('_', ' ')}</span>
              )) : <span>—</span>}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Total Employees</span>
              <span className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalEmployees ?? 0}</p>
            <p className="text-xs text-gray-500 mt-2">Across all companies</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Revenue</span>
              <span className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${stats.revenue?.toLocaleString?.() ?? stats.monthlyRevenue?.toLocaleString?.() ?? '0'}
            </p>
            <p className="text-xs text-gray-500 mt-2">{stats.activeSubscriptions ?? 0} active subscriptions</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setActiveTab('companies')} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition">
              View All Companies
            </button>
            <button onClick={() => setActiveTab('users')} className="px-4 py-2 bg-violet-50 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-100 transition">
              Manage Users
            </button>
            <button onClick={() => setActiveTab('subscriptions')} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition">
              Subscriptions
            </button>
            <button onClick={() => setActiveTab('activity')} className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition">
              Activity Logs
            </button>
            <button onClick={() => { fetchDashboard(); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition inline-flex items-center gap-1.5">
              {icons.refresh} Refresh Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent Companies */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Recent Companies</h3>
              <button onClick={() => setActiveTab('companies')} className="text-xs text-indigo-600 font-medium hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Company</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentCompanies.length > 0 ? recentCompanies.slice(0, 10).map((c) => (
                    <tr key={c._id || c.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-3 font-medium text-gray-800">{c.companyName || c.name}</td>
                      <td className="px-6 py-3"><StatusBadge active={c.isActive !== false} /></td>
                      <td className="px-6 py-3 text-gray-500">{formatDate(c.createdAt)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400">No companies yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Recent Activity</h3>
              <button onClick={() => setActiveTab('activity')} className="text-xs text-indigo-600 font-medium hover:underline">View All</button>
            </div>
            <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
              {recentActivity.length > 0 ? recentActivity.slice(0, 20).map((a, i) => (
                <div key={a._id || i} className="px-6 py-3 flex items-start gap-3 hover:bg-gray-50/50 transition">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-indigo-600 text-xs font-bold">{(a.user?.name || a.userName || '?')[0]?.toUpperCase()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-800 truncate">
                      <span className="font-medium">{a.user?.name || a.userName || 'System'}</span>{' '}
                      <span className="text-gray-500">{a.action || a.description}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(a.createdAt || a.timestamp)}</p>
                  </div>
                </div>
              )) : (
                <div className="px-6 py-8 text-center text-gray-400">No recent activity</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Companies ─────────────────────────────────────────────
  const renderCompanies = () => {
    return (
      <div className="space-y-5">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icons.search}</span>
              <input
                type="text"
                placeholder="Search companies..."
                value={companiesSearch}
                onChange={(e) => setCompaniesSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchCompanies(1, companiesSearch, companiesStatus)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
              />
            </div>
            <select
              value={companiesStatus}
              onChange={(e) => { setCompaniesStatus(e.target.value); fetchCompanies(1, companiesSearch, e.target.value); }}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={() => fetchCompanies(1, companiesSearch, companiesStatus)}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6"><TableSkeleton rows={6} cols={7} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Company Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Employees</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Subscription</th>
                    <th className="px-6 py-3">Created</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {companies.length > 0 ? companies.map((c) => (
                    <tr key={c._id || c.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4 font-medium text-gray-800">{c.companyName || c.name}</td>
                      <td className="px-6 py-4 text-gray-500">{c.email || c.companyEmail || '—'}</td>
                      <td className="px-6 py-4 text-gray-600">{c.employeeCount ?? c.totalEmployees ?? '—'}</td>
                      <td className="px-6 py-4"><StatusBadge active={c.isActive !== false} /></td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {c.subscription?.plan || c.plan || 'Free'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(c.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleCompany(c._id || c.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${c.isActive !== false ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                          >
                            {c.isActive !== false ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => fetchCompanyDetail(c._id || c.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                          >
                            View
                          </button>
                          <button
                            onClick={() => deleteCompany(c._id || c.id, c.companyName || c.name)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No companies found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Pagination page={companiesPage} totalPages={companiesTotalPages} onPageChange={(p) => fetchCompanies(p)} />

        {/* Company Detail Modal */}
        <Modal open={companyDetailModal} onClose={() => setCompanyDetailModal(false)} title="Company Details" wide>
          {companyDetailLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-52" />
            </div>
          ) : selectedCompany ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ['Company Name', selectedCompany.companyName || selectedCompany.name],
                  ['Email', selectedCompany.email || selectedCompany.companyEmail],
                  ['Phone', selectedCompany.phone || selectedCompany.companyPhone],
                  ['Industry', selectedCompany.industry],
                  ['Address', selectedCompany.address],
                  ['Status', selectedCompany.isActive !== false ? 'Active' : 'Inactive'],
                  ['Employees', selectedCompany.employeeCount ?? selectedCompany.totalEmployees],
                  ['Subscription', selectedCompany.subscription?.plan || selectedCompany.plan || 'Free'],
                  ['Created', formatDate(selectedCompany.createdAt)],
                  ['Last Updated', formatDate(selectedCompany.updatedAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
                    <p className="mt-1 text-sm text-gray-800">{value || '—'}</p>
                  </div>
                ))}
              </div>
              {selectedCompany.admins && selectedCompany.admins.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Company Admins</h4>
                  <div className="space-y-2">
                    {selectedCompany.admins.map((admin, i) => (
                      <div key={admin._id || i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                          {(admin.name || 'A')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{admin.name}</p>
                          <p className="text-xs text-gray-500">{admin.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </Modal>
      </div>
    );
  };

  // ── Users ─────────────────────────────────────────────────
  const renderUsers = () => {
    return (
      <div className="space-y-5">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icons.search}</span>
              <input
                type="text"
                placeholder="Search users..."
                value={usersSearch}
                onChange={(e) => setUsersSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers(1, usersSearch, usersRole)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
              />
            </div>
            <select
              value={usersRole}
              onChange={(e) => { setUsersRole(e.target.value); fetchUsers(1, usersSearch, e.target.value); }}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
            >
              <option value="">All Roles</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r.replace('_', ' ')}</option>
              ))}
            </select>
            <button
              onClick={() => fetchUsers(1, usersSearch, usersRole)}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6"><TableSkeleton rows={6} cols={7} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Company</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Last Login</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.length > 0 ? users.map((u) => (
                    <tr key={u._id || u.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {(u.name || 'U')[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{u.email}</td>
                      <td className="px-6 py-4 text-gray-600">{u.company?.companyName || u.companyName || '—'}</td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => changeUserRole(u._id || u.id, e.target.value)}
                          className="px-2 py-1 border border-gray-200 rounded-md text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>{r.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4"><StatusBadge active={u.isActive !== false} /></td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{formatDateTime(u.lastLogin)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleUser(u._id || u.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${u.isActive !== false ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                          >
                            {u.isActive !== false ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Pagination page={usersPage} totalPages={usersTotalPages} onPageChange={(p) => fetchUsers(p)} />
      </div>
    );
  };

  // ── Subscriptions ─────────────────────────────────────────
  const renderSubscriptions = () => {
    const filteredSubs = subscriptions.filter((s) => {
      if (subsPlanFilter && (s.plan || s.subscription?.plan || '') !== subsPlanFilter) return false;
      if (subsStatusFilter && (s.status || '') !== subsStatusFilter) return false;
      return true;
    });

    const planTypes = [...new Set(subscriptions.map((s) => s.plan || s.subscription?.plan).filter(Boolean))];
    const statusTypes = [...new Set(subscriptions.map((s) => s.status).filter(Boolean))];

    return (
      <div className="space-y-5">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={subsPlanFilter}
              onChange={(e) => setSubsPlanFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
            >
              <option value="">All Plans</option>
              {planTypes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              value={subsStatusFilter}
              onChange={(e) => setSubsStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
            >
              <option value="">All Status</option>
              {statusTypes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6"><TableSkeleton rows={6} cols={6} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Company</th>
                    <th className="px-6 py-3">Plan</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Employees</th>
                    <th className="px-6 py-3">Monthly Total</th>
                    <th className="px-6 py-3">Start Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredSubs.length > 0 ? filteredSubs.map((s, i) => (
                    <tr key={s._id || i} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4 font-medium text-gray-800">{s.company?.companyName || s.companyName || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {s.plan || s.subscription?.plan || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          active={s.status === 'active' || s.status === 'Active'}
                          label={s.status || '—'}
                        />
                      </td>
                      <td className="px-6 py-4 text-gray-600">{s.employeeCount ?? s.employees ?? '—'}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">${s.monthlyTotal?.toLocaleString?.() ?? s.amount?.toLocaleString?.() ?? '0'}</td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(s.startDate || s.createdAt)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No subscriptions found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Documents ─────────────────────────────────────────────
  const renderDocuments = () => {
    const docTypes = [...new Set(documents.map((d) => d.documentType || d.type).filter(Boolean))];
    const filteredDocs = documents.filter((d) => {
      if (docsTypeFilter && (d.documentType || d.type) !== docsTypeFilter) return false;
      return true;
    });

    return (
      <div className="space-y-5">
        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex gap-3">
            <select
              value={docsTypeFilter}
              onChange={(e) => setDocsTypeFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
            >
              <option value="">All Document Types</option>
              {docTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6"><TableSkeleton rows={6} cols={5} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Document Type</th>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Company</th>
                    <th className="px-6 py-3">Employee</th>
                    <th className="px-6 py-3">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredDocs.length > 0 ? filteredDocs.map((d, i) => (
                    <tr key={d._id || i} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                          {d.documentType || d.type || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">{d.title || d.name || '—'}</td>
                      <td className="px-6 py-4 text-gray-600">{d.company?.companyName || d.companyName || '—'}</td>
                      <td className="px-6 py-4 text-gray-600">{d.employee?.name || d.employeeName || '—'}</td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(d.createdAt)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No documents found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Activity Logs ─────────────────────────────────────────
  const renderActivityLogs = () => {
    const actionTypes = [...new Set(activityLogs.map((a) => a.action).filter(Boolean))];

    return (
      <div className="space-y-5">
        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex gap-3">
            <select
              value={activityActionFilter}
              onChange={(e) => { setActivityActionFilter(e.target.value); fetchActivityLogs(1, e.target.value); }}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
            >
              <option value="">All Actions</option>
              {actionTypes.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6"><TableSkeleton rows={8} cols={5} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Action</th>
                    <th className="px-6 py-3">Entity</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activityLogs.length > 0 ? activityLogs.map((a, i) => (
                    <tr key={a._id || i} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                            {(a.user?.name || a.userName || '?')[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800 text-sm">{a.user?.name || a.userName || 'System'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                          {a.action || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{a.entity || a.entityType || '—'}</td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{a.description || a.details || '—'}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">{formatDateTime(a.createdAt || a.timestamp)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No activity logs found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Pagination page={activityPage} totalPages={activityTotalPages} onPageChange={(p) => fetchActivityLogs(p)} />
      </div>
    );
  };

  // ── Settings ──────────────────────────────────────────────
  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Settings</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
              <input
                type="text"
                defaultValue="GrandHR"
                className="w-full max-w-md px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input
                type="email"
                defaultValue="support@grandhr.com"
                className="w-full max-w-md px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Trial Period (days)</label>
              <input
                type="number"
                defaultValue={14}
                className="w-full max-w-md px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
              />
            </div>
          </div>
          <div className="mt-6">
            <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
              Save Settings
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold">
              {(hrUser?.name || 'S')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{hrUser?.name || 'Super Admin'}</p>
              <p className="text-sm text-gray-500">{hrUser?.email}</p>
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 mt-1">
                {hrUser?.role}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
          <p className="text-sm text-gray-500 mb-4">Irreversible actions. Proceed with extreme caution.</p>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition">
              Clear All Logs
            </button>
            <button className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition">
              Reset Platform Stats
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Tab content map ───────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'companies': return renderCompanies();
      case 'users': return renderUsers();
      case 'subscriptions': return renderSubscriptions();
      case 'documents': return renderDocuments();
      case 'activity': return renderActivityLogs();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  const tabTitle = TABS.find((t) => t.key === activeTab)?.label || 'Overview';

  // ════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside className="w-[260px] bg-slate-900 text-white flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="GrandHR" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-base font-bold tracking-tight"><span className="text-blue-400">Grand</span><span className="text-green-400">HR</span></h1>
              <p className="text-[11px] text-slate-400 font-medium">Super Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{icons[tab.key]}</span>
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {(hrUser?.name || 'S')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{hrUser?.name || 'Super Admin'}</p>
              <p className="text-[11px] text-slate-400 truncate">{hrUser?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition"
          >
            {icons.signout}
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ───────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{tabTitle}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {activeTab === 'overview' && 'Platform overview and key metrics'}
                {activeTab === 'companies' && 'Manage all registered companies'}
                {activeTab === 'users' && 'Manage all platform users'}
                {activeTab === 'subscriptions' && 'View all subscription details'}
                {activeTab === 'documents' && 'All generated documents across companies'}
                {activeTab === 'activity' && 'Platform-wide activity logs'}
                {activeTab === 'settings' && 'Configure platform settings'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <div className="w-px h-6 bg-gray-200" />
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Super Admin
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="px-8 py-6">
          {renderContent()}
        </div>
      </main>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Animation styles */}
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SuperAdminDashboard;
