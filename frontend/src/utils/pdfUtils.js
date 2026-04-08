import { jsPDF } from 'jspdf';

// Make jsPDF available globally
if (typeof window !== 'undefined') {
  window.jspdf = { jsPDF };
}

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export const formatDateShort = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const year = date.getFullYear();
  return `${String(day).padStart(2, '0')}-${monthNames[date.getMonth()]}-${String(year).slice(-2)}`;
};

export const formatCurrency = (amount) => {
  if (!amount) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

/** jsPDF built-in fonts do not render ₹ reliably; use this for all PDF text. */
export const formatCurrencyPdf = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return 'Rs. 0';
  const formatted =
    n % 1 === 0
      ? n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
      : n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `Rs. ${formatted}`;
};

/**
 * Adds logo + company name + address to PDF; returns Y position below the letterhead rule.
 */
export function addCompanyLetterheadPdf(doc, company, margin, pageWidth, yStart) {
  const c = company || {};
  let yPos = yStart;
  const contentW = pageWidth - margin * 2;
  let logoBottom = yPos;
  if (c.logoImage && typeof c.logoImage === 'string') {
    try {
      let fmt = 'PNG';
      if (c.logoImage.includes('data:image/jpeg') || c.logoImage.includes('data:image/jpg')) {
        fmt = 'JPEG';
      }
      doc.addImage(c.logoImage, fmt, margin, yPos, 30, 15);
      logoBottom = yPos + 16;
    } catch {
      // ignore bad image data
    }
  }
  const textX = c.logoImage ? margin + 34 : margin;
  const textMaxW = contentW - (c.logoImage ? 34 : 0);
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(String(c.name || 'Company Name'), textX, yPos + 5);
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  let lineY = yPos + 10;
  if (c.address) {
    const addrLines = doc.splitTextToSize(String(c.address), textMaxW);
    addrLines.forEach((ln) => {
      doc.text(ln, textX, lineY);
      lineY += 4.5;
    });
  }
  if (c.email) {
    doc.text(`Email: ${String(c.email)}`, textX, lineY);
    lineY += 4.5;
  }
  if (c.phone) {
    doc.text(`Phone: ${String(c.phone)}`, textX, lineY);
    lineY += 4.5;
  }
  if (c.website) {
    doc.text(`Website: ${String(c.website)}`, textX, lineY);
    lineY += 4.5;
  }
  const blockBottom = Math.max(logoBottom, lineY) + 2;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, blockBottom, pageWidth - margin, blockBottom);
  return blockBottom + 5;
}

export const numberToWords = (input) => {
  let num = Math.floor(Math.abs(Number(input) || 0));
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  if (num === 0) return 'Zero';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return tens[ten] + (one > 0 ? ' ' + ones[one] : '');
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    return ones[hundred] + ' Hundred' + (remainder > 0 ? ' ' + numberToWords(remainder) : '');
  }
  if (num < 100000) {
    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;
    return numberToWords(thousand) + ' Thousand' + (remainder > 0 ? ' ' + numberToWords(remainder) : '');
  }
  if (num < 10000000) {
    const lakh = Math.floor(num / 100000);
    const remainder = num % 100000;
    return numberToWords(lakh) + ' Lakh' + (remainder > 0 ? ' ' + numberToWords(remainder) : '');
  }
  const crore = Math.floor(num / 10000000);
  const remainder = num % 10000000;
  return numberToWords(crore) + ' Crore' + (remainder > 0 ? ' ' + numberToWords(remainder) : '');
};

