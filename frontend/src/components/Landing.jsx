import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  // Services for Companies/Employers
  const employerServices = [
    {
      icon: '👥',
      title: 'Employee Management',
      description: 'Complete employee lifecycle management from onboarding to offboarding',
      features: ['Add & Manage Employees', 'Employee Profiles', 'Department Organization', 'Role & Permissions']
    },
    {
      icon: '📅',
      title: 'Leave Management',
      description: 'Streamline leave requests, approvals, and tracking',
      features: ['Leave Requests', 'Approval Workflow', 'Leave Balance Tracking', 'Leave Policies']
    },
    {
      icon: '⏰',
      title: 'Attendance Tracking',
      description: 'Monitor employee attendance and work hours',
      features: ['Clock In/Out', 'Attendance Reports', 'Hours Tracking', 'Absence Management']
    },
    {
      icon: '💰',
      title: 'Payroll Processing',
      description: 'Automated payroll calculation and payslip generation',
      features: ['Salary Management', 'Auto Calculations', 'Payslip Generation', 'Tax & Deductions']
    },
    {
      icon: '🤖',
      title: 'Automation',
      description: 'Automate repetitive HR tasks and processes',
      features: ['Auto Payroll', 'Auto Attendance', 'Auto Reminders', 'Scheduled Jobs']
    },
    {
      icon: '📊',
      title: 'Analytics & Reports',
      description: 'Comprehensive insights and reporting',
      features: ['HR Dashboard', 'Employee Analytics', 'Attendance Reports', 'Payroll Reports']
    }
  ];

  // Services for Employees
  const employeeServices = [
    {
      icon: '👤',
      title: 'My Profile',
      description: 'Access and manage your personal information',
      features: ['View Profile', 'Update Information', 'View Documents', 'Employment Details']
    },
    {
      icon: '📝',
      title: 'Leave Management',
      description: 'Apply for leaves and track your leave balance',
      features: ['Apply for Leave', 'View Leave Balance', 'Leave History', 'Status Tracking']
    },
    {
      icon: '🕐',
      title: 'Attendance',
      description: 'Clock in/out and view your attendance records',
      features: ['Clock In/Out', 'View Attendance', 'Work Hours', 'Monthly Reports']
    },
    {
      icon: '💵',
      title: 'Payroll & Payslips',
      description: 'Access your salary information and payslips',
      features: ['View Payslips', 'Salary Details', 'Download Payslips', 'Payroll History']
    },
    {
      icon: '📄',
      title: 'Document Generation',
      description: 'Generate professional HR documents for free',
      features: ['Offer Letters', 'Appointment Letters', 'Salary Slips', 'All HR Documents']
    },
    {
      icon: '💬',
      title: 'AI Support',
      description: 'Get instant help with multiple specialized chatbots',
      features: ['HR Assistant', 'Payroll Bot', 'Leave Bot', '24/7 Support']
    }
  ];

  // Key Features
  const keyFeatures = [
    {
      icon: '🏢',
      title: 'Multi-Company Support',
      description: 'Manage multiple companies and their employees from one platform'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Enterprise-grade security with role-based access control'
    },
    {
      icon: '☁️',
      title: 'Cloud-Based',
      description: 'Access your HR data from anywhere, anytime'
    },
    {
      icon: '📱',
      title: 'Responsive Design',
      description: 'Works seamlessly on desktop, tablet, and mobile devices'
    },
    {
      icon: '⚡',
      title: 'Fast & Efficient',
      description: 'Automated processes save time and reduce manual work'
    },
    {
      icon: '🎯',
      title: 'Easy Onboarding',
      description: 'Simple registration and employee onboarding process'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Complete HR Management Solution
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-white/90 font-medium">
              Empowering Companies and Employees with Comprehensive HR Services
            </p>
            <p className="text-lg md:text-xl mb-10 text-white/80 max-w-3xl mx-auto">
              GrandHR provides everything you need to manage your workforce efficiently. 
              From employee onboarding to payroll processing, all in one integrated platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/hr/register"
                className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Get Started as Employer
              </Link>
              <Link
                to="/hr/login"
                className="px-8 py-4 bg-primary-800 text-white rounded-lg font-semibold text-lg hover:bg-primary-900 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 border-2 border-white/20"
              >
                Login to GrandHR
              </Link>
            </div>
            <p className="text-sm text-white/70 mt-6">
              Free document generation available • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* For Companies Section */}
      <section id="solutions" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              For Companies & Employers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Manage your entire workforce with powerful HR tools designed for modern businesses
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {employerServices.map((service, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all transform hover:-translate-y-2">
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center text-gray-700 text-sm">
                      <span className="text-primary-600 mr-2 font-bold">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/hr/register"
              className="inline-block px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold text-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl"
            >
              Start Managing Your Workforce →
            </Link>
          </div>
        </div>
      </section>

      {/* For Employees Section */}
      <section id="services" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              For Employees
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access all your HR needs in one place. Simple, fast, and always available.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {employeeServices.map((service, index) => (
              <div key={index} className="bg-white rounded-xl p-8 border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all transform hover:-translate-y-2">
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center text-gray-700 text-sm">
                      <span className="text-primary-600 mr-2 font-bold">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/hr/login"
              className="inline-block px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold text-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl"
            >
              Access Your HR Portal →
            </Link>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Why Choose GrandHR?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built for modern businesses and their employees
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that works best for your organization
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-primary-500 transition-all">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Free</h3>
                <div className="text-4xl font-bold text-primary-600 mb-2">₹0</div>
                <p className="text-gray-600">Forever</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-700">
                  <span className="text-primary-600 mr-2">✓</span>
                  Document Generation
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-primary-600 mr-2">✓</span>
                  Basic HR Features
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-primary-600 mr-2">✓</span>
                  Employee Portal
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-primary-600 mr-2">✓</span>
                  Support via Chatbots
                </li>
              </ul>
              <Link
                to="/hr/register"
                className="block w-full text-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Get Started Free
              </Link>
            </div>
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-8 border-2 border-primary-600 text-white transform scale-105 shadow-xl">
              <div className="text-center mb-6">
                <span className="inline-block px-3 py-1 bg-white text-primary-600 rounded-full text-sm font-semibold mb-2">POPULAR</span>
                <h3 className="text-2xl font-bold mb-2">Professional</h3>
                <div className="text-4xl font-bold mb-2">Custom</div>
                <p className="text-white/80">Pricing</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Everything in Free
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Advanced Analytics
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Priority Support
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Custom Integrations
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Dedicated Account Manager
                </li>
              </ul>
              <Link
                to="/#contact"
                className="block w-full text-center px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-primary-500 transition-all">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-primary-600 mb-2">Custom</div>
                <p className="text-gray-600">Pricing</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-700">
                  <span className="text-primary-600 mr-2">✓</span>
                  Everything in Professional
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-primary-600 mr-2">✓</span>
                  Multi-Company Management
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-primary-600 mr-2">✓</span>
                  White-Label Solution
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-primary-600 mr-2">✓</span>
                  API Access
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-primary-600 mr-2">✓</span>
                  24/7 Premium Support
                </li>
              </ul>
              <Link
                to="/#contact"
                className="block w-full text-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                About GrandHR
              </h2>
              <p className="text-xl text-gray-600">
                Your trusted partner in HR management
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
                <p className="text-gray-600 mb-4">
                  To provide comprehensive HR management solutions that empower companies to efficiently manage their workforce while giving employees easy access to all their HR needs.
                </p>
                <p className="text-gray-600">
                  We believe in making HR management simple, accessible, and efficient for businesses of all sizes.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">What We Offer</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2 mt-1">✓</span>
                    <span>Complete employee lifecycle management</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2 mt-1">✓</span>
                    <span>Automated payroll and attendance tracking</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2 mt-1">✓</span>
                    <span>Professional document generation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2 mt-1">✓</span>
                    <span>AI-powered support with multiple chatbots</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2 mt-1">✓</span>
                    <span>Cloud-based secure platform</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Document Generation Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-4">
              ✨ Free to Use - No Login Required
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Professional Document Generation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Generate professional HR documents instantly. Perfect for employers, employees, and HR professionals.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Offer Letter', icon: '📝', path: '/offer-letter', color: 'from-blue-500 to-blue-600' },
              { name: 'Appointment Letter', icon: '📋', path: '/appointment-letter', color: 'from-green-500 to-green-600' },
              { name: 'Increment Letter', icon: '📈', path: '/increment-letter', color: 'from-purple-500 to-purple-600' },
              { name: 'Relieving Letter', icon: '👋', path: '/relieving-letter', color: 'from-orange-500 to-orange-600' },
              { name: 'Termination Letter', icon: '⚠️', path: '/termination-letter', color: 'from-red-500 to-red-600' },
              { name: 'Salary Slip', icon: '💰', path: '/salary-slip', color: 'from-yellow-500 to-yellow-600' },
            ].map((doc, index) => (
              <Link
                key={index}
                to={doc.path}
                className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-500 hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="flex items-center space-x-4">
                  <div className={`text-4xl bg-gradient-to-r ${doc.color} p-3 rounded-lg`}>
                    {doc.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary-600 transition-colors">
                    {doc.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started with GrandHR in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Register Your Company</h3>
              <p className="text-gray-600">
                Employers register and create their company account. Set up your organization profile and preferences.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Add Your Employees</h3>
              <p className="text-gray-600">
                Add employees to your organization. They'll receive email credentials to access their portal.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Start Managing</h3>
              <p className="text-gray-600">
                Employees can access their portal, apply for leaves, track attendance, and view payslips. Employers manage everything from the dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions? We're here to help you get started with GrandHR
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-8 border border-primary-200">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Email Support</h3>
              <p className="text-gray-600 mb-4">Get help via email</p>
              <a 
                href="mailto:support@shahworks.com" 
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                support@shahworks.com
              </a>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-8 border border-primary-200">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Visit Our Website</h3>
              <p className="text-gray-600 mb-4">Learn more about Shah Works</p>
              <a 
                href="https://www.shahworks.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                www.shahworks.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Transform Your HR Management?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join companies using GrandHR to streamline their HR operations and empower their employees
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/hr/register"
              className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Get Started Free
            </Link>
            <Link
              to="/hr/login"
              className="inline-block px-8 py-4 bg-primary-800 text-white rounded-lg font-semibold text-lg hover:bg-primary-900 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 border-2 border-white/20"
            >
              Login to Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                GrandHR
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Complete HR management solution for companies and their employees. 
                Streamline your HR operations with our comprehensive platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/hr/register" className="hover:text-primary-400 transition-colors">Register Company</Link></li>
                <li><Link to="/hr/login" className="hover:text-primary-400 transition-colors">Employer Login</Link></li>
                <li><Link to="/hr/dashboard" className="hover:text-primary-400 transition-colors">Dashboard</Link></li>
                <li><Link to="/hr/employees" className="hover:text-primary-400 transition-colors">Employee Management</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Employees</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/hr/login" className="hover:text-primary-400 transition-colors">Employee Login</Link></li>
                <li><Link to="/hr/leaves" className="hover:text-primary-400 transition-colors">Leave Management</Link></li>
                <li><Link to="/hr/attendance" className="hover:text-primary-400 transition-colors">Attendance</Link></li>
                <li><Link to="/hr/payroll" className="hover:text-primary-400 transition-colors">Payroll & Payslips</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/offer-letter" className="hover:text-primary-400 transition-colors">Document Generator</Link></li>
                <li><Link to="/hierarchy" className="hover:text-primary-400 transition-colors">Org Hierarchy</Link></li>
                <li><Link to="/hr/support" className="hover:text-primary-400 transition-colors">Support</Link></li>
                <li>
                  <a href="https://www.shahworks.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                    www.shahworks.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
            <p>
              © {new Date().getFullYear()} GrandHR. All rights reserved. |{' '}
              <a href="https://www.shahworks.com" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300">
                Shah Works
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
