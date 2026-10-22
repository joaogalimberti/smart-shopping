/**
 * Oliva — Centralized Storage Management
 */

export const STORAGE_KEYS = {
  PRODUCTS: 'smartShop_products',
  LIST: 'smartShop_list',
  HISTORY: 'smartShop_history',
  SETTINGS: 'smartShop_settings',
  ONBOARDING: 'oliva_onboarding_done'
};

export function getProducts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || [];
  } catch {
    return [];
  }
}

export function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

export function getShoppingList() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LIST)) || [];
  } catch {
    return [];
  }
}

export function saveShoppingList(list) {
  localStorage.setItem(STORAGE_KEYS.LIST, JSON.stringify(list));
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY)) || [];
  } catch {
    return [];
  }
}

export function saveHistory(history) {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || {
      groupByCategory: false,
      filter: 'all'
    };
  } catch {
    return { groupByCategory: false, filter: 'all' };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function isOnboardingCompleted() {
  return localStorage.getItem(STORAGE_KEYS.ONBOARDING) === 'true';
}

export function setOnboardingCompleted() {
  localStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true');
}

export function resetOnboarding() {
  localStorage.removeItem(STORAGE_KEYS.ONBOARDING);
}

export function generateNextId() {
  const products = getProducts();
  return products.length === 0 ? 1 : Math.max(...products.map(p => Number(p.id) || 0)) + 1;
}

/**
 * Synchronizes shopping list items with product definitions
 */
export function syncListWithProducts() {
  const products = getProducts();
  let list = getShoppingList();

  // If this is a brand new user with no items, populate 3 tasteful starter items so the app is immediately clear!
  if (products.length === 0 && list.length === 0 && !localStorage.getItem('oliva_initialized')) {
    localStorage.setItem('oliva_initialized', 'true');
    const starters = [
      { id: 1, name: 'Sourdough Bread', unit: 'un', quantity: 1, barcode: '', category: 'bakery' },
      { id: 2, name: 'Oat Milk', unit: 'lt', quantity: 2, barcode: '', category: 'dairy' },
      { id: 3, name: 'Crisp Apples', unit: 'kg', quantity: 1, barcode: '', category: 'produce' }
    ];
    saveProducts(starters);
    const starterList = starters.map(p => ({
      productId: p.id,
      name: p.name,
      unit: p.unit,
      needed: p.quantity,
      bought: 0,
      collected: false,
      category: p.category
    }));
    saveShoppingList(starterList);
    return starterList;
  }

  // Remove items whose product was deleted
  list = list.filter(item => products.some(p => p.id === item.productId));

  // Add newly created products or update existing
  products.forEach(p => {
    const existing = list.find(item => item.productId === p.id);
    if (!existing) {
      list.push({
        productId: p.id,
        name: p.name,
        unit: p.unit,
        needed: p.quantity,
        bought: 0,
        collected: false,
        category: p.category || 'other'
      });
    } else {
      existing.name = p.name;
      existing.unit = p.unit;
      existing.needed = p.quantity;
      existing.category = p.category || existing.category || 'other';
    }
  });

  saveShoppingList(list);
  return list;
}
