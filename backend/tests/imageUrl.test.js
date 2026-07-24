import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProductImageUrl } from '../src/utils/imageUrl.js';

test('buildProductImageUrl returns the original thumbnail URL when present', () => {
  assert.equal(
    buildProductImageUrl('https://example.com/images/product.jpg'),
    'https://example.com/images/product.jpg'
  );
});

test('buildProductImageUrl returns null when no thumbnail URL exists', () => {
  assert.equal(buildProductImageUrl(null), null);
  assert.equal(buildProductImageUrl(''), null);
});
