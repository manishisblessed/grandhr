import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: '📚' },
    { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
    { id: 'account', name: 'Account & Billing', icon: '💳' },
    { id: 'features', name: 'Features', icon: '⭐' },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: '🔧' },
    { id: 'payment', name: 'Payment & Plans', icon: '💰' }
  ];

  const faqs = [
    {
      category: 'getting-started',
      question: 'How do I register my company?',
      answer: 'Click on "Register Company" in the navigation bar or footer. Fill in your company details and create an admin account. You\'ll be guided through a simple onboarding process.',
      tags: ['registration', 'onboarding', 'company']
    },
    {
      category: 'getting-started',
      question: 'How do I add employees?',
      answer: 'After logging in as an admin, go to the Employees section. Click "Add Employee" and fill in the required information. Employees will receive login credentials via email.',
      tags: ['employees', 'add', 'management']
    },
    {
      category: 'account',
      question: 'How do I upgrade my plan?',
      answer: 'Go to the Pricing page and select your desired plan. Click "Upgrade" and you\'ll be redirected to our secure payment gateway (Razorpay) to complete the transaction.',
      tags: ['upgrade', 'plan', 'payment']
    },
    {
      category: 'account',
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit/debit cards, UPI, net banking, and digital wallets through Razorpay. All transactions are secure and encrypted.',
      tags: ['payment', 'razorpay', 'methods']
    },
    {
      category: 'features',
      question: 'How does leave management work?',
      answer: 'Employees can apply for leaves through the Leave Management section. Managers/HR can approve or reject requests. The system automatically tracks leave balances.',
      tags: ['leave', 'management', 'approval']
    },
    {
      category: 'features',
      question: 'Can I generate payslips automatically?',
      answer: 'Yes! Once payroll is processed, payslips are automatically generated and can be downloaded by employees. You can also set up automation for monthly payroll processing.',
      tags: ['payslip', 'payroll', 'automation']
    },
    {
      category: 'payment',
      question: 'How do I make a payment?',
      answer: 'Navigate to the Pricing page, select your plan, and click "Subscribe" or "Upgrade". You\'ll be redirected to Razorpay\'s secure payment page where you can complete the transaction using your preferred payment method.',
      tags: ['payment', 'razorpay', 'subscription']
    },
    {
      category: 'payment',
      question: 'Is my payment information secure?',
      answer: 'Absolutely! We use Razorpay, a PCI-DSS compliant payment gateway. Your payment information is never stored on our servers. All transactions are encrypted and secure.',
      tags: ['security', 'payment', 'razorpay']
    },
    {
      category: 'troubleshooting',
      question: 'I forgot my password. How do I reset it?',
      answer: 'Click on "Login" and then "Forgot Password". Enter your email address and you\'ll receive a password reset link. Follow the instructions in the email.',
      tags: ['password', 'reset', 'login']
    },
    {
      category: 'troubleshooting',
      question: 'Why can\'t I access certain features?',
      answer: 'Access to features depends on your role (Admin, HR, Manager, or Employee). Contact your company administrator if you need additional permissions.',
      tags: ['permissions', 'access', 'roles']
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Find answers to common questions and get the support you need
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pl-12 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-500 shadow-lg"
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">🔍</span>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedCategory === category.id
                      ? 'bg-accent-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="max-w-4xl mx-auto space-y-4">
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map((faq, index) => (
                  <FAQItem key={index} faq={faq} />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-xl text-gray-600">No results found. Try a different search term.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="py-16 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-xl mb-8 text-white/90">
              Our support team is here to assist you
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/#contact"
                className="px-8 py-4 bg-white text-slate-900 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-xl"
              >
                Contact Support
              </Link>
              <a
                href="https://wa.me/919090702705"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-xl"
              >
                WhatsApp Support
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const FAQItem = ({ faq }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-accent-300 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors"
      >
        <span className="font-semibold text-gray-800 text-lg">{faq.question}</span>
        <svg
          className={`w-6 h-6 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-4 pt-2 border-t border-gray-200">
          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {faq.tags.map((tag, idx) => (
              <span key={idx} className="px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-xs font-semibold">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpCenter;

