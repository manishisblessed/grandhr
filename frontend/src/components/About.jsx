import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.jpeg';

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

const About = () => {
  const containerRef = useScrollReveal();

  const values = [
    { icon: '🎯', title: 'Simplicity', description: 'We make complex HR processes simple and intuitive for teams of all sizes.' },
    { icon: '🔒', title: 'Security', description: 'Enterprise-grade security with encrypted data, JWT auth, and role-based access.' },
    { icon: '🚀', title: 'Innovation', description: 'Continuously improving with AI, automation, and the latest technology.' },
    { icon: '🤝', title: 'Trust', description: 'Transparent pricing, reliable uptime, and dedicated support you can count on.' },
  ];

  const milestones = [
    { year: '2025', event: 'GrandHR founded with a mission to democratize HR tech' },
    { year: '2025', event: 'Core platform launched — Employee, Attendance, Leave, Payroll' },
    { year: '2026', event: 'Document generation, multi-company support, AI chatbot added' },
    { year: '2026', event: 'Razorpay payment integration and multi-currency pricing' },
    { year: '2026', event: 'Enterprise features — performance management, recruitment, analytics' },
  ];

  const team = [
    { name: 'Shah Works', role: 'Founding Team', description: 'Product design, engineering, and business operations.' },
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
            <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in">
              <img src={logoImg} alt="GrandHR" className="h-16 md:h-20 object-contain drop-shadow-2xl" />
              <span className="text-3xl md:text-4xl font-bold font-display">
                <span className="text-blue-400">Grand</span><span className="text-green-400">HR</span>
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
              About GrandHR
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Built in India, for the world. Complete HR management solution for MNCs and growing businesses.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  To empower every company — from 5-person startups to 5,000-person enterprises — with world-class HR tools that are affordable, easy to use, and built for the modern workforce.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  We believe that great HR software shouldn't cost a fortune. GrandHR brings enterprise-grade features — payroll, compliance, attendance, document generation, AI support — at prices that growing businesses can afford.
                </p>
                <div className="flex gap-4">
                  <Link to="/features" className="px-6 py-3 bg-accent-600 text-white rounded-xl font-semibold hover:bg-accent-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                    Explore Features
                  </Link>
                  <Link to="/pricing" className="px-6 py-3 border-2 border-accent-600 text-accent-600 rounded-xl font-semibold hover:bg-accent-50 transition-all">
                    View Pricing
                  </Link>
                </div>
              </div>
              <div className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700" style={{ transitionDelay: '200ms' }}>
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">What We Offer</h3>
                  <ul className="space-y-4">
                    {[
                      'Complete employee lifecycle management',
                      'Automated payroll with PF/ESI/PT compliance',
                      'Leave & attendance tracking with approvals',
                      'Professional document generation (10+ templates)',
                      'Multi-company management from one dashboard',
                      'AI-powered HR chatbot',
                      'Real-time analytics & custom reports',
                      'Secure cloud platform with 99.9% uptime',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start group">
                        <span className="w-6 h-6 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center text-xs mr-3 flex-shrink-0 mt-0.5 group-hover:bg-accent-600 group-hover:text-white transition-colors">✓</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 scroll-reveal opacity-0 translate-y-4 transition-all duration-700">Our Values</h2>
              <p className="text-xl text-gray-600 scroll-reveal opacity-0 translate-y-4 transition-all duration-700" style={{ transitionDelay: '100ms' }}>
                The principles that guide everything we build
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {values.map((value, idx) => (
                <div
                  key={idx}
                  className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-accent-300 hover:shadow-xl group"
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300">{value.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-bold text-center text-gray-900 mb-16 scroll-reveal opacity-0 translate-y-4 transition-all duration-700">Our Journey</h2>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-accent-200" />
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 relative pl-16 pb-10 last:pb-0"
                  style={{ transitionDelay: `${idx * 150}ms` }}
                >
                  <div className="absolute left-3 w-7 h-7 bg-accent-600 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:border-accent-300 hover:shadow-xl transition-all">
                    <span className="text-sm font-bold text-accent-600">{m.year}</span>
                    <p className="text-gray-800 font-medium mt-1">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 scroll-reveal opacity-0 translate-y-4 transition-all duration-700">Built by</h2>
            <div className="max-w-lg mx-auto mt-8 scroll-reveal opacity-0 translate-y-6 transition-all duration-700" style={{ transitionDelay: '200ms' }}>
              <div className="bg-gradient-to-br from-accent-50 to-purple-50 rounded-2xl p-8 border border-accent-200 shadow-xl">
                <div className="text-5xl mb-4">🏗️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Shah Works</h3>
                <a href="https://www.shahworks.com/" target="_blank" rel="noopener noreferrer" className="text-accent-600 hover:text-accent-700 font-medium transition-colors">
                  www.shahworks.com
                </a>
                <p className="text-gray-600 mt-4">Product design, full-stack engineering, and business operations. Building software that makes a difference.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 scroll-reveal opacity-0 translate-y-4 transition-all duration-700">Get in Touch</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { icon: '📧', label: 'Email', value: 'support@grandhr.in', href: 'mailto:support@grandhr.in' },
                { icon: '📞', label: 'Phone', value: '+91 9090702707', href: 'tel:+919090702707' },
                { icon: '💬', label: 'WhatsApp', value: '+91 9090702707', href: 'https://wa.me/919090702707' },
                { icon: '📍', label: 'Address', value: 'E-Block, Shiv Ram Park, Nangloi, New Delhi-110041', href: null },
              ].map((item, idx) => (
                <div key={idx} className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/20 transition-colors" style={{ transitionDelay: `${idx * 100}ms` }}>
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="text-sm text-gray-400 mb-1">{item.label}</div>
                  {item.href ? (
                    <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-white font-medium hover:text-accent-400 transition-colors text-sm">{item.value}</a>
                  ) : (
                    <p className="text-white font-medium text-sm">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
