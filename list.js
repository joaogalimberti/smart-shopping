/**
 * Oliva — list.js
 * In-Store Shopping Cart
 * Modular · Pastel Olive Palette · Zero Emojis
 */

import { 
  getProducts, 
  saveProducts, 
  getShoppingList, 
  saveShoppingList, 
  getHistory, 
  saveHistory, 
  getSettings, 
  saveSettings, 
  syncListWithProducts, 
  generateNextId 
} from './storage.js';

import { 
  parseQuickInput, 
  parseBulkText,
  UNIT_LABELS, 
  CATEGORIES 
} from './smartParser.js';

import { 
  renderIcons, 
  getCategoryIconName 
} from './icons.js';

import { initTutorial } from './tutorial.js';
import { initMagicImporter } from './magicImporter.js';

const API_BASE = 'https://69264c8426e7e41498f9efaa.mockapi.io/Compras';

/* ── DOM Elements ── */
const progressSubtitle      = document.getElementById('progressSubtitle');
const progressPct           = document.getElementById('progressPct');
const progressFill          = document.getElementById('progressFill');
const btnToggleGroup        = document.getElementById('btnToggleGroup');
const btnResetList          = document.getElementById('btnResetList');
const quickAddListForm      = document.getElementById('quickAddListForm');
const quickAddListInput     = document.getElementById('quickAddListInput');
const quickSuggestionsList  = document.getElementById('quickSuggestionsList');

const filterAll             = document.getElementById('filterAll');
const filterPending         = document.getElementById('filterPending');
const filterCollected       = document.getElementById('filterCollected');
const countAll              = document.getElementById('countAll');
const countPending          = document.getElementById('countPending');
const countCollected        = document.getElementById('countCollected');

const shoppingListContainer = document.getElementById('shoppingListContainer');
const btnSubmitShopping     = document.getElementById('btnSubmitShopping');
const submitBtnText         = document.getElementById('submitBtnText');
const historyList           = document.getElementById('historyList');
const btnClearHistory       = document.getElementById('btnClearHistory');
const bottomNavBadge        = document.getElementById('bottomNavBadge');

const toast                 = document.getElementById('toast');
const toastMessage          = document.getElementById('toastMessage');
const modalOverlay          = document.getElementById('modalOverlay');
const modalTitle            = document.getElementById('modalTitle');
const modalMessage          = document.getElementById('modalMessage');
const modalOkBtn            = document.getElementById('modalOkBtn');

const resetConfirmOverlay   = document.getElementById('resetConfirmOverlay');
const resetCancelBtn        = document.getElementById('resetCancelBtn');
const resetOkBtn            = document.getElementById('resetOkBtn');

/* ── Local State ── */
let settings = getSettings();
let toastTimer = null;

