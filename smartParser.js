/**
 * Oliva — Smart Natural Language Parser, Bulk Text Importer & Auto-Categorizer
 * Supports English & Portuguese grocery terms seamlessly
 * Handles:
 * - Single items ("2 Milk lt", "1kg Arroz", "Pao Frances")
 * - Multi-line lists (WhatsApp, Notes)
 * - Comma-separated lists ("leite, pao, ovos, arroz")
 * - Space-separated lists ("leite pao ovos arroz cafe" or "2 leite 1kg arroz 3 pao")
 */

export const CATEGORIES = {
  produce: { label: 'Produce', icon: 'apple' },
  dairy: { label: 'Dairy & Eggs', icon: 'milk' },
  bakery: { label: 'Bakery', icon: 'croissant' },
  meat: { label: 'Meat & Seafood', icon: 'beef' },
  pantry: { label: 'Pantry & Grains', icon: 'box' },
  beverages: { label: 'Beverages', icon: 'coffee' },
  household: { label: 'Household', icon: 'sparkles' },
  other: { label: 'Other', icon: 'tag' }
};

const CATEGORY_KEYWORDS = {
  produce: [
    'apple', 'banana', 'orange', 'lemon', 'lime', 'tomato', 'potato', 'onion', 'garlic',
    'carrot', 'lettuce', 'salad', 'spinach', 'broccoli', 'cucumber', 'pepper', 'avocado',
    'strawberry', 'berry', 'grape', 'watermelon', 'melon', 'fruit', 'vegetable', 'herb',
    'maca', 'banana', 'laranja', 'limao', 'tomate', 'batata', 'cebola', 'alho', 'cenoura',
    'alface', 'fruta', 'verdura', 'legume', 'abacate', 'morango', 'melancia', 'uva', 'manga',
    'mamao', 'abacaxi', 'pepino', 'pimentao', 'rabanete', 'couve', 'brocolis', 'espinafre',
    'cheiro verde', 'salsinha', 'cebolinha', 'coentro', 'mandioca', 'aipim', 'beterraba',
    'chuchu', 'abobora', 'pera', 'pessego', 'kiwi'
  ],
  dairy: [
    'milk', 'cheese', 'butter', 'yogurt', 'yoghurt', 'egg', 'eggs', 'cream', 'mozzarella',
    'parmesan', 'cheddar', 'curd', 'margarine', 'ricotta', 'condensed milk',
    'leite', 'queijo', 'manteiga', 'iogurte', 'ovo', 'ovos', 'creme de leite', 'requeijao',
    'leite condensado', 'mussarela', 'mucarela', 'parmesao', 'ricota', 'nata', 'margarina',
    'prato', 'gorgonzola', 'provolone'
  ],
  bakery: [
    'bread', 'bagel', 'croissant', 'toast', 'bun', 'cake', 'cookie', 'cookies', 'muffin', 'pastry',
    'biscuit', 'biscuits', 'pie', 'dough',
    'pao', 'paes', 'torrada', 'bolo', 'biscoito', 'bolacha', 'broa', 'croissant', 'baguete',
    'sonho', 'torta', 'brioche', 'pao frances', 'pao de forma', 'pao doce', 'pao integral'
  ],
  meat: [
    'chicken', 'beef', 'meat', 'pork', 'steak', 'fish', 'salmon', 'tuna', 'bacon', 'ham',
    'sausage', 'turkey', 'shrimp', 'lamb', 'ribs', 'fillet',
    'carne', 'frango', 'peixe', 'presunto', 'linguica', 'bife', 'alcatra', 'patinho',
    'moida', 'costela', 'lombo', 'bacon', 'peito de frango', 'sobrecoxa', 'asa', 'camarao',
    'salmao', 'tilapia', 'atum', 'sardinha', 'calabresa', 'salsicha', 'mortadela', 'peru'
  ],
  pantry: [
    'rice', 'bean', 'beans', 'pasta', 'spaghetti', 'noodle', 'noodles', 'oil', 'olive oil',
    'sugar', 'salt', 'flour', 'sauce', 'tomato sauce', 'spice', 'pepper', 'vinegar', 'cereal',
    'oats', 'canned', 'lentil', 'chickpea', 'corn', 'mayo', 'ketchup', 'mustard', 'olive', 'olives',
    'yeast',
    'arroz', 'feijao', 'macarrao', 'oleo', 'azeite', 'acucar', 'sal', 'farinha', 'molho',
    'molho de tomate', 'tempero', 'pimenta', 'vinagre', 'milho', 'ervilha', 'grao de bico',
    'lentilha', 'aveia', 'cereal', 'granola', 'maionese', 'ketchup', 'mostarda', 'azeitona',
    'fermento', 'azeite de oliva', 'massa'
  ],
  beverages: [
    'water', 'juice', 'soda', 'coke', 'beer', 'wine', 'tea', 'coffee', 'energy drink',
    'sparkling water', 'drink', 'beverage',
    'agua', 'agua mineral', 'suco', 'refrigerante', 'cerveja', 'vinho', 'cha', 'cafe',
    'cafe em po', 'energetico', 'vodka', 'gin', 'agua tonica', 'guarana', 'coca'
  ],
  household: [
    'soap', 'detergent', 'sponge', 'shampoo', 'conditioner', 'toothpaste', 'brush',
    'toilet paper', 'tissue', 'cleaner', 'bleach', 'trash bag', 'napkin', 'laundry',
    'sabao', 'sabao em po', 'sabao liquido', 'detergente', 'esponja', 'papel higienico',
    'papel toalha', 'pasta de dente', 'creme dental', 'amaciante', 'desinfetante',
    'agua sanitaria', 'alvejante', 'sabonete', 'xampu', 'shampoo', 'condicionador',
    'desodorante', 'vassoura', 'pano', 'saco de lixo', 'guardanapo'
  ]
};

