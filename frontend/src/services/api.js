const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const LOCAL_STORAGE_KEY = 'aussomefinds_products_v1';
const LOCAL_ORDERS_KEY = 'aussomefinds_orders_v1';

export const getLocalProducts = () => {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY);
    return item ? JSON.parse(item) : null;
  } catch (err) {
    return null;
  }
};

export const setLocalProducts = (products) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('LocalStorage error:', err);
  }
};

export const getLocalOrders = () => {
  try {
    const item = localStorage.getItem(LOCAL_ORDERS_KEY);
    return item ? JSON.parse(item) : [];
  } catch (err) {
    return [];
  }
};

export const setLocalOrders = (orders) => {
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('LocalStorage orders error:', err);
  }
};

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/products${query ? `?${query}` : ''}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    const serverProducts = data.products || data || [];
    if (!params.category || params.category === 'All') {
      setLocalProducts(serverProducts);
    }
    return serverProducts;
  } catch (err) {
    console.warn('Backend API fetch error, using local storage cache:', err.message);
    const cached = getLocalProducts();
    if (cached && Array.isArray(cached) && cached.length > 0) {
      const validProducts = cached.filter(p => p && p.id && p.name);
      if (params.category && params.category !== 'All') {
        return validProducts.filter((p) => p.category && p.category.toLowerCase() === params.category.toLowerCase());
      }
      return validProducts;
    }
    return null;
  }
}

export async function createProduct(productData) {
  const newProduct = {
    id: `prod-${Date.now()}`,
    status: 'Available',
    ...productData,
    price: Number(productData.price) || 0,
    originalPrice: productData.originalPrice ? Number(productData.originalPrice) : undefined
  };

  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (res.ok) {
      const data = await res.json();
      const created = data.product || data;
      const cached = getLocalProducts() || [];
      const updatedList = [created, ...cached.filter(p => p && p.id && p.id !== created.id)];
      setLocalProducts(updatedList);
      return created;
    }
  } catch (err) {
    console.warn('Backend POST failed, saving locally:', err);
  }

  const cached = getLocalProducts() || [];
  const updated = [newProduct, ...cached.filter(p => p && p.id)];
  setLocalProducts(updated);
  return newProduct;
}

export async function updateProduct(id, productData) {
  const updatedItem = {
    id,
    ...productData,
    price: Number(productData.price) || 0,
    originalPrice: productData.originalPrice ? Number(productData.originalPrice) : undefined
  };

  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (res.ok) {
      const data = await res.json();
      const result = data.product || data;
      const cached = getLocalProducts() || [];
      const index = cached.findIndex((p) => p && p.id === id);
      if (index > -1) cached[index] = result;
      else cached.unshift(result);
      setLocalProducts(cached);
      return result;
    }
  } catch (err) {
    console.warn('Backend PUT failed, updating locally:', err);
  }

  const cached = getLocalProducts() || [];
  const index = cached.findIndex((p) => p && p.id === id);
  if (index > -1) {
    cached[index] = { ...cached[index], ...updatedItem };
    setLocalProducts(cached);
  }
  return updatedItem;
}

export async function deleteProduct(id) {
  try {
    await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('Backend DELETE failed, deleting locally:', err);
  }

  const cached = getLocalProducts() || [];
  const updated = cached.filter((p) => p.id !== id);
  setLocalProducts(updated);
  return { success: true, id };
}

export async function placeOrder(orderData) {
  const newOrder = {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    status: orderData.paymentMethod === 'Bank' ? 'Pending Payment Verification' : 'Order Placed (Cash)',
    paymentConfirmed: false,
    ...orderData
  };

  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    });
    if (res.ok) {
      const created = await res.json();
      const cached = getLocalOrders();
      setLocalOrders([created.order || newOrder, ...cached]);
      return created;
    }
  } catch (err) {
    console.warn('Backend POST order failed, saving locally:', err);
  }

  const cached = getLocalOrders();
  setLocalOrders([newOrder, ...cached]);
  return { success: true, order: newOrder };
}

export async function fetchOrders() {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`);
    if (res.ok) {
      const data = await res.json();
      const serverOrders = data.orders || data || [];
      if (Array.isArray(serverOrders) && serverOrders.length > 0) {
        setLocalOrders(serverOrders);
        return serverOrders;
      }
    }
  } catch (err) {
    console.warn('Backend orders fetch failed, reading local storage:', err);
  }
  return getLocalOrders();
}

export async function updateOrderStatus(orderId, status, paymentConfirmed = true) {
  try {
    await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, paymentConfirmed })
    });
  } catch (err) {
    console.warn('Backend PUT order status failed:', err);
  }
  const cached = getLocalOrders();
  const updated = cached.map((ord) => (ord.id === orderId ? { ...ord, status, paymentConfirmed } : ord));
  setLocalOrders(updated);
  return { success: true, orderId, status };
}

export async function updateProductStatus(productId, status) {
  try {
    await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  } catch (err) {
    console.warn('Backend PUT product status failed:', err);
  }
  const cached = getLocalProducts() || [];
  const updated = cached.map((prod) => (prod.id === productId ? { ...prod, status } : prod));
  setLocalProducts(updated);
  return { success: true, productId, status };
}
