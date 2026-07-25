import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProductFilter } from '../src/controllers/ProductsController.js';
import { CategoryModel } from '../src/models/category.model.js';
import { BrandModel } from '../src/models/brand.model.js';

const originalCategoryFindOne = CategoryModel.findOne;
const originalBrandFindOne = BrandModel.findOne;

test('buildProductFilter resolves category and brand slugs for POST requests', async () => {
  CategoryModel.findOne = async ({ slug }) => (slug === 'for-her' ? { _id: '64f000000000000000000001', slug: 'for-her' } : null);
  BrandModel.findOne = async ({ slug }) => (slug === 'niche' ? { _id: '64f000000000000000000002', slug: 'niche' } : null);

  try {
    const filter = await buildProductFilter({
      category: 'for-her',
      brand: 'niche',
      skip: 0,
      limit: 20,
      sortBy: 'price',
      order: 'desc',
    });

    assert.deepEqual(filter.categories, { $in: ['64f000000000000000000001'] });
    assert.deepEqual(filter.brand, { $in: ['64f000000000000000000002'] });
  } finally {
    CategoryModel.findOne = originalCategoryFindOne;
    BrandModel.findOne = originalBrandFindOne;
  }
});
