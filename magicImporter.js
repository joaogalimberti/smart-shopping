/**
 * Oliva — Smart Bulk Text Importer (WhatsApp, Notes & Multi-Item Parser)
 * Automatically categorizes by supermarket aisle in real-time
 */

import { parseBulkText, groupItemsByCategory, CATEGORIES, UNIT_LABELS } from './smartParser.js';
import { getProducts, saveProducts, getShoppingList, saveShoppingList, generateNextId } from './storage.js';
import { renderIcons, getCategoryIconName } from './icons.js';

let modalEl = null;
let onItemsAddedCallback = null;

export function initMagicImporter(onAdded) {
  onItemsAddedCallback = onAdded;
  createModal();

  // Attach to trigger buttons
  document.querySelectorAll('[data-open-magic-importer]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openMagicImporter();
    });
  });
}

function createModal() {
  if (document.getElementById('magicImporterModal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'magicImporterModal';
  overlay.className = 'modal-scrim';
  overlay.innerHTML = `
    <div class="modal-panel magic-panel">
      <div class="magic-header">
        <div class="magic-title-box">
          <div class="magic-icon-badge">
            <i data-lucide="wand-2" style="width:18px;height:18px;"></i>
          </div>
          <div>
            <h3 class="magic-title">Smart Text Paste</h3>
            <p class="magic-subtitle">Paste a list from WhatsApp, Notes, or email</p>
          </div>
        </div>
        <button type="button" class="icon-button" id="magicCloseBtn" style="width:26px;height:26px;">
          <i data-lucide="x" style="width:14px;height:14px;"></i>
        </button>
      </div>

      <div class="magic-controls-row">
        <button type="button" class="btn btn-ghost" id="magicPasteClipboardBtn" style="padding:4px 9px; font-size:0.74rem;">
          <i data-lucide="clipboard-paste" style="width:13px;height:13px;"></i>
          <span>Paste from clipboard</span>
        </button>
        <button type="button" class="btn btn-ghost" id="magicClearBtn" style="padding:4px 9px; font-size:0.74rem;">
          Clear
        </button>
      </div>

      <textarea 
        id="magicTextarea" 
        class="magic-textarea" 
        rows="4"
        placeholder="Paste or type items (by line, comma, or space)...&#10;e.g.:&#10;leite pao ovos arroz cafe&#10;or:&#10;2 caixas de leite&#10;1kg arroz&#10;500g queijo mussarela"
      ></textarea>

      <!-- Live Real-Time Aisle Breakdown -->
      <div class="magic-preview-card" id="magicPreviewCard">
        <div class="magic-preview-header">
          <span class="magic-preview-count" id="magicPreviewCount">0 items detected</span>
        </div>
        <div class="magic-preview-content" id="magicPreviewContent">
          <span style="color:var(--text-muted); font-size:0.75rem;">Detected items will appear organized by aisle here...</span>
        </div>
      </div>

      <div class="modal-actions-row">
        <button type="button" class="btn btn-primary btn-full" id="magicSubmitBtn" disabled style="padding:11px 16px;">
          <i data-lucide="check" style="width:16px;height:16px;"></i>
          <span id="magicSubmitBtnText">Add Items to Cart</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  modalEl = overlay;

  const textarea = document.getElementById('magicTextarea');
  const closeBtn = document.getElementById('magicCloseBtn');
  const pasteBtn = document.getElementById('magicPasteClipboardBtn');
  const clearBtn = document.getElementById('magicClearBtn');
  const submitBtn = document.getElementById('magicSubmitBtn');

  closeBtn.addEventListener('click', closeMagicImporter);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeMagicImporter();
  });

  textarea.addEventListener('input', () => updatePreview(textarea.value));

  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        textarea.value = text;
        updatePreview(text);
      }
    } catch (err) {
      textarea.focus();
    }
  });

  clearBtn.addEventListener('click', () => {
    textarea.value = '';
    updatePreview('');
    textarea.focus();
  });

  submitBtn.addEventListener('click', () => {
    const text = textarea.value.trim();
    const items = parseBulkText(text);
    if (items.length === 0) return;

    // Add all to storage
    const products = getProducts();
    const shoppingList = getShoppingList();
    let nextId = generateNextId();

    for (const item of items) {
      // Check if product already exists by name
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

      // Add to shopping cart or increase needed
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

    closeMagicImporter();
    textarea.value = '';

    if (onItemsAddedCallback) {
      onItemsAddedCallback(items);
    }
  });

  renderIcons(overlay);
}

function updatePreview(text) {
  const items = parseBulkText(text);
  const countEl = document.getElementById('magicPreviewCount');
  const contentEl = document.getElementById('magicPreviewContent');
  const submitBtn = document.getElementById('magicSubmitBtn');
  const submitText = document.getElementById('magicSubmitBtnText');

  if (items.length === 0) {
    countEl.textContent = '0 items detected';
    contentEl.innerHTML = '<span style="color:var(--text-muted); font-size:0.75rem;">Type or paste items above to preview them organized by aisle.</span>';
    submitBtn.disabled = true;
    submitText.textContent = 'Add Items to Cart';
    return;
  }

  const grouped = groupItemsByCategory(items);
  const aisleCount = Object.keys(grouped).length;

  countEl.textContent = `${items.length} item${items.length > 1 ? 's' : ''} organized in ${aisleCount} aisle${aisleCount > 1 ? 's' : ''}`;
  submitBtn.disabled = false;
  submitText.textContent = `Add All (${items.length}) Items to Cart`;

  contentEl.innerHTML = Object.entries(grouped).map(([catKey, catItems]) => {
    const meta = CATEGORIES[catKey] || { label: 'Other', icon: 'tag' };
    const iconName = getCategoryIconName(catKey);

    return `
      <div class="magic-aisle-preview">
        <div class="magic-aisle-title">
          <i data-lucide="${iconName}" style="width:12px;height:12px;"></i>
          <span>${meta.label}</span>
        </div>
        <div class="magic-chips-row">
          ${catItems.map(item => `
            <span class="magic-item-pill">
              <strong>${escapeHtml(item.name)}</strong>
              <small>${item.quantity} ${UNIT_LABELS[item.unit] || item.unit}</small>
            </span>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');

  renderIcons(contentEl);
}

export function openMagicImporter() {
  if (!modalEl) createModal();
  modalEl.classList.add('show');
  const textarea = document.getElementById('magicTextarea');
  setTimeout(() => {
    if (textarea) textarea.focus();
  }, 100);
}

export function closeMagicImporter() {
  if (modalEl) {
    modalEl.classList.remove('show');
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
