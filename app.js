/**
 * Oliva — app.js
 * Pantry & Catalog Management
 * Modular · Pastel Olive Palette · Zero Emojis
 */

import { 
  getProducts, 
  saveProducts, 
  getShoppingList, 
  saveShoppingList, 
  generateNextId, 
  syncListWithProducts 
} from './storage.js';

import { 
  parseQuickInput, 
  parseBulkText,
  detectCategory, 
  UNIT_LABELS 
} from './smartParser.js';

import { 
  renderIcons, 
  getCategoryIconName 
} from './icons.js';

import { initTutorial } from './tutorial.js';
import { initMagicImporter } from './magicImporter.js';

/* ── DOM Elements ── */
const quickAddForm       = document.getElementById('quickAddForm');
const quickAddInput      = document.getElementById('quickAddInput');
const quickSuggestions   = document.getElementById('quickSuggestions');
const toggleFullFormBtn  = document.getElementById('toggleFullFormBtn');
const toggleFormText     = document.getElementById('toggleFormText');
const fullFormCard       = document.getElementById('fullFormCard');
const closeFormBtn       = document.getElementById('closeFormBtn');
const formProduct        = document.getElementById('formProduct');
const formTitle          = document.getElementById('formTitle');
const btnSave            = document.getElementById('btnSave');
const btnCancelEdit      = document.getElementById('btnCancelEdit');

const searchInput        = document.getElementById('searchInput');
const categoryChips      = document.getElementById('categoryChips');
const productsContainer  = document.getElementById('productsContainer');
const listBadge          = document.getElementById('listBadge');
const bottomNavBadge     = document.getElementById('bottomNavBadge');

const toast              = document.getElementById('toast');
const toastMessage       = document.getElementById('toastMessage');
const modalOverlay       = document.getElementById('modalOverlay');
const modalTitle         = document.getElementById('modalTitle');
const modalMessage       = document.getElementById('modalMessage');
const modalOkBtn         = document.getElementById('modalOkBtn');

const confirmOverlay     = document.getElementById('confirmOverlay');
const confirmCancelBtn   = document.getElementById('confirmCancelBtn');
const confirmOkBtn       = document.getElementById('confirmOkBtn');

/* ── Local State ── */
let currentSearchTerm    = '';
let activeCategoryFilter = 'all';
let editingProductId     = null;
let confirmResolver      = null;
let toastTimeout         = null;

