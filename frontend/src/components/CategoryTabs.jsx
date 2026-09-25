import React from 'react';
import { 
  LayoutGrid, 
  UtensilsCrossed, 
  ShoppingBag, 
  Pill, 
  Coffee, 
  Cake 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', name: 'All Vendors', icon: LayoutGrid },
  { id: 'RESTAURANT', name: 'Restaurants', icon: UtensilsCrossed },
  { id: 'GROCERY', name: 'Groceries', icon: ShoppingBag },
  { id: 'PHARMACY', name: 'Pharmacy', icon: Pill },
  { id: 'CAFE', name: 'Café & Drinks', icon: Coffee },
  { id: 'BAKERY', name: 'Bakery & Sweets', icon: Cake },
];

export default function CategoryTabs({ selectedCategory, onSelectCategory }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none py-1">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 scale-[1.02]'
                : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-emerald-400'}`} />
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
