import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About GrandHR</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Your trusted partner in HR management
            </p>
          </div>
        </section>

        {/* About Content */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
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
                      <span className="text-accent-600 mr-2 mt-1">✓</span>
                      <span>Complete employee lifecycle management</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent-600 mr-2 mt-1">✓</span>
                      <span>Automated payroll and attendance tracking</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent-600 mr-2 mt-1">✓</span>
                      <span>Professional document generation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent-600 mr-2 mt-1">✓</span>
                      <span>AI-powered support with multiple chatbots</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent-600 mr-2 mt-1">✓</span>
                      <span>Cloud-based secure platform</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;

