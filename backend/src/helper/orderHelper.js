const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const validateOrderPayload = (body) => {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return ['Request body must be a valid JSON object'];
  }

  const requiredFields = ['fullName', 'phone', 'email', 'address', 'district'];

  requiredFields.forEach((field) => {
    const value = body[field];
    if (typeof value !== 'string' || value.trim() === '') {
      errors.push(`${field} is required`);
    }
  });

  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.push('items must be a non-empty array');
  }

  if (typeof body.paymentMethod !== 'string' || body.paymentMethod.trim() === '') {
    errors.push('paymentMethod is required');
  }

  if (!isValidEmail(body.email)) {
    errors.push('email must be a valid email address');
  }

  return errors;
};

export const buildOrderNumber = () => {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${datePart}-${randomPart}`;
};
