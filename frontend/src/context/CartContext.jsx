import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('smartdeliver_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cartVendor, setCartVendor] = useState(() => {
    try {
      const saved = localStorage.getItem('smartdeliver_cart_vendor');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('smartdeliver_cart', JSON.stringify(items));
      if (items.length === 0) {
        localStorage.removeItem('smartdeliver_cart_vendor');
        setCartVendor(null);
      } else if (cartVendor) {
        localStorage.setItem('smartdeliver_cart_vendor', JSON.stringify(cartVendor));
      }
    } catch (e) {
      console.error('Failed to sync cart to storage:', e);
    }
  }, [items, cartVendor]);

  const addToCart = (product, vendor) => {
    // Single vendor check
    if (cartVendor && vendor && cartVendor.id !== vendor.id) {
      const confirmSwitch = window.confirm(
        `Your cart contains items from "${cartVendor.name}". Would you like to clear your cart to add items from "${vendor.name}"?`
      );
      if (!confirmSwitch) return false;

      // Clear previous store
      setItems([{
        id: product.id,
        name: product.name,
        price: Number(product.price),
        imageUrl: product.imageUrl,
        vendorId: vendor.id,
        quantity: 1,
      }]);
      setCartVendor({ id: vendor.id, name: vendor.name });
      setIsOpen(true);
      return true;
    }

    if (!cartVendor && vendor) {
      setCartVendor({ id: vendor.id, name: vendor.name });
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          imageUrl: product.imageUrl,
          vendorId: product.vendorId || (vendor ? vendor.id : null),
          quantity: 1,
        },
      ];
    });

    setIsOpen(true);
    return true;
  };

  const updateQuantity = (productId, delta) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setCartVendor(null);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const itemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = items.length > 0 ? 50.0 : 0.0;
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        cartVendor,
        isOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemsCount,
        subtotal,
        deliveryFee,
        total,
        lastOrder,
        setLastOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
