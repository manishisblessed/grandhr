import React from 'react';
import { Link } from 'react-router-dom';

const Solutions = () => {
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

  return (
    <div className="min-h-screen bg-white">
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">HR Solutions for Modern Businesses</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Comprehensive HR management solutions designed to streamline your workforce operations
            </p>
          </div>
        </section>

        {/* For Companies Section */}
        <section className="py-20 bg-white">
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
                <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 border border-gray-200 hover:border-accent-300 hover:shadow-xl transition-all transform hover:-translate-y-2">
                  <div className="text-5xl mb-4">{service.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center text-gray-700 text-sm">
                        <span className="text-accent-600 mr-2 font-bold">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                to="/hr/company-onboarding"
                className="inline-block px-8 py-4 bg-slate-800 text-white rounded-lg font-semibold text-lg hover:bg-slate-900 transition-all shadow-lg hover:shadow-xl"
              >
                Start Managing Your Workforce →
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Solutions;

