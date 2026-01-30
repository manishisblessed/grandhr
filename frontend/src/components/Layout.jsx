import React from 'react';

const Layout = ({ title, description, icon, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto w-full px-2 sm:px-4 py-6 max-w-[1500px]">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            {icon} {title}
          </h1>
          <p className="text-xl text-white/90">{description}</p>
        </header>
        {children}
      </div>
    </div>
  );
};

export default Layout;

