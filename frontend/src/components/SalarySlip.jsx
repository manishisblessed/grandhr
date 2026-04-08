import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { formatDate, formatCurrency, formatCurrencyPdf, numberToWords } from '../utils/pdfUtils';
import { jsPDF } from 'jspdf';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';

const SalarySlip = () => {
  // Company state
  const [companies, setCompanies] = useState([]);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showCompanyManager, setShowCompanyManager] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [currentLogoBase64, setCurrentLogoBase64] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    company: {
      name: '',
      address: '',
      email: '',
      phone: '',
      logoImage: null
    },
    employee: {
      name: '',
      id: '',
      email: '',
      designation: '',
      dateOfJoining: '',
      pan: '',
      uan: '',
      bankName: '',
      accountNumber: '',
      ifscCode: ''
    },
    period: {
      payMonth: 'January',
      payYear: new Date().getFullYear(),
      payDate: new Date().toISOString().split('T')[0],
      paidDays: 31,
      lopDays: 0
    },
    earnings: {
      basic: 0,
      hra: 0,
      otherAllowance: 0,
      specialAllowance: 0,
      gross: 0
    },
    deductions: {
      pf: 0,
      pfEmployerShare: 0,
      total: 0
    },
    netPayable: 0
  });

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const { showSuccess, showError } = useToast();

  // Load companies on mount
  useEffect(() => {
    const stored = localStorage.getItem('salarySlipCompanies');
    if (stored) {
      const parsed = JSON.parse(stored);
      setCompanies(parsed);
    } else {
      const defaultCompany = {
        name: 'Abheepay',
        address: 'Plot No-3, 2nd Floor, kh no.33/6 Amberhai, Sector-19, Dwarka, New Delhi-110075',
        email: '',
        phone: '',
        logo: 'Abheepay',
        logoImage: null
      };
      setCompanies([defaultCompany]);
      localStorage.setItem('salarySlipCompanies', JSON.stringify([defaultCompany]));
    }
  }, []);

  // Calculate HRA (50% of Basic)
  useEffect(() => {
    const basic = formData.earnings.basic || 0;
    const hra = basic * 0.5;
    const otherAllowance = Math.max(0, hra - 2000);
    
    setFormData(prev => ({
      ...prev,
      earnings: {
        ...prev.earnings,
        hra: hra,
        otherAllowance: otherAllowance
      }
    }));
  }, [formData.earnings.basic]);

  // Calculate totals
  useEffect(() => {
    const { basic, hra, otherAllowance, specialAllowance } = formData.earnings;
    const gross = basic + hra + otherAllowance + specialAllowance;
    
    const { pf, pfEmployerShare } = formData.deductions;
    const totalDeductions = pf + pfEmployerShare;
    const netPayable = gross - totalDeductions;

    setFormData(prev => ({
      ...prev,
      earnings: { ...prev.earnings, gross },
      deductions: { ...prev.deductions, total: totalDeductions },
      netPayable
    }));
  }, [formData.earnings.basic, formData.earnings.hra, formData.earnings.otherAllowance, 
      formData.earnings.specialAllowance, formData.deductions.pf, formData.deductions.pfEmployerShare]);

  // Calculate PF (12% of Basic)
  useEffect(() => {
    const basic = formData.earnings.basic || 0;
    const pf = basic * 0.12;
    const pfEmployerShare = basic * 0.13;
    
    setFormData(prev => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        pf: pf,
        pfEmployerShare: pfEmployerShare
      }
    }));
  }, [formData.earnings.basic]);

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
    } else if (value !== '') {
      const company = companies[parseInt(value)];
      setCurrentCompany(company);
      setFormData(prev => ({
        ...prev,
        company: { ...company }
      }));
      setCurrentLogoBase64(company.logoImage);
      setLogoPreview(company.logoImage);
      setShowCompanyForm(true);
    } else {
      setShowCompanyForm(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setLogoPreview(null);
      setCurrentLogoBase64(null);
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
    reader.onload = (event) => {
      setCurrentLogoBase64(event.target.result);
      setLogoPreview(event.target.result);
    };
    reader.readAsDataURL(file);
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
      logo: name.substring(0, 8).toUpperCase(),
      logoImage: currentLogoBase64
    };

    let updatedCompanies;
    if (currentCompany && companies.findIndex(c => c.name === currentCompany.name) !== -1) {
      updatedCompanies = companies.map(c => c.name === currentCompany.name ? company : c);
    } else {
      updatedCompanies = [...companies, company];
    }

    setCompanies(updatedCompanies);
    localStorage.setItem('salarySlipCompanies', JSON.stringify(updatedCompanies));
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

    const html = generateSalarySlipHTML(data);
    setPreviewContent(html);
    setPreviewVisible(true);
  };

  const handleSendSalarySlip = async () => {
    const recipientEmail = emailTo.trim() || formData.employee.email?.trim();
    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      showError('Please enter a valid employee email address');
      return;
    }
    const data = { ...formData, company: currentCompany || formData.company };
    if (!data.company.name) {
      showError('Please select or add a company');
      return;
    }
    setSendingEmail(true);
    try {
      const htmlContent = generateSalarySlipHTML(data);
      const subject = `Salary Slip - ${data.period.payMonth} ${data.period.payYear} - ${data.company.name || 'Company'}`;
      await api.post('/generated-documents/send-email', {
        toEmail: recipientEmail,
        subject,
        htmlContent,
      });
      showSuccess(`Salary slip sent to ${recipientEmail}`);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const generateSalarySlipHTML = (data) => {
    const payDateFormatted = data.period.payDate ? formatDate(data.period.payDate) : '';
    
    return `
      <div class="space-y-6 text-sm">
        <div class="text-center pb-4 border-b-2 border-gray-800">
          ${data.company.logoImage ? 
            `<div class="mb-3"><img src="${data.company.logoImage}" alt="Company Logo" class="max-h-16 mx-auto"></div>` : 
            `<div class="text-2xl font-bold text-primary-600 mb-2">${data.company.logo || data.company.name || 'Company Name'}</div>`
          }
          <div class="text-2xl font-bold text-primary-600 mb-2">${data.company.name || 'Company Name'}</div>
          ${data.company.address ? `<div class="text-sm text-gray-700">${data.company.address.replace(/\n/g, '<br>')}</div>` : ''}
        </div>
        
        <div class="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
          <div class="font-bold text-lg mb-4 text-center uppercase">EMPLOYEE SUMMARY</div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div><div class="font-semibold mb-1">Employee Name</div><div class="text-gray-700">${data.employee.name || 'N/A'}</div></div>
            <div><div class="font-semibold mb-1">Employee ID</div><div class="text-gray-700">${data.employee.id || 'N/A'}</div></div>
            <div><div class="font-semibold mb-1">Email</div><div class="text-gray-700">${data.employee.email || 'N/A'}</div></div>
            <div><div class="font-semibold mb-1">UAN Number</div><div class="text-gray-700">${data.employee.uan || 'N/A'}</div></div>
            <div><div class="font-semibold mb-1">Pay Period</div><div class="text-gray-700">${data.period.payMonth} ${data.period.payYear}</div></div>
            <div><div class="font-semibold mb-1">Pay Date</div><div class="text-gray-700">${payDateFormatted || 'N/A'}</div></div>
            <div><div class="font-semibold mb-1">Total Net Pay</div><div class="text-lg font-bold text-green-700">${formatCurrency(data.netPayable)}</div></div>
            <div><div class="font-semibold mb-1">Paid Days</div><div class="text-gray-700">${data.period.paidDays || 0}</div></div>
            <div><div class="font-semibold mb-1">LOP Days</div><div class="text-gray-700">${data.period.lopDays || 0}</div></div>
          </div>
        </div>
        
        <div>
          <div class="font-bold text-lg mb-3 uppercase">EARNINGS</div>
          <table class="w-full border-collapse border border-gray-300">
            <thead>
              <tr class="bg-primary-500 text-white">
                <th class="p-3 text-left border border-gray-300">Description</th>
                <th class="p-3 text-right border border-gray-300">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="p-3 border border-gray-300">Basic</td><td class="p-3 text-right font-mono border border-gray-300">${formatCurrency(data.earnings.basic)}</td></tr>
              <tr><td class="p-3 border border-gray-300">House Rent Allowance</td><td class="p-3 text-right font-mono border border-gray-300">${formatCurrency(data.earnings.hra)}</td></tr>
              <tr><td class="p-3 border border-gray-300">Other Allowance</td><td class="p-3 text-right font-mono border border-gray-300">${formatCurrency(data.earnings.otherAllowance)}</td></tr>
              <tr><td class="p-3 border border-gray-300">Special Allowance</td><td class="p-3 text-right font-mono border border-gray-300">${formatCurrency(data.earnings.specialAllowance)}</td></tr>
              <tr class="bg-gray-100 font-bold"><td class="p-3 border border-gray-300">Gross Earnings</td><td class="p-3 text-right font-mono border border-gray-300">${formatCurrency(data.earnings.gross)}</td></tr>
            </tbody>
          </table>
        </div>
        
        <div>
          <div class="font-bold text-lg mb-3 uppercase">DEDUCTIONS</div>
          <table class="w-full border-collapse border border-gray-300">
            <thead>
              <tr class="bg-primary-500 text-white">
                <th class="p-3 text-left border border-gray-300">Description</th>
                <th class="p-3 text-right border border-gray-300">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="p-3 border border-gray-300">Provident Fund</td><td class="p-3 text-right font-mono border border-gray-300">${formatCurrency(data.deductions.pf)}</td></tr>
              <tr><td class="p-3 border border-gray-300">PF Employer Share</td><td class="p-3 text-right font-mono border border-gray-300">${formatCurrency(data.deductions.pfEmployerShare)}</td></tr>
              <tr class="bg-gray-100 font-bold"><td class="p-3 border border-gray-300">Total Deductions</td><td class="p-3 text-right font-mono border border-gray-300">${formatCurrency(data.deductions.total)}</td></tr>
            </tbody>
          </table>
        </div>
        
        <div class="bg-green-50 p-4 rounded-lg border-2 border-green-300">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <div class="font-bold text-lg mb-2">TOTAL NET PAYABLE</div>
              <div class="text-2xl font-bold text-green-700 font-mono mb-2">${formatCurrency(data.netPayable)}</div>
              <div class="text-sm italic text-green-800 font-semibold">Rupees ${numberToWords(data.netPayable)}</div>
            </div>
            <div class="text-sm space-y-1">
              <div class="flex justify-between"><span>Gross Earnings:</span><span class="font-mono">${formatCurrency(data.earnings.gross)}</span></div>
              <div class="flex justify-between"><span>- Total Deductions:</span><span class="font-mono">${formatCurrency(data.deductions.total)}</span></div>
              <div class="border-t border-green-400 pt-1 mt-1"></div>
              <div class="flex justify-between font-bold"><span>= Total Net Payable:</span><span class="font-mono text-green-700">${formatCurrency(data.netPayable)}</span></div>
            </div>
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

      const margin = 15;
      const borderMargin = 10;
      let yPos = margin;
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const contentWidth = pageWidth - (margin * 2);
      const lineHeight = 7;

      // Draw border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(borderMargin, borderMargin, pageWidth - (borderMargin * 2), pageHeight - (borderMargin * 2));

      function addText(text, fontSize = 12, isBold = false, align = 'left', x = margin) {
        if (text === null || text === undefined) text = '';
        text = String(text).trim();
        if (!text) return;

        doc.setFontSize(fontSize);
        doc.setFont('times', isBold ? 'bold' : 'normal');
        const lines = doc.splitTextToSize(text, contentWidth);

        if (yPos + (lines.length * lineHeight) > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
          doc.rect(borderMargin, borderMargin, pageWidth - (borderMargin * 2), pageHeight - (borderMargin * 2));
        }

        lines.forEach(line => {
          if (line && line.trim()) {
            let textX = x;
            if (align === 'center') textX = pageWidth / 2;
            else if (align === 'right') textX = pageWidth - margin;
            doc.text(line, textX, yPos, { align });
          }
          yPos += lineHeight;
        });
      }

      // Logo and Company Header
      let logoAdded = false;
      if (data.company.logoImage) {
        try {
          const logoHeight = 15;
          const logoWidth = 30;
          let imgFormat = 'PNG';
          if (data.company.logoImage.includes('data:image/jpeg') || data.company.logoImage.includes('data:image/jpg')) {
            imgFormat = 'JPEG';
          }
          doc.addImage(data.company.logoImage, imgFormat, margin, margin, logoWidth, logoHeight);
          logoAdded = true;
        } catch (e) {
          console.error('Error adding logo:', e);
        }
      }

      const companyNameY = margin + 5;
      doc.setFontSize(16);
      doc.setFont('times', 'bold');
      const companyNameX = logoAdded ? margin + 35 : pageWidth / 2;
      doc.text(data.company.name || 'Company Name', companyNameX, companyNameY, { align: logoAdded ? 'left' : 'center' });

      if (data.company.address) {
        doc.setFontSize(9);
        doc.setFont('times', 'normal');
        const addressLines = doc.splitTextToSize(data.company.address, logoAdded ? contentWidth - 35 : contentWidth);
        addressLines.forEach((line, index) => {
          doc.text(line, companyNameX, companyNameY + 6 + (index * 5), { align: logoAdded ? 'left' : 'center' });
        });
        yPos = Math.max(logoAdded ? margin + 15 : companyNameY + 6 + (addressLines.length * 5), companyNameY + 6 + (addressLines.length * 5)) + 3;
      } else {
        yPos = logoAdded ? margin + 15 : companyNameY + 10;
      }

      // Separator
      doc.setDrawColor(0, 0, 0);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;

      // Employee Summary
      doc.setFontSize(13);
      doc.setFont('times', 'bold');
      doc.text('EMPLOYEE SUMMARY', pageWidth / 2, yPos, { align: 'center' });
      yPos += 7;

      const summaryBoxHeight = 52;
      const summaryBoxY = yPos;
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, summaryBoxY, contentWidth, summaryBoxHeight, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, summaryBoxY, contentWidth, summaryBoxHeight, 'S');

      const summaryData = [
        ['Employee Name', data.employee.name || 'N/A'],
        ['Employee ID', data.employee.id || 'N/A'],
        ['Email', data.employee.email || 'N/A'],
        ['UAN Number', data.employee.uan || 'N/A'],
        ['Pay Period', `${data.period.payMonth} ${data.period.payYear}`],
        ['Pay Date', data.period.payDate ? formatDate(data.period.payDate) : 'N/A'],
        ['Total Net Pay', formatCurrencyPdf(data.netPayable)],
        ['Paid Days', (data.period.paidDays || 0).toString()],
        ['LOP Days', (data.period.lopDays || 0).toString()]
      ];

      const colWidth = (contentWidth - 20) / 2;
      const rowHeight = 10;
      const startX1 = margin + 10;
      const startX2 = margin + 10 + colWidth + 10;
      const startY = summaryBoxY + 8;

      summaryData.forEach(([label, value], index) => {
        const isNetPay = label === 'Total Net Pay';
        const row = Math.floor(index / 2);
        const col = index % 2;
        const xLabel = col === 0 ? startX1 : startX2;
        const xValue = xLabel + 50;
        const y = startY + (row * rowHeight);

        doc.setFont('times', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text(label + ':', xLabel, y);

        doc.setFont('times', isNetPay ? 'bold' : 'normal');
        doc.setFontSize(isNetPay ? 10 : 9);
        if (isNetPay) doc.setTextColor(46, 125, 50);
        else doc.setTextColor(0, 0, 0);
        doc.text(String(value), xValue, y);
      });

      yPos = summaryBoxY + summaryBoxHeight + 8;

      // Earnings Section
      doc.setFontSize(11);
      doc.setFont('times', 'bold');
      doc.text('EARNINGS', margin, yPos);
      yPos += 6;

      const earnings = [
        ['Basic', formatCurrencyPdf(data.earnings.basic)],
        ['House Rent Allowance', formatCurrencyPdf(data.earnings.hra)],
        ['Other Allowance', formatCurrencyPdf(data.earnings.otherAllowance)],
        ['Special Allowance', formatCurrencyPdf(data.earnings.specialAllowance)],
        ['Gross Earnings', formatCurrencyPdf(data.earnings.gross)]
      ];

      const tableStartY = yPos;
      doc.setFillColor(79, 70, 229);
      doc.rect(margin, tableStartY - 5, contentWidth, 8, 'F');
      doc.setFontSize(9);
      doc.setFont('times', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Description', margin + 3, tableStartY);
      doc.text('Amount (₹)', pageWidth - margin - 3, tableStartY, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      yPos = tableStartY + 8;

      earnings.forEach(([label, amount], index) => {
        const isBold = index === earnings.length - 1;
        const rowY = yPos;

        if (isBold) {
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, rowY - 4, contentWidth, 8, 'F');
        }

        doc.setDrawColor(200, 200, 200);
        doc.line(margin, rowY - 4, pageWidth - margin, rowY - 4);
        doc.line(margin, rowY + 4, pageWidth - margin, rowY + 4);
        doc.line(margin, rowY - 4, margin, rowY + 4);
        doc.line(pageWidth - margin, rowY - 4, pageWidth - margin, rowY + 4);
        doc.line(margin + contentWidth * 0.6, rowY - 4, margin + contentWidth * 0.6, rowY + 4);

        doc.setFont('times', isBold ? 'bold' : 'normal');
        doc.setFontSize(9);
        doc.text(label, margin + 3, rowY);
        doc.text(amount, pageWidth - margin - 3, rowY, { align: 'right' });
        yPos += 8;
      });

      yPos += 8;

      // Deductions Section
      doc.setFontSize(11);
      doc.setFont('times', 'bold');
      doc.text('DEDUCTIONS', margin, yPos);
      yPos += 6;

      const deductions = [
        ['Provident Fund', formatCurrencyPdf(data.deductions.pf)],
        ['PF Employer Share', formatCurrencyPdf(data.deductions.pfEmployerShare)],
        ['Total Deductions', formatCurrencyPdf(data.deductions.total)]
      ];

      const deductionsTableStartY = yPos;
      doc.setFillColor(79, 70, 229);
      doc.rect(margin, deductionsTableStartY - 5, contentWidth, 8, 'F');
      doc.setFontSize(9);
      doc.setFont('times', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Description', margin + 3, deductionsTableStartY);
      doc.text('Amount (₹)', pageWidth - margin - 3, deductionsTableStartY, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      yPos = deductionsTableStartY + 8;

      deductions.forEach(([label, amount], index) => {
        const isBold = index === deductions.length - 1;
        const rowY = yPos;

        if (isBold) {
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, rowY - 4, contentWidth, 8, 'F');
        }

        doc.setDrawColor(200, 200, 200);
        doc.line(margin, rowY - 4, pageWidth - margin, rowY - 4);
        doc.line(margin, rowY + 4, pageWidth - margin, rowY + 4);
        doc.line(margin, rowY - 4, margin, rowY + 4);
        doc.line(pageWidth - margin, rowY - 4, pageWidth - margin, rowY + 4);
        doc.line(margin + contentWidth * 0.6, rowY - 4, margin + contentWidth * 0.6, rowY + 4);

        doc.setFont('times', isBold ? 'bold' : 'normal');
        doc.setFontSize(9);
        doc.text(label, margin + 3, rowY);
        doc.text(amount, pageWidth - margin - 3, rowY, { align: 'right' });
        yPos += 8;
      });

      yPos += 8;

      // Total Net Payable
      const netPayableBoxHeight = 45;
      const netPayableBoxY = yPos - 3;

      doc.setFillColor(232, 245, 233);
      doc.setDrawColor(200, 220, 200);
      doc.rect(margin, netPayableBoxY, contentWidth, netPayableBoxHeight, 'FD');

      const leftColX = margin + 10;
      const leftColY = netPayableBoxY + 6;

      doc.setFontSize(12);
      doc.setFont('times', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('TOTAL NET PAYABLE', leftColX, leftColY);

      doc.setFontSize(16);
      doc.setTextColor(46, 125, 50);
      doc.text(formatCurrencyPdf(data.netPayable), leftColX, leftColY + 8);

      doc.setFontSize(8);
      doc.setFont('times', 'bold');
      doc.setTextColor(46, 100, 50);
      const netWords = `Rupees ${numberToWords(Math.round(Number(data.netPayable) || 0))}`;
      const wordsLines = doc.splitTextToSize(netWords, contentWidth * 0.45);
      wordsLines.forEach((line, index) => {
        doc.text(line, leftColX, leftColY + 16 + (index * 4));
      });

      const rightColX = margin + contentWidth * 0.55;
      const rightColY = netPayableBoxY + 8;

      doc.setFontSize(9);
      doc.setFont('times', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('Gross Earnings:', rightColX, rightColY);
      doc.text(formatCurrencyPdf(data.earnings.gross), pageWidth - margin - 10, rightColY, { align: 'right' });

      doc.text('- Total Deductions:', rightColX, rightColY + 7);
      doc.text(formatCurrencyPdf(data.deductions.total), pageWidth - margin - 10, rightColY + 7, { align: 'right' });

      doc.setDrawColor(100, 200, 100);
      doc.line(rightColX, rightColY + 10, pageWidth - margin - 10, rightColY + 10);

      doc.setFont('times', 'bold');
      doc.text('= Total Net Payable:', rightColX, rightColY + 16);
      doc.setTextColor(46, 125, 50);
      doc.text(formatCurrencyPdf(data.netPayable), pageWidth - margin - 10, rightColY + 16, { align: 'right' });

      doc.setTextColor(0, 0, 0);
      yPos = netPayableBoxY + netPayableBoxHeight + 3;

      // Disclaimer
      yPos += 3;
      doc.setFontSize(8);
      doc.setFont('times', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Disclaimer: This document is system-generated and does not require manual signature or authorization.', pageWidth / 2, yPos, { align: 'center' });

      const employeeName = (data.employee.name || 'Employee').replace(/\s+/g, '_');
      const companyName = (data.company.name || 'Company').replace(/\s+/g, '_');
      const payPeriod = `${data.period.payMonth}_${data.period.payYear}`.replace(/\s+/g, '_');
      const filename = `Salary_Slip_${companyName}_${employeeName}_${payPeriod}.pdf`;

      doc.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  const clearForm = () => {
    if (confirm('Are you sure you want to clear all fields?')) {
      setFormData({
        company: { name: '', address: '', email: '', phone: '', logoImage: null },
        employee: { name: '', id: '', email: '', designation: '', dateOfJoining: '', pan: '', uan: '', bankName: '', accountNumber: '', ifscCode: '' },
        period: { payMonth: 'January', payYear: new Date().getFullYear(), payDate: new Date().toISOString().split('T')[0], paidDays: 31, lopDays: 0 },
        earnings: { basic: 0, hra: 0, otherAllowance: 0, specialAllowance: 0, gross: 0 },
        deductions: { pf: 0, pfEmployerShare: 0, total: 0 },
        netPayable: 0
      });
      setPreviewVisible(false);
      setEmailTo('');
    }
  };

  // Generate years array
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <Layout title="Salary Slip Generator" description="Generate professional salary slips for multiple companies" icon="💰">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
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
                      placeholder="e.g., ANGINATAPP INNOVATIONS PRIVATE LIMITED"
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
                    <label className="form-label">Company Logo (Optional):</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="form-input" 
                      onChange={handleLogoUpload}
                    />
                    <p className="text-xs text-gray-500 mt-1">Supported formats: JPG, PNG, GIF (Max 2MB)</p>
                    {logoPreview && (
                      <div className="mt-3 p-3 bg-white border-2 border-gray-300 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Logo Preview:</p>
                        <img src={logoPreview} alt="Logo Preview" className="max-h-20 border-2 border-gray-300 rounded p-2 bg-white object-contain" />
                        <button type="button" onClick={() => { setLogoPreview(null); setCurrentLogoBase64(null); }} className="mt-2 text-sm text-red-600 hover:text-red-800 font-semibold">
                          Remove Logo
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="btn-primary flex-1" onClick={saveCompany}>Save Company</button>
                    <button type="button" className="btn-secondary flex-1" onClick={() => setShowCompanyForm(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Employee Information - Continue with similar pattern for other sections */}
          <div className="card shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">👤</span>
              <h2 className="section-title mb-0 flex-1">Employee Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">Employee Name: <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.employee.name}
                  onChange={(e) => handleInputChange('employee', 'name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Employee ID:</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.employee.id}
                    onChange={(e) => handleInputChange('employee', 'id', e.target.value)}
                    placeholder="e.g., ANG/EMP/026"
                  />
                </div>
                <div>
                  <label className="form-label">Employee Email (for sending slip):</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.employee.email}
                    onChange={(e) => handleInputChange('employee', 'email', e.target.value)}
                    placeholder="employee@example.com"
                  />
                </div>
                <div>
                  <label className="form-label">Designation: <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.employee.designation}
                    onChange={(e) => handleInputChange('employee', 'designation', e.target.value)}
                    placeholder="e.g., Full Stack Developer"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="form-label">UAN Number:</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.employee.uan}
                  onChange={(e) => handleInputChange('employee', 'uan', e.target.value)}
                  placeholder="e.g., 123456789012"
                  maxLength="12"
                />
              </div>
            </div>
          </div>

          {/* Salary Period */}
          <div className="card shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📅</span>
              <h2 className="section-title mb-0 flex-1">Salary Period</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Pay Month:</label>
                <select 
                  className="form-input"
                  value={formData.period.payMonth}
                  onChange={(e) => handleInputChange('period', 'payMonth', e.target.value)}
                >
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Pay Year:</label>
                <select 
                  className="form-input"
                  value={formData.period.payYear}
                  onChange={(e) => handleInputChange('period', 'payYear', parseInt(e.target.value))}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Pay Date:</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={formData.period.payDate}
                  onChange={(e) => handleInputChange('period', 'payDate', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="form-label">Paid Days:</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={formData.period.paidDays}
                    onChange={(e) => handleInputChange('period', 'paidDays', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="form-label">LOP Days:</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={formData.period.lopDays}
                    onChange={(e) => handleInputChange('period', 'lopDays', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Earnings */}
          <div className="card shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💰</span>
              <h2 className="section-title mb-0 flex-1">Earnings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">Basic Salary (₹): <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={formData.earnings.basic || ''}
                  onChange={(e) => handleInputChange('earnings', 'basic', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 50000"
                  required
                />
              </div>
              <div>
                <label className="form-label">House Rent Allowance (₹):</label>
                <input 
                  type="number" 
                  className="form-input bg-gray-50" 
                  value={formData.earnings.hra.toFixed(2)}
                  readOnly
                  placeholder="Auto-calculated (50% of Basic)"
                />
              </div>
              <div>
                <label className="form-label">Other Allowance (₹):</label>
                <input 
                  type="number" 
                  className="form-input bg-gray-50" 
                  value={formData.earnings.otherAllowance.toFixed(2)}
                  readOnly
                  placeholder="Auto-calculated (HRA - 2000)"
                />
              </div>
              <div>
                <label className="form-label">Special Allowance (₹):</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={formData.earnings.specialAllowance || ''}
                  onChange={(e) => handleInputChange('earnings', 'specialAllowance', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 10000"
                />
              </div>
              <div>
                <label className="form-label">Gross Earnings (₹):</label>
                <input 
                  type="number" 
                  className="form-input bg-gray-50" 
                  value={formData.earnings.gross.toFixed(2)}
                  readOnly
                  placeholder="Auto-calculated"
                />
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="card shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📉</span>
              <h2 className="section-title mb-0 flex-1">Deductions</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">Provident Fund (₹):</label>
                <input 
                  type="number" 
                  className="form-input bg-gray-50" 
                  value={formData.deductions.pf.toFixed(2)}
                  readOnly
                  placeholder="Auto-calculated (12% of Basic)"
                />
              </div>
              <div>
                <label className="form-label">PF Employer Share (₹):</label>
                <input 
                  type="number" 
                  className="form-input bg-gray-50" 
                  value={formData.deductions.pfEmployerShare.toFixed(2)}
                  readOnly
                  placeholder="Auto-calculated (13% of Basic)"
                />
              </div>
              <div>
                <label className="form-label">Total Deductions (₹):</label>
                <input 
                  type="number" 
                  className="form-input bg-gray-50" 
                  value={formData.deductions.total.toFixed(2)}
                  readOnly
                  placeholder="Auto-calculated"
                />
              </div>
            </div>
          </div>

          {/* Net Payable */}
          <div className="card shadow-xl bg-green-50 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💵</span>
              <h2 className="section-title mb-0 flex-1">Total Net Payable</h2>
            </div>
            <div className="space-y-2">
              <div>
                <label className="form-label">Net Payable (₹):</label>
                <input 
                  type="number" 
                  className="form-input bg-white text-green-700 font-bold text-lg" 
                  value={formData.netPayable.toFixed(2)}
                  readOnly
                />
              </div>
              <div className="text-sm italic text-green-800 font-semibold">
                Rupees {numberToWords(Math.round(Number(formData.netPayable) || 0))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" className="btn-primary flex-1 text-lg py-4" onClick={generatePreview}>
              Generate Salary Slip
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
                <p className="text-sm font-semibold text-gray-700">Email salary slip to employee</p>
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
                    onClick={handleSendSalarySlip}
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
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">Preview Will Appear Here</h3>
              <p className="text-gray-500">Fill the form and click "Generate Salary Slip"</p>
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
                            localStorage.setItem('salarySlipCompanies', JSON.stringify(updated));
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

export default SalarySlip;

