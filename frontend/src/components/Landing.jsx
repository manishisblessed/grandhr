import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Services for Companies/Employers
  const employerServices = [
    {
      icon: '👥',
      title: 'Employee Management',
      description: 'Complete employee lifecycle management from onboarding to offboarding',
      features: ['Add & Manage Employees', 'Employee Profiles', 'Department Organization', 'Role & Permissions'],
      gradient: 'from-blue-500 to-cyan-500',
      delay: '0.1s'
    },
    {
      icon: '📅',
      title: 'Leave Management',
      description: 'Streamline leave requests, approvals, and tracking',
      features: ['Leave Requests', 'Approval Workflow', 'Leave Balance Tracking', 'Leave Policies'],
      gradient: 'from-purple-500 to-pink-500',
      delay: '0.2s'
    },
    {
      icon: '⏰',
      title: 'Attendance Tracking',
      description: 'Monitor employee attendance and work hours',
      features: ['Clock In/Out', 'Attendance Reports', 'Hours Tracking', 'Absence Management'],
      gradient: 'from-green-500 to-emerald-500',
      delay: '0.3s'
    },
    {
      icon: '💰',
      title: 'Payroll Processing',
      description: 'Automated payroll calculation and payslip generation',
      features: ['Salary Management', 'Auto Calculations', 'Payslip Generation', 'Tax & Deductions'],
      gradient: 'from-orange-500 to-red-500',
      delay: '0.4s'
    },
    {
      icon: '🤖',
      title: 'Automation',
      description: 'Automate repetitive HR tasks and processes',
      features: ['Auto Payroll', 'Auto Attendance', 'Auto Reminders', 'Scheduled Jobs'],
      gradient: 'from-indigo-500 to-purple-500',
      delay: '0.5s'
    },
    {
      icon: '📊',
      title: 'Analytics & Reports',
      description: 'Comprehensive insights and reporting',
      features: ['HR Dashboard', 'Employee Analytics', 'Attendance Reports', 'Payroll Reports'],
      gradient: 'from-teal-500 to-cyan-500',
      delay: '0.6s'
    }
  ];

  // Services for Employees
  const employeeServices = [
    {
      icon: '👤',
      title: 'My Profile',
      description: 'Access and manage your personal information',
      features: ['View Profile', 'Update Information', 'View Documents', 'Employment Details'],
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      icon: '📝',
      title: 'Leave Management',
      description: 'Apply for leaves and track your leave balance',
      features: ['Apply for Leave', 'View Leave Balance', 'Leave History', 'Status Tracking'],
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: '🕐',
      title: 'Attendance',
      description: 'Clock in/out and view your attendance records',
      features: ['Clock In/Out', 'View Attendance', 'Work Hours', 'Monthly Reports'],
      gradient: 'from-green-500 to-teal-500'
    },
    {
      icon: '💵',
      title: 'Payroll & Payslips',
      description: 'Access your salary information and payslips',
      features: ['View Payslips', 'Salary Details', 'Download Payslips', 'Payroll History'],
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      icon: '📄',
      title: 'Document Generation',
      description: 'Generate professional HR documents (login required)',
      features: ['Offer Letters', 'Appointment Letters', 'Salary Slips', 'All HR Documents'],
      gradient: 'from-red-500 to-pink-500'
    },
    {
      icon: '💬',
      title: 'AI Support',
      description: 'Get instant help with multiple specialized chatbots',
      features: ['HR Assistant', 'Payroll Bot', 'Leave Bot', '24/7 Support'],
      gradient: 'from-indigo-500 to-purple-500'
    }
  ];

  // Key Features
  const keyFeatures = [
    {
      icon: '🏢',
      title: 'Multi-Company Support',
      description: 'Manage multiple companies and their employees from one platform',
      color: 'text-blue-600'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Enterprise-grade security with role-based access control',
      color: 'text-green-600'
    },
    {
      icon: '☁️',
      title: 'Cloud-Based',
      description: 'Access your HR data from anywhere, anytime',
      color: 'text-purple-600'
    },
    {
      icon: '📱',
      title: 'Responsive Design',
      description: 'Works seamlessly on desktop, tablet, and mobile devices',
      color: 'text-pink-600'
    },
    {
      icon: '⚡',
      title: 'Fast & Efficient',
      description: 'Automated processes save time and reduce manual work',
      color: 'text-orange-600'
    },
    {
      icon: '🎯',
      title: 'Easy Onboarding',
      description: 'Simple registration and employee onboarding process',
      color: 'text-indigo-600'
    }
  ];

  // Stats
  const stats = [
    { number: '10K+', label: 'Companies Trust Us', icon: '🏢' },
    { number: '500K+', label: 'Employees Served', icon: '👥' },
    { number: '99.9%', label: 'Uptime Guarantee', icon: '⚡' },
    { number: '24/7', label: 'Support Available', icon: '💬' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <Navbar />
      
      {/* Hero Section - Enhanced */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 md:py-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className={`max-w-5xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/20 animate-fade-in">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">Trusted by 10,000+ Companies Worldwide</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-gradient">
              Transform Your HR Operations
              <br />
              <span className="text-accent-400">With Enterprise-Grade Solutions</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-4 text-white/90 font-light max-w-3xl mx-auto">
              Empowering MNCs and growing businesses with comprehensive HR management. 
              Streamline operations, boost productivity, and elevate your workforce experience.
            </p>
            
            <p className="text-lg md:text-xl mb-10 text-white/70 max-w-2xl mx-auto">
              Join thousands of companies already transforming their HR with GrandHR
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/hr/company-onboarding"
                className="group px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-white/20 transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              
              <Link
                to="/pricing"
                className="px-8 py-4 bg-accent-600/90 backdrop-blur-sm text-white rounded-xl font-bold text-lg hover:bg-accent-700 transition-all duration-300 shadow-2xl hover:shadow-accent-500/50 transform hover:-translate-y-1 hover:scale-105 border-2 border-accent-400/50"
              >
                View Pricing
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/70 mt-12">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center stagger-item hover-lift p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-accent-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Companies Section - Enhanced */}
      <section id="solutions" className="py-20 md:py-28 bg-gradient-to-br from-white via-blue-50/30 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-block px-4 py-2 bg-accent-100 text-accent-700 rounded-full text-sm font-semibold mb-4">
              FOR ENTERPRISES
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Powerful HR Solutions for
              <br />
              <span className="bg-gradient-to-r from-accent-600 to-purple-600 bg-clip-text text-transparent">
                Modern Businesses
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Manage your entire workforce with enterprise-grade HR tools designed for scalability, 
              efficiency, and growth. Trusted by MNCs worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {employerServices.map((service, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-transparent transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2 overflow-hidden stagger-item"
                style={{ animationDelay: service.delay }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Icon */}
                <div className="relative mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} text-white text-3xl shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    {service.icon}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-accent-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                
                <ul className="space-y-3">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center text-gray-700 text-sm group-hover:text-gray-900 transition-colors">
                      <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Hover Effect Border */}
                <div className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <Link
              to="/hr/company-onboarding"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-accent-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-accent-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-accent-500/50 transform hover:-translate-y-1 hover:scale-105"
            >
              Start Managing Your Workforce
              <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* For Employees Section - Enhanced */}
      <section id="services" className="py-20 md:py-28 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
              FOR EMPLOYEES
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Your HR Portal,
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Simplified & Accessible
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Access all your HR needs in one place. Simple, fast, secure, and always available 
              when you need it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {employeeServices.map((service, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-transparent transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2 overflow-hidden stagger-item"
                style={{ animationDelay: `${(index + 6) * 0.1}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                <div className="relative mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} text-white text-3xl shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    {service.icon}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                
                <ul className="space-y-3">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center text-gray-700 text-sm group-hover:text-gray-900 transition-colors">
                      <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-16 animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
            <Link
              to="/hr/login"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 transform hover:-translate-y-1 hover:scale-105"
            >
              Access Your HR Portal
              <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Features Section - Enhanced */}
      <section id="features" className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
              WHY CHOOSE GRANDHR
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Built for
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"> Excellence</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Enterprise-grade features designed for modern businesses and their employees
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {keyFeatures.map((feature, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-accent-300 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2 stagger-item"
                style={{ animationDelay: `${(index + 12) * 0.1}s` }}
              >
                <div className={`text-6xl mb-6 transform hover:scale-110 transition-transform duration-300 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Ready to Transform Your HR?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of companies already using GrandHR to streamline their HR operations 
              and empower their workforce.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/hr/company-onboarding"
                className="group px-10 py-5 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-white/20 transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  Get Started Free
                  <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                to="/hr/login"
                className="px-10 py-5 bg-accent-600 text-white rounded-xl font-bold text-lg hover:bg-accent-700 transition-all duration-300 shadow-2xl hover:shadow-accent-500/50 transform hover:-translate-y-1 hover:scale-105 border-2 border-accent-400/50"
              >
                Login to Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