/* ── Toast Pill Helper ── */
function showToast(message) {
  if (!toast) return;
  clearTimeout(toastTimeout);
  toastMessage.textContent = message;
  toast.classList.add('show');
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

/* ── Modal Dialog Helper ── */
function openModal(title, text) {
  modalTitle.textContent = title;
  modalMessage.innerHTML = text;
  modalOverlay.classList.add('show');
}

modalOkBtn?.addEventListener('click', () => {
  modalOverlay.classList.remove('show');
});

/* ── Confirmation Dialog Helper ── */
function confirmAction() {
  return new Promise(resolve => {
    confirmResolver = resolve;
    confirmOverlay.classList.add('show');
  });
}

confirmCancelBtn?.addEventListener('click', () => {
  confirmOverlay.classList.remove('show');
  if (confirmResolver) confirmResolver(false);
  confirmResolver = null;
});

confirmOkBtn?.addEventListener('click', () => {
  confirmOverlay.classList.remove('show');
  if (confirmResolver) confirmResolver(true);
  confirmResolver = null;
});

/* ── Badge Updater ── */
function updateBadges() {
  const list = getShoppingList();
  const count = list.length;
  if (listBadge) {
    listBadge.textContent = count;
    listBadge.style.display = count > 0 ? 'inline-flex' : 'none';
  }
  if (bottomNavBadge) {
    bottomNavBadge.textContent = count;
    bottomNavBadge.style.display = count > 0 ? 'inline-flex' : 'none';
  }
}

/* ── Render Products Catalog ── */
function renderProducts() {
  const allProducts = getProducts();
  
  // Filter by search & pastel category
  const filtered = allProducts.filter(p => {
    const matchesSearch = !currentSearchTerm || 
      p.name.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.includes(currentSearchTerm));
    
    const matchesCat = activeCategoryFilter === 'all' || p.category === activeCategoryFilter;
    return matchesSearch && matchesCat;
  });

  if (filtered.length === 0) {
    if (allProducts.length === 0) {
      productsContainer.innerHTML = `
        <div class="empty-box">
          <div class="empty-icon-pill">
            <i data-lucide="package-open" style="width:20px;height:20px;"></i>
          </div>
          <h3 class="empty-heading">Pantry is empty</h3>
          <p class="empty-detail">Type items into the quick-add bar above or tap a suggestion pill.</p>
        </div>`;
    } else {
      productsContainer.innerHTML = `
        <div class="empty-box">
          <div class="empty-icon-pill">
            <i data-lucide="search-x" style="width:20px;height:20px;"></i>
          </div>
          <h3 class="empty-heading">No items found</h3>
          <p class="empty-detail">Try searching for something else or switch category.</p>
        </div>`;
    }
    renderIcons(productsContainer);
    return;
  }

  productsContainer.innerHTML = filtered.map(p => {
    const iconName = getCategoryIconName(p.category);
    const unitLabel = UNIT_LABELS[p.unit] || p.unit;
    const catClass = `tag-${p.category || 'other'}`;

    return `
      <div class="pantry-card" data-id="${p.id}">
        <div class="pantry-icon-circle ${catClass}">
          <i data-lucide="${iconName}" style="width:17px;height:17px;"></i>
        </div>
        <div class="pantry-details">
          <div class="pantry-title">${escapeHtml(p.name)}</div>
          <div class="pantry-sub">
            <span>${p.quantity} ${unitLabel}</span>
            ${p.barcode ? `<span>&bull;</span> <span>EAN: ${escapeHtml(p.barcode)}</span>` : ''}
          </div>
        </div>
        <div class="pantry-actions">
          <button class="tool-icon-btn edit-btn" data-id="${p.id}" title="Edit product">
            <i data-lucide="pencil" style="width:13px;height:13px;"></i>
          </button>
          <button class="tool-icon-btn danger delete-btn" data-id="${p.id}" title="Delete product">
            <i data-lucide="trash-2" style="width:13px;height:13px;"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Attach card event listeners
  productsContainer.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      startEditProduct(id);
    });
  });

  productsContainer.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const confirmed = await confirmAction();
      if (confirmed) {
        deleteProduct(id);
      }
    });
  });

  renderIcons(productsContainer);
}

/* ── Add Item Helper (Supports Single & Multi-Item Text) ── */
function addItemByString(raw) {
  if (!raw) return;

  // Check if text has multiple items (newlines, commas, semicolons, or space-separated items)
  const items = parseBulkText(raw);
  if (items.length > 1) {
    const products = getProducts();
    const shoppingList = getShoppingList();
    let nextId = generateNextId();

    for (const item of items) {
      let existingProd = products.find(p => p.name.toLowerCase() === item.name.toLowerCase());
      if (!existingProd) {
        existingProd = {
          id: nextId++,
          name: item.name,
          unit: item.unit,
          quantity: item.quantity,
          barcode: '',
          category: item.category,
          createdAt: new Date().toISOString()
        };
        products.push(existingProd);
      }

      let existingCart = shoppingList.find(c => c.productId === existingProd.id);
      if (!existingCart) {
        shoppingList.push({
          productId: existingProd.id,
          name: existingProd.name,
          unit: existingProd.unit,
          needed: existingProd.quantity,
          bought: 0,
          collected: false,
          category: existingProd.category
        });
      } else {
        existingCart.needed = (existingCart.needed || 0) + item.quantity;
      }
    }

    saveProducts(products);
    saveShoppingList(shoppingList);
    showToast(`Organized & added ${items.length} items`);
    renderProducts();
    updateBadges();
    return;
  }

  // Single item parsing
  const parsed = parseQuickInput(raw);
  if (!parsed || !parsed.name) return;

  const products = getProducts();
  const newProduct = {
    id: generateNextId(),
    name: parsed.name,
    unit: parsed.unit,
    quantity: parsed.quantity,
    barcode: '',
    category: parsed.category,
    createdAt: new Date().toISOString()
  };

  products.push(newProduct);
  saveProducts(products);

  // Auto-sync into shopping list
  const shoppingList = getShoppingList();
  shoppingList.push({
    productId: newProduct.id,
    name: newProduct.name,
    unit: newProduct.unit,
    needed: newProduct.quantity,
    bought: 0,
    collected: false,
    category: newProduct.category
  });
  saveShoppingList(shoppingList);

  showToast(`Added "${newProduct.name}"`);
  renderProducts();
  updateBadges();
}

/* ── Smart Quick-Add Form ── */
quickAddForm?.addEventListener('submit', e => {
  e.preventDefault();
  const raw = quickAddInput.value.trim();
  if (!raw) return;
  addItemByString(raw);
  quickAddInput.value = '';
  // Keep focus on input for ultra-fast rapid-fire item entry!
  quickAddInput.focus();
});

/* ── 1-Click Suggestion Pills ── */
quickSuggestions?.addEventListener('click', e => {
  const pill = e.target.closest('.suggestion-pill');
  if (!pill) return;
  const itemText = pill.dataset.item;
  if (itemText) {
    addItemByString(itemText);
  }
});

/* ── Detailed Form Accordion ── */
function toggleForm(show) {
  const isCurrentlyOpen = fullFormCard.classList.contains('open');
  const shouldOpen = show !== undefined ? show : !isCurrentlyOpen;

  if (shouldOpen) {
    fullFormCard.classList.add('open');
    toggleFormText.textContent = 'Hide form';
    renderIcons(toggleFullFormBtn);
  } else {
    fullFormCard.classList.remove('open');
    toggleFormText.textContent = 'Detailed form';
    renderIcons(toggleFullFormBtn);
    resetForm();
  }
}

toggleFullFormBtn?.addEventListener('click', () => toggleForm());
closeFormBtn?.addEventListener('click', () => toggleForm(false));

/* ── Edit Product ── */
function startEditProduct(id) {
  const product = getProducts().find(p => p.id === id);
  if (!product) return;

  editingProductId = id;
  document.getElementById('productIdEdit').value = product.id;
  document.getElementById('productName').value = product.name;
  document.getElementById('productUnit').value = product.unit;
  document.getElementById('productQty').value = product.quantity;
  document.getElementById('productCategory').value = product.category || detectCategory(product.name);
  document.getElementById('productBarcode').value = product.barcode || '';

  formTitle.querySelector('span').textContent = 'Edit Product';
  btnSave.querySelector('span').textContent = 'Update';
  btnCancelEdit.style.display = 'inline-flex';

  toggleForm(true);
  window.scrollTo({ top: fullFormCard.offsetTop - 40, behavior: 'smooth' });
}

function resetForm() {
  editingProductId = null;
  formProduct.reset();
  document.getElementById('productIdEdit').value = '';
  formTitle.querySelector('span').textContent = 'Add Product';
  btnSave.querySelector('span').textContent = 'Save Product';
  btnCancelEdit.style.display = 'none';
}

btnCancelEdit?.addEventListener('click', resetForm);

/* ── Delete Product ── */
function deleteProduct(id) {
  let products = getProducts();
  products = products.filter(p => p.id !== id);
  saveProducts(products);

  let list = getShoppingList();
  list = list.filter(item => item.productId !== id);
  saveShoppingList(list);

  showToast('Product removed');
  renderProducts();
  updateBadges();
}

/* ── Save / Update via Form ── */
formProduct?.addEventListener('submit', e => {
  e.preventDefault();

  const name = document.getElementById('productName').value.trim();
  const unit = document.getElementById('productUnit').value;
  const quantity = parseFloat(document.getElementById('productQty').value);
  const category = document.getElementById('productCategory').value;
  const barcode = document.getElementById('productBarcode').value.trim();

  if (!name || isNaN(quantity) || quantity <= 0) {
    openModal('Incomplete Details', 'Please specify a valid product name and quantity.');
    return;
  }

  if (barcode && !/^\d{13}$/.test(barcode)) {
    openModal('Invalid Barcode', 'The barcode must contain exactly 13 digits (EAN-13 standard).');
    return;
  }

  const products = getProducts();

  if (editingProductId) {
    const idx = products.findIndex(p => p.id === editingProductId);
    if (idx !== -1) {
      products[idx] = {
        ...products[idx],
        name,
        unit,
        quantity,
        category,
        barcode
      };
      saveProducts(products);

      // Update in shopping list
      const list = getShoppingList();
      const listItem = list.find(item => item.productId === editingProductId);
      if (listItem) {
        listItem.name = name;
        listItem.unit = unit;
        listItem.needed = quantity;
        listItem.category = category;
        saveShoppingList(list);
      }

      showToast(`Updated "${name}"`);
    }
  } else {
    const newProduct = {
      id: generateNextId(),
      name,
      unit,
      quantity,
      category,
      barcode,
      createdAt: new Date().toISOString()
    };
    products.push(newProduct);
    saveProducts(products);

    const list = getShoppingList();
    list.push({
      productId: newProduct.id,
      name,
      unit,
      needed: quantity,
      bought: 0,
      collected: false,
      category
    });
    saveShoppingList(list);

    showToast(`Added "${name}"`);
  }

  resetForm();
  toggleForm(false);
  renderProducts();
  updateBadges();
});

/* ── Search & Filter Listeners ── */
searchInput?.addEventListener('input', e => {
  currentSearchTerm = e.target.value.trim();
  renderProducts();
});

// Inline search toggle (expand/collapse)
const filterSearchToggle   = document.getElementById('filterSearchToggle');
const filterSearchExpandedRow = document.getElementById('filterSearchExpandedRow');
filterSearchToggle?.addEventListener('click', () => {
  const isExpanded = filterSearchExpandedRow?.classList.contains('visible');
  if (isExpanded) {
    filterSearchExpandedRow.classList.remove('visible');
    filterSearchExpandedRow.style.display = 'none';
    filterSearchToggle.classList.remove('active');
    if (searchInput) { searchInput.value = ''; }
    currentSearchTerm = '';
    renderProducts();
  } else {
    if (filterSearchExpandedRow) {
      filterSearchExpandedRow.style.display = 'block';
      filterSearchExpandedRow.classList.add('visible');
    }
    filterSearchToggle.classList.add('active');
    searchInput?.focus();
  }
});

// Close search on Escape key
searchInput?.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    filterSearchExpandedRow?.classList.remove('visible');
    if (filterSearchExpandedRow) filterSearchExpandedRow.style.display = 'none';
    filterSearchToggle?.classList.remove('active');
    searchInput.value = '';
    currentSearchTerm = '';
    renderProducts();
  }
});

categoryChips?.addEventListener('click', e => {
  const chip = e.target.closest('.cat-chip');
  if (!chip) return;

  categoryChips.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');

  activeCategoryFilter = chip.dataset.category || 'all';
  renderProducts();
});

/* ── HTML Entity Escaping ── */
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Initial Boot ── */
syncListWithProducts();
renderProducts();
updateBadges();
renderIcons();
initTutorial();
initMagicImporter(items => {
  showToast(`Organized & added ${items.length} items`);
  renderProducts();
  updateBadges();
});

