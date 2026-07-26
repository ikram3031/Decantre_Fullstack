import axios from 'axios';
import { MockDb } from './mockDb';

// Let's create a custom axios adapter
const mockAdapter = async (config) => {
  const url = config.url || '';
  const method = (config.method || 'GET').toUpperCase();
  const data = config.data ? JSON.parse(config.data) : null;

  // Small utility for delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 1. Auth Routing
  if (url.includes('/api/login') && method === 'POST') {
    const { email, password } = data || {};
    if (email === 'admin@example.com' && password === 'admin') {
      return {
        data: {
          token: 'mock-jwt-token-xyz',
          user: {
            id: 'usr-1',
            name: 'Alexander Wright',
            email: 'admin@example.com',
            role: 'Administrator',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config
      };
    }
    return {
      data: { message: 'Invalid credentials. Use admin@example.com and password "admin".' },
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config: config
    };
  }

  // 2. Orders Routing
  if (url.includes('/api/orders')) {
    const orders = MockDb.getOrders();

    // Match exact order: /api/orders/:id
    const orderMatch = url.match(/\/api\/orders\/([a-zA-Z0-9-]+)$/);
    if (orderMatch) {
      const orderId = orderMatch[1];
      const orderIndex = orders.findIndex((o) => o.id === orderId);

      if (method === 'GET') {
        if (orderIndex !== -1) {
          return {
            data: orders[orderIndex],
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config
          };
        }
        return {
          data: { message: 'Order not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: config
        };
      }

      if (method === 'PUT') {
        if (orderIndex !== -1) {
          const updatedOrder = { ...orders[orderIndex], ...data };
          
          // If status changed, automatically append to history
          if (data.status && data.status !== orders[orderIndex].status) {
            const historyEntry = {
              id: `h-updated-${Date.now()}`,
              date: new Date().toISOString(),
              status: data.status,
              comment: data.comment || `Order status updated to ${data.status}`,
              updatedBy: 'admin'
            };
            updatedOrder.history = [...(updatedOrder.history || []), historyEntry];
          }

          orders[orderIndex] = updatedOrder;
          MockDb.saveOrders(orders);
          return {
            data: updatedOrder,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config
          };
        }
        return {
          data: { message: 'Order not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: config
        };
      }

      if (method === 'DELETE') {
        if (orderIndex !== -1) {
          const deleted = orders.splice(orderIndex, 1);
          MockDb.saveOrders(orders);
          return {
            data: deleted[0],
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config
          };
        }
        return {
          data: { message: 'Order not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: config
        };
      }
    }

    if (method === 'GET') {
      return {
        data: orders,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config
      };
    }

    if (method === 'POST') {
      const orderCount = orders.length;
      const orderNumber = `WC-${1001 + orderCount}`;
      const newOrder = {
        id: `ord-${Date.now()}`,
        orderNumber,
        date: new Date().toISOString(),
        history: [
          {
            id: `h-${Date.now()}`,
            date: new Date().toISOString(),
            status: data.status || 'pending',
            comment: data.notes || 'Order created',
            updatedBy: 'admin'
          }
        ],
        ...data
      };
      orders.push(newOrder);
      MockDb.saveOrders(orders);

      // Decrement product inventory stock levels
      const products = MockDb.getProducts();
      newOrder.items.forEach((item) => {
        const pIndex = products.findIndex((p) => p.id === item.productId);
        if (pIndex !== -1) {
          const product = products[pIndex];
          
          // Decrement specific variant stock if it exists
          if (item.size && product.variants) {
            const vIndex = product.variants.findIndex((v) => v.size === item.size);
            if (vIndex !== -1) {
              product.variants[vIndex].stockQuantity = Math.max(0, product.variants[vIndex].stockQuantity - item.quantity);
            }
          }

          product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
          if (product.stockQuantity === 0) {
            product.stockStatus = 'outofstock';
          }
        }
      });
      MockDb.saveProducts(products);

      // Also increment customer's totals if customerId is present
      if (newOrder.customerId) {
        const customers = MockDb.getCustomers();
        const cIndex = customers.findIndex((c) => c.id === newOrder.customerId);
        if (cIndex !== -1) {
          customers[cIndex].totalOrders += 1;
          customers[cIndex].totalSpent += newOrder.total;
          MockDb.saveCustomers(customers);
        }
      }

      return {
        data: newOrder,
        status: 201,
        statusText: 'Created',
        headers: {},
        config: config
      };
    }
  }

  // 3. Products Routing
  if (url.includes('/api/products')) {
    const products = MockDb.getProducts();

    const productMatch = url.match(/\/api\/products\/([a-zA-Z0-9-]+)$/);
    if (productMatch) {
      const productId = productMatch[1];
      const productIndex = products.findIndex((p) => p.id === productId);

      if (method === 'GET') {
        if (productIndex !== -1) {
          return {
            data: products[productIndex],
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config
          };
        }
        return {
          data: { message: 'Product not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: config
        };
      }

      if (method === 'PUT') {
        if (productIndex !== -1) {
          const updatedProduct = { ...products[productIndex], ...data };
          products[productIndex] = updatedProduct;
          MockDb.saveProducts(products);
          return {
            data: updatedProduct,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config
          };
        }
        return {
          data: { message: 'Product not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: config
        };
      }

      if (method === 'DELETE') {
        if (productIndex !== -1) {
          const deleted = products.splice(productIndex, 1);
          MockDb.saveProducts(products);
          return {
            data: deleted[0],
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config
          };
        }
        return {
          data: { message: 'Product not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: config
        };
      }
    }

    if (method === 'GET') {
      return {
        data: products,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config
      };
    }

    if (method === 'POST') {
      const newProduct = {
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString(),
        slug: (data.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        ...data
      };
      products.push(newProduct);
      MockDb.saveProducts(products);
      return {
        data: newProduct,
        status: 201,
        statusText: 'Created',
        headers: {},
        config: config
      };
    }
  }

  // 4. Users Routing
  if (url.includes('/api/users')) {
    const users = MockDb.getUsers();

    const userMatch = url.match(/\/api\/users\/([a-zA-Z0-9-]+)$/);
    if (userMatch) {
      const userId = userMatch[1];
      const userIndex = users.findIndex((u) => u.id === userId);

      if (method === 'GET') {
        if (userIndex !== -1) {
          return {
            data: users[userIndex],
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config
          };
        }
        return {
          data: { message: 'User not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: config
        };
      }

      if (method === 'PUT') {
        if (userIndex !== -1) {
          const updatedUser = { ...users[userIndex], ...data };
          users[userIndex] = updatedUser;
          MockDb.saveUsers(users);
          return {
            data: updatedUser,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config
          };
        }
        return {
          data: { message: 'User not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: config
        };
      }

      if (method === 'DELETE') {
        if (userIndex !== -1) {
          const deleted = users.splice(userIndex, 1);
          MockDb.saveUsers(users);
          return {
            data: deleted[0],
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config
          };
        }
        return {
          data: { message: 'User not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: config
        };
      }
    }

    if (method === 'GET') {
      return {
        data: users,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config
      };
    }

    if (method === 'POST') {
      const newUser = {
        id: `usr-${Date.now()}`,
        createdAt: new Date().toISOString(),
        avatar: data.avatar || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`,
        ...data
      };
      users.push(newUser);
      MockDb.saveUsers(users);
      return {
        data: newUser,
        status: 201,
        statusText: 'Created',
        headers: {},
        config: config
      };
    }
  }

  // 5. Customers Routing
  if (url.includes('/api/customers')) {
    const customers = MockDb.getCustomers();

    const customerMatch = url.match(/\/api\/customers\/([a-zA-Z0-9-]+)$/);
    if (customerMatch) {
      const customerId = customerMatch[1];
      const customerIndex = customers.findIndex((c) => c.id === customerId);

      if (method === 'GET') {
        if (customerIndex !== -1) {
          return {
            data: customers[customerIndex],
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config
          };
        }
        return {
          data: { message: 'Customer not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: config
        };
      }

      if (method === 'PUT') {
        if (customerIndex !== -1) {
          const updatedCustomer = { ...customers[customerIndex], ...data };
          customers[customerIndex] = updatedCustomer;
          MockDb.saveCustomers(customers);

          // Update customerName or customerEmail in all orders of this customer
          const orders = MockDb.getOrders();
          let orderChanged = false;
          orders.forEach((o, idx) => {
            if (o.customerId === customerId) {
              orders[idx].customerName = updatedCustomer.name;
              orders[idx].customerEmail = updatedCustomer.email;
              orderChanged = true;
            }
          });
          if (orderChanged) {
            MockDb.saveOrders(orders);
          }

          return {
            data: updatedCustomer,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config
          };
        }
        return {
          data: { message: 'Customer not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: config
        };
      }
    }

    if (method === 'GET') {
      return {
        data: customers,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config
      };
    }
  }

  // 6. Categories Routing
  if (url.includes('/api/categories')) {
    const categories = MockDb.getCategories();

    const catMatch = url.match(/\/api\/categories\/([a-zA-Z0-9-]+)$/);
    if (catMatch) {
      const catId = catMatch[1];
      const catIndex = categories.findIndex((c) => c.id === catId);

      if (method === 'GET') {
        if (catIndex !== -1) {
          return {
            data: categories[catIndex],
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config
          };
        }
        return {
          data: { message: 'Category not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: config
        };
      }

      if (method === 'PUT') {
        if (catIndex !== -1) {
          const updatedCat = { ...categories[catIndex], ...data };
          categories[catIndex] = updatedCat;
          MockDb.saveCategories(categories);
          return {
            data: updatedCat,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config
          };
        }
        return {
          data: { message: 'Category not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: config
        };
      }

      if (method === 'DELETE') {
        if (catIndex !== -1) {
          const deleted = categories.splice(catIndex, 1);
          MockDb.saveCategories(categories);
          return {
            data: deleted[0],
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config
          };
        }
        return {
          data: { message: 'Category not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: config
        };
      }
    }

    if (method === 'GET') {
      return {
        data: categories,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config
      };
    }

    if (method === 'POST') {
      const newCat = {
        id: `cat-${Date.now()}`,
        slug: (data.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        parentId: data.parentId || null,
        ...data
      };
      categories.push(newCat);
      MockDb.saveCategories(categories);
      return {
        data: newCat,
        status: 201,
        statusText: 'Created',
        headers: {},
        config: config
      };
    }
  }

  // 7. Brands Routing
  if (url.includes('/api/brands')) {
    const brands = MockDb.getBrands();

    const brandMatch = url.match(/\/api\/brands\/([a-zA-Z0-9-]+)$/);
    if (brandMatch) {
      const brandId = brandMatch[1];
      const brandIndex = brands.findIndex((b) => b.id === brandId);

      if (method === 'GET') {
        if (brandIndex !== -1) {
          return {
            data: brands[brandIndex],
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config
          };
        }
        return {
          data: { message: 'Brand not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: config
        };
      }

      if (method === 'PUT') {
        if (brandIndex !== -1) {
          const updatedBrand = { ...brands[brandIndex], ...data };
          brands[brandIndex] = updatedBrand;
          MockDb.saveBrands(brands);
          return {
            data: updatedBrand,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config
          };
        }
        return {
          data: { message: 'Brand not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: config
        };
      }

      if (method === 'DELETE') {
        if (brandIndex !== -1) {
          const deleted = brands.splice(brandIndex, 1);
          MockDb.saveBrands(brands);
          return {
            data: deleted[0],
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config
          };
        }
        return {
          data: { message: 'Brand not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: config
        };
      }
    }

    if (method === 'GET') {
      return {
        data: brands,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config
      };
    }

    if (method === 'POST') {
      const newBrand = {
        id: `br-${Date.now()}`,
        slug: (data.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        parentId: data.parentId || null,
        ...data
      };
      brands.push(newBrand);
      MockDb.saveBrands(brands);
      return {
        data: newBrand,
        status: 201,
        statusText: 'Created',
        headers: {},
        config: config
      };
    }
  }

  // 8. Tags Routing
  if (url.includes('/api/tags')) {
    const tags = MockDb.getTags();

    const tagMatch = url.match(/\/api\/tags\/([a-zA-Z0-9-]+)$/);
    if (tagMatch) {
      const tagId = tagMatch[1];
      const tagIndex = tags.findIndex((t) => t.id === tagId);

      if (method === 'GET') {
        if (tagIndex !== -1) {
          return {
            data: tags[tagIndex],
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config
          };
        }
        return {
          data: { message: 'Tag not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: config
        };
      }

      if (method === 'PUT') {
        if (tagIndex !== -1) {
          const updatedTag = { ...tags[tagIndex], ...data };
          tags[tagIndex] = updatedTag;
          MockDb.saveTags(tags);
          return {
            data: updatedTag,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config
          };
        }
        return {
          data: { message: 'Tag not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: config
        };
      }

      if (method === 'DELETE') {
        if (tagIndex !== -1) {
          const deleted = tags.splice(tagIndex, 1);
          MockDb.saveTags(tags);
          return {
            data: deleted[0],
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config
          };
        }
        return {
          data: { message: 'Tag not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: config
        };
      }
    }

    if (method === 'GET') {
      return {
        data: tags,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config
      };
    }

    if (method === 'POST') {
      const newTag = {
        id: `tag-${Date.now()}`,
        slug: (data.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        ...data
      };
      tags.push(newTag);
      MockDb.saveTags(tags);
      return {
        data: newTag,
        status: 201,
        statusText: 'Created',
        headers: {},
        config: config
      };
    }
  }

  // Fallback
  return {
    data: { message: 'Mock route not implemented' },
    status: 404,
    statusText: 'Not Found',
    headers: {},
    config: config
  };
};

export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/api/v1`,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  refreshQueue = [];
};

const clearAuthStorage = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_refresh_token');
  localStorage.removeItem('admin_user');
};

const triggerLogout = () => {
  clearAuthStorage();
  window.dispatchEvent(new Event('dashboard-logout'));
};

const refreshTokenRequest = async () => {
  const refreshToken = localStorage.getItem('admin_refresh_token');
  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  const url = `${apiClient.defaults.baseURL.replace(/\/api\/v1$/, '')}/api/refresh`;
  const response = await axios.post(url, { refreshToken });
  const payload = response.data?.data || response.data || {};
  const newToken = payload.accessToken || payload.token || payload.authToken;
  const newRefreshToken = payload.refreshToken || payload.refresh_token || payload.refresh;

  if (!newToken) {
    throw new Error('Failed to refresh token');
  }

  localStorage.setItem('admin_token', newToken);
  if (newRefreshToken) {
    localStorage.setItem('admin_refresh_token', newRefreshToken);
  }

  return newToken;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/api/refresh')
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      try {
        const token = await refreshTokenRequest();
        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        triggerLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
