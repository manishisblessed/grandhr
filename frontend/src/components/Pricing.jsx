import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';

const CURRENCIES = [
  { code: 'INR', symbol: '\u20b9', name: 'Indian Rupee', rate: 1, locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.012, locale: 'en-US' },
  { code: 'EUR', symbol: '\u20ac', name: 'Euro', rate: 0.011, locale: 'de-DE' },
  { code: 'GBP', symbol: '\u00a3', name: 'British Pound', rate: 0.0095, locale: 'en-GB' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rate: 0.044, locale: 'ar-AE' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 0.016, locale: 'en-SG' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 0.018, locale: 'en-AU' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 0.016, locale: 'en-CA' },
];

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    type: 'STARTER',
    basePrice: 100,
    setupFee: 0,
    icon: '🚀',
    tagline: 'Perfect for small teams',
    features: [
      { text: 'Employee Management', included: true },
      { text: 'Attendance Tracking', included: true },
      { text: 'Leave Management', included: true },
      { text: 'Holiday Calendar', included: true },
      { text: 'Basic Reports & Dashboards', included: true },
      { text: 'Email Support', included: true },
      { text: 'Payroll Processing', included: false },
      { text: 'Advanced Analytics', included: false },
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    type: 'PROFESSIONAL',
    basePrice: 149,
    setupFee: 0,
    isPopular: true,
    icon: '⭐',
    tagline: 'Best for growing companies',
    features: [
      { text: 'Everything in Starter', included: true },
      { text: 'Payroll Processing', included: true },
      { text: 'Statutory Compliance (PF, ESI, PT)', included: true },
      { text: 'Payslip Generation', included: true },
      { text: 'Role-based Access Control', included: true },
      { text: 'CSV / PDF Reports', included: true },
      { text: 'Document Generation', included: true },
      { text: 'Priority Email & Chat Support', included: true },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    type: 'ENTERPRISE',
    basePrice: 199,
    setupFee: 0,
    icon: '🏢',
    tagline: 'For large organizations',
    features: [
      { text: 'Everything in Professional', included: true },
      { text: 'Recruitment & Onboarding', included: true },
      { text: 'Performance Management', included: true },
      { text: 'Expense & Reimbursement', included: true },
      { text: 'Advanced Analytics & Insights', included: true },
      { text: 'Custom Integrations & API', included: true },
      { text: 'Dedicated Account Manager', included: true },
      { text: 'Priority 24/7 Phone Support', included: true },
    ],
  },
];

