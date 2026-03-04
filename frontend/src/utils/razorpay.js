/**
 * Razorpay Payment Gateway Integration
 * GrandHR - Secure Payment Processing
 */

// Load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });
};

/**
 * Initialize Razorpay payment
 * @param {Object} options - Payment options
 * @param {number} options.amount - Amount in paise (e.g., 10000 for ₹100)
 * @param {string} options.currency - Currency code (default: 'INR')
 * @param {string} options.orderId - Order ID from backend
 * @param {string} options.key - Razorpay key ID
 * @param {string} options.name - Company name
 * @param {string} options.description - Payment description
 * @param {string} options.prefill.email - Customer email
 * @param {string} options.prefill.contact - Customer phone
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 */
export const initiatePayment = async (options) => {
  try {
    const Razorpay = await loadRazorpayScript();

    const razorpayOptions = {
      key: options.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: options.amount, // Amount in paise
      currency: options.currency || 'INR',
      name: options.name || 'GrandHR',
      description: options.description || 'GrandHR Subscription',
      order_id: options.orderId,
      prefill: {
        email: options.prefill?.email || '',
        contact: options.prefill?.contact || '',
        name: options.prefill?.name || ''
      },
      theme: {
        color: '#6366f1' // Accent color
      },
      handler: function (response) {
        // Payment successful
        if (options.onSuccess) {
          options.onSuccess(response);
        }
      },
      modal: {
        ondismiss: function () {
          // Payment cancelled
          if (options.onError) {
            options.onError(new Error('Payment cancelled by user'));
          }
        }
      }
    };

    const razorpay = new Razorpay(razorpayOptions);
    razorpay.open();
  } catch (error) {
    console.error('Razorpay initialization error:', error);
    if (options.onError) {
      options.onError(error);
    }
  }
};

/**
 * Create order on backend and initiate payment
 * @param {Object} paymentData - Payment data
 * @param {number} paymentData.amount - Amount in rupees
 * @param {string} paymentData.planId - Subscription plan ID
 * @param {string} paymentData.planName - Plan name
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export const processPayment = async (paymentData, onSuccess, onError) => {
  try {
    // Import API utility
    const { default: api } = await import('./api');

    // Create order on backend
    const orderResponse = await api.post('/payments/create-order', {
      amount: paymentData.amount * 100, // Convert to paise
      currency: 'INR',
      planId: paymentData.planId,
      planName: paymentData.planName
    });

    const { orderId, amount, key } = orderResponse.data;

    // Get user info from localStorage
    const hrUser = JSON.parse(localStorage.getItem('hr_user') || '{}');
    const company = JSON.parse(localStorage.getItem('hr_company') || '{}');

    // Initiate Razorpay payment
    await initiatePayment({
      key,
      orderId,
      amount,
      currency: 'INR',
      name: 'GrandHR',
      description: `${paymentData.planName} Subscription`,
      prefill: {
        email: hrUser.email || company.email || '',
        contact: '9090702705',
        name: company.name || 'Customer'
      },
      onSuccess: async (response) => {
        try {
          // Verify payment on backend
          const verifyResponse = await api.post('/payments/verify', {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            planId: paymentData.planId
          });

          if (verifyResponse.data.success) {
            onSuccess(verifyResponse.data);
          } else {
            onError(new Error('Payment verification failed'));
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          onError(error);
        }
      },
      onError: (error) => {
        console.error('Payment error:', error);
        onError(error);
      }
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    onError(error);
  }
};

/**
 * Format amount for display
 * @param {number} amount - Amount in paise
 * @returns {string} Formatted amount
 */
export const formatAmount = (amount) => {
  const rupees = amount / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(rupees);
};

export default {
  initiatePayment,
  processPayment,
  formatAmount
};

