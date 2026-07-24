import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOrderPayload } from '../src/helper/orderHelper.js';

test('validateOrderPayload accepts a complete order payload', () => {
  const payload = {
    fullName: 'Nadia Rahman',
    phone: '+8801712345678',
    email: 'customer@example.com',
    address: 'House 12, Road 3',
    city: 'Dhaka',
    thana: 'Dhanmondi',
    district: 'Dhaka',
    zip: '1209',
    paymentMethod: 'cod',
    items: [{ name: 'Oud Imperial', quantity: 1, unitPrice: 1200 }],
  };

  assert.deepEqual(validateOrderPayload(payload), []);
});

test('validateOrderPayload reports missing required fields', () => {
  const payload = {
    fullName: 'Nadia Rahman',
    phone: '+8801712345678',
    email: 'invalid-email',
    address: 'House 12, Road 3',
    city: 'Dhaka',
    thana: 'Dhanmondi',
    district: 'Dhaka',
    zip: '1209',
    paymentMethod: 'cod',
    items: [],
  };

  const errors = validateOrderPayload(payload);
  assert.ok(errors.includes('items must be a non-empty array'));
  assert.ok(errors.includes('email must be a valid email address'));
});
