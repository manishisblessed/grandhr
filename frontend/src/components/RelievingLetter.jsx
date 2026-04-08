import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { formatDate, addCompanyLetterheadPdf } from '../utils/pdfUtils';
import { companyLetterheadHtml } from '../utils/letterheadHtml';
import { jsPDF } from 'jspdf';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';

const RelievingLetter = () => {
  const [companies, setCompanies] = useState([]);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showCompanyManager, setShowCompanyManager] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    company: { name: '', address: '', email: '', phone: '', signatory: '', designation: '', logoImage: null },
    employee: { name: '', id: '', designation: '', department: '', email: '' },
    employment: { joiningDate: '', relievingDate: '', letterDate: '', reasonForLeaving: '' }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.jspdf = { jsPDF };
    }
    const stored = localStorage.getItem('relievingLetterCompanies');
    if (stored) {
      setCompanies(JSON.parse(stored));
    }
    const today = new Date();
    setFormData(prev => ({
      ...prev,
      employment: { ...prev.employment, letterDate: today.toISOString().split('T')[0] }
    }));
  }, []);

  const calculateTenure = (joiningDate, relievingDate) => {
    if (!joiningDate || !relievingDate) return '';
    const join = new Date(joiningDate);
    const relieve = new Date(relievingDate);
    const diffTime = Math.abs(relieve - join);
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

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleCompanyLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      handleInputChange('company', 'logoImage', null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => handleInputChange('company', 'logoImage', ev.target?.result || null);
    reader.readAsDataURL(file);
  };

  const handleEmailLetter = async () => {
    const recipientEmail = emailTo.trim() || formData.employee.email?.trim();
    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      showError('Please enter a valid employee email address');
      return;
    }
    const data = { ...formData, company: currentCompany || formData.company };
    if (!data.employee.name) {
      showError('Please fill employee name before sending');
      return;
    }
    setSendingEmail(true);
    try {
      const htmlContent = generateRelievingLetterHTML(data);
      const subject = `Relieving Letter - ${data.company.name || 'Company'}`;
      await api.post('/generated-documents/send-email', {
        toEmail: recipientEmail,
        subject,
        htmlContent,
      });
      showSuccess(`Relieving letter sent to ${recipientEmail}`);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCompanySelect = (value) => {
    if (value === 'new') {
      setShowCompanyForm(true);
      setCurrentCompany(null);
      setFormData(prev => ({ ...prev, company: { name: '', address: '', email: '', phone: '', signatory: '', designation: '', logoImage: null } }));
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
      designation: formData.company.designation.trim(),
      logoImage: formData.company.logoImage || null
    };
    let updatedCompanies;
    if (currentCompany && companies.findIndex(c => c.name === currentCompany.name) !== -1) {
      updatedCompanies = companies.map(c => c.name === currentCompany.name ? company : c);
    } else {
      updatedCompanies = [...companies, company];
    }
    setCompanies(updatedCompanies);
    localStorage.setItem('relievingLetterCompanies', JSON.stringify(updatedCompanies));
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
    if (!data.employment.joiningDate || !data.employment.relievingDate) {
      alert('Please enter joining and relieving dates');
      return;
    }
    const html = generateRelievingLetterHTML(data);
    setPreviewContent(html);
    setPreviewVisible(true);
  };

  const generateRelievingLetterHTML = (data) => {
    const letterDate = formatDate(data.employment.letterDate);
    const joiningDate = formatDate(data.employment.joiningDate);
    const relievingDate = formatDate(data.employment.relievingDate);
    const tenure = calculateTenure(data.employment.joiningDate, data.employment.relievingDate);
    return `
      <div class="space-y-6 text-sm leading-relaxed">
        ${companyLetterheadHtml(data.company)}
        <h1 class="text-2xl font-bold text-center text-primary-600 mb-6">RELIEVING LETTER</h1>
        <div><strong>Date:</strong> ${letterDate}</div>
        <div class="space-y-1">
          <strong>To,</strong><br>
          ${data.employee.name || 'Employee Name'}<br>
          ${data.employee.id ? `Employee ID: ${data.employee.id}<br>` : ''}
          ${data.employee.designation ? `Designation: ${data.employee.designation}<br>` : ''}
          ${data.employee.department ? `Department: ${data.employee.department}<br>` : ''}
          ${data.employee.email ? `Email: ${data.employee.email}` : ''}
        </div>
        <div class="font-semibold text-primary-600 my-4">
          <strong>Subject: Relieving Letter - ${data.employee.name || 'Employee'}</strong>
        </div>
        <div class="space-y-3">
          <p>Dear ${data.employee.name || 'Employee'},</p>
          <p>This is to certify that <strong>${data.employee.name || 'Employee Name'}</strong> (Employee ID: ${data.employee.id || 'N/A'}) was employed with ${data.company.name || 'our company'} as <strong>${data.employee.designation || 'Designation'}</strong> ${data.employee.department ? `in the ${data.employee.department} department` : ''}.</p>
        </div>
        <div class="mt-6">
          <div class="font-semibold text-primary-600 mb-2">Employment Details:</div>
          <ul class="list-disc list-inside space-y-1 ml-4">
            <li><strong>Date of Joining:</strong> ${joiningDate}</li>
            <li><strong>Date of Relieving:</strong> ${relievingDate}</li>
            <li><strong>Total Tenure:</strong> ${tenure || 'N/A'}</li>
          </ul>
        </div>
        <div class="mt-6 space-y-3">
          <p>During the tenure of employment, ${data.employee.name || 'the employee'} has performed duties assigned and has been relieved from services on ${relievingDate}.</p>
          <p>We wish ${data.employee.name || 'the employee'} all the best for future endeavors.</p>
        </div>
        <div class="mt-8">
          <p><strong>Best regards,</strong></p>
          <p class="mt-4"><strong>${data.company.signatory || 'Authorized Signatory'}</strong></p>
          <p>${data.company.designation || 'Designation'}</p>
          <p>${data.company.name || 'Company Name'}</p>
        </div>
      </div>
    `;
  };

  const downloadPDF = () => {
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

      function addText(text, fontSize = 12, isBold = false, align = 'left') {
        doc.setFontSize(fontSize);
        doc.setFont('times', isBold ? 'bold' : 'normal');
        const maxWidth = pageWidth - (margin * 2);
        const lines = doc.splitTextToSize(text, maxWidth);
        if (yPos + (lines.length * lineHeight) > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
        lines.forEach(line => {
          doc.text(line, margin, yPos, { align: align });
          yPos += lineHeight;
        });
      }

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

      yPos = addCompanyLetterheadPdf(doc, data.company, margin, pageWidth, margin);
      addText('RELIEVING LETTER', 18, true, 'center');
      yPos += 10;
      addText(`Date: ${formatDate(data.employment.letterDate)}`, 12, false, 'left');
      yPos += 5;
      addText('To,', 12, true);
      addText(data.employee.name || 'Employee Name', 12, true);
      if (data.employee.id) addText(`Employee ID: ${data.employee.id}`, 10);
      if (data.employee.designation) addText(`Designation: ${data.employee.designation}`, 10);
      if (data.employee.department) addText(`Department: ${data.employee.department}`, 10);
      if (data.employee.email) addText(`Email: ${data.employee.email}`, 10);
      yPos += 5;
      addText(`Subject: Relieving Letter - ${data.employee.name || 'Employee'}`, 12, true);
      yPos += 5;
      addText(`Dear ${data.employee.name || 'Employee'},`, 12);
      yPos += 3;
      addText(`This is to certify that ${data.employee.name || 'Employee Name'} (Employee ID: ${data.employee.id || 'N/A'}) was employed with ${data.company.name || 'our company'} as ${data.employee.designation || 'Designation'} ${data.employee.department ? `in the ${data.employee.department} department` : ''}.`, 11);
      yPos += 5;
      addText('Employment Details:', 12, true);
      addText(`   • Date of Joining: ${formatDate(data.employment.joiningDate)}`, 11);
      addText(`   • Date of Relieving: ${formatDate(data.employment.relievingDate)}`, 11);
      const tenure = calculateTenure(data.employment.joiningDate, data.employment.relievingDate);
      addText(`   • Total Tenure: ${tenure || 'N/A'}`, 11);
      yPos += 5;
      addText(`During the tenure of employment, ${data.employee.name || 'the employee'} has performed duties assigned and has been relieved from services on ${formatDate(data.employment.relievingDate)}.`, 11);
      yPos += 3;
      addText(`We wish ${data.employee.name || 'the employee'} all the best for future endeavors.`, 11);
      yPos += 5;
      addText('Best regards,', 12);
      yPos += 10;
      addText(data.company.signatory || 'Authorized Signatory', 12, true);
      addText(data.company.designation || 'Designation', 11);
      addText(data.company.name || 'Company Name', 11);
      yPos += 10;
      doc.setFontSize(8);
      doc.setFont('times', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Disclaimer: This document is system-generated and does not require manual signature or authorization.', pageWidth / 2, yPos, { align: 'center' });

      const employeeName = (data.employee.name || 'Employee').replace(/\s+/g, '_');
      const companyName = (data.company.name || 'Company').replace(/\s+/g, '_');
      const filename = `Relieving_Letter_${companyName}_${employeeName}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  const clearForm = () => {
    if (confirm('Are you sure you want to clear all fields?')) {
      setFormData({
        company: { name: '', address: '', email: '', phone: '', signatory: '', designation: '', logoImage: null },
        employee: { name: '', id: '', designation: '', department: '', email: '' },
        employment: { joiningDate: '', relievingDate: '', letterDate: '', reasonForLeaving: '' }
      });
      const today = new Date();
      setFormData(prev => ({
        ...prev,
        employment: { ...prev.employment, letterDate: today.toISOString().split('T')[0] }
      }));
      setPreviewVisible(false);
      setEmailTo('');
    }
  };

  return (
    <Layout title="Relieving Letter Generator" description="Generate professional relieving letters" icon="👋">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Company Selection */}
          <div className="card shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🏢</span>
              <h2 className="section-title mb-0 flex-1">Company Selection</h2>
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
                  <div>
                    <label className="form-label">Company Logo (optional):</label>
                    <input type="file" accept="image/*" className="form-input" onChange={handleCompanyLogoUpload} />
                    {formData.company.logoImage && (
                      <div className="mt-2 flex items-center gap-3">
                        <img src={formData.company.logoImage} alt="" className="max-h-16 object-contain border rounded p-1 bg-white" />
                        <button type="button" className="text-sm text-red-600 font-medium" onClick={() => handleInputChange('company', 'logoImage', null)}>Remove logo</button>
                      </div>
                    )}
                  </div>
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

          {/* Employee Information */}
          <div className="card shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">👤</span>
              <h2 className="section-title mb-0 flex-1">Employee Information</h2>
            </div>
            <div className="space-y-4">
              <div><label className="form-label">Employee Name: <span className="text-red-500">*</span></label>
                <input type="text" className="form-input" value={formData.employee.name} onChange={(e) => handleInputChange('employee', 'name', e.target.value)} placeholder="Full Name" required /></div>
              <div><label className="form-label">Employee ID: <span className="text-red-500">*</span></label>
                <input type="text" className="form-input" value={formData.employee.id} onChange={(e) => handleInputChange('employee', 'id', e.target.value)} placeholder="Employee ID" required /></div>
              <div><label className="form-label">Designation: <span className="text-red-500">*</span></label>
                <input type="text" className="form-input" value={formData.employee.designation} onChange={(e) => handleInputChange('employee', 'designation', e.target.value)} placeholder="e.g., Software Developer" required /></div>
              <div><label className="form-label">Department:</label>
                <input type="text" className="form-input" value={formData.employee.department} onChange={(e) => handleInputChange('employee', 'department', e.target.value)} placeholder="e.g., Engineering" /></div>
              <div><label className="form-label">Employee Email (for sending letter):</label>
                <input type="email" className="form-input" value={formData.employee.email} onChange={(e) => handleInputChange('employee', 'email', e.target.value)} placeholder="employee@example.com" /></div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="card shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📅</span>
              <h2 className="section-title mb-0 flex-1">Employment Details</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="form-label">Date of Joining: <span className="text-red-500">*</span></label>
                  <input type="date" className="form-input" value={formData.employment.joiningDate} onChange={(e) => handleInputChange('employment', 'joiningDate', e.target.value)} required /></div>
                <div><label className="form-label">Date of Relieving: <span className="text-red-500">*</span></label>
                  <input type="date" className="form-input" value={formData.employment.relievingDate} onChange={(e) => handleInputChange('employment', 'relievingDate', e.target.value)} required /></div>
              </div>
              <div><label className="form-label">Letter Date: <span className="text-red-500">*</span></label>
                <input type="date" className="form-input" value={formData.employment.letterDate} onChange={(e) => handleInputChange('employment', 'letterDate', e.target.value)} required /></div>
              <div><label className="form-label">Reason for Leaving:</label>
                <textarea rows="3" className="form-input" value={formData.employment.reasonForLeaving} onChange={(e) => handleInputChange('employment', 'reasonForLeaving', e.target.value)} placeholder="e.g., Personal reasons, Better opportunity, etc." /></div>
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
              <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700">Email to employee</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    className="form-input flex-1"
                    placeholder="employee@example.com"
                    value={emailTo || formData.employee.email || ''}
                    onChange={(e) => setEmailTo(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-primary whitespace-nowrap px-6 disabled:opacity-50"
                    onClick={handleEmailLetter}
                    disabled={sendingEmail}
                  >
                    {sendingEmail ? 'Sending…' : 'Send to email'}
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button type="button" className="btn-primary flex-1" onClick={downloadPDF}>Download PDF</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setPreviewVisible(false)}>Close</button>
              </div>
            </div>
          ) : (
            <div className="card shadow-xl bg-white/80 text-center py-12">
              <div className="text-6xl mb-4">👋</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">Preview Will Appear Here</h3>
              <p className="text-gray-500">Fill the form and click "Preview"</p>
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
                            localStorage.setItem('relievingLetterCompanies', JSON.stringify(updated));
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

export default RelievingLetter;
