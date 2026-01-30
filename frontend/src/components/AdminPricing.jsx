import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const AdminPricing = () => {
  const [plans, setPlans] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editingAddOn, setEditingAddOn] = useState(null);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showAddOnForm, setShowAddOnForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, addOnsRes] = await Promise.all([
        api.get('/pricing/plans'),
        api.get('/pricing/add-ons'),
      ]);
      setPlans(plansRes.data.data || []);
      setAddOns(addOnsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch pricing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanToggle = async (planId, isActive) => {
    try {
      // This would require an update endpoint
      await api.patch(`/admin/pricing/plans/${planId}`, { isActive: !isActive });
      fetchData();
    } catch (error) {
      console.error('Failed to update plan:', error);
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Pricing Management</h1>
          <p className="text-gray-600">Manage plans, pricing, and add-ons</p>
        </div>

        {/* Plans Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Plans</h2>
            <button
              onClick={() => {
                setEditingPlan(null);
                setShowPlanForm(true);
              }}
              className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
            >
              + Add Plan
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price/Employee</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Setup Fee</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employee Range</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id} className="border-b border-gray-200">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">{plan.name}</div>
                      {plan.isPopular && (
                        <span className="text-xs bg-accent-100 text-accent-700 px-2 py-1 rounded">Popular</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{formatPrice(plan.pricePerEmployee)}</td>
                    <td className="px-4 py-3 text-gray-700">{formatPrice(plan.setupFee)}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {plan.minEmployees} - {plan.maxEmployees || '∞'}
                    </td>
                    <td className="px-4 py-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={plan.isActive}
                          onChange={() => handlePlanToggle(plan.id, plan.isActive)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setEditingPlan(plan);
                          setShowPlanForm(true);
                        }}
                        className="text-accent-600 hover:text-accent-700 font-semibold"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add-Ons Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Add-Ons</h2>
            <button
              onClick={() => {
                setEditingAddOn(null);
                setShowAddOnForm(true);
              }}
              className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
            >
              + Add Add-On
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {addOns.map((addOn) => (
              <div key={addOn.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{addOn.name}</h3>
                    <p className="text-sm text-gray-600">{addOn.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addOn.isActive}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                  </label>
                </div>
                <div className="mt-2">
                  <span className="text-lg font-bold text-gray-800">
                    {formatPrice(addOn.price)}
                  </span>
                  {addOn.unit && (
                    <span className="text-sm text-gray-600 ml-1">/{addOn.unit}</span>
                  )}
                  <span className="text-xs text-gray-500 ml-2">({addOn.priceType})</span>
                </div>
                <button
                  onClick={() => {
                    setEditingAddOn(addOn);
                    setShowAddOnForm(true);
                  }}
                  className="mt-3 text-accent-600 hover:text-accent-700 font-semibold text-sm"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPricing;

