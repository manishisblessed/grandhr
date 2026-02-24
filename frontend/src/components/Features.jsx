import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const useScrollReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    const elements = ref.current?.querySelectorAll('.scroll-reveal');
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
};

const Features = () => {
  const containerRef = useScrollReveal();

  const coreModules = [
    {
      icon: '👥', title: 'Employee Management',
      description: 'Complete employee lifecycle from onboarding to exit. Manage profiles, documents, roles, and organizational hierarchies with ease.',
      highlights: ['Digital employee profiles', 'Role-based access control', 'Org chart visualization', 'Bulk import via CSV'],
    },
    {
      icon: '⏰', title: 'Attendance & Time Tracking',
      description: 'Automated clock-in/out, GPS-based attendance, shift management, and real-time tracking with detailed reports.',
      highlights: ['One-click clock in/out', 'GPS & IP-based tracking', 'Shift scheduling', 'Overtime calculations'],
    },
    {
      icon: '📅', title: 'Leave Management',
      description: 'Streamlined leave requests, multi-level approvals, balance tracking, and holiday calendars for your entire team.',
      highlights: ['Multi-level approvals', 'Custom leave types', 'Auto balance tracking', 'Holiday calendar'],
    },
    {
      icon: '💰', title: 'Payroll Processing',
      description: 'End-to-end payroll automation with tax calculations, statutory compliance (PF, ESI, PT), and one-click payslip generation.',
      highlights: ['Auto salary calculation', 'PF/ESI/PT compliance', 'Payslip generation', 'Bank file export'],
    },
    {
      icon: '📄', title: 'Document Generation',
      description: 'Generate professional HR documents instantly — offer letters, appointment letters, experience letters, salary slips, and more.',
      highlights: ['Offer & appointment letters', 'Experience & relieving letters', 'Salary slips', 'Custom templates'],
    },
    {
      icon: '📊', title: 'Reports & Analytics',
      description: 'Comprehensive dashboards with real-time insights into attendance, payroll, headcount, attrition, and department metrics.',
      highlights: ['Real-time dashboards', 'Custom report builder', 'CSV & PDF exports', 'Trend analysis'],
    },
  ];

  const advancedFeatures = [
    { icon: '🤖', title: 'AI-Powered Support', description: 'Smart chatbot for instant HR queries, policy lookups, and employee self-service.' },
    { icon: '🔔', title: 'Smart Notifications', description: 'Automated alerts for birthdays, work anniversaries, pending approvals, and policy reminders.' },
    { icon: '🏢', title: 'Multi-Company Support', description: 'Manage multiple companies from a single dashboard. Separate data, unified control.' },
    { icon: '🔒', title: 'Enterprise Security', description: 'Role-based access, encrypted data, JWT authentication, and audit logging.' },
    { icon: '📱', title: 'Mobile Responsive', description: 'Full functionality on every device — desktop, tablet, or mobile. Works anywhere.' },
    { icon: '⚡', title: 'Automation Engine', description: 'Automate repetitive tasks — probation reminders, payroll runs, approval workflows.' },
    { icon: '🌍', title: 'Multi-Currency & Global', description: 'Support for international teams with multi-currency pricing and localization.' },
    { icon: '📧', title: 'Email Notifications', description: 'Automated emails from noreply@grandhr.in for onboarding, approvals, and confirmations.' },
  ];

  const stats = [
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '50+', label: 'HR Features' },
    { value: '10+', label: 'Document Types' },
    { value: '24/7', label: 'Support' },
  ];

  return (
    <div className="min-h-screen bg-white" ref={containerRef}>
      <main>
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-accent-500 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-block px-4 py-1.5 bg-accent-600/20 border border-accent-500/30 rounded-full text-accent-300 text-sm font-semibold mb-6 animate-fade-in">
              Powerful features for modern HR teams
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
              Everything You Need to<br />
              <span className="bg-gradient-to-r from-accent-400 to-purple-400 bg-clip-text text-transparent">Manage HR Effortlessly</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              From onboarding to exit — automate every aspect of HR with one unified platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/hr/company-onboarding" className="px-8 py-4 bg-gradient-to-r from-accent-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-accent-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105">
                Start Free Trial
              </Link>
              <Link to="/pricing" className="px-8 py-4 bg-white/10 border border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all">
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center scroll-reveal opacity-0 translate-y-4 transition-all duration-700" style={{ transitionDelay: `${idx * 100}ms` }}>
                  <div className="text-4xl md:text-5xl font-bold text-accent-600 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Modules */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 scroll-reveal opacity-0 translate-y-4 transition-all duration-700">
                Core HR Modules
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto scroll-reveal opacity-0 translate-y-4 transition-all duration-700" style={{ transitionDelay: '100ms' }}>
                Comprehensive tools to handle every aspect of human resource management
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {coreModules.map((module, index) => (
                <div
                  key={index}
                  className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 group bg-white rounded-2xl p-8 border border-gray-200 hover:border-accent-300 hover:shadow-2xl"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{module.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{module.title}</h3>
                  <p className="text-gray-600 mb-5 leading-relaxed">{module.description}</p>
                  <ul className="space-y-2">
                    {module.highlights.map((h, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-700">
                        <span className="w-5 h-5 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0">✓</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Advanced Features */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 scroll-reveal opacity-0 translate-y-4 transition-all duration-700">
                Advanced Capabilities
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto scroll-reveal opacity-0 translate-y-4 transition-all duration-700" style={{ transitionDelay: '100ms' }}>
                Go beyond basic HR with intelligent automation and enterprise features
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {advancedFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-accent-300 hover:shadow-xl group"
                  style={{ transitionDelay: `${idx * 75}ms` }}
                >
                  <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-accent-600 to-purple-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 scroll-reveal opacity-0 translate-y-4 transition-all duration-700">Ready to Transform Your HR?</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto scroll-reveal opacity-0 translate-y-4 transition-all duration-700" style={{ transitionDelay: '100ms' }}>
              Join hundreds of companies already using GrandHR to streamline their HR operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center scroll-reveal opacity-0 translate-y-4 transition-all duration-700" style={{ transitionDelay: '200ms' }}>
              <Link to="/hr/company-onboarding" className="px-8 py-4 bg-white text-accent-700 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl transform hover:scale-105">
                Start Free Trial
              </Link>
              <Link to="/contact" className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Features;
