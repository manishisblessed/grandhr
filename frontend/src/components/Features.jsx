import React from 'react';

const Features = () => {
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
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Powerful Features</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Everything you need to manage your HR operations efficiently
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-white">
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
                <div key={index} className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-accent-300 hover:shadow-xl transition-all">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Features;