const YEARLY_DISCOUNT = 0.20;

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState('MONTHLY');
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [employeeCount, setEmployeeCount] = useState(25);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  const convertPrice = useCallback((inrAmount) => {
    const converted = inrAmount * currency.rate;
    if (currency.code === 'INR') return Math.round(converted);
    return Math.round(converted * 100) / 100;
  }, [currency]);

  const formatPrice = useCallback((amount) => {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.code === 'INR' ? 0 : 2,
      maximumFractionDigits: currency.code === 'INR' ? 0 : 2,
    }).format(amount);
  }, [currency]);

  const summary = useMemo(() => {
    const plan = PLANS.find(p => p.id === selectedPlan);
    if (!plan) return null;

    const perEmployee = convertPrice(plan.basePrice);
    const monthlyTotal = perEmployee * employeeCount;
    const yearlyMonthlyTotal = monthlyTotal * (1 - YEARLY_DISCOUNT);
    const yearlyTotal = yearlyMonthlyTotal * 12;
    const monthlyYearlyTotal = monthlyTotal * 12;
    const savings = monthlyYearlyTotal - yearlyTotal;

    const displayMonthly = billingPeriod === 'MONTHLY' ? monthlyTotal : yearlyMonthlyTotal;
    const displayYearly = billingPeriod === 'YEARLY' ? yearlyTotal : monthlyYearlyTotal;

    return {
      plan,
      perEmployee,
      monthlyTotal: displayMonthly,
      yearlyTotal: displayYearly,
      savings: billingPeriod === 'YEARLY' ? savings : 0,
      perEmployeeDisplay: billingPeriod === 'MONTHLY' ? perEmployee : perEmployee * (1 - YEARLY_DISCOUNT),
    };
  }, [selectedPlan, employeeCount, billingPeriod, convertPrice]);

  const loadRazorpay = () => {
    if (!summary) return;
    const amountInPaise = Math.round(summary.monthlyTotal * 100);
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_XXXXXXXX',
      amount: amountInPaise,
      currency: currency.code === 'INR' ? 'INR' : 'USD',
      name: 'GrandHR',
      description: `${summary.plan.name} Plan - ${employeeCount} employees (${billingPeriod === 'MONTHLY' ? 'Monthly' : 'Yearly'})`,
      image: '/logo.jpeg',
      handler: function (response) {
        alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
      },
      prefill: {
        name: '',
        email: '',
        contact: '',
      },
      theme: {
        color: '#4f46e5',
      },
      modal: {
        ondismiss: function () {},
      },
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <main>
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-accent-500 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-block px-4 py-1.5 bg-accent-600/20 border border-accent-500/30 rounded-full text-accent-300 text-sm font-semibold mb-6 animate-fade-in">
              14-day free trial on all plans
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-slide-up">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Choose the perfect plan for your organization. No hidden fees.
            </p>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <span className={`text-lg font-medium transition-colors ${billingPeriod === 'MONTHLY' ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={billingPeriod === 'YEARLY'}
                  onChange={(e) => setBillingPeriod(e.target.checked ? 'YEARLY' : 'MONTHLY')}
                  className="sr-only peer"
                />
                <div className="w-16 h-8 bg-gray-700 rounded-full peer peer-checked:bg-accent-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all shadow-lg" />
              </label>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-medium transition-colors ${billingPeriod === 'YEARLY' ? 'text-white' : 'text-gray-400'}`}>Yearly</span>
                <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full font-bold shadow-md animate-bounce-subtle">Save 20%</span>
              </div>
            </div>

            {/* Currency selector */}
            <div className="relative inline-block animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <button
                onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all text-sm font-medium"
              >
                <span className="text-lg">{currency.symbol}</span>
                <span>{currency.code}</span>
                <svg className={`w-4 h-4 transition-transform ${showCurrencyMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showCurrencyMenu && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 min-w-[220px] animate-scale-in">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setCurrency(c); setShowCurrencyMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-accent-50 transition-colors flex items-center gap-3 ${currency.code === c.code ? 'bg-accent-50 text-accent-700 font-semibold' : 'text-gray-700'}`}
                    >
                      <span className="text-lg w-8">{c.symbol}</span>
                      <span>{c.code} - {c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Employee slider */}
        <section className="py-8 bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-gradient-to-r from-slate-50 to-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <label className="text-lg md:text-xl font-bold text-gray-800">
                  Number of Employees: <span className="text-accent-600 text-2xl">{employeeCount}</span>
                </label>
                {summary && (
                  <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg font-medium">
                    {employeeCount} &times; {formatPrice(summary.perEmployeeDisplay)} = <span className="font-bold text-accent-700">{formatPrice(summary.monthlyTotal)}</span>/mo
                  </div>
                )}
              </div>
              <input
                type="range"
                min="1"
                max="500"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-accent-600"
                style={{
                  background: `linear-gradient(to right, rgb(99 102 241) 0%, rgb(99 102 241) ${(employeeCount / 500) * 100}%, rgb(229 231 235) ${(employeeCount / 500) * 100}%, rgb(229 231 235) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>1 employee</span>
                <span>100</span>
                <span>250</span>
                <span>500+</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
              {PLANS.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                const perEmp = convertPrice(plan.basePrice);
                const displayPerEmp = billingPeriod === 'YEARLY' ? perEmp * (1 - YEARLY_DISCOUNT) : perEmp;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative rounded-2xl p-8 border-2 cursor-pointer transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl ${
                      isSelected
                        ? 'border-accent-500 shadow-2xl scale-[1.02] bg-white ring-4 ring-accent-100'
                        : plan.isPopular
                        ? 'border-accent-300 shadow-xl bg-white hover:border-accent-400'
                        : 'border-gray-200 shadow-lg bg-white hover:border-gray-300'
                    } ${plan.isPopular ? 'lg:-mt-4 lg:mb-4' : ''}`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="inline-block px-5 py-2 bg-gradient-to-r from-accent-600 to-purple-600 text-white rounded-full text-sm font-bold shadow-lg animate-bounce-subtle">
                          MOST POPULAR
                        </span>
                      </div>
                    )}

                    {isSelected && (
                      <div className="absolute top-4 right-4 animate-scale-in">
                        <div className="w-7 h-7 bg-accent-600 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-8">
                      <div className="text-4xl mb-2">{plan.icon}</div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                      <p className="text-sm text-gray-500 mb-4">{plan.tagline}</p>
                      <div className="mb-2">
                        {billingPeriod === 'YEARLY' && (
                          <div className="text-lg text-gray-400 line-through mb-1">{formatPrice(perEmp)}</div>
                        )}
                        <span className="text-5xl md:text-6xl font-bold text-gray-900">
                          {formatPrice(displayPerEmp)}
                        </span>
                        <span className="text-xl text-gray-600 ml-1">/employee</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {billingPeriod === 'MONTHLY' ? 'per month' : 'per month, billed yearly'}
                      </p>
                    </div>

                    <ul className="space-y-3.5 mb-8 min-h-[280px]">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-gray-700">
                          <span className={`mr-3 mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${feature.included ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            {feature.included ? '✓' : '✕'}
                          </span>
                          <span className={`text-sm md:text-base ${!feature.included ? 'text-gray-400 line-through' : ''}`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${
                        isSelected
                          ? 'bg-gradient-to-r from-accent-600 to-purple-600 text-white'
                          : plan.isPopular
                          ? 'bg-gradient-to-r from-accent-600 to-accent-700 text-white hover:from-accent-700 hover:to-accent-800'
                          : 'bg-slate-800 text-white hover:bg-slate-900'
                      }`}
                      onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan.id); }}
                    >
                      {isSelected ? 'Selected ✓' : 'Select Plan'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Price Summary */}
        {summary && (
          <section className="py-12 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-10 right-10 w-64 h-64 bg-accent-400 rounded-full blur-3xl" />
            </div>
            <div className="container mx-auto px-4 max-w-4xl relative z-10">
              <div className="bg-white rounded-2xl p-8 md:p-10 shadow-2xl">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Price Summary</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-lg text-gray-700">
                      {summary.plan.name} Plan ({employeeCount} employees):
                    </span>
                    <span className="text-xl font-bold text-gray-900">{formatPrice(summary.monthlyTotal)}/mo</span>
                  </div>

                  {summary.savings > 0 && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-lg text-green-600 font-semibold">Yearly Discount (20%):</span>
                      <span className="text-xl font-bold text-green-600">-{formatPrice(summary.savings)}/yr</span>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-r from-accent-50 to-purple-50 rounded-xl p-6 mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xl font-semibold text-gray-800">
                      {billingPeriod === 'MONTHLY' ? 'Monthly Total:' : 'Monthly (billed yearly):'}
                    </span>
                    <span className="text-3xl font-bold text-accent-600">{formatPrice(summary.monthlyTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-accent-200">
                    <span className="text-lg text-gray-700">Annual Total:</span>
                    <span className="text-2xl font-bold text-gray-900">{formatPrice(summary.yearlyTotal)}</span>
                  </div>
                  <div className="text-right text-sm text-gray-500 mt-1">
                    Currency: {currency.code} ({currency.name})
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={loadRazorpay}
                    className="flex-1 text-center px-6 py-4 bg-gradient-to-r from-accent-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-accent-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Pay with Razorpay
                  </button>
                  <Link
                    to="/hr/company-onboarding"
                    className="flex-1 text-center px-6 py-4 bg-white border-2 border-accent-600 text-accent-600 rounded-xl font-bold text-lg hover:bg-accent-50 transition-all"
                  >
                    Start Free Trial
                  </Link>
                </div>

                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    Secured by Razorpay
                  </span>
                  <span>|</span>
                  <span>PCI-DSS Compliant</span>
                  <span>|</span>
                  <span>256-bit SSL</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Can I switch plans anytime?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.' },
                { q: 'Is there a free trial?', a: 'Yes! All plans include a 14-day free trial. No credit card required to start.' },
                { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, net banking, and digital wallets through Razorpay.' },
                { q: 'Can I pay in my local currency?', a: 'Yes! Use the currency selector at the top to see prices in your local currency. Payments are processed in INR or USD through Razorpay.' },
                { q: 'What happens if I need more than 500 employees?', a: 'Contact our sales team for custom enterprise pricing tailored to your organization\'s needs.' },
              ].map((faq, idx) => (
                <PricingFAQ key={idx} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const PricingFAQ = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:border-accent-300 hover:shadow-md">
      <button onClick={() => setOpen(!open)} className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors">
        <span className="font-semibold text-gray-800 text-lg">{question}</span>
        <svg className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-4 text-gray-600 leading-relaxed">{answer}</div>
      </div>
    </div>
  );
};

export default Pricing;
