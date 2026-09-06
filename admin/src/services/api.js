const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
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

export const fetchProducts = async (params = {}) => {
  try {
    const url = new URL(`${API_BASE}/products`);
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    const serverProducts = data.products || data || [];
    if (!params.category || params.category === 'All') {
      setLocalProducts(serverProducts);
    }
    return serverProducts;
  } catch (err) {
    console.warn('Backend API offline or unreachable, using local storage cache:', err.message);
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
};

export const createProduct = async (productData) => {
  const defaultPlaceholder = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop";
  const imageList = Array.isArray(productData.images) && productData.images.length > 0
    ? productData.images
    : (productData.image ? [productData.image] : [defaultPlaceholder]);

  const payload = {
    ...productData,
    image: imageList[0] || defaultPlaceholder,
    images: imageList,
    price: Number(productData.price) || 0,
    originalPrice: productData.originalPrice ? Number(productData.originalPrice) : undefined
  };

  try {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      const created = data.product || data;
      const cached = getLocalProducts() || [];
      const updatedList = [created, ...cached.filter(p => p && p.id && p.id !== created.id)];
      setLocalProducts(updatedList);
      return created;
    } else {
      const errText = await res.text();
      console.error('API Error Response:', errText);
    }
  } catch (err) {
    console.warn('Backend POST failed, saving locally:', err.message);
  }

  const newProduct = {
    id: `prod-${Date.now()}`,
    status: 'Available',
    ...payload
  };
  const cached = getLocalProducts() || [];
  const updated = [newProduct, ...cached.filter(p => p && p.id)];
  setLocalProducts(updated);
  return newProduct;
};

export const updateProduct = async (id, productData) => {
  const defaultPlaceholder = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop";
  const imageList = Array.isArray(productData.images) && productData.images.length > 0
    ? productData.images
    : (productData.image ? [productData.image] : [defaultPlaceholder]);

  const payload = {
    ...productData,
    image: imageList[0] || defaultPlaceholder,
    images: imageList,
    price: Number(productData.price) || 0,
    originalPrice: productData.originalPrice ? Number(productData.originalPrice) : undefined
  };

  try {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      const updated = data.product || data;
      const cached = getLocalProducts() || [];
      const index = cached.findIndex(p => p.id === id);
      if (index > -1) {
        cached[index] = updated;
        setLocalProducts(cached);
      }
      return updated;
    }
  } catch (err) {
    console.warn('Backend PUT failed:', err.message);
  }

  const updatedItem = {
    id,
    ...payload
  };
  const cached = getLocalProducts() || [];
  const index = cached.findIndex(p => p.id === id);
  if (index > -1) {
    cached[index] = updatedItem;
    setLocalProducts(cached);
  }
  return updatedItem;
};

export const deleteProduct = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      console.error('Delete request returned status:', res.status);
    }
  } catch (err) {
    console.warn('Backend DELETE request failed:', err);
  }

  const cached = getLocalProducts() || [];
  const updated = cached.filter((p) => p && p.id !== id);
  setLocalProducts(updated);
  return { success: true, id };
};

export const placeOrder = async (orderData) => {
  const newOrder = {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    status: orderData.paymentMethod === 'Bank' ? 'Pending Payment Verification' : 'Order Placed (Cash)',
    paymentConfirmed: false,
    ...orderData
  };

  try {
    const res = await fetch(`${API_BASE}/orders`, {
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
};

export const fetchOrders = async () => {
  try {
    const res = await fetch(`${API_BASE}/orders`);
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
};

export const updateOrderStatus = async (orderId, status, paymentConfirmed = true) => {
  try {
    await fetch(`${API_BASE}/orders/${orderId}`, {
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
};

export const updateProductStatus = async (productId, status) => {
  try {
    await fetch(`${API_BASE}/products/${productId}`, {
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
};