const COMPOUND_ITEMS = [
  'pao frances', 'pao de forma', 'pao doce', 'pao integral',
  'azeite de oliva', 'azeite extra virgem', 'molho de tomate', 'cafe em po', 'papel higienico', 'papel toalha',
  'peito de frango', 'creme de leite', 'leite condensado', 'queijo mussarela', 'queijo prato',
  'agua mineral', 'agua sanitaria', 'sabao em po', 'sabao liquido', 'pasta de dente', 'creme dental',
  'whole milk', 'sourdough bread', 'olive oil', 'tomato sauce', 'ground beef'
];

export function detectCategory(name) {
  if (!name) return 'other';
  const clean = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const w of words) {
      if (clean.includes(w)) {
        return cat;
      }
    }
  }
  return 'other';
}

function normalizeUnit(u) {
  const clean = (u || '').toLowerCase();
  if (['l', 'lt', 'litro', 'litros', 'liter', 'liters'].includes(clean)) return 'lt';
  if (['kg', 'quilo', 'quilos', 'kilo', 'kilos', 'kilogram', 'kilograms'].includes(clean)) return 'kg';
  if (['g', 'grama', 'gramas', 'gram', 'grams'].includes(clean)) return 'g';
  if (['mt', 'metro', 'metros', 'meter', 'meters', 'm'].includes(clean)) return 'mt';
  if (['pc', 'pct', 'pacote', 'pacotes', 'caixa', 'caixas', 'lata', 'latas', 'cx', 'package', 'pack'].includes(clean)) return 'pc';
  if (['duzia', 'dúzia', 'duzias', 'dozen'].includes(clean)) return 'duzia';
  return 'un';
}

/**
 * Parses user input like:
 * "2 caixas de leite" -> { name: "Leite", quantity: 2, unit: "pc", category: "dairy" }
 * "500g queijo mussarela" -> { name: "Queijo Mussarela", quantity: 0.5, unit: "kg", category: "dairy" }
 * "1kg arroz" -> { name: "Arroz", quantity: 1, unit: "kg", category: "pantry" }
 * "Bread" -> { name: "Bread", quantity: 1, unit: "un", category: "bakery" }
 */
export function parseQuickInput(raw) {
  let text = (raw || '').trim();
  if (!text) return null;

  // Clean leading bullet or numbered lists: e.g. "- ", "* ", "1. ", "• "
  text = text.replace(/^([-*•]\s+|\d+[\.\)]\s+)/, '').trim();
  text = text.replace(/^(e|and)\s+/i, '').trim();

  let quantity = 1;
  let unit = 'un';

  // 1. Leading quantity + unit: e.g. "2 caixas de ", "1.5kg ", "500g "
  const leadingMatch = text.match(/^([\d.,]+)\s*(x|un|kg|g|quilos?|kilos?|litros?|lt|l|ml|pc|pct|pacotes?|caixas?|latas?|cx|garrafas?|duzias?|dúzias?|dozens?)?(\s+de)?\s+/i);
  if (leadingMatch) {
    let rawNum = leadingMatch[1].replace(',', '.');
    let num = parseFloat(rawNum);
    if (!isNaN(num) && num > 0) {
      quantity = num;
      if (leadingMatch[2] && leadingMatch[2].toLowerCase() !== 'x') {
        const norm = normalizeUnit(leadingMatch[2]);
        if (norm === 'g') {
          quantity = Math.round((num / 1000) * 100) / 100;
          unit = 'kg';
        } else if (norm === 'duzia') {
          quantity = num * 12;
          unit = 'un';
        } else {
          unit = norm;
        }
      }
      text = text.substring(leadingMatch[0].length).trim();
    }
  }

  // 2. Trailing quantity + unit: e.g. "Arroz 5kg" or "Maca 1.5 kg"
  const trailingMatch = text.match(/\s+([\d.,]+)\s*(un|kg|g|quilos?|kilos?|litros?|lt|l|ml|pc|pct|pacotes?|caixas?|cx)?$/i);
  if (trailingMatch) {
    let rawNum = trailingMatch[1].replace(',', '.');
    let num = parseFloat(rawNum);
    if (!isNaN(num) && num > 0) {
      quantity = num;
      if (trailingMatch[2]) {
        const norm = normalizeUnit(trailingMatch[2]);
        if (norm === 'g') {
          quantity = Math.round((num / 1000) * 100) / 100;
          unit = 'kg';
        } else {
          unit = norm;
        }
      }
      text = text.substring(0, text.length - trailingMatch[0].length).trim();
    }
  }

  // Strip prepositions like "de " or "of "
  text = text.replace(/^(de|of)\s+/i, '').trim();
  if (!text) return null;

  // Capitalize properly
  const words = text.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1));
  const name = words.join(' ');
  const category = detectCategory(name);

  return {
    name,
    quantity,
    unit,
    category
  };
}

