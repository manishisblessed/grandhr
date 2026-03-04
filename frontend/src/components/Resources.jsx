import React from 'react';
import { Link } from 'react-router-dom';

const Resources = () => {
  const resources = [
    {
      category: 'Documentation',
      icon: '📚',
      items: [
        { title: 'User Guide', description: 'Complete guide to using GrandHR', link: '/help-center' },
        { title: 'API Documentation', description: 'Developer API reference', link: '/api-docs' },
        { title: 'Video Tutorials', description: 'Step-by-step video guides', link: 'https://www.youtube.com/@grandhr' },
        { title: 'Best Practices', description: 'HR management best practices', link: '/best-practices' }
      ]
    },
    {
      category: 'Tools & Generators',
      icon: '🛠️',
      items: [
        { title: 'Document Generator', description: 'Generate HR documents instantly', link: '/offer-letter' },
        { title: 'Org Hierarchy Builder', description: 'Create organizational charts', link: '/hierarchy' },
        { title: 'Salary Calculator', description: 'Calculate employee salaries', link: '/calculator' },
        { title: 'Leave Balance Calculator', description: 'Track leave balances', link: '/leave-calculator' }
      ]
    },
    {
      category: 'Templates',
      icon: '📄',
      items: [
        { title: 'Offer Letter Templates', description: 'Professional offer letter formats', link: '/offer-letter' },
        { title: 'Appointment Letters', description: 'Appointment letter templates', link: '/appointment-letter' },
        { title: 'Payslip Templates', description: 'Customizable payslip formats', link: '/salary-slip' },
        { title: 'HR Policy Templates', description: 'Company policy templates', link: '/policies' }
      ]
    },
    {
      category: 'Support',
      icon: '💬',
      items: [
        { title: 'Help Center', description: 'FAQs and troubleshooting', link: '/help-center' },
        { title: 'Contact Support', description: 'Get in touch with our team', link: '/#contact' },
        { title: 'WhatsApp Support', description: 'Chat with us on WhatsApp', link: 'https://wa.me/919090702705', external: true },
        { title: 'Community Forum', description: 'Connect with other users', link: '/forum' }
      ]
    },
    {
      category: 'Legal & Compliance',
      icon: '⚖️',
      items: [
        { title: 'Privacy Policy', description: 'How we protect your data', link: '/privacy-policy' },
        { title: 'Terms of Service', description: 'Terms and conditions', link: '/terms-of-service' },
        { title: 'Compliance Guide', description: 'HR compliance resources', link: '/compliance' },
        { title: 'Data Security', description: 'Security practices and policies', link: '/security' }
      ]
    },
    {
      category: 'Payment & Billing',
      icon: '💳',
      items: [
        { title: 'Pricing Plans', description: 'View our subscription plans', link: '/#pricing' },
        { title: 'Payment Methods', description: 'Accepted payment options', link: '/payment-methods' },
        { title: 'Billing FAQ', description: 'Billing and payment questions', link: '/help-center#billing' },
        { title: 'Razorpay Security', description: 'Secure payment processing', link: 'https://razorpay.com/security', external: true }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Resources</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Everything you need to get the most out of GrandHR
            </p>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources.map((category, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-accent-300 transition-all p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{category.icon}</span>
                    <h2 className="text-2xl font-bold text-gray-800">{category.category}</h2>
                  </div>
                  <ul className="space-y-3">
                    {category.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        {item.external ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 rounded-lg hover:bg-accent-50 transition-colors group"
                          >
                            <div className="font-semibold text-gray-800 group-hover:text-accent-600 transition-colors">
                              {item.title}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                          </a>
                        ) : (
                          <Link
                            to={item.link}
                            className="block p-3 rounded-lg hover:bg-accent-50 transition-colors group"
                          >
                            <div className="font-semibold text-gray-800 group-hover:text-accent-600 transition-colors">
                              {item.title}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Payment Gateway Info */}
        <section className="py-16 bg-gradient-to-r from-accent-50 to-purple-50">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-accent-200">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">💳</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Secure Payment Processing</h2>
                <p className="text-xl text-gray-600">
                  All payments are processed securely through Razorpay
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-3">Accepted Payment Methods</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>✓ Credit & Debit Cards</li>
                    <li>✓ UPI (Unified Payments Interface)</li>
                    <li>✓ Net Banking</li>
                    <li>✓ Digital Wallets</li>
                    <li>✓ EMI Options</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-3">Security Features</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>✓ PCI-DSS Compliant</li>
                    <li>✓ 256-bit SSL Encryption</li>
                    <li>✓ Secure Tokenization</li>
                    <li>✓ Fraud Detection</li>
                    <li>✓ 24/7 Monitoring</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link
                  to="/#pricing"
                  className="inline-block px-8 py-4 bg-accent-600 text-white rounded-lg font-semibold hover:bg-accent-700 transition-all shadow-lg"
                >
                  View Pricing Plans
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Resources;