/* ── Toast Pill Helper ── */
function showToast(message) {
  if (!toast) return;
  clearTimeout(toastTimer);
  toastMessage.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

/* ── Modal Dialog Helper ── */
function openModal(title, content) {
  modalTitle.textContent = title;
  modalMessage.innerHTML = content;
  modalOverlay.classList.add('show');
}

modalOkBtn?.addEventListener('click', () => {
  modalOverlay.classList.remove('show');
});

/* ── Update Progress UI ── */
function updateProgress(list) {
  const total = list.length;
  const collected = list.filter(item => item.collected).length;
  const pending = total - collected;
  const pct = total === 0 ? 0 : Math.round((collected / total) * 100);

  if (progressSubtitle) {
    progressSubtitle.textContent = `${collected} of ${total} collected`;
  }
  if (progressPct) {
    progressPct.textContent = `${pct}%`;
  }
  if (progressFill) {
    progressFill.style.width = `${pct}%`;
  }

  if (countAll) countAll.textContent = total;
  if (countPending) countPending.textContent = pending;
  if (countCollected) countCollected.textContent = collected;
  if (bottomNavBadge) bottomNavBadge.textContent = total;

  // Submit button state
  if (btnSubmitShopping) {
    const isReady = total > 0 && collected === total;
    btnSubmitShopping.disabled = !isReady;
    if (isReady) {
      btnSubmitShopping.classList.add('btn-success');
      btnSubmitShopping.classList.remove('btn-primary');
      submitBtnText.textContent = 'Submit Completed Shopping';
    } else {
      btnSubmitShopping.classList.add('btn-primary');
      btnSubmitShopping.classList.remove('btn-success');
      submitBtnText.textContent = total === 0 ? 'Cart is Empty' : `Collect all items (${collected}/${total})`;
    }
  }
}

/* ── Render Shopping List ── */
function renderList() {
  const list = syncListWithProducts();

  if (list.length === 0) {
    shoppingListContainer.innerHTML = `
      <div class="empty-box">
        <div class="empty-icon-pill">
          <i data-lucide="shopping-bag" style="width:20px;height:20px;"></i>
        </div>
        <h3 class="empty-heading">Cart is clear</h3>
        <p class="empty-detail">Add items with the quick input above or browse your Pantry.</p>
      </div>`;
    updateProgress([]);
    renderIcons(shoppingListContainer);
    return;
  }

  const currentFilter = settings.filter || 'all';
  const filtered = list.filter(item => {
    if (currentFilter === 'pending') return !item.collected;
    if (currentFilter === 'collected') return item.collected;
    return true;
  });

  if (filtered.length === 0) {
    shoppingListContainer.innerHTML = `
      <div class="empty-box">
        <div class="empty-icon-pill">
          <i data-lucide="check-check" style="width:20px;height:20px;"></i>
        </div>
        <h3 class="empty-heading">No ${currentFilter} items</h3>
        <p class="empty-detail">All items in this view have been checked off.</p>
      </div>`;
    updateProgress(list);
    renderIcons(shoppingListContainer);
    return;
  }

  if (settings.groupByCategory) {
    // Group by supermarket aisle
    const grouped = {};
    filtered.forEach(item => {
      const cat = item.category || 'other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    shoppingListContainer.innerHTML = Object.entries(grouped).map(([catKey, items]) => {
      const catMeta = CATEGORIES[catKey] || { label: 'Other', icon: 'tag' };
      const iconName = getCategoryIconName(catKey);

      return `
        <div class="aisle-block">
          <div class="aisle-title-row">
            <i data-lucide="${iconName}" style="width:12px;height:12px;"></i>
            <span>${catMeta.label}</span>
          </div>
          ${items.map(renderItemCard).join('')}
        </div>
      `;
    }).join('');
  } else {
    shoppingListContainer.innerHTML = filtered.map(renderItemCard).join('');
  }

  attachItemEvents();
  updateProgress(list);
  renderIcons(shoppingListContainer);
}

/* ── Item Card Template ── */
function renderItemCard(item) {
  const isChecked = item.collected;
  const unitLabel = UNIT_LABELS[item.unit] || item.unit;
  const catKey = item.category || 'other';
  const catName = (CATEGORIES[catKey] || {}).label || 'Grocery';
  const catIcon = getCategoryIconName(catKey);

  return `
    <div class="grocery-card ${isChecked ? 'done' : ''}" data-id="${item.productId}">
      <button class="check-circle-btn" data-id="${item.productId}" title="Toggle collected">
        <i data-lucide="check" style="width:15px;height:15px;"></i>
      </button>

      <div class="grocery-main" data-id="${item.productId}">
        <div class="grocery-name">${escapeHtml(item.name)}</div>
        <div class="grocery-meta">
          <span class="tag-badge tag-${catKey}">
            <i data-lucide="${catIcon}" style="width:10px;height:10px;"></i>
            ${catName}
          </span>
          <span>&bull;</span>
          <span>Need: ${item.needed} ${unitLabel}</span>
        </div>
      </div>

      <div class="stepper-unit">
        <button class="step-btn btn-minus" data-id="${item.productId}" title="Decrease bought">
          <i data-lucide="minus" style="width:12px;height:12px;"></i>
        </button>
        <div class="step-count">${item.bought}</div>
        <div class="step-max">/${item.needed}</div>
        <button class="step-btn btn-plus" data-id="${item.productId}" title="Increase bought">
          <i data-lucide="plus" style="width:12px;height:12px;"></i>
        </button>
      </div>
    </div>
  `;
}

/* ── Attach Event Handlers ── */
function attachItemEvents() {
  // Check trigger button
  shoppingListContainer.querySelectorAll('.check-circle-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      toggleItemCollected(id);
    });
  });

  // Tapping item body toggles completion too (facilitated in-store one-hand tap)
  shoppingListContainer.querySelectorAll('.grocery-main').forEach(el => {
    el.addEventListener('click', () => {
      const id = Number(el.dataset.id);
      toggleItemCollected(id);
    });
  });

  // Stepper buttons
  shoppingListContainer.querySelectorAll('.btn-minus').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      adjustQuantity(id, -1);
    });
  });

  shoppingListContainer.querySelectorAll('.btn-plus').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      adjustQuantity(id, +1);
    });
  });
}