/**
 * Parses space-separated items e.g.:
 * "leite pao ovos arroz cafe" -> 5 items
 * "2 leite 1kg arroz pao frances queijo" -> 4 items
 */
export function parseSpaceSeparatedList(text) {
  let str = (text || '').trim();
  if (!str) return [];

  // Protect multi-word compound items
  const placeholders = {};
  let pIdx = 0;
  for (const compound of COMPOUND_ITEMS) {
    const reg = new RegExp('\\b' + compound + '\\b', 'gi');
    if (reg.test(str)) {
      const ph = '__COMP_' + (pIdx++) + '__';
      placeholders[ph] = compound;
      str = str.replace(reg, ph);
    }
  }

  const rawTokens = str.split(/\s+/).filter(Boolean);
  const items = [];
  let i = 0;

  while (i < rawTokens.length) {
    let token = rawTokens[i];
    let qty = 1;
    let unit = 'un';

    // Check if token is quantity (e.g. "2", "1kg", "500g")
    const qtyMatch = token.match(/^([\d.,]+)(x|kg|g|lt|l|ml|pc|pct|un)?$/i);
    if (qtyMatch && i + 1 < rawTokens.length) {
      let rawNum = qtyMatch[1].replace(',', '.');
      let num = parseFloat(rawNum);
      if (!isNaN(num) && num > 0) {
        qty = num;
        if (qtyMatch[2]) {
          const norm = normalizeUnit(qtyMatch[2]);
          if (norm === 'g') {
            qty = Math.round((num / 1000) * 100) / 100;
            unit = 'kg';
          } else {
            unit = norm;
          }
        }
        i++;
        token = rawTokens[i];
      }
    }

    if (placeholders[token]) {
      token = placeholders[token];
    }

    // Skip lone prepositions
    if (token && token.toLowerCase() !== 'de' && token.toLowerCase() !== 'e' && token.toLowerCase() !== 'and') {
      const parsed = parseQuickInput(token);
      if (parsed) {
        if (qty > 1 || (qty < 1 && unit === 'kg')) {
          parsed.quantity = qty;
        }
        if (unit !== 'un') {
          parsed.unit = unit;
        }
        items.push(parsed);
      }
    }
    i++;
  }

  return items;
}

/**
 * Smart Bulk Text Parser
 * Parses multi-line texts (like WhatsApp messages, notes, emails, comma-separated lists,
 * or space-separated grocery words) and returns an array of organized items.
 */
export function parseBulkText(text) {
  if (!text) return [];

  // Check if string is a space-separated grocery list without commas or newlines
  if (!text.includes('\n') && !text.includes(',') && !text.includes(';')) {
    const spaceItems = parseSpaceSeparatedList(text);
    if (spaceItems.length > 1) {
      return spaceItems;
    }
  }

  // Split lines by newline or semicolon
  const lines = text
    .split(/\r?\n|;/)
    .flatMap(line => {
      if (line.includes(',') && !line.match(/\d+,\d+/)) {
        return line.split(',');
      }
      return [line];
    })
    .map(l => l.trim())
    .filter(Boolean);

  const results = [];
  const seen = new Set();

  for (const rawLine of lines) {
    // Check if line itself has multiple space-separated grocery items
    const spaceItems = parseSpaceSeparatedList(rawLine);
    if (spaceItems.length > 1) {
      for (const it of spaceItems) {
        const key = it.name.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          results.push(it);
        }
      }
      continue;
    }

    const item = parseQuickInput(rawLine);
    if (item && item.name.length >= 2) {
      const key = item.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        results.push(item);
      }
    }
  }

  return results;
}

/**
 * Groups a list of parsed items by category
 */
export function groupItemsByCategory(items) {
  const grouped = {};
  for (const item of items) {
    const cat = item.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }
  return grouped;
}

export const UNIT_LABELS = {
  un: 'Unit',
  kg: 'Kilogram',
  lt: 'Liter',
  mt: 'Meter',
  pc: 'Package'
};
