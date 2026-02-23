import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { formatDate } from '../utils/pdfUtils';
import { jsPDF } from 'jspdf';
import { saveDocument, pdfBlobToBase64 } from '../utils/documentSaver';

const WarningLetter = () => {
  const [companies, setCompanies] = useState([]);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showCompanyManager, setShowCompanyManager] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [collapsedSections, setCollapsedSections] = useState({
    company: false,
    employee: false,
    warning: false,
  });

  const [formData, setFormData] = useState({
    company: { name: '', address: '', email: '', phone: '', signatory: '', designation: '' },
    employee: { name: '', id: '', designation: '', department: '' },
    warning: {
      letterDate: '',
      warningType: '',
      incidentDate: '',
      incidentDescription: '',
      previousWarnings: 0,
      policyViolated: '',
      expectedImprovement: '',
      improvementDeadline: '',
      consequences: '',
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.jspdf = { jsPDF };
    }
    const stored = localStorage.getItem('warningLetterCompanies');
    if (stored) {
      setCompanies(JSON.parse(stored));
    }
    const today = new Date();
    const deadlineDate = new Date(today);
    deadlineDate.setDate(deadlineDate.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      warning: {
        ...prev.warning,
        letterDate: today.toISOString().split('T')[0],
        improvementDeadline: deadlineDate.toISOString().split('T')[0],
      },
    }));
  }, []);

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleCompanySelect = (value) => {
    if (value === 'new') {
      setShowCompanyForm(true);
      setCurrentCompany(null);
      setFormData(prev => ({ ...prev, company: { name: '', address: '', email: '', phone: '', signatory: '', designation: '' } }));
    } else if (value !== '') {
      const company = companies[parseInt(value)];
      setCurrentCompany(company);
      setFormData(prev => ({ ...prev, company: { ...company } }));
      setShowCompanyForm(true);
    } else {
      setShowCompanyForm(false);
    }
  };

  const saveCompany = () => {
    const name = formData.company.name.trim();
    if (!name) {
      alert('Please enter company name');
      return;
    }
    const company = {
      name,
      address: formData.company.address.trim(),
      email: formData.company.email.trim(),
      phone: formData.company.phone.trim(),
      signatory: formData.company.signatory.trim(),
      designation: formData.company.designation.trim(),
    };
    let updatedCompanies;
    if (currentCompany && companies.findIndex(c => c.name === currentCompany.name) !== -1) {
      updatedCompanies = companies.map(c => c.name === currentCompany.name ? company : c);
    } else {
      updatedCompanies = [...companies, company];
    }
    setCompanies(updatedCompanies);
    localStorage.setItem('warningLetterCompanies', JSON.stringify(updatedCompanies));
    setCurrentCompany(company);
    setShowCompanyForm(false);
    alert('Company saved successfully!');
  };

  const generateRefNumber = () => {
    const year = new Date().getFullYear();
    const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    return `WARN/${year}/${seq}`;
  };

  const generatePreview = () => {
    const data = { ...formData, company: currentCompany || formData.company };

    if (!data.company.name) {
      alert('Please select or add a company');
      return;
    }
    if (!data.employee.name) {
      alert('Please enter employee name');
      return;
    }
    if (!data.warning.warningType) {
      alert('Please select a warning type');
      return;
    }
    if (!data.warning.incidentDescription) {
      alert('Please describe the incident');
      return;
    }

    const html = generateWarningLetterHTML(data);
    setPreviewContent(html);
    setPreviewVisible(true);
  };

  const generateWarningLetterHTML = (data) => {
    const letterDate = formatDate(data.warning.letterDate);
    const incidentDate = formatDate(data.warning.incidentDate);
    const improvementDeadline = formatDate(data.warning.improvementDeadline);
    const refNumber = generateRefNumber();

    return `
      <div class="space-y-6 text-sm leading-relaxed">
        <div class="text-right space-y-1">
          <div class="font-bold text-lg">${data.company.name || 'Company Name'}</div>
          ${data.company.address ? `<div>${data.company.address.replace(/\n/g, '<br>')}</div>` : ''}
          ${data.company.email ? `<div>Email: ${data.company.email}</div>` : ''}
          ${data.company.phone ? `<div>Phone: ${data.company.phone}</div>` : ''}
        </div>

        <div class="flex justify-between items-start">
          <div><strong>Date:</strong> ${letterDate}</div>
          <div><strong>Ref:</strong> ${refNumber}</div>
        </div>

        <div class="text-center text-red-600 font-bold text-xs tracking-widest">CONFIDENTIAL</div>
        <h1 class="text-2xl font-bold text-center text-primary-600 mb-4">WARNING LETTER</h1>

        <div class="space-y-1">
          <strong>To,</strong><br>
          ${data.employee.name || 'Employee Name'}<br>
          ${data.employee.id ? `Employee ID: ${data.employee.id}<br>` : ''}
          ${data.employee.designation ? `Designation: ${data.employee.designation}<br>` : ''}
          ${data.employee.department ? `Department: ${data.employee.department}` : ''}
        </div>

        <div class="font-semibold text-primary-600 my-4">
          <strong>Subject: ${data.warning.warningType || 'Warning'} – ${data.employee.name || 'Employee'}</strong>
        </div>

        <div class="space-y-3">
          <p>Dear ${data.employee.name || 'Employee'},</p>
          <p>This letter serves as a formal <strong>${data.warning.warningType || 'warning'}</strong> regarding your conduct/performance as detailed below.</p>
        </div>

        <div class="mt-4">
          <div class="font-semibold text-primary-600 mb-2">Incident Details:</div>
          <ul class="list-disc list-inside space-y-1 ml-4">
            ${incidentDate ? `<li><strong>Date of Incident:</strong> ${incidentDate}</li>` : ''}
            <li><strong>Warning Type:</strong> ${data.warning.warningType}</li>
            ${data.warning.previousWarnings > 0 ? `<li><strong>Previous Warnings:</strong> ${data.warning.previousWarnings}</li>` : ''}
          </ul>
        </div>

        <div class="mt-4">
          <div class="font-semibold text-primary-600 mb-2">Description of Incident/Behaviour:</div>
          <p class="ml-4">${(data.warning.incidentDescription || '').replace(/\n/g, '<br>')}</p>
        </div>

        ${data.warning.policyViolated ? `
        <div class="mt-4">
          <div class="font-semibold text-primary-600 mb-2">Policy/Rule Violated:</div>
          <p class="ml-4">${data.warning.policyViolated.replace(/\n/g, '<br>')}</p>
        </div>` : ''}

        ${data.warning.expectedImprovement ? `
        <div class="mt-4">
          <div class="font-semibold text-primary-600 mb-2">Expected Improvement:</div>
          <p class="ml-4">${data.warning.expectedImprovement.replace(/\n/g, '<br>')}</p>
          ${improvementDeadline ? `<p class="ml-4 mt-1"><strong>Deadline for Improvement:</strong> ${improvementDeadline}</p>` : ''}
        </div>` : ''}

        ${data.warning.consequences ? `
        <div class="mt-4">
          <div class="font-semibold text-red-600 mb-2">Consequences of Non-Compliance:</div>
          <p class="ml-4">${data.warning.consequences.replace(/\n/g, '<br>')}</p>
        </div>` : ''}

        <div class="mt-6 space-y-3">
          <p>We expect you to take this matter seriously and make the necessary corrections immediately. Failure to do so may result in further disciplinary action, up to and including termination of employment.</p>
          <p>Please acknowledge receipt of this letter by signing below. Your signature does not imply agreement with the contents but confirms that you have received and understood this warning.</p>
        </div>

        <div class="mt-8">
          <p><strong>Regards,</strong></p>
          <p class="mt-4"><strong>${data.company.signatory || 'Authorized Signatory'}</strong></p>
          <p>${data.company.designation || 'Designation'}</p>
          <p>${data.company.name || 'Company Name'}</p>
        </div>

        <div class="mt-10 pt-6 border-t border-gray-300">
          <p><strong>Employee Acknowledgement:</strong></p>
          <div class="mt-4 flex justify-between">
            <div>
              <p>Signature: ___________________________</p>
              <p class="mt-2">Name: ${data.employee.name || '___________________________'}</p>
            </div>
            <div>
              <p>Date: ___________________________</p>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const downloadPDF = async () => {
    try {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('PDF library not loaded. Please refresh the page.');
        return;
      }
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
      const data = { ...formData, company: currentCompany || formData.company };
      const margin = 20;
      let yPos = margin;
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const lineHeight = 7;
      const refNumber = generateRefNumber();

      function checkPage(extra = 0) {
        if (yPos + extra > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
      }

      function addText(text, fontSize = 12, isBold = false, align = 'left') {
        doc.setFontSize(fontSize);
        doc.setFont('times', isBold ? 'bold' : 'normal');
        doc.setTextColor(0, 0, 0);
        const maxWidth = pageWidth - margin * 2;
        const lines = doc.splitTextToSize(text, maxWidth);
        checkPage(lines.length * lineHeight);
        lines.forEach(line => {
          if (align === 'center') {
            doc.text(line, pageWidth / 2, yPos, { align: 'center' });
          } else if (align === 'right') {
            doc.text(line, pageWidth - margin, yPos, { align: 'right' });
          } else {
            doc.text(line, margin, yPos);
          }
          yPos += lineHeight;
        });
      }

      function addBullet(text, fontSize = 11) {
        doc.setFontSize(fontSize);
        doc.setFont('times', 'normal');
        doc.setTextColor(0, 0, 0);
        const bulletX = margin + 4;
        const textX = margin + 10;
        const maxWidth = pageWidth - margin - textX;
        const lines = doc.splitTextToSize(text, maxWidth);
        checkPage(lines.length * lineHeight);
        doc.text('•', bulletX, yPos);
        lines.forEach((line, i) => {
          doc.text(line, textX, yPos);
          yPos += lineHeight;
        });
      }

      // Border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

      // Company header
      addText(data.company.name || 'Company Name', 16, true, 'center');
      if (data.company.address) addText(data.company.address, 10, false, 'center');
      if (data.company.email || data.company.phone) {
        const contactLine = [data.company.email, data.company.phone].filter(Boolean).join(' | ');
        addText(contactLine, 9, false, 'center');
      }

      yPos += 2;
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.3);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 6;

      // Date and Ref
      doc.setFontSize(11);
      doc.setFont('times', 'normal');
      doc.text(`Date: ${formatDate(data.warning.letterDate)}`, margin, yPos);
      doc.text(`Ref: ${refNumber}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += lineHeight + 2;

      // CONFIDENTIAL
      doc.setFontSize(10);
      doc.setFont('times', 'bold');
      doc.setTextColor(200, 0, 0);
      doc.text('CONFIDENTIAL', pageWidth / 2, yPos, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      yPos += lineHeight + 2;

      // Title
      addText('WARNING LETTER', 18, true, 'center');
      yPos += 4;

      // Employee details
      addText('To,', 12, true);
      addText(data.employee.name || 'Employee Name', 12, true);
      if (data.employee.id) addText(`Employee ID: ${data.employee.id}`, 10);
      if (data.employee.designation) addText(`Designation: ${data.employee.designation}`, 10);
      if (data.employee.department) addText(`Department: ${data.employee.department}`, 10);
      yPos += 4;

      // Subject
      addText(`Subject: ${data.warning.warningType || 'Warning'} – ${data.employee.name || 'Employee'}`, 12, true);
      yPos += 4;

      // Body
      addText(`Dear ${data.employee.name || 'Employee'},`, 12);
      yPos += 2;
      addText(`This letter serves as a formal ${data.warning.warningType || 'warning'} regarding your conduct/performance as detailed below.`, 11);
      yPos += 4;

      // Incident details section
      addText('Incident Details:', 12, true);
      if (data.warning.incidentDate) {
        addBullet(`Date of Incident: ${formatDate(data.warning.incidentDate)}`);
      }
      addBullet(`Warning Type: ${data.warning.warningType}`);
      if (data.warning.previousWarnings > 0) {
        addBullet(`Previous Warnings: ${data.warning.previousWarnings}`);
      }
      yPos += 3;

      // Description
      addText('Description of Incident/Behaviour:', 12, true);
      addText(data.warning.incidentDescription || 'N/A', 11);
      yPos += 3;

      // Policy violated
      if (data.warning.policyViolated) {
        addText('Policy/Rule Violated:', 12, true);
        addText(data.warning.policyViolated, 11);
        yPos += 3;
      }

      // Expected improvement
      if (data.warning.expectedImprovement) {
        addText('Expected Improvement:', 12, true);
        addText(data.warning.expectedImprovement, 11);
        if (data.warning.improvementDeadline) {
          addText(`Deadline for Improvement: ${formatDate(data.warning.improvementDeadline)}`, 11, true);
        }
        yPos += 3;
      }

      // Consequences
      if (data.warning.consequences) {
        doc.setTextColor(180, 0, 0);
        addText('Consequences of Non-Compliance:', 12, true);
        doc.setTextColor(0, 0, 0);
        addText(data.warning.consequences, 11);
        yPos += 3;
      }

      // Standard paragraphs
      addText('We expect you to take this matter seriously and make the necessary corrections immediately. Failure to do so may result in further disciplinary action, up to and including termination of employment.', 11);
      yPos += 2;
      addText('Please acknowledge receipt of this letter by signing below. Your signature does not imply agreement with the contents but confirms that you have received and understood this warning.', 11);
      yPos += 6;

      // Signatory
      addText('Regards,', 12);
      yPos += 8;
      addText(data.company.signatory || 'Authorized Signatory', 12, true);
      addText(data.company.designation || 'Designation', 11);
      addText(data.company.name || 'Company Name', 11);
      yPos += 10;

      // Acknowledgement section
      checkPage(30);
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.2);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 6;

      addText('Employee Acknowledgement:', 12, true);
      yPos += 6;
      doc.setFont('times', 'normal');
      doc.setFontSize(11);
      doc.text('Signature: ___________________________', margin, yPos);
      doc.text('Date: ___________________________', pageWidth / 2, yPos);
      yPos += 8;
      doc.text(`Name: ${data.employee.name || '___________________________'}`, margin, yPos);
      yPos += 10;

      // Disclaimer
      checkPage(10);
      doc.setFontSize(8);
      doc.setFont('times', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Disclaimer: This document is system-generated and does not require manual signature or authorization.', pageWidth / 2, yPos, { align: 'center' });

      const employeeName = (data.employee.name || 'Employee').replace(/\s+/g, '_');
      const companyName = (data.company.name || 'Company').replace(/\s+/g, '_');
      const filename = `Warning_Letter_${companyName}_${employeeName}_${new Date().toISOString().split('T')[0]}.pdf`;

      // Save to database
      try {
        const pdfBlob = doc.output('blob');
        const pdfBase64 = await pdfBlobToBase64(pdfBlob);
        await saveDocument({
          documentType: 'WARNING_LETTER',
          title: `Warning Letter - ${data.employee.name || 'Employee'}`,
          content: previewContent,
          pdfData: pdfBase64,
          metadata: {
            employeeName: data.employee.name,
            employeeId: data.employee.id,
            companyName: data.company.name,
            warningType: data.warning.warningType,
            incidentDate: data.warning.incidentDate,
            letterDate: data.warning.letterDate,
          },
          employeeId: data.employee.id,
        });
      } catch (saveErr) {
        console.error('Could not save to database:', saveErr);
      }

      doc.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  const clearForm = () => {
    if (confirm('Are you sure you want to clear all fields?')) {
      setFormData({
        company: { name: '', address: '', email: '', phone: '', signatory: '', designation: '' },
        employee: { name: '', id: '', designation: '', department: '' },
        warning: {
          letterDate: '',
          warningType: '',
          incidentDate: '',
          incidentDescription: '',
          previousWarnings: 0,
          policyViolated: '',
          expectedImprovement: '',
          improvementDeadline: '',
          consequences: '',
        },
      });
      const today = new Date();
      const deadlineDate = new Date(today);
      deadlineDate.setDate(deadlineDate.getDate() + 30);
      setFormData(prev => ({
        ...prev,
        warning: {
          ...prev.warning,
          letterDate: today.toISOString().split('T')[0],
          improvementDeadline: deadlineDate.toISOString().split('T')[0],
        },
      }));
      setPreviewVisible(false);
    }
  };

  return (
    <Layout title="Warning Letter Generator" description="Generate professional warning letters for employees" icon="🚨">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Panel */}
        <div className="space-y-6">

          {/* Company Selection */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-purple-50/50 transition-colors duration-200"
              onClick={() => toggleSection('company')}
            >
              <span className="text-2xl">🏢</span>
              <h2 className="text-lg font-bold text-gray-800 flex-1">Company Details</h2>
              <svg className={`w-5 h-5 text-purple-500 transform transition-transform duration-300 ${collapsedSections.company ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {!collapsedSections.company && (
              <div className="px-6 pb-6 space-y-4">
                <div>
                  <label className="form-label">Select Company:</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      className="form-input flex-1"
                      value={companies.findIndex(c => c.name === currentCompany?.name) >= 0 ? companies.findIndex(c => c.name === currentCompany?.name) : ''}
                      onChange={(e) => handleCompanySelect(e.target.value)}
                    >
                      <option value="">-- Select Company --</option>
                      <option value="new">+ Add New Company</option>
                      {companies.map((company, index) => (
                        <option key={index} value={index}>{company.name}</option>
                      ))}
                    </select>
                    <button type="button" className="btn-secondary whitespace-nowrap" onClick={() => setShowCompanyManager(true)}>Manage</button>
                  </div>
                </div>
                {showCompanyForm && (
                  <div className="space-y-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200">
                    <h3 className="text-lg font-bold text-purple-700">Add/Edit Company</h3>
                    <div>
                      <label className="form-label">Company Name:</label>
                      <input type="text" className="form-input" value={formData.company.name} onChange={(e) => handleInputChange('company', 'name', e.target.value)} placeholder="Company Name" />
                    </div>
                    <div>
                      <label className="form-label">Address:</label>
                      <textarea rows="3" className="form-input" value={formData.company.address} onChange={(e) => handleInputChange('company', 'address', e.target.value)} placeholder="Full address" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Email:</label>
                        <input type="email" className="form-input" value={formData.company.email} onChange={(e) => handleInputChange('company', 'email', e.target.value)} placeholder="hr@company.com" />
                      </div>
                      <div>
                        <label className="form-label">Phone:</label>
                        <input type="text" className="form-input" value={formData.company.phone} onChange={(e) => handleInputChange('company', 'phone', e.target.value)} placeholder="+91-XXXXXXXXXX" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Signatory Name:</label>
                        <input type="text" className="form-input" value={formData.company.signatory} onChange={(e) => handleInputChange('company', 'signatory', e.target.value)} placeholder="HR Manager" />
                      </div>
                      <div>
                        <label className="form-label">Signatory Designation:</label>
                        <input type="text" className="form-input" value={formData.company.designation} onChange={(e) => handleInputChange('company', 'designation', e.target.value)} placeholder="HR Manager" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="btn-primary flex-1" onClick={saveCompany}>Save Company</button>
                      <button type="button" className="btn-secondary flex-1" onClick={() => setShowCompanyForm(false)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Employee Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-purple-50/50 transition-colors duration-200"
              onClick={() => toggleSection('employee')}
            >
              <span className="text-2xl">👤</span>
              <h2 className="text-lg font-bold text-gray-800 flex-1">Employee Information</h2>
              <svg className={`w-5 h-5 text-purple-500 transform transition-transform duration-300 ${collapsedSections.employee ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {!collapsedSections.employee && (
              <div className="px-6 pb-6 space-y-4">
                <div>
                  <label className="form-label">Employee Name: <span className="text-red-500">*</span></label>
                  <input type="text" className="form-input" value={formData.employee.name} onChange={(e) => handleInputChange('employee', 'name', e.target.value)} placeholder="Full Name" required />
                </div>
                <div>
                  <label className="form-label">Employee ID:</label>
                  <input type="text" className="form-input" value={formData.employee.id} onChange={(e) => handleInputChange('employee', 'id', e.target.value)} placeholder="Employee ID" />
                </div>
                <div>
                  <label className="form-label">Designation:</label>
                  <input type="text" className="form-input" value={formData.employee.designation} onChange={(e) => handleInputChange('employee', 'designation', e.target.value)} placeholder="e.g., Software Developer" />
                </div>
                <div>
                  <label className="form-label">Department:</label>
                  <input type="text" className="form-input" value={formData.employee.department} onChange={(e) => handleInputChange('employee', 'department', e.target.value)} placeholder="e.g., Engineering" />
                </div>
              </div>
            )}
          </div>

          {/* Warning Details */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-purple-50/50 transition-colors duration-200"
              onClick={() => toggleSection('warning')}
            >
              <span className="text-2xl">⚠️</span>
              <h2 className="text-lg font-bold text-gray-800 flex-1">Warning Details</h2>
              <svg className={`w-5 h-5 text-purple-500 transform transition-transform duration-300 ${collapsedSections.warning ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {!collapsedSections.warning && (
              <div className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Letter Date: <span className="text-red-500">*</span></label>
                    <input type="date" className="form-input" value={formData.warning.letterDate} onChange={(e) => handleInputChange('warning', 'letterDate', e.target.value)} required />
                  </div>
                  <div>
                    <label className="form-label">Incident Date:</label>
                    <input type="date" className="form-input" value={formData.warning.incidentDate} onChange={(e) => handleInputChange('warning', 'incidentDate', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Warning Type: <span className="text-red-500">*</span></label>
                  <select
                    className="form-input"
                    value={formData.warning.warningType}
                    onChange={(e) => handleInputChange('warning', 'warningType', e.target.value)}
                    required
                  >
                    <option value="">-- Select Warning Type --</option>
                    <option value="Verbal Warning">Verbal Warning</option>
                    <option value="First Written Warning">First Written Warning</option>
                    <option value="Second Written Warning">Second Written Warning</option>
                    <option value="Final Written Warning">Final Written Warning</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Previous Warnings:</label>
                  <input type="number" min="0" className="form-input" value={formData.warning.previousWarnings} onChange={(e) => handleInputChange('warning', 'previousWarnings', parseInt(e.target.value) || 0)} placeholder="0" />
                </div>
                <div>
                  <label className="form-label">Incident Description: <span className="text-red-500">*</span></label>
                  <textarea rows="4" className="form-input" value={formData.warning.incidentDescription} onChange={(e) => handleInputChange('warning', 'incidentDescription', e.target.value)} placeholder="Describe the incident, behavior, or performance issue in detail..." />
                </div>
                <div>
                  <label className="form-label">Policy / Rule Violated:</label>
                  <textarea rows="2" className="form-input" value={formData.warning.policyViolated} onChange={(e) => handleInputChange('warning', 'policyViolated', e.target.value)} placeholder="e.g., Section 4.2 of Employee Code of Conduct – Attendance Policy" />
                </div>
                <div>
                  <label className="form-label">Expected Improvement:</label>
                  <textarea rows="3" className="form-input" value={formData.warning.expectedImprovement} onChange={(e) => handleInputChange('warning', 'expectedImprovement', e.target.value)} placeholder="Describe the expected improvement or corrective actions..." />
                </div>
                <div>
                  <label className="form-label">Improvement Deadline:</label>
                  <input type="date" className="form-input" value={formData.warning.improvementDeadline} onChange={(e) => handleInputChange('warning', 'improvementDeadline', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Consequences of Non-Compliance:</label>
                  <textarea rows="2" className="form-input" value={formData.warning.consequences} onChange={(e) => handleInputChange('warning', 'consequences', e.target.value)} placeholder="e.g., Further disciplinary action including suspension or termination of employment." />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200"
              onClick={generatePreview}
            >
              Generate Letter
            </button>
            <button
              type="button"
              className="flex-1 bg-white text-purple-700 font-semibold py-4 px-6 rounded-xl border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200"
              onClick={clearForm}
            >
              Clear Form
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:sticky lg:top-6 h-fit">
          {previewVisible ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Letter Preview</h2>
                <button
                  type="button"
                  className="text-white/80 hover:text-white text-2xl font-bold transition-colors"
                  onClick={() => setPreviewVisible(false)}
                >
                  &times;
                </button>
              </div>
              <div className="p-6">
                <div
                  className="preview-content bg-white p-6 rounded-lg border-2 border-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button
                    type="button"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200"
                    onClick={downloadPDF}
                  >
                    Download PDF
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-white text-purple-700 font-semibold py-3 px-6 rounded-xl border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200"
                    onClick={() => setPreviewVisible(false)}
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 text-center py-16 px-6">
              <div className="text-7xl mb-4">🚨</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">Preview Will Appear Here</h3>
              <p className="text-gray-500">Fill in the form and click "Generate Letter" to preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Company Manager Modal */}
      {showCompanyManager && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCompanyManager(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-100" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Manage Companies</h2>
              <button onClick={() => setShowCompanyManager(false)} className="text-white/80 hover:text-white text-3xl font-bold transition-colors">&times;</button>
            </div>
            <div className="p-6">
              {companies.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">🏢</div>
                  <p className="text-gray-500">No companies added yet. Add one from the form above.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {companies.map((company, index) => (
                    <div key={index} className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100 flex justify-between items-center hover:shadow-md transition-shadow duration-200">
                      <div>
                        <div className="font-semibold text-purple-700">{company.name}</div>
                        <div className="text-sm text-gray-600">{company.address || 'No address'}</div>
                        {company.email && <div className="text-xs text-gray-500">{company.email}</div>}
                      </div>
                      <div className="flex gap-2 ml-4 shrink-0">
                        <button
                          className="px-4 py-2 text-sm font-medium text-purple-700 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors duration-200"
                          onClick={() => {
                            setCurrentCompany(company);
                            handleCompanySelect(index.toString());
                            setShowCompanyManager(false);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors duration-200"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this company?')) {
                              const updated = companies.filter((_, i) => i !== index);
                              setCompanies(updated);
                              localStorage.setItem('warningLetterCompanies', JSON.stringify(updated));
                              if (currentCompany?.name === company.name) {
                                setCurrentCompany(null);
                              }
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default WarningLetter;