/* ── Toggle Item Collected ── */
function toggleItemCollected(productId) {
  const list = getShoppingList();
  const item = list.find(i => i.productId === productId);
  if (!item) return;

  if (item.collected) {
    item.collected = false;
    item.bought = 0;
  } else {
    item.collected = true;
    item.bought = item.needed;
  }

  saveShoppingList(list);
  renderList();
}

/* ── Adjust Item Bought Quantity ── */
function adjustQuantity(productId, delta) {
  const list = getShoppingList();
  const item = list.find(i => i.productId === productId);
  if (!item) return;

  const newBought = Math.max(0, (item.bought || 0) + delta);
  item.bought = newBought;
  item.collected = newBought >= item.needed;

  saveShoppingList(list);
  renderList();
}

/* ── Add Item Helper (Supports Single & Multi-Item Text) ── */
function addItemFromList(raw) {
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
    renderList();
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

  const list = getShoppingList();
  list.push({
    productId: newProduct.id,
    name: newProduct.name,
    unit: newProduct.unit,
    needed: newProduct.quantity,
    bought: 0,
    collected: false,
    category: newProduct.category
  });
  saveShoppingList(list);

  showToast(`Added "${newProduct.name}" to cart`);
  renderList();
}

/* ── Quick-Add from List Page ── */
quickAddListForm?.addEventListener('submit', e => {
  e.preventDefault();
  const raw = quickAddListInput.value.trim();
  if (!raw) return;
  addItemFromList(raw);
  quickAddListInput.value = '';
  // Keep focus on input for continuous rapid-fire entry!
  quickAddListInput.focus();
});

/* ── 1-Click Suggestion Pills on List ── */
quickSuggestionsList?.addEventListener('click', e => {
  const pill = e.target.closest('.suggestion-pill');
  if (!pill) return;
  const itemText = pill.dataset.item;
  if (itemText) {
    addItemFromList(itemText);
  }
});

/* ── Filter Segment Buttons ── */
[filterAll, filterPending, filterCollected].forEach(btn => {
  btn?.addEventListener('click', () => {
    [filterAll, filterPending, filterCollected].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    settings.filter = btn.dataset.filter;
    saveSettings(settings);
    renderList();
  });
});

/* ── Aisle Grouping Toggle ── */
btnToggleGroup?.addEventListener('click', () => {
  settings.groupByCategory = !settings.groupByCategory;
  saveSettings(settings);
  btnToggleGroup.classList.toggle('active', settings.groupByCategory);
  showToast(settings.groupByCategory ? 'Grouped by Aisle' : 'Standard List View');
  renderList();
});

/* ── Reset List Confirmation ── */
btnResetList?.addEventListener('click', () => {
  resetConfirmOverlay.classList.add('show');
});

resetCancelBtn?.addEventListener('click', () => {
  resetConfirmOverlay.classList.remove('show');
});

resetOkBtn?.addEventListener('click', () => {
  resetConfirmOverlay.classList.remove('show');
  const list = getShoppingList().map(i => ({
    ...i,
    bought: 0,
    collected: false
  }));
  saveShoppingList(list);
  showToast('Cart quantities reset');
  renderList();
});

