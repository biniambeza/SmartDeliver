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
    <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none py-1">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center space-x-2 px-5 py-3 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 scale-[1.03] ring-2 ring-amber-300'
                : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-amber-50/60 border border-amber-200/80 shadow-sm'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-emerald-700'}`} />
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
