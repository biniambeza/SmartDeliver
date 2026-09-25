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
                ? 'bg-[#F5B820] text-white shadow-md shadow-[#F5B820]/30 scale-[1.03] ring-2 ring-[#FBD968]'
                : 'bg-white text-gray-700 hover:text-gray-950 hover:bg-[#FFF8E1] border border-gray-200 shadow-sm'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#1E8C45]'}`} />
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