/* ── Submit Shopping to Server (MockAPI) ── */
btnSubmitShopping?.addEventListener('click', async () => {
  const list = getShoppingList();
  if (list.length === 0) {
    showToast('Shopping cart is empty');
    return;
  }

  const allCollected = list.every(i => i.collected);
  if (!allCollected) {
    showToast('Please collect all items before submitting');
    return;
  }

  btnSubmitShopping.disabled = true;
  submitBtnText.textContent = 'Submitting to server...';

  try {
    const purchaseDate = new Date().toISOString();

    // 1. Create main shopping purchase record
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: purchaseDate })
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const createdRecord = await res.json();
    const purchaseId = createdRecord.CodCompras || createdRecord.id || 'N/A';

    // 2. Submit nested items
    const products = getProducts();
    for (const item of list) {
      const prod = products.find(p => p.id === item.productId);
      await fetch(`${API_BASE}/${purchaseId}/produtos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          CodProduto:    item.productId,
          Nome:          item.name,
          Unidade:       item.unit,
          Quantidade:    item.needed,
          CodigoBarra:   prod?.barcode || '',
          Ativo:         false,
          QuantComprada: item.bought
        })
      });
    }

    // 3. Save to history
    const history = getHistory();
    history.push({
      id: purchaseId,
      date: purchaseDate,
      items: list.length,
      success: true
    });
    saveHistory(history);

    // 4. Reset shopping list items
    const resetList = list.map(i => ({ ...i, bought: 0, collected: false }));
    saveShoppingList(resetList);

    openModal(
      'Shopping Submitted!',
      `Your shopping list has been successfully submitted.<br><br>
       <strong>Purchase ID:</strong> #${purchaseId}<br>
       <strong>Items synchronized:</strong> ${list.length}`
    );

    renderList();
    renderHistory();

  } catch (err) {
    console.error('Submission error:', err);

    const history = getHistory();
    history.push({
      date: new Date().toISOString(),
      items: list.length,
      success: false,
      error: err.message
    });
    saveHistory(history);

    openModal(
      'Submission Failed',
      `Could not sync shopping list to server.<br><br>
       <span style="color:var(--danger);font-size:0.8rem;">${escapeHtml(err.message)}</span>`
    );

    renderHistory();

  } finally {
    btnSubmitShopping.disabled = false;
    updateProgress(getShoppingList());
  }
});

/* ── Render Submissions History ── */
function renderHistory() {
  if (!historyList) return;
  const history = getHistory();

  if (history.length === 0) {
    historyList.innerHTML = `
      <li class="history-row-item" style="color:var(--text-muted);justify-content:center;padding:10px;">
        <span>No submissions yet</span>
      </li>`;
    return;
  }

  historyList.innerHTML = history.slice().reverse().map(entry => {
    const d = new Date(entry.date);
    const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
      ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return `
      <li class="history-row-item">
        <div style="display:flex; align-items:center; gap:6px;">
          <div class="history-dot-indicator ${entry.success ? 'success' : 'error'}"></div>
          <span style="font-weight:600; color:var(--text-main);">${dateFormatted}</span>
        </div>
        <div style="color:var(--text-muted);">
          ${entry.items} item${entry.items !== 1 ? 's' : ''}
          ${entry.id ? ` &bull; #${entry.id}` : ''}
        </div>
      </li>
    `;
  }).join('');
}

btnClearHistory?.addEventListener('click', () => {
  saveHistory([]);
  renderHistory();
  showToast('History cleared');
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
if (settings.groupByCategory) {
  btnToggleGroup?.classList.add('active');
}

[filterAll, filterPending, filterCollected].forEach(btn => {
  btn?.classList.toggle('active', btn.dataset.filter === (settings.filter || 'all'));
});

renderList();
renderHistory();
renderIcons();
initTutorial();
initMagicImporter(items => {
  showToast(`Organized & added ${items.length} items`);
  renderList();
});

