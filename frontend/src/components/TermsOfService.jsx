import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white">
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
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
                <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  By accessing and using GrandHR ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Description of Service</h2>
                <p className="text-gray-600 leading-relaxed">
                  GrandHR is a comprehensive HR management platform that provides services including but not limited to employee management, payroll processing, leave management, attendance tracking, and document generation.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Account Registration</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  To use our Service, you must:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Register for an account by providing accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Be at least 18 years of age or have parental consent</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Payment Terms</h2>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">4.1 Subscription Plans</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We offer various subscription plans. By subscribing, you agree to pay the fees associated with your selected plan. All payments are processed securely through Razorpay.
                </p>

                <h3 className="text-xl font-semibold text-gray-700 mb-3">4.2 Payment Processing</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Payments are processed by Razorpay, a PCI-DSS compliant payment gateway. You agree to provide valid payment information and authorize us to charge your payment method for all applicable fees.
                </p>

                <h3 className="text-xl font-semibold text-gray-700 mb-3">4.3 Billing and Renewal</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Subscription fees are billed in advance on a monthly or annual basis, depending on your plan. Subscriptions automatically renew unless cancelled before the renewal date.
                </p>

                <h3 className="text-xl font-semibold text-gray-700 mb-3">4.4 Refunds</h3>
                <p className="text-gray-600 leading-relaxed">
                  Refund requests are handled on a case-by-case basis. Generally, refunds are not provided for partial billing periods. Contact our support team for refund inquiries.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">5. User Responsibilities</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You agree to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Use the Service only for lawful purposes</li>
                  <li>Not violate any applicable laws or regulations</li>
                  <li>Not attempt to gain unauthorized access to the Service</li>
                  <li>Not interfere with or disrupt the Service</li>
                  <li>Maintain the confidentiality of your account information</li>
                  <li>Comply with all applicable data protection and privacy laws</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Intellectual Property</h2>
                <p className="text-gray-600 leading-relaxed">
                  All content, features, and functionality of the Service are owned by GrandHR and are protected by international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Data and Privacy</h2>
                <p className="text-gray-600 leading-relaxed">
                  Your use of the Service is also governed by our Privacy Policy. You retain ownership of your data, and we will handle it in accordance with our Privacy Policy and applicable data protection laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Service Availability</h2>
                <p className="text-gray-600 leading-relaxed">
                  We strive to maintain high availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or unforeseen circumstances. We are not liable for any downtime.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed">
                  To the maximum extent permitted by law, GrandHR shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Termination</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We may terminate or suspend your account and access to the Service immediately, without prior notice, for:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Violation of these Terms of Service</li>
                  <li>Non-payment of fees</li>
                  <li>Fraudulent or illegal activity</li>
                  <li>At our sole discretion, with or without cause</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">11. Changes to Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right to modify these Terms of Service at any time. We will notify users of significant changes via email or through the Service. Continued use after changes constitutes acceptance of the modified terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">12. Governing Law</h2>
                <p className="text-gray-600 leading-relaxed">
                  These Terms of Service shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">13. Contact Information</h2>
                <p className="text-gray-600 leading-relaxed">
                  For questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-6 mt-4">
                  <p className="text-gray-700">
                    <strong>Email:</strong> support@grandhr.in<br />
                    <strong>Phone:</strong> +91 9090702707<br />
                    <strong>WhatsApp:</strong> +91 9090702707<br />
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

export default TermsOfService;

