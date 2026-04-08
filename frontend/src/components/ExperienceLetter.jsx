import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { formatDate } from '../utils/pdfUtils';
import { jsPDF } from 'jspdf';
import { saveDocument, pdfBlobToBase64 } from '../utils/documentSaver';

const ExperienceLetter = () => {
  const [companies, setCompanies] = useState([]);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showCompanyManager, setShowCompanyManager] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  const [formData, setFormData] = useState({
    company: { name: '', address: '', email: '', phone: '', signatory: '', designation: '' },
    employee: { name: '', id: '', designation: '', department: '', joiningDate: '', lastWorkingDate: '' },
    experience: {
      letterDate: '', employmentType: 'Full-time', performanceRating: 'Good',
      responsibilities: '', achievements: '', conductRating: 'Good', rehireEligible: 'Yes'
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.jspdf = { jsPDF };
    }
    const stored = localStorage.getItem('experienceLetterCompanies');
    if (stored) {
      setCompanies(JSON.parse(stored));
    }
    const today = new Date();
    setFormData(prev => ({
      ...prev,
      experience: { ...prev.experience, letterDate: today.toISOString().split('T')[0] }
    }));
  }, []);

  const calculateTenure = (joiningDate, lastWorkingDate) => {
    if (!joiningDate || !lastWorkingDate) return '';
    const join = new Date(joiningDate);
    const last = new Date(lastWorkingDate);
    const diffTime = Math.abs(last - join);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;
    let tenure = '';
    if (years > 0) tenure += years + ' year' + (years > 1 ? 's' : '') + ' ';
    if (months > 0) tenure += months + ' month' + (months > 1 ? 's' : '') + ' ';
    if (days > 0 || tenure === '') tenure += days + ' day' + (days !== 1 ? 's' : '');
    return tenure.trim();
  };

  const generateRefNumber = (letterDate) => {
    const year = letterDate ? new Date(letterDate).getFullYear() : new Date().getFullYear();
    return `EXP/${year}/001`;
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
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
      name, address: formData.company.address.trim(), email: formData.company.email.trim(),
      phone: formData.company.phone.trim(), signatory: formData.company.signatory.trim(),
      designation: formData.company.designation.trim()
    };
    let updatedCompanies;
    if (currentCompany && companies.findIndex(c => c.name === currentCompany.name) !== -1) {
      updatedCompanies = companies.map(c => c.name === currentCompany.name ? company : c);
    } else {
      updatedCompanies = [...companies, company];
    }
    setCompanies(updatedCompanies);
    localStorage.setItem('experienceLetterCompanies', JSON.stringify(updatedCompanies));
    setCurrentCompany(company);
    setShowCompanyForm(false);
    alert('Company saved successfully!');
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
    if (!data.employee.joiningDate || !data.employee.lastWorkingDate) {
      alert('Please enter joining date and last working date');
      return;
    }
    const html = generateExperienceLetterHTML(data);
    setPreviewContent(html);
    setPreviewVisible(true);
  };

  const generateExperienceLetterHTML = (data) => {
    const letterDate = formatDate(data.experience.letterDate);
    const joiningDate = formatDate(data.employee.joiningDate);
    const lastWorkingDate = formatDate(data.employee.lastWorkingDate);
    const tenure = calculateTenure(data.employee.joiningDate, data.employee.lastWorkingDate);
    const refNumber = generateRefNumber(data.experience.letterDate);

    return `
      <div class="space-y-6 text-sm leading-relaxed">
        <div class="text-right space-y-1">
          <div class="font-bold text-lg">${data.company.name || 'Company Name'}</div>
          ${data.company.address ? `<div>${data.company.address.replace(/\n/g, '<br>')}</div>` : ''}
          ${data.company.email ? `<div>Email: ${data.company.email}</div>` : ''}
          ${data.company.phone ? `<div>Phone: ${data.company.phone}</div>` : ''}
        </div>
        <hr class="border-gray-300" />
        <div class="flex justify-between">
          <div><strong>Date:</strong> ${letterDate}</div>
          <div><strong>Ref:</strong> ${refNumber}</div>
        </div>
        <h2 class="text-center text-lg font-bold text-gray-700 uppercase tracking-wide mt-4">To Whom It May Concern</h2>
        <h1 class="text-2xl font-bold text-center text-primary-600 mb-6 underline">EXPERIENCE CERTIFICATE</h1>
        <div class="space-y-3">
          <p>This is to certify that <strong>${data.employee.name || 'Employee Name'}</strong> (Employee ID: ${data.employee.id || 'N/A'}) was employed with <strong>${data.company.name || 'our organization'}</strong> as <strong>${data.employee.designation || 'Designation'}</strong>${data.employee.department ? ` in the <strong>${data.employee.department}</strong> department` : ''} from <strong>${joiningDate}</strong> to <strong>${lastWorkingDate}</strong>, a total tenure of <strong>${tenure || 'N/A'}</strong>.</p>
          <p>During this period, ${data.employee.name ? `Mr./Ms. ${data.employee.name}` : 'the employee'} was engaged as a <strong>${data.experience.employmentType}</strong> employee.</p>
        </div>
        ${data.experience.responsibilities ? `
        <div class="mt-4">
          <div class="font-semibold text-primary-600 mb-2">Key Responsibilities:</div>
          <p>${data.experience.responsibilities.replace(/\n/g, '<br>')}</p>
        </div>` : ''}
        <div class="mt-4">
          <div class="font-semibold text-primary-600 mb-2">Performance Assessment:</div>
          <p>${data.employee.name ? `Mr./Ms. ${data.employee.name}` : 'The employee'} demonstrated <strong>${data.experience.performanceRating.toLowerCase()}</strong> performance throughout the tenure of employment and consistently met the expectations of the role and responsibilities assigned.</p>
        </div>
        ${data.experience.achievements ? `
        <div class="mt-4">
          <div class="font-semibold text-primary-600 mb-2">Notable Achievements:</div>
          <p>${data.experience.achievements.replace(/\n/g, '<br>')}</p>
        </div>` : ''}
        <div class="mt-4">
          <div class="font-semibold text-primary-600 mb-2">Character & Conduct:</div>
          <p>During the period of employment, ${data.employee.name ? `Mr./Ms. ${data.employee.name}` : 'the employee'} maintained an <strong>${data.experience.conductRating.toLowerCase()}</strong> standard of conduct and demonstrated professionalism, integrity, and dedication in all assignments.</p>
        </div>
        ${data.experience.rehireEligible === 'Yes' ? `
        <div class="mt-4">
          <p>${data.employee.name ? `Mr./Ms. ${data.employee.name}` : 'The employee'} is eligible for rehire and we would welcome the opportunity to work with them again in the future.</p>
        </div>` : ''}
        <div class="mt-4 space-y-3">
          <p>We wish ${data.employee.name ? `Mr./Ms. ${data.employee.name}` : 'the employee'} all the very best in future endeavors and are confident that they will continue to excel in their career.</p>
          <p>This experience certificate is issued upon request for whatever purpose it may serve.</p>
        </div>
        <div class="mt-10">
          <p><strong>For ${data.company.name || 'Company Name'},</strong></p>
          <div class="mt-8 space-y-1">
            <p><strong>${data.company.signatory || 'Authorized Signatory'}</strong></p>
            <p>${data.company.designation || 'Designation'}</p>
            <p>${data.company.name || 'Company Name'}</p>
          </div>
          <div class="mt-6 pt-4 border-t border-dashed border-gray-300 text-center text-xs text-gray-400">
            [Company Seal]
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
      const refNumber = generateRefNumber(data.experience.letterDate);
      const tenure = calculateTenure(data.employee.joiningDate, data.employee.lastWorkingDate);

      function checkPageBreak(requiredSpace) {
        if (yPos + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
      }

      function addText(text, fontSize = 12, isBold = false, align = 'left') {
        doc.setFontSize(fontSize);
        doc.setFont('times', isBold ? 'bold' : 'normal');
        const maxWidth = pageWidth - (margin * 2);
        const lines = doc.splitTextToSize(text, maxWidth);
        checkPageBreak(lines.length * lineHeight);
        const xPos = align === 'center' ? pageWidth / 2 : align === 'right' ? pageWidth - margin : margin;
        lines.forEach(line => {
          doc.text(line, xPos, yPos, { align });
          yPos += lineHeight;
        });
      }

      function addWrappedParagraph(text, fontSize = 11, isBold = false) {
        doc.setFontSize(fontSize);
        doc.setFont('times', isBold ? 'bold' : 'normal');
        const maxWidth = pageWidth - (margin * 2);
        const lines = doc.splitTextToSize(text, maxWidth);
        checkPageBreak(lines.length * lineHeight);
        lines.forEach(line => {
          doc.text(line, margin, yPos);
          yPos += lineHeight;
        });
      }

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

      // Company letterhead
      addText(data.company.name || 'Company Name', 16, true, 'center');
      if (data.company.address) addText(data.company.address, 10, false, 'center');
      if (data.company.email || data.company.phone) {
        const contactParts = [];
        if (data.company.email) contactParts.push(`Email: ${data.company.email}`);
        if (data.company.phone) contactParts.push(`Phone: ${data.company.phone}`);
        addText(contactParts.join('  |  '), 9, false, 'center');
      }
      yPos += 2;

      // Horizontal line under letterhead
      doc.setLineWidth(0.3);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;

      // Date and reference
      doc.setFontSize(11);
      doc.setFont('times', 'normal');
      doc.text(`Date: ${formatDate(data.experience.letterDate)}`, margin, yPos);
      doc.text(`Ref: ${refNumber}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 10;

      // TO WHOM IT MAY CONCERN
      addText('TO WHOM IT MAY CONCERN', 13, true, 'center');
      yPos += 3;

      // EXPERIENCE CERTIFICATE title
      addText('EXPERIENCE CERTIFICATE', 16, true, 'center');
      yPos += 8;

      // Body paragraph - employment confirmation
      addWrappedParagraph(`This is to certify that ${data.employee.name || 'Employee Name'} (Employee ID: ${data.employee.id || 'N/A'}) was employed with ${data.company.name || 'our organization'} as ${data.employee.designation || 'Designation'}${data.employee.department ? ` in the ${data.employee.department} department` : ''} from ${formatDate(data.employee.joiningDate)} to ${formatDate(data.employee.lastWorkingDate)}, a total tenure of ${tenure || 'N/A'}.`);
      yPos += 3;

      addWrappedParagraph(`During this period, ${data.employee.name ? `Mr./Ms. ${data.employee.name}` : 'the employee'} was engaged as a ${data.experience.employmentType} employee.`);
      yPos += 5;

      // Responsibilities
      if (data.experience.responsibilities) {
        addText('Key Responsibilities:', 12, true);
        yPos += 1;
        addWrappedParagraph(data.experience.responsibilities);
        yPos += 5;
      }

      // Performance
      addText('Performance Assessment:', 12, true);
      yPos += 1;
      addWrappedParagraph(`${data.employee.name ? `Mr./Ms. ${data.employee.name}` : 'The employee'} demonstrated ${data.experience.performanceRating.toLowerCase()} performance throughout the tenure of employment and consistently met the expectations of the role and responsibilities assigned.`);
      yPos += 5;

      // Achievements
      if (data.experience.achievements) {
        addText('Notable Achievements:', 12, true);
        yPos += 1;
        addWrappedParagraph(data.experience.achievements);
        yPos += 5;
      }

      // Character & Conduct
      addText('Character & Conduct:', 12, true);
      yPos += 1;
      addWrappedParagraph(`During the period of employment, ${data.employee.name ? `Mr./Ms. ${data.employee.name}` : 'the employee'} maintained an ${data.experience.conductRating.toLowerCase()} standard of conduct and demonstrated professionalism, integrity, and dedication in all assignments.`);
      yPos += 5;

      // Rehire eligibility
      if (data.experience.rehireEligible === 'Yes') {
        addWrappedParagraph(`${data.employee.name ? `Mr./Ms. ${data.employee.name}` : 'The employee'} is eligible for rehire and we would welcome the opportunity to work with them again in the future.`);
        yPos += 3;
      }

      // Wishing well
      addWrappedParagraph(`We wish ${data.employee.name ? `Mr./Ms. ${data.employee.name}` : 'the employee'} all the very best in future endeavors and are confident that they will continue to excel in their career.`);
      yPos += 3;
      addWrappedParagraph('This experience certificate is issued upon request for whatever purpose it may serve.');
      yPos += 8;

      // Signature block
      checkPageBreak(40);
      addText(`For ${data.company.name || 'Company Name'},`, 12, true);
      yPos += 15;
      addText(data.company.signatory || 'Authorized Signatory', 12, true);
      addText(data.company.designation || 'Designation', 11);
      addText(data.company.name || 'Company Name', 11);
      yPos += 8;

      // Company seal placeholder
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.2);
      const sealX = pageWidth / 2 - 15;
      checkPageBreak(20);
      doc.roundedRect(sealX, yPos, 30, 12, 2, 2);
      doc.setFontSize(8);
      doc.setFont('times', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('Company Seal', pageWidth / 2, yPos + 7, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      yPos += 18;

      // Disclaimer
      checkPageBreak(10);
      doc.setFontSize(8);
      doc.setFont('times', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Disclaimer: This document is system-generated and does not require manual signature or authorization.', pageWidth / 2, yPos, { align: 'center' });
      doc.setTextColor(0, 0, 0);

      const employeeName = (data.employee.name || 'Employee').replace(/\s+/g, '_');
      const companyName = (data.company.name || 'Company').replace(/\s+/g, '_');
      const filename = `Experience_Letter_${companyName}_${employeeName}_${new Date().toISOString().split('T')[0]}.pdf`;

      const pdfBlob = doc.output('blob');
      doc.save(filename);

      try {
        const base64 = await pdfBlobToBase64(pdfBlob);
        await saveDocument({
          documentType: 'EXPERIENCE_LETTER',
          title: `Experience Letter - ${data.employee.name || 'Employee'}`,
          content: previewContent,
          pdfData: base64,
          metadata: {
            employeeName: data.employee.name,
            employeeId: data.employee.id,
            companyName: data.company.name,
            designation: data.employee.designation,
            department: data.employee.department,
            joiningDate: data.employee.joiningDate,
            lastWorkingDate: data.employee.lastWorkingDate,
            employmentType: data.experience.employmentType,
            performanceRating: data.experience.performanceRating
          },
          employeeId: data.employee.id
        });
      } catch (saveError) {
        console.error('Error saving document to database:', saveError);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  const clearForm = () => {
    if (confirm('Are you sure you want to clear all fields?')) {
      setFormData({
        company: { name: '', address: '', email: '', phone: '', signatory: '', designation: '' },
        employee: { name: '', id: '', designation: '', department: '', joiningDate: '', lastWorkingDate: '' },
        experience: {
          letterDate: '', employmentType: 'Full-time', performanceRating: 'Good',
          responsibilities: '', achievements: '', conductRating: 'Good', rehireEligible: 'Yes'
        }
      });
      const today = new Date();
      setFormData(prev => ({
        ...prev,
        experience: { ...prev.experience, letterDate: today.toISOString().split('T')[0] }
      }));
      setPreviewVisible(false);
    }
  };

  return (
    <Layout title="Experience Letter Generator" description="Generate professional experience/service certificates" icon="📜">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Company Selection */}
          <div className="card shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🏢</span>
              <h2 className="section-title mb-0 flex-1">Company Details</h2>
            </div>
            <div className="space-y-4">
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
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border-2 border-primary-200">
                  <h3 className="text-lg font-bold text-primary-600">Add/Edit Company</h3>
                  <div><label className="form-label">Company Name:</label>
                    <input type="text" className="form-input" value={formData.company.name} onChange={(e) => handleInputChange('company', 'name', e.target.value)} placeholder="Company Name" /></div>
                  <div><label className="form-label">Address:</label>
                    <textarea rows="3" className="form-input" value={formData.company.address} onChange={(e) => handleInputChange('company', 'address', e.target.value)} placeholder="Full address" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="form-label">Email:</label>
                      <input type="email" className="form-input" value={formData.company.email} onChange={(e) => handleInputChange('company', 'email', e.target.value)} placeholder="hr@company.com" /></div>
                    <div><label className="form-label">Phone:</label>
                      <input type="text" className="form-input" value={formData.company.phone} onChange={(e) => handleInputChange('company', 'phone', e.target.value)} placeholder="+91-XXXXXXXXXX" /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="form-label">Signatory Name:</label>
                      <input type="text" className="form-input" value={formData.company.signatory} onChange={(e) => handleInputChange('company', 'signatory', e.target.value)} placeholder="HR Manager" /></div>
                    <div><label className="form-label">Signatory Designation:</label>
                      <input type="text" className="form-input" value={formData.company.designation} onChange={(e) => handleInputChange('company', 'designation', e.target.value)} placeholder="HR Manager" /></div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="btn-primary flex-1" onClick={saveCompany}>Save</button>
                    <button type="button" className="btn-secondary flex-1" onClick={() => setShowCompanyForm(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Employee Details */}
          <div className="card shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">👤</span>
              <h2 className="section-title mb-0 flex-1">Employee Details</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="form-label">Employee Name: <span className="text-red-500">*</span></label>
                  <input type="text" className="form-input" value={formData.employee.name} onChange={(e) => handleInputChange('employee', 'name', e.target.value)} placeholder="Full Name" required /></div>
                <div><label className="form-label">Employee ID:</label>
                  <input type="text" className="form-input" value={formData.employee.id} onChange={(e) => handleInputChange('employee', 'id', e.target.value)} placeholder="Employee ID" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="form-label">Designation: <span className="text-red-500">*</span></label>
                  <input type="text" className="form-input" value={formData.employee.designation} onChange={(e) => handleInputChange('employee', 'designation', e.target.value)} placeholder="e.g., Software Developer" required /></div>
                <div><label className="form-label">Department:</label>
                  <input type="text" className="form-input" value={formData.employee.department} onChange={(e) => handleInputChange('employee', 'department', e.target.value)} placeholder="e.g., Engineering" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="form-label">Date of Joining: <span className="text-red-500">*</span></label>
                  <input type="date" className="form-input" value={formData.employee.joiningDate} onChange={(e) => handleInputChange('employee', 'joiningDate', e.target.value)} required /></div>
                <div><label className="form-label">Last Working Date: <span className="text-red-500">*</span></label>
                  <input type="date" className="form-input" value={formData.employee.lastWorkingDate} onChange={(e) => handleInputChange('employee', 'lastWorkingDate', e.target.value)} required /></div>
              </div>
            </div>
          </div>

          {/* Experience Details */}
          <div className="card shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⭐</span>
              <h2 className="section-title mb-0 flex-1">Experience Details</h2>
            </div>
            <div className="space-y-4">
              <div><label className="form-label">Letter Date: <span className="text-red-500">*</span></label>
                <input type="date" className="form-input" value={formData.experience.letterDate} onChange={(e) => handleInputChange('experience', 'letterDate', e.target.value)} required /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="form-label">Employment Type:</label>
                  <select className="form-input" value={formData.experience.employmentType} onChange={(e) => handleInputChange('experience', 'employmentType', e.target.value)}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select></div>
                <div><label className="form-label">Performance Rating:</label>
                  <select className="form-input" value={formData.experience.performanceRating} onChange={(e) => handleInputChange('experience', 'performanceRating', e.target.value)}>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Satisfactory">Satisfactory</option>
                    <option value="Average">Average</option>
                  </select></div>
              </div>
              <div><label className="form-label">Key Responsibilities:</label>
                <textarea rows="4" className="form-input" value={formData.experience.responsibilities} onChange={(e) => handleInputChange('experience', 'responsibilities', e.target.value)} placeholder="Describe the key responsibilities held during employment..." /></div>
              <div><label className="form-label">Notable Achievements:</label>
                <textarea rows="4" className="form-input" value={formData.experience.achievements} onChange={(e) => handleInputChange('experience', 'achievements', e.target.value)} placeholder="Describe any notable achievements or contributions..." /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="form-label">Conduct Rating:</label>
                  <select className="form-input" value={formData.experience.conductRating} onChange={(e) => handleInputChange('experience', 'conductRating', e.target.value)}>
                    <option value="Exemplary">Exemplary</option>
                    <option value="Good">Good</option>
                    <option value="Satisfactory">Satisfactory</option>
                  </select></div>
                <div><label className="form-label">Eligible for Rehire:</label>
                  <select className="form-input" value={formData.experience.rehireEligible} onChange={(e) => handleInputChange('experience', 'rehireEligible', e.target.value)}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" className="btn-primary flex-1 text-lg py-4" onClick={generatePreview}>Generate Letter</button>
            <button type="button" className="btn-secondary flex-1 py-4" onClick={generatePreview}>Preview</button>
            <button type="button" className="btn-secondary flex-1 py-4" onClick={clearForm}>Clear</button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:sticky lg:top-6 h-fit">
          {previewVisible ? (
            <div className="card shadow-2xl">
              <h2 className="section-title mb-4">Preview</h2>
              <div className="preview-content bg-white p-6 rounded-lg border-2 border-gray-200 max-h-[calc(100vh-200px)] overflow-y-auto" dangerouslySetInnerHTML={{ __html: previewContent }} />
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button type="button" className="btn-primary flex-1" onClick={downloadPDF}>Download PDF</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setPreviewVisible(false)}>Close</button>
              </div>
            </div>
          ) : (
            <div className="card shadow-xl bg-white/80 text-center py-12">
              <div className="text-6xl mb-4">📜</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">Preview Will Appear Here</h3>
              <p className="text-gray-500">Fill the form and click "Generate Letter"</p>
            </div>
          )}
        </div>
      </div>

      {/* Company Manager Modal */}
      {showCompanyManager && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={() => setShowCompanyManager(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Manage Companies</h2>
              <button onClick={() => setShowCompanyManager(false)} className="text-gray-500 hover:text-gray-700 text-3xl font-bold">&times;</button>
            </div>
            <div className="p-6">
              {companies.length === 0 ? (
                <p className="text-gray-600">No companies added yet.</p>
              ) : (
                <div className="space-y-3">
                  {companies.map((company, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-primary-600">{company.name}</div>
                        <div className="text-sm text-gray-600">{company.address || 'No address'}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-secondary text-sm px-4 py-2" onClick={() => { setCurrentCompany(company); handleCompanySelect(index.toString()); setShowCompanyManager(false); }}>Edit</button>
                        <button className="btn-secondary text-sm px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100" onClick={() => {
                          if (confirm('Are you sure you want to delete this company?')) {
                            const updated = companies.filter((_, i) => i !== index);
                            setCompanies(updated);
                            localStorage.setItem('experienceLetterCompanies', JSON.stringify(updated));
                            if (currentCompany?.name === company.name) {
                              setCurrentCompany(null);
                            }
                          }
                        }}>Delete</button>
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

export default ExperienceLetter;
