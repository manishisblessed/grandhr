import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-white/90">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Introduction</h2>
                <p className="text-gray-600 leading-relaxed">
                  GrandHR ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our HR management platform and services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Information We Collect</h2>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">2.1 Personal Information</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Name, email address, phone number, and contact information</li>
                  <li>Company information and business details</li>
                  <li>Employee data, payroll information, and HR records</li>
                  <li>Payment and billing information (processed securely through Razorpay)</li>
                  <li>Account credentials and authentication data</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6">2.2 Automatically Collected Information</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We automatically collect certain information when you use our services:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Device information and IP address</li>
                  <li>Browser type and version</li>
                  <li>Usage data and analytics</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We use the collected information for the following purposes:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>To provide, maintain, and improve our HR management services</li>
                  <li>To process payments and manage subscriptions through Razorpay</li>
                  <li>To send you important updates, notifications, and support communications</li>
                  <li>To personalize your experience and provide customer support</li>
                  <li>To comply with legal obligations and protect our rights</li>
                  <li>To analyze usage patterns and improve our platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Payment Processing</h2>
                <p className="text-gray-600 leading-relaxed">
                  We use Razorpay, a PCI-DSS compliant payment gateway, to process all payments. Your payment information is encrypted and securely transmitted to Razorpay. We do not store your complete payment card details on our servers. Razorpay's privacy policy governs the collection and use of your payment information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Data Security</h2>
                <p className="text-gray-600 leading-relaxed">
                  We implement industry-standard security measures to protect your information, including:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure authentication and access controls</li>
                  <li>Regular security audits and updates</li>
                  <li>Compliance with data protection regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Data Sharing and Disclosure</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We do not sell your personal information. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>With payment processors (Razorpay) for transaction processing</li>
                  <li>With service providers who assist in operating our platform</li>
                  <li>When required by law or to protect our legal rights</li>
                  <li>With your explicit consent</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Your Rights</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Access and receive a copy of your personal data</li>
                  <li>Rectify inaccurate or incomplete information</li>
                  <li>Request deletion of your personal data</li>
                  <li>Object to processing of your personal data</li>
                  <li>Data portability</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Cookies and Tracking</h2>
                <p className="text-gray-600 leading-relaxed">
                  We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie preferences through your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Children's Privacy</h2>
                <p className="text-gray-600 leading-relaxed">
                  Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Changes to This Policy</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">11. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have questions about this Privacy Policy, please contact us at:
                </p>
                <div className="bg-gray-50 rounded-lg p-6 mt-4">
                  <p className="text-gray-700">
                    <strong>Email:</strong> support@grandhr.in<br />
                    <strong>Phone:</strong> +91-9090702705<br />
                    <strong>WhatsApp:</strong> +91-9090702705<br />
                    <strong>Address:</strong> E-Block, Shiv Ram Park,<br />
                    Nangloi, New Delhi-110041, India
                  </p>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicy;

