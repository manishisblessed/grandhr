import React from 'react';

/**
 * Footer Component
 * Made by Shah Works - www.shahworks.com
 */
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              GrandHR
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Complete HR management solution for companies and their employees. 
              Streamline your HR operations with our comprehensive platform.
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/hr/dashboard" className="hover:text-primary-400 transition-colors">HR Dashboard</a></li>
              <li><a href="/hr/employees" className="hover:text-primary-400 transition-colors">Employee Management</a></li>
              <li><a href="/hr/leaves" className="hover:text-primary-400 transition-colors">Leave Management</a></li>
              <li><a href="/hr/attendance" className="hover:text-primary-400 transition-colors">Attendance Tracking</a></li>
              <li><a href="/hr/payroll" className="hover:text-primary-400 transition-colors">Payroll Processing</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/documents" className="hover:text-primary-400 transition-colors">Document Generator</a></li>
              <li><a href="/hierarchy" className="hover:text-primary-400 transition-colors">Org Hierarchy</a></li>
              <li><a href="/hr/automation" className="hover:text-primary-400 transition-colors">Automation</a></li>
              <li><a href="/hr/support" className="hover:text-primary-400 transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a 
                  href="https://www.shahworks.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary-400 transition-colors"
                >
                  www.shahworks.com
                </a>
              </li>
              <li>
                <a 
                  href="mailto:support@shahworks.com" 
                  className="hover:text-primary-400 transition-colors"
                >
                  support@shahworks.com
                </a>
              </li>
              <li className="pt-4">
                <div className="flex gap-2">
                  <span className="text-xs text-gray-500">Powered by</span>
                  <a 
                    href="https://www.shahworks.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 font-semibold text-xs"
                  >
                    Shah Works
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} GrandHR. All rights reserved. |{' '}
            <a 
              href="https://www.shahworks.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300"
            >
              Shah Works
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

