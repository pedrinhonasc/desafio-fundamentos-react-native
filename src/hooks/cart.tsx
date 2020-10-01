import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const car_products_str = await AsyncStorage.getItem(
        '@GoMarketPlace:car_products',
      );

      if (car_products_str) {
        const car_products = JSON.parse(car_products_str);
        setProducts(car_products);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const foundProduct = products.find(item => item.id === product.id);
      if (!foundProduct) {
        const new_product: Product = {
          id: product.id,
          title: product.title,
          image_url: product.image_url,
          price: product.price,
          quantity: 1,
        };
        setProducts([...products, new_product]);
      } else {
        const itemIndex = products.findIndex(item => item.id === product.id);

        products[itemIndex].quantity += 1;
        setProducts([...products]);
      }

      await AsyncStorage.setItem(
        '@GoMarketPlace:car_products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const itemIndex = products.findIndex(item => item.id === id);
      products[itemIndex].quantity += 1;

      setProducts([...products]);
      await AsyncStorage.setItem(
        '@GoMarketPlace:car_products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const itemIndex = products.findIndex(item => item.id === id);
      if (products[itemIndex].quantity > 0) products[itemIndex].quantity -= 1;

      setProducts([...products]);
      await AsyncStorage.setItem(
        '@GoMarketPlace:car_products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
