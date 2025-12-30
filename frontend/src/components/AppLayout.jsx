import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Chatbot from './Chatbot';
import { useAuth } from '../contexts/AuthContext';

const AppLayout = () => {
  const location = useLocation();
  const hrUser = JSON.parse(localStorage.getItem('hr_user') || 'null');
  const isHRPage = location.pathname.startsWith('/hr');
  const showChatbot = isHRPage && hrUser; // Only show on HR pages when logged in

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {showChatbot && <Chatbot />}
    </div>
  );
};

export default AppLayout;

