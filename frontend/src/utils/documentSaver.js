import api from './api';

/**
 * Save a generated document to the database
 * @param {Object} params - Document parameters
 * @param {string} params.documentType - Type of document (OFFER_LETTER, APPOINTMENT_LETTER, etc.)
 * @param {string} params.title - Document title
 * @param {string} params.content - HTML or text content
 * @param {string} params.pdfData - Base64 encoded PDF (optional)
 * @param {Object} params.metadata - Additional metadata
 * @param {string} params.employeeId - Employee ID (optional)
 */
export const saveDocument = async (params) => {
  try {
    const response = await api.post('/generated-documents', {
      documentType: params.documentType,
      title: params.title,
      content: params.content,
      pdfData: params.pdfData,
      metadata: params.metadata || {},
      employeeId: params.employeeId,
    });

    return {
      success: true,
      document: response.data.document,
    };
  } catch (error) {
    console.error('Error saving document:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to save document',
    };
  }
};

/**
 * Convert PDF blob to base64
 * @param {Blob} blob - PDF blob
 * @returns {Promise<string>} Base64 string
 */
export const pdfBlobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1]; // Remove data:application/pdf;base64, prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

