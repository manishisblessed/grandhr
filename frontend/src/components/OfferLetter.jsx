import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { formatDate, formatCurrency } from '../utils/pdfUtils';
import { jsPDF } from 'jspdf';
import { saveDocument, pdfBlobToBase64 } from '../utils/documentSaver';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';

const OfferLetter = () => {
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
    company: {
      name: '',
      address: '',
      email: '',
      phone: '',
      website: '',
      signatory: '',
      designation: ''
    },
    candidate: {
      name: '',
      address: '',
      email: '',
      phone: ''
    },
    job: {
      position: '',
      department: '',
      joiningDate: '',
      workLocation: ''
    },
    compensation: {
      annualSalary: '',
      monthlySalary: '',
      probationPeriod: '3 months',
      benefits: ''
    },
    terms: {
      workingHours: '9:00 AM to 6:00 PM',
      noticePeriod: '30 days',
      offerDate: '',
      validityPeriod: '15 days',
      additionalTerms: ''
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.jspdf = { jsPDF };
    }
    const stored = localStorage.getItem('offerLetterCompanies');
    if (stored) {
      setCompanies(JSON.parse(stored));
    }
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 15);
    setFormData(prev => ({
      ...prev,
      terms: { ...prev.terms, offerDate: today.toISOString().split('T')[0] },
      job: { ...prev.job, joiningDate: futureDate.toISOString().split('T')[0] }
    }));
  }, []);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleCompanySelect = (value) => {
    if (value === 'new') {
      setShowCompanyForm(true);
      setCurrentCompany(null);
      setFormData(prev => ({ ...prev, company: { name: '', address: '', email: '', phone: '', website: '', signatory: '', designation: '' } }));
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
      website: formData.company.website.trim(),
      signatory: formData.company.signatory.trim(),
      designation: formData.company.designation.trim()
    };

    let updatedCompanies;
    if (currentCompany && companies.findIndex(c => c.name === currentCompany.name) !== -1) {
      updatedCompanies = companies.map(c => c.name === currentCompany.name ? company : c);
    } else {
      updatedCompanies = [...companies, company];
    }

    setCompanies(updatedCompanies);
    localStorage.setItem('offerLetterCompanies', JSON.stringify(updatedCompanies));
    setCurrentCompany(company);
    setShowCompanyForm(false);
    alert('Company saved successfully!');
  };

  const generatePreview = () => {
    const data = {
      ...formData,
      company: currentCompany || formData.company
    };

    if (!data.company.name) {
      alert('Please select or add a company');
      return;
    }
    if (!data.candidate.name) {
      alert('Please enter candidate name');
      return;
    }
    if (!data.job.position) {
      alert('Please enter position');
      return;
    }

    const html = generateOfferLetterHTML(data);
    setPreviewContent(html);
    setPreviewVisible(true);
  };

  const generateOfferLetterHTML = (data) => {
    const offerDate = formatDate(data.terms.offerDate);
    const joiningDate = formatDate(data.job.joiningDate);
    const monthlySalary = formatCurrency(data.compensation.monthlySalary);
    const annualSalary = formatCurrency(data.compensation.annualSalary);

    return `
      <div class="space-y-6 text-sm leading-relaxed">
        <h1 class="text-2xl font-bold text-center text-primary-600 mb-6">OFFER LETTER</h1>
        <div class="text-right space-y-1">
          <div class="font-bold">${data.company.name || 'Company Name'}</div>
          ${data.company.address ? `<div>${data.company.address.replace(/\n/g, '<br>')}</div>` : ''}
          ${data.company.email ? `<div>Email: ${data.company.email}</div>` : ''}
          ${data.company.phone ? `<div>Phone: ${data.company.phone}</div>` : ''}
          ${data.company.website ? `<div>Website: ${data.company.website}</div>` : ''}
        </div>
        <div><strong>Date:</strong> ${offerDate}</div>
        <div class="space-y-1">
          <strong>To,</strong><br>
          ${data.candidate.name || 'Candidate Name'}<br>
          ${data.candidate.address ? data.candidate.address.replace(/\n/g, '<br>') : ''}<br>
          ${data.candidate.email ? `Email: ${data.candidate.email}<br>` : ''}
          ${data.candidate.phone ? `Phone: ${data.candidate.phone}` : ''}
        </div>
        <div class="font-semibold text-primary-600 my-4">
          <strong>Subject: Offer of Employment - ${data.job.position || 'Position'}</strong>
        </div>
        <div class="space-y-3">
          <p>Dear ${data.candidate.name || 'Candidate'},</p>
          <p>We are pleased to offer you the position of <strong>${data.job.position || 'Position'}</strong> 
          ${data.job.department ? `in our ${data.job.department} department` : ''} at 
          <strong>${data.company.name || 'our company'}</strong>. We believe your skills and experience 
          will be a valuable addition to our team.</p>
        </div>
        <div class="mt-6">
          <div class="font-semibold text-primary-600 mb-2">1. Position & Joining Details:</div>
          <ul class="list-disc list-inside space-y-1 ml-4">
            <li><strong>Designation:</strong> ${data.job.position || 'N/A'}</li>
            <li><strong>Department:</strong> ${data.job.department || 'N/A'}</li>
            <li><strong>Joining Date:</strong> ${joiningDate}</li>
            <li><strong>Work Location:</strong> ${data.job.workLocation || 'As per company policy'}</li>
          </ul>
        </div>
        <div class="mt-6">
          <div class="font-semibold text-primary-600 mb-2">2. Compensation Package:</div>
          <ul class="list-disc list-inside space-y-1 ml-4">
            <li><strong>Annual Salary:</strong> ${annualSalary}</li>
            <li><strong>Monthly Salary:</strong> ${monthlySalary}</li>
            <li><strong>Probation Period:</strong> ${data.compensation.probationPeriod}</li>
            ${data.compensation.benefits ? `<li><strong>Benefits:</strong> ${data.compensation.benefits}</li>` : ''}
          </ul>
        </div>
        <div class="mt-6">
          <div class="font-semibold text-primary-600 mb-2">3. Terms & Conditions:</div>
          <ul class="list-disc list-inside space-y-1 ml-4">
            <li><strong>Working Hours:</strong> ${data.terms.workingHours}</li>
            <li><strong>Notice Period:</strong> ${data.terms.noticePeriod}</li>
            <li>This offer is valid for <strong>${data.terms.validityPeriod}</strong> from the date of this letter.</li>
            <li>Your employment will be subject to the company's policies and procedures.</li>
            ${data.terms.additionalTerms ? `<li>${data.terms.additionalTerms}</li>` : ''}
          </ul>
        </div>
        <div class="space-y-3 mt-6">
          <p>We look forward to welcoming you to our team. Please confirm your acceptance of this offer by 
          signing and returning a copy of this letter within the validity period.</p>
          <p>If you have any questions or need clarification on any aspect of this offer, please feel free 
          to contact us.</p>
          <p>We are excited about the possibility of you joining our organization and contributing to our 
          continued success.</p>
        </div>
        <div class="mt-6">
          <p>Best regards,</p>
        </div>
        <div class="flex justify-between mt-12">
          <div class="border-t-2 border-gray-800 pt-2 w-[45%]">
            <strong>${data.company.signatory || 'Authorized Signatory'}</strong><br>
            ${data.company.designation || 'Designation'}<br>
            ${data.company.name || 'Company Name'}
          </div>
          <div class="border-t-2 border-gray-800 pt-2 w-[45%]">
            <strong>Candidate Signature</strong><br>
            Date: _______________
          </div>
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
      const data = {
        ...formData,
        company: currentCompany || formData.company
      };

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

      // Draw border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

      addText('OFFER LETTER', 18, true, 'center');
      yPos += 10;
      addText(data.company.name || 'Company Name', 14, true, 'right');
      if (data.company.address) addText(data.company.address, 10, false, 'right');
      if (data.company.email) addText(`Email: ${data.company.email}`, 10, false, 'right');
      if (data.company.phone) addText(`Phone: ${data.company.phone}`, 10, false, 'right');
      if (data.company.website) addText(`Website: ${data.company.website}`, 10, false, 'right');
      yPos += 5;
      addText(`Date: ${formatDate(data.terms.offerDate)}`, 12, false, 'left');
      yPos += 5;
      addText('To,', 12, true);
      addText(data.candidate.name || 'Candidate Name', 12, true);
      if (data.candidate.address) addText(data.candidate.address, 10);
      if (data.candidate.email) addText(`Email: ${data.candidate.email}`, 10);
      if (data.candidate.phone) addText(`Phone: ${data.candidate.phone}`, 10);
      yPos += 5;
      addText(`Subject: Offer of Employment - ${data.job.position || 'Position'}`, 12, true);
      yPos += 5;
      addText(`Dear ${data.candidate.name || 'Candidate'},`, 12);
      yPos += 3;
      addText(`We are pleased to offer you the position of ${data.job.position || 'Position'} ${data.job.department ? `in our ${data.job.department} department` : ''} at ${data.company.name || 'our company'}. We believe your skills and experience will be a valuable addition to our team.`, 11);
      yPos += 5;
      addText('1. Position & Joining Details:', 12, true);
      addText(`   • Designation: ${data.job.position || 'N/A'}`, 11);
      addText(`   • Department: ${data.job.department || 'N/A'}`, 11);
      addText(`   • Joining Date: ${formatDate(data.job.joiningDate)}`, 11);
      addText(`   • Work Location: ${data.job.workLocation || 'As per company policy'}`, 11);
      yPos += 5;
      addText('2. Compensation Package:', 12, true);
      addText(`   • Annual Salary: ${formatCurrency(data.compensation.annualSalary)}`, 11);
      addText(`   • Monthly Salary: ${formatCurrency(data.compensation.monthlySalary)}`, 11);
      addText(`   • Probation Period: ${data.compensation.probationPeriod}`, 11);
      if (data.compensation.benefits) {
        addText(`   • Benefits: ${data.compensation.benefits}`, 11);
      }
      yPos += 5;
      addText('3. Terms & Conditions:', 12, true);
      addText(`   • Working Hours: ${data.terms.workingHours}`, 11);
      addText(`   • Notice Period: ${data.terms.noticePeriod}`, 11);
      addText(`   • Offer Validity: ${data.terms.validityPeriod}`, 11);
      if (data.terms.additionalTerms) {
        addText(`   • Additional Terms: ${data.terms.additionalTerms}`, 11);
      }
      yPos += 5;
      addText('We look forward to welcoming you to our team. Please confirm your acceptance of this offer by signing and returning a copy of this letter within the validity period.', 11);
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

      const candidateName = (data.candidate.name || 'Candidate').replace(/\s+/g, '_');
      const companyName = (data.company.name || 'Company').replace(/\s+/g, '_');
      const filename = `Offer_Letter_${companyName}_${candidateName}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Generate PDF blob and save to database
      const pdfBlob = doc.output('blob');
      doc.save(filename);
      
      // Save document to database asynchronously
      pdfBlobToBase64(pdfBlob).then((pdfBase64) => {
        saveDocument({
          documentType: 'OFFER_LETTER',
          title: `Offer Letter - ${data.candidate.name || 'Candidate'}`,
          content: previewContent || `Offer Letter for ${data.candidate.name} - ${data.job.position}`,
          pdfData: pdfBase64,
          metadata: {
            candidateName: data.candidate.name,
            companyName: data.company.name,
            position: data.job.position,
            joiningDate: data.job.joiningDate,
            salary: data.compensation.annualSalary,
            filename,
          },
        }).then((result) => {
          if (result.success) {
            console.log('Document saved successfully:', result.document);
          } else {
            console.warn('Failed to save document:', result.error);
          }
        });
      }).catch((error) => {
        console.error('Error saving document:', error);
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  const handleEmailOfferLetter = async () => {
    const recipientEmail = emailTo.trim() || formData.candidate.email?.trim();
    if (!recipientEmail) {
      showError('Please enter the candidate\'s email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      showError('Please enter a valid email address');
      return;
    }
    const data = { ...formData, company: currentCompany || formData.company };
    if (!data.candidate.name || !data.job.position) {
      showError('Please fill in candidate name and position before sending');
      return;
    }
    setSendingEmail(true);
    try {
      const htmlContent = generateOfferLetterHTML(data);
      const subject = `Offer Letter - ${data.job.position} - ${data.company.name || 'Company'}`;
      await api.post('/generated-documents/send-email', {
        toEmail: recipientEmail,
        subject,
        htmlContent,
      });
      showSuccess(`Offer letter sent to ${recipientEmail} from noreply@grandhr.in`);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const clearForm = () => {
    if (confirm('Are you sure you want to clear all form data?')) {
      setFormData({
        company: { name: '', address: '', email: '', phone: '', website: '', signatory: '', designation: '' },
        candidate: { name: '', address: '', email: '', phone: '' },
        job: { position: '', department: '', joiningDate: '', workLocation: '' },
        compensation: { annualSalary: '', monthlySalary: '', probationPeriod: '3 months', benefits: '' },
        terms: { workingHours: '9:00 AM to 6:00 PM', noticePeriod: '30 days', offerDate: '', validityPeriod: '15 days', additionalTerms: '' }
      });
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + 15);
      setFormData(prev => ({
        ...prev,
        terms: { ...prev.terms, offerDate: today.toISOString().split('T')[0] },
        job: { ...prev.job, joiningDate: futureDate.toISOString().split('T')[0] }
      }));
      setPreviewVisible(false);
      setEmailTo('');
    }
  };

  return (
    <Layout title="Offer Letter Generator" description="Generate professional offer letters for multiple companies" icon="📝">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Company Selection */}
          <div className="card shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🏢</span>
              <h2 className="section-title mb-0 flex-1">Company & Template Selection</h2>
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
                  <button type="button" className="btn-secondary whitespace-nowrap" onClick={() => setShowCompanyManager(true)}>
                    Manage Companies
                  </button>
                </div>
              </div>

              {showCompanyForm && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border-2 border-primary-200">
                  <h3 className="text-lg font-bold text-primary-600">Add/Edit Company Details</h3>
                  <div>
                    <label className="form-label">Company Name:</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.company.name}
                      onChange={(e) => handleInputChange('company', 'name', e.target.value)}
                      placeholder="e.g., ABC Technologies Pvt Ltd"
                    />
                  </div>
                  <div>
                    <label className="form-label">Company Address:</label>
                    <textarea 
                      rows="3" 
                      className="form-input" 
                      value={formData.company.address}
                      onChange={(e) => handleInputChange('company', 'address', e.target.value)}
                      placeholder="Full company address"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Company Email:</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        value={formData.company.email}
                        onChange={(e) => handleInputChange('company', 'email', e.target.value)}
                        placeholder="hr@company.com"
                      />
                    </div>
                    <div>
                      <label className="form-label">Company Phone:</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={formData.company.phone}
                        onChange={(e) => handleInputChange('company', 'phone', e.target.value)}
                        placeholder="+91-XXXXXXXXXX"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Company Website:</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.company.website}
                      onChange={(e) => handleInputChange('company', 'website', e.target.value)}
                      placeholder="www.company.com"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Authorized Signatory Name:</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={formData.company.signatory}
                        onChange={(e) => handleInputChange('company', 'signatory', e.target.value)}
                        placeholder="Name of HR/Manager"
                      />
                    </div>
                    <div>
                      <label className="form-label">Signatory Designation:</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={formData.company.designation}
                        onChange={(e) => handleInputChange('company', 'designation', e.target.value)}
                        placeholder="e.g., HR Manager"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="btn-primary flex-1" onClick={saveCompany}>Save Company</button>
                    <button type="button" className="btn-secondary flex-1" onClick={() => setShowCompanyForm(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Candidate Information */}
          <div className="card shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">👤</span>
              <h2 className="section-title mb-0 flex-1">Candidate Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">Candidate Name: <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.candidate.name}
                  onChange={(e) => handleInputChange('candidate', 'name', e.target.value)}
                  placeholder="Full Name"
                  required
                />
              </div>
              <div>
                <label className="form-label">Candidate Address:</label>
                <textarea 
                  rows="3" 
                  className="form-input" 
                  value={formData.candidate.address}
                  onChange={(e) => handleInputChange('candidate', 'address', e.target.value)}
                  placeholder="Full address"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Candidate Email:</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={formData.candidate.email}
                    onChange={(e) => handleInputChange('candidate', 'email', e.target.value)}
                    placeholder="candidate@email.com"
                  />
                </div>
                <div>
                  <label className="form-label">Candidate Phone:</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.candidate.phone}
                    onChange={(e) => handleInputChange('candidate', 'phone', e.target.value)}
                    placeholder="+91-XXXXXXXXXX"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="card shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💼</span>
              <h2 className="section-title mb-0 flex-1">Job Details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">Position/Designation: <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.job.position}
                  onChange={(e) => handleInputChange('job', 'position', e.target.value)}
                  placeholder="e.g., Full Stack Developer"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Department:</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.job.department}
                    onChange={(e) => handleInputChange('job', 'department', e.target.value)}
                    placeholder="e.g., Engineering"
                  />
                </div>
                <div>
                  <label className="form-label">Joining Date: <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={formData.job.joiningDate}
                    onChange={(e) => handleInputChange('job', 'joiningDate', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Work Location:</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.job.workLocation}
                  onChange={(e) => handleInputChange('job', 'workLocation', e.target.value)}
                  placeholder="City, State"
                />
              </div>
            </div>
          </div>

          {/* Compensation & Benefits */}
          <div className="card shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💰</span>
              <h2 className="section-title mb-0 flex-1">Compensation & Benefits</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Annual Salary (₹):</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={formData.compensation.annualSalary}
                    onChange={(e) => handleInputChange('compensation', 'annualSalary', e.target.value)}
                    placeholder="e.g., 600000"
                  />
                </div>
                <div>
                  <label className="form-label">Monthly Salary (₹):</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={formData.compensation.monthlySalary}
                    onChange={(e) => handleInputChange('compensation', 'monthlySalary', e.target.value)}
                    placeholder="e.g., 50000"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Probation Period:</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.compensation.probationPeriod}
                  onChange={(e) => handleInputChange('compensation', 'probationPeriod', e.target.value)}
                  placeholder="e.g., 3 months"
                />
              </div>
              <div>
                <label className="form-label">Additional Benefits:</label>
                <textarea 
                  rows="4" 
                  className="form-input" 
                  value={formData.compensation.benefits}
                  onChange={(e) => handleInputChange('compensation', 'benefits', e.target.value)}
                  placeholder="e.g., Health Insurance, PF, ESI, etc."
                />
              </div>
            </div>
          </div>

          {/* Additional Terms */}
          <div className="card shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📋</span>
              <h2 className="section-title mb-0 flex-1">Additional Terms</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Working Hours:</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.terms.workingHours}
                    onChange={(e) => handleInputChange('terms', 'workingHours', e.target.value)}
                    placeholder="e.g., 9:00 AM to 6:00 PM"
                  />
                </div>
                <div>
                  <label className="form-label">Notice Period:</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.terms.noticePeriod}
                    onChange={(e) => handleInputChange('terms', 'noticePeriod', e.target.value)}
                    placeholder="e.g., 30 days"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Offer Date: <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={formData.terms.offerDate}
                    onChange={(e) => handleInputChange('terms', 'offerDate', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Offer Validity:</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.terms.validityPeriod}
                    onChange={(e) => handleInputChange('terms', 'validityPeriod', e.target.value)}
                    placeholder="e.g., 15 days"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Additional Terms & Conditions:</label>
                <textarea 
                  rows="4" 
                  className="form-input" 
                  value={formData.terms.additionalTerms}
                  onChange={(e) => handleInputChange('terms', 'additionalTerms', e.target.value)}
                  placeholder="Any additional terms or conditions"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" className="btn-primary flex-1 text-lg py-4" onClick={generatePreview}>
              Generate Offer Letter
            </button>
            <button type="button" className="btn-secondary flex-1 py-4" onClick={() => setPreviewVisible(false)}>
              Preview
            </button>
            <button type="button" className="btn-secondary flex-1 py-4" onClick={clearForm}>
              Clear Form
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:sticky lg:top-6 h-fit">
          {previewVisible ? (
            <div className="card shadow-2xl">
              <h2 className="section-title mb-4">Preview</h2>
              <div 
                className="preview-content bg-white p-6 rounded-lg border-2 border-gray-200 max-h-[calc(100vh-200px)] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
              <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700">Email offer letter to candidate (from noreply@grandhr.in)</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    className="form-input flex-1"
                    placeholder="candidate@example.com"
                    value={emailTo || formData.candidate.email || ''}
                    onChange={(e) => setEmailTo(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-primary whitespace-nowrap px-6 disabled:opacity-50"
                    onClick={handleEmailOfferLetter}
                    disabled={sendingEmail}
                  >
                    {sendingEmail ? 'Sending…' : 'Send to email'}
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button type="button" className="btn-primary flex-1" onClick={downloadPDF}>
                  Download PDF
                </button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setPreviewVisible(false)}>
                  Close Preview
                </button>
              </div>
            </div>
          ) : (
            <div className="card shadow-xl bg-white/80 text-center py-12">
              <div className="text-6xl mb-4">📝</div>
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
                        <button className="btn-secondary text-sm px-4 py-2" onClick={() => { setCurrentCompany(company); handleCompanySelect(index.toString()); setShowCompanyManager(false); }}>
                          Edit
                        </button>
                        <button className="btn-secondary text-sm px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100" onClick={() => {
                          if (confirm('Are you sure you want to delete this company?')) {
                            const updated = companies.filter((_, i) => i !== index);
                            setCompanies(updated);
                            localStorage.setItem('offerLetterCompanies', JSON.stringify(updated));
                            if (currentCompany?.name === company.name) {
                              setCurrentCompany(null);
                            }
                          }
                        }}>
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

export default OfferLetter;
