/**
 * Oliva — Optimized Lucide Icons Provider
 * Treeshaken & Lightweight
 */
import { 
  createIcons,
  Leaf,
  Package, 
  PackagePlus, 
  PackageOpen, 
  ShoppingCart, 
  ShoppingBag, 
  Sparkles, 
  Plus, 
  PlusCircle, 
  Minus, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Tag, 
  Layers, 
  Store, 
  Barcode, 
  Check, 
  CheckCheck, 
  CheckCircle2, 
  Pencil, 
  Trash2, 
  Search, 
  SearchX, 
  Circle, 
  RotateCcw, 
  Send, 
  History, 
  List, 
  Apple, 
  Milk, 
  Croissant, 
  Beef, 
  Coffee,
  Signal,
  Wifi,
  ArrowRight,
  CircleHelp,
  HelpCircle,
  Wand2,
  ClipboardPaste,
  FileText
} from 'lucide';

const appIcons = {
  Leaf,
  Package, 
  PackagePlus, 
  PackageOpen, 
  ShoppingCart, 
  ShoppingBag, 
  Sparkles, 
  Plus, 
  PlusCircle, 
  Minus, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Tag, 
  Layers, 
  Store, 
  Barcode, 
  Check, 
  CheckCheck, 
  CheckCircle2, 
  Pencil, 
  Trash2, 
  Search, 
  SearchX, 
  Circle, 
  RotateCcw, 
  Send, 
  History, 
  List, 
  Apple, 
  Milk, 
  Croissant, 
  Beef, 
  Coffee,
  Signal,
  Wifi,
  ArrowRight,
  CircleHelp,
  HelpCircle,
  Wand2,
  ClipboardPaste,
  FileText
};

/**
 * Replaces all [data-lucide] placeholders in the DOM with crisp SVG vectors.
 */
export function renderIcons(root = document) {
  try {
    createIcons({
      icons: appIcons,
      nameAttr: 'data-lucide',
      attrs: {
        'stroke-width': '2',
        class: 'lucide-icon'
      }
    });
  } catch (err) {
    console.error('Lucide icon rendering error:', err);
  }
}

/**
 * Maps category key to a modern Lucide icon name
 */
export function getCategoryIconName(category) {
  switch (category) {
    case 'produce': return 'apple';
    case 'dairy': return 'milk';
    case 'bakery': return 'croissant';
    case 'meat': return 'beef';
    case 'pantry': return 'package';
    case 'beverages': return 'coffee';
    case 'household': return 'sparkles';
    default: return 'tag';
  }
}
