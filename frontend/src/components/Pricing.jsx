import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [employeeCount, setEmployeeCount] = useState(25);
  const [billingPeriod, setBillingPeriod] = useState('MONTHLY');
  const [selectedAddOns, setSelectedAddOns] = useState({});
  const [addOnQuantities, setAddOnQuantities] = useState({});
  const [priceCalculation, setPriceCalculation] = useState(null);
  const [validation, setValidation] = useState({ valid: true });
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  // Fetch plans and add-ons
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, addOnsRes] = await Promise.all([
          api.get('/pricing/plans'),
          api.get('/pricing/add-ons'),
        ]);

        setPlans(plansRes.data.data || []);
        setAddOns(addOnsRes.data.data || []);

        // Auto-select Professional plan (Most Popular)
        const professionalPlan = plansRes.data.data?.find(p => p.isPopular || p.type === 'PROFESSIONAL');
        if (professionalPlan) {
          setSelectedPlan(professionalPlan.id);
        }
      } catch (error) {
        console.error('Failed to fetch pricing data:', error);
        // Set default plans if API fails
        setPlans([
          {
            id: 'starter',
            type: 'STARTER',
            name: 'Starter',
            pricePerEmployee: 49,
            setupFee: 2999,
            isPopular: false,
          },
          {
            id: 'professional',
            type: 'PROFESSIONAL',
            name: 'Professional',
            pricePerEmployee: 99,
            setupFee: 4999,
            isPopular: true,
          },
          {
            id: 'enterprise',
            type: 'ENTERPRISE',
            name: 'Enterprise',
            pricePerEmployee: 149,
            setupFee: 0,
            isPopular: false,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate price when selections change
  useEffect(() => {
    if (selectedPlan && employeeCount > 0) {
      calculatePrice();
    }
  }, [selectedPlan, employeeCount, billingPeriod, selectedAddOns, addOnQuantities]);

  // Validate plan selection
  useEffect(() => {
    if (selectedPlan && employeeCount > 0) {
      validatePlan();
    }
  }, [selectedPlan, employeeCount]);

  const validatePlan = async () => {
    try {
      const res = await api.post('/pricing/validate', {
        planId: selectedPlan,
        employeeCount,
      });
      setValidation(res.data.data);
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  const calculatePrice = async () => {
    if (!selectedPlan) return;

    setCalculating(true);
    try {
      const addOnIds = Object.keys(selectedAddOns).filter(id => selectedAddOns[id]);
      
      const res = await api.post('/pricing/calculate', {
        planId: selectedPlan,
        employeeCount,
        billingPeriod,
        addOnIds,
        addOnQuantities,
        isFirstInvoice: true,
      });

      setPriceCalculation(res.data.data);
    } catch (error) {
      console.error('Price calculation error:', error);
      // Calculate locally if API fails
      const plan = plans.find(p => p.id === selectedPlan);
      if (plan) {
        const basePrice = plan.pricePerEmployee * employeeCount;
        const discount = billingPeriod === 'YEARLY' ? basePrice * 0.1 : 0;
        const total = basePrice - discount + (plan.setupFee || 0);
        setPriceCalculation({
          total,
          breakdown: {
            plan: { name: plan.name, total: basePrice },
            setupFee: plan.setupFee || 0,
            discount: { amount: discount },
          },
        });
      }
    } finally {
      setCalculating(false);
    }
  };

  const handleAddOnToggle = (addOnId) => {
    setSelectedAddOns(prev => ({
      ...prev,
      [addOnId]: !prev[addOnId],
    }));
  };

  const handleAddOnQuantityChange = (addOnId, quantity) => {
    setAddOnQuantities(prev => ({
      ...prev,
      [addOnId]: Math.max(1, parseInt(quantity) || 1),
    }));
  };

  const getPlanFeatures = (plan) => {
    if (plan.type === 'STARTER') {
      return [
        'Employee Management',
        'Attendance Tracking',
        'Leave Management',
        'Holiday Calendar',
        'Basic Reports',
        '❌ Payroll (Not included)',
      ];
    } else if (plan.type === 'PROFESSIONAL') {
      return [
        'Everything in Starter',
        '✅ Payroll Processing',
        'Statutory Compliance (PF, ESI, PT)',
        'Payslip Generation',
        'Role-based Access Control',
        'CSV / PDF Reports',
      ];
    } else if (plan.type === 'ENTERPRISE') {
      return [
        'Everything in Professional',
        'Recruitment & Onboarding',
        'Performance Management',
        'Expense & Reimbursement',
        'Advanced Analytics & Insights',
        'Priority 24/7 Support',
      ];
    }
    return plan.features || [];
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              Choose the perfect plan for your organization. All plans include a 14-day free trial.
            </p>

            {/* Billing Period Toggle */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className={`text-lg font-medium transition-colors ${billingPeriod === 'MONTHLY' ? 'text-white' : 'text-gray-400'}`}>
                Monthly
              </span>
              <label className="relative inline-flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={billingPeriod === 'YEARLY'}
                  onChange={(e) => setBillingPeriod(e.target.checked ? 'YEARLY' : 'MONTHLY')}
                  className="sr-only peer"
                />
                <div className="w-16 h-8 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-accent-600 shadow-lg"></div>
              </label>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-medium transition-colors ${billingPeriod === 'YEARLY' ? 'text-white' : 'text-gray-400'}`}>
                  Yearly
                </span>
                <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full font-semibold shadow-md">
                  Save 10%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Employee Count Slider */}
        <section className="py-8 bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-gradient-to-r from-slate-50 to-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <label className="text-lg md:text-xl font-bold text-gray-800">
                  Number of Employees: <span className="text-accent-600 text-2xl">{employeeCount}</span>
                </label>
                <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                  {employeeCount} × {plans.find(p => p.id === selectedPlan)?.pricePerEmployee || 99} = {formatPrice((plans.find(p => p.id === selectedPlan)?.pricePerEmployee || 99) * employeeCount)}
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="500"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-600 hover:accent-accent-700 transition-all"
                style={{
                  background: `linear-gradient(to right, rgb(99 102 241) 0%, rgb(99 102 241) ${(employeeCount / 500) * 100}%, rgb(229 231 235) ${(employeeCount / 500) * 100}%, rgb(229 231 235) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>1 employee</span>
                <span>500+ employees</span>
              </div>
              
              {/* Validation Messages */}
              {!validation.valid && (
                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <p className="text-red-800 font-semibold flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    {validation.error}
                  </p>
                </div>
              )}
              {validation.valid && validation.warning && (
                <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
                  <p className="text-yellow-800 flex items-center gap-2">
                    <span className="text-xl">ℹ️</span>
                    {validation.warning}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
              {plans.map((plan, index) => {
                const isSelected = selectedPlan === plan.id;
                const isPopular = plan.isPopular || plan.type === 'PROFESSIONAL';
                const monthlyPrice = plan.pricePerEmployee * employeeCount;
                const yearlyMonthlyPrice = (monthlyPrice * 12 * 0.9) / 12;
                const displayPrice = billingPeriod === 'MONTHLY' 
                  ? plan.pricePerEmployee 
                  : (plan.pricePerEmployee * 12 * 0.9) / 12;

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl p-8 border-2 transition-all duration-300 transform hover:scale-105 ${
                      isSelected
                        ? 'border-accent-500 shadow-2xl scale-105 bg-white'
                        : isPopular
                        ? 'border-accent-300 shadow-xl bg-white hover:border-accent-400'
                        : 'border-gray-200 shadow-lg bg-white hover:border-gray-300'
                    } ${isPopular ? 'lg:-mt-4 lg:mb-4' : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="inline-block px-4 py-2 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-full text-sm font-bold shadow-lg">
                          MOST POPULAR
                        </span>
                      </div>
                    )}

                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-accent-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-8">
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                      <div className="mb-2">
                        <span className="text-5xl md:text-6xl font-bold text-gray-900">
                          {formatPrice(displayPrice)}
                        </span>
                        <span className="text-xl text-gray-600 ml-1">/employee</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {billingPeriod === 'MONTHLY' ? 'per month' : 'per month (billed yearly)'}
                      </p>
                      {plan.setupFee > 0 && (
                        <p className="text-sm text-gray-500">
                          + {formatPrice(plan.setupFee)} setup fee
                        </p>
                      )}
                      {plan.setupFee === 0 && plan.type === 'ENTERPRISE' && (
                        <p className="text-sm text-accent-600 font-semibold">
                          Custom pricing available
                        </p>
                      )}
                    </div>

                    <ul className="space-y-4 mb-8 min-h-[280px]">
                      {getPlanFeatures(plan).map((feature, idx) => (
                        <li key={idx} className="flex items-start text-gray-700">
                          <span className={`mr-3 mt-0.5 flex-shrink-0 text-xl ${feature.startsWith('❌') ? 'text-red-500' : 'text-green-600'}`}>
                            {feature.startsWith('❌') ? '✕' : '✓'}
                          </span>
                          <span className={`text-sm md:text-base ${feature.startsWith('❌') ? 'text-gray-500 line-through' : ''}`}>
                            {feature.replace('❌', '').replace('✅', '')}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl ${
                        isSelected
                          ? 'bg-gradient-to-r from-accent-600 to-accent-700 text-white hover:from-accent-700 hover:to-accent-800'
                          : isPopular
                          ? 'bg-gradient-to-r from-accent-600 to-accent-700 text-white hover:from-accent-700 hover:to-accent-800'
                          : 'bg-slate-800 text-white hover:bg-slate-900'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlan(plan.id);
                      }}
                    >
                      {plan.type === 'ENTERPRISE' ? 'Get Custom Quote' : isSelected ? 'Selected ✓' : 'Select Plan'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Add-Ons Section */}
        {selectedPlan && addOns.length > 0 && (
          <section className="py-12 bg-white border-t border-gray-200">
            <div className="container mx-auto px-4 max-w-5xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Enhance Your Plan</h2>
                <p className="text-gray-600">Add powerful features to customize your experience</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {addOns.map((addOn) => {
                  const isSelected = selectedAddOns[addOn.id];
                  const quantity = addOnQuantities[addOn.id] || 1;

                  return (
                    <div
                      key={addOn.id}
                      className={`bg-white rounded-xl p-6 border-2 transition-all duration-300 ${
                        isSelected 
                          ? 'border-accent-500 bg-accent-50 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1 text-lg">{addOn.name}</h3>
                          <p className="text-sm text-gray-600">{addOn.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleAddOnToggle(addOn.id)}
                            className="sr-only peer"
                          />
                          <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(addOn.price)}
                          </span>
                          {addOn.unit && (
                            <span className="text-sm text-gray-600 ml-1">/{addOn.unit}</span>
                          )}
                        </div>

                        {isSelected && addOn.priceType === 'PER_UNIT' && (
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-600">Qty:</label>
                            <input
                              type="number"
                              min="1"
                              value={quantity}
                              onChange={(e) => handleAddOnQuantityChange(addOn.id, e.target.value)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Price Summary */}
        {priceCalculation && selectedPlan && (
          <section className="py-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="bg-white rounded-2xl p-8 md:p-10 shadow-2xl">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Price Summary</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-lg text-gray-700">Plan ({priceCalculation.breakdown?.plan?.name || plans.find(p => p.id === selectedPlan)?.name}):</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(priceCalculation.breakdown?.plan?.total || (plans.find(p => p.id === selectedPlan)?.pricePerEmployee || 0) * employeeCount)}
                      {billingPeriod === 'YEARLY' && <span className="text-sm font-normal text-gray-600"> / month</span>}
                    </span>
                  </div>

                  {priceCalculation.breakdown?.addOns?.length > 0 && (
                    <div className="py-3 border-b border-gray-200">
                      <div className="text-sm text-gray-600 mb-2 font-semibold">Add-Ons:</div>
                      {priceCalculation.breakdown.addOns.map((addOn, idx) => (
                        <div key={idx} className="flex justify-between text-sm ml-4 mb-2 text-gray-700">
                          <span>{addOn.name} {addOn.quantity && `(×${addOn.quantity})`}</span>
                          <span className="font-semibold">{formatPrice(addOn.total)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 font-semibold">
                        <span>Add-Ons Total:</span>
                        <span>{formatPrice(priceCalculation.addOnsTotal)}</span>
                      </div>
                    </div>
                  )}

                  {priceCalculation.breakdown?.setupFee > 0 && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-lg text-gray-700">Setup Fee (one-time):</span>
                      <span className="text-xl font-bold text-gray-900">{formatPrice(priceCalculation.breakdown.setupFee)}</span>
                    </div>
                  )}

                  {priceCalculation.breakdown?.discount?.amount > 0 && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-lg text-green-600 font-semibold">Yearly Discount (10%):</span>
                      <span className="text-xl font-bold text-green-600">-{formatPrice(priceCalculation.breakdown.discount.amount)}</span>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-r from-accent-50 to-accent-100 rounded-xl p-6 mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xl font-semibold text-gray-800">
                      {billingPeriod === 'MONTHLY' ? 'Monthly Total:' : 'Monthly (billed yearly):'}
                    </span>
                    <span className="text-3xl font-bold text-accent-600">
                      {formatPrice(priceCalculation.total)}
                    </span>
                  </div>
                  {billingPeriod === 'YEARLY' && (
                    <div className="flex justify-between items-center pt-2 border-t border-accent-200">
                      <span className="text-lg text-gray-700">Yearly Total:</span>
                      <span className="text-2xl font-bold text-gray-900">{formatPrice(priceCalculation.total * 12)}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/hr/company-onboarding"
                    className="flex-1 text-center px-6 py-4 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-xl font-bold text-lg hover:from-accent-700 hover:to-accent-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Get Started Now
                  </Link>
                  {plans.find(p => p.id === selectedPlan)?.type === 'ENTERPRISE' && (
                    <Link
                      to="/contact"
                      className="flex-1 text-center px-6 py-4 bg-white border-2 border-accent-600 text-accent-600 rounded-xl font-bold text-lg hover:bg-accent-50 transition-all"
                    >
                      Contact Sales
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Pricing;
