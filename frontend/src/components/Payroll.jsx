import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import HRLayout from './HRLayout';

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const response = await api.get('/payroll/my-payrolls');
      setPayrolls(response.data.payrolls || []);
    } catch (error) {
      console.error('Failed to fetch payrolls:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HRLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
            <p className="text-gray-500">View your payroll information</p>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payroll...</p>
          </div>
        ) : payrolls.length > 0 ? (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Base Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Allowances</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Deductions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Tax</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Net Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payrolls.map((payroll) => (
                  <tr key={payroll.id}>
                    <td className="px-6 py-4 text-sm">
                      {payroll.month}/{payroll.year}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      ${payroll.baseSalary?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      ${payroll.allowances?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      ${payroll.deductions?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      ${payroll.tax?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      ${payroll.netSalary?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payroll.status === 'PAID' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payroll.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-600">No payroll records found</p>
          </div>
        )}
      </div>
    </HRLayout>
  );
};

export default Payroll;

