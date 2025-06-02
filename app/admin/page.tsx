"use client";

import { LuUsers, LuBox, LuShoppingCart, LuDollarSign } from "react-icons/lu";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [inProgressOrderCount, setInProgressOrderCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recentOrder, setRecentOrder] = useState<{
    code: string;
    userName: string;
    total: number;
    status: string;
    date: string;
  } | null>(null);
  
  const [topRatedProduct, setTopRatedProduct] = useState<{
    name: string;
    stock: number;
    rating: number;
    image: string;
    category: string;
  } | null>(null);
  
  const [totalRevenue, setTotalRevenue] = useState(0);

  const updateCounts = async () => {
    const [users, products, orders] = await Promise.all([
      updateUserCount(),
      updateProductCount().then(() => updateLowStockCount()),
      updateOrderCount()
    ]);
    
    // Update counts and data that depend on products and orders
    await Promise.all([
      updateInProgressOrderCount(),
      updateTotalRevenue(),
      updateRecentOrder(),
      updateTopRatedProduct()
    ]);
    
    return { users, products, orders };
  };
  
  const updateTopRatedProduct = async () => {
    try {
      // Get products from localStorage
      const storedProducts = localStorage.getItem('saturn-products');
      const localStorageProducts = storedProducts ? JSON.parse(storedProducts) : [];
      
      // Get products from JSON file
      const response = await fetch('/data/products.json');
      const data = await response.json();
      const jsonProducts = data.products || [];
      
      // Combine both sources and get unique products by ID
      const allProducts = [...localStorageProducts];
      const productIds = new Set(localStorageProducts.map((product: any) => product.id));
      
      jsonProducts.forEach((jsonProduct: any) => {
        if (!productIds.has(jsonProduct.id)) {
          allProducts.push(jsonProduct);
          productIds.add(jsonProduct.id);
        }
      });
      
      // Find the top rated product (highest rating, then newest by ID if ratings are equal)
      if (allProducts.length > 0) {
        const topProduct = [...allProducts].sort((a, b) => {
          // First sort by rating (descending)
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          // If ratings are equal, sort by ID (descending to get the newest)
          return parseInt(b.id, 10) - parseInt(a.id, 10);
        })[0];
        
        setTopRatedProduct({
          name: topProduct.name,
          stock: topProduct.stock,
          rating: topProduct.rating,
          image: topProduct.image,
          category: topProduct.category
        });
      } else {
        setTopRatedProduct(null);
      }
      
      return allProducts;
    } catch (error) {
      console.error('Error finding top rated product:', error);
      return [];
    }
  };
  
  const updateRecentOrder = async () => {
    try {
      // Get orders from localStorage
      const storedOrders = localStorage.getItem('saturn-orders');
      const localStorageOrders = storedOrders ? JSON.parse(storedOrders) : [];
      
      // Get orders from JSON file
      const response = await fetch('/data/orders.json');
      const data = await response.json();
      const jsonOrders = data.orders || [];
      
      // Combine both sources and get unique orders by ID
      const allOrders = [...localStorageOrders];
      const orderIds = new Set(localStorageOrders.map((order: any) => order.id));
      
      jsonOrders.forEach((jsonOrder: any) => {
        if (!orderIds.has(jsonOrder.id)) {
          allOrders.push(jsonOrder);
          orderIds.add(jsonOrder.id);
        }
      });
      
      // Find the most recent order by date and highest ID
      if (allOrders.length > 0) {
        const sortedOrders = [...allOrders].sort((a, b) => {
          // First sort by date (newest first)
          const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
          
          // If dates are the same, sort by ID (highest first)
          if (dateDiff === 0) {
            return parseInt(b.id, 10) - parseInt(a.id, 10);
          }
          
          return dateDiff;
        });
        
        const mostRecent = sortedOrders[0];
        
        setRecentOrder({
          code: mostRecent.code,
          userName: mostRecent.userName,
          total: mostRecent.total,
          status: mostRecent.status,
          date: mostRecent.date
        });
      } else {
        setRecentOrder(null);
      }
      
      return allOrders;
    } catch (error) {
      console.error('Error fetching recent order:', error);
      return [];
    }
  };
  
  const updateLowStockCount = async () => {
    try {
      // Get products from localStorage
      const storedProducts = localStorage.getItem('saturn-products');
      const localStorageProducts = storedProducts ? JSON.parse(storedProducts) : [];
      
      // Get products from JSON file
      const response = await fetch('/data/products.json');
      const data = await response.json();
      const jsonProducts = data.products || [];
      
      // Combine both sources and get unique products by ID
      const allProducts = [...localStorageProducts];
      const productIds = new Set(localStorageProducts.map((product: any) => product.id));
      
      jsonProducts.forEach((jsonProduct: any) => {
        if (!productIds.has(jsonProduct.id)) {
          allProducts.push(jsonProduct);
          productIds.add(jsonProduct.id);
        }
      });
      
      // Count low stock products (stock <= 5)
      const lowStockProducts = allProducts.filter((product: any) => {
        const stock = typeof product.stock === 'number' ? product.stock : parseInt(product.stock, 10) || 0;
        return stock <= 5;
      });
      
      setLowStockCount(lowStockProducts.length);
      return lowStockProducts.length;
    } catch (error) {
      console.error('Error counting low stock products:', error);
      return 0;
    }
  };
  
  const updateInProgressOrderCount = async () => {
    try {
      // Get orders from localStorage
      const storedOrders = localStorage.getItem('saturn-orders');
      const localStorageOrders = storedOrders ? JSON.parse(storedOrders) : [];
      
      // Get orders from JSON file
      const response = await fetch('/data/orders.json');
      const data = await response.json();
      const jsonOrders = data.orders || [];
      
      // Combine both sources and get unique orders by ID
      const allOrders = [...localStorageOrders];
      const orderIds = new Set(localStorageOrders.map((order: any) => order.id));
      
      jsonOrders.forEach((jsonOrder: any) => {
        if (!orderIds.has(jsonOrder.id)) {
          allOrders.push(jsonOrder);
          orderIds.add(jsonOrder.id);
        }
      });
      
      // Count in-progress orders
      const inProgressCount = allOrders.filter((order: any) => 
        order.status === 'en proceso' || order.status === 'procesando'
      ).length;
      
      setInProgressOrderCount(inProgressCount);
      return inProgressCount;
    } catch (error) {
      console.error('Error counting in-progress orders:', error);
      return 0;
    }
  };
  
  const updateTotalRevenue = async () => {
    try {
      // Get orders from localStorage
      const storedOrders = localStorage.getItem('saturn-orders');
      const localStorageOrders = storedOrders ? JSON.parse(storedOrders) : [];
      
      // Get orders from JSON file
      const response = await fetch('/data/orders.json');
      const data = await response.json();
      const jsonOrders = data.orders || [];
      
      // Combine both sources and get unique orders by ID
      const allOrders = [...localStorageOrders];
      const orderIds = new Set(localStorageOrders.map((order: any) => order.id));
      
      jsonOrders.forEach((jsonOrder: any) => {
        if (!orderIds.has(jsonOrder.id)) {
          allOrders.push(jsonOrder);
          orderIds.add(jsonOrder.id);
        }
      });
      
      // Calculate total revenue from delivered orders
      const deliveredOrders = allOrders.filter((order: any) => order.status === 'entregado');
      const revenue = deliveredOrders.reduce((sum: number, order: any) => {
        return sum + (order.total || 0);
      }, 0);
      
      setTotalRevenue(revenue);
    } catch (error) {
      console.error('Error calculating total revenue:', error);
    }
  };

  const updateOrderCount = async () => {
    try {
      // Get orders from localStorage
      const storedOrders = localStorage.getItem('saturn-orders');
      const localStorageOrders = storedOrders ? JSON.parse(storedOrders) : [];
      
      // Get orders from JSON file
      const response = await fetch('/data/orders.json');
      const data = await response.json();
      const jsonOrders = data.orders || [];
      
      // Combine both sources and get unique orders by ID
      const allOrders = [...localStorageOrders];
      const orderIds = new Set(localStorageOrders.map((order: any) => order.id));
      
      jsonOrders.forEach((jsonOrder: any) => {
        if (!orderIds.has(jsonOrder.id)) {
          allOrders.push(jsonOrder);
          orderIds.add(jsonOrder.id);
        }
      });
      
      setOrderCount(allOrders.length);
    } catch (error) {
      console.error('Error counting orders:', error);
    }
  };

  const updateProductCount = async () => {
    try {
      // Get products from localStorage
      const storedProducts = localStorage.getItem('saturn-products');
      const localStorageProducts = storedProducts ? JSON.parse(storedProducts) : [];
      
      // Get products from JSON file
      const response = await fetch('/data/products.json');
      const data = await response.json();
      const jsonProducts = data.products || [];
      
      // Combine both sources and get unique products by ID
      const allProducts = [...localStorageProducts];
      jsonProducts.forEach((jsonProduct: any) => {
        if (!allProducts.some((product: any) => product.id === jsonProduct.id)) {
          allProducts.push(jsonProduct);
        }
      });
      
      setProductCount(allProducts.length);
    } catch (error) {
      console.error('Error counting products:', error);
    }
  };

  const updateUserCount = () => {
    try {
      // Get users from localStorage
      const storedUsers = localStorage.getItem('saturn-users');
      const localStorageUsers = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Get users from JSON file (this will be fetched on the client side)
      const fetchJsonUsers = async () => {
        try {
          const response = await fetch('/data/users.json');
          const data = await response.json();
          return data.users || [];
        } catch (error) {
          console.error('Error fetching users.json:', error);
          return [];
        }
      };

      // Combine both sources and get unique users by ID
      const getUniqueUsers = async () => {
        const jsonUsers = await fetchJsonUsers();
        const allUsers = [...localStorageUsers];
        
        // Add JSON users if they don't exist in localStorage
        jsonUsers.forEach((jsonUser: any) => {
          if (!allUsers.some((user) => user.id === jsonUser.id)) {
            allUsers.push(jsonUser);
          }
        });
        
        return allUsers;
      };

      getUniqueUsers().then(users => {
        setUserCount(users.length);
      });
    } catch (error) {
      console.error('Error counting users:', error);
    }
  };

  useEffect(() => {
    // Initial counts
    updateCounts();

    // Listen for storage events (changes from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'saturn-users') {
        updateUserCount();
      } else if (e.key === 'saturn-products') {
        updateProductCount().then(() => 
          Promise.all([
            updateLowStockCount(),
            updateTopRatedProduct()
          ])
        );
      } else if (e.key === 'saturn-orders') {
        updateOrderCount().then(() => {
          return Promise.all([
            updateInProgressOrderCount(),
            updateTotalRevenue(),
            updateRecentOrder()
          ]);
        });
      }
    };

    // Listen for custom events when data is updated in the same tab
    const handleUserUpdate = () => updateUserCount();
    const handleProductUpdate = () => {
      updateProductCount().then(() => 
        Promise.all([
          updateLowStockCount(),
          updateTopRatedProduct()
        ])
      );
    };
    const handleOrderUpdate = () => {
      updateOrderCount().then(() => {
        return Promise.all([
          updateInProgressOrderCount(),
          updateTotalRevenue(),
          updateRecentOrder()
        ]);
      });
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('usersUpdated', handleUserUpdate);
    window.addEventListener('productsUpdated', handleProductUpdate);
    window.addEventListener('ordersUpdated', handleOrderUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('usersUpdated', handleUserUpdate);
      window.removeEventListener('productsUpdated', handleProductUpdate);
      window.removeEventListener('ordersUpdated', handleOrderUpdate);
    };
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-mint-green-dark font-playfair">
        Panel de Control
      </h1>
      <p className="text-gray-600 mb-8 font-poppins">
        Resumen general de Saturn Beauty
      </p>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1 font-poppins">
                Total Usuarios
              </p>
              <h3 className="text-2xl font-bold font-playfair">{userCount}</h3>
            </div>
            <div className="bg-lavender-light p-2 rounded-lg">
              <LuUsers className="text-lavender text-xl" />
            </div>
          </div>
        </Card>

        {/* Total Products */}
        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Productos</p>
              <h3 className="text-2xl font-bold">{productCount}</h3>
            </div>
            <div className="bg-mint-green-light p-2 rounded-lg">
              <LuBox className="text-mint-green text-xl" />
            </div>
          </div>
        </Card>

        {/* Total Orders */}
        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pedidos</p>
              <h3 className="text-2xl font-bold">{orderCount}</h3>
            </div>
            <div className="bg-accent-yellow bg-opacity-20 p-2 rounded-lg">
              <LuShoppingCart className="text-yellow-600 text-xl" />
            </div>
          </div>
        </Card>

        {/* Total Revenue */}
        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
              <h3 className="text-2xl font-bold">${totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <LuDollarSign className="text-green-600 text-xl" />
            </div>
          </div>
        </Card>
      </div>
      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Orders */}
        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">Pedidos en Proceso</h3>
            <div className="bg-orange-100 p-1 rounded">
              <span className="text-orange-600">!</span>
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-orange-600">{inProgressOrderCount}</span>
            <p className="text-gray-600 mt-1">Requieren atención</p>
          </div>
        </Card>

        {/* Low Stock */}
        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">Stock Bajo</h3>
            <div className="bg-red-100 p-1 rounded">
              <span className="text-red-600">!</span>
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-red-600">{lowStockCount}</span>
            <p className="text-gray-600 mt-1">Productos con ≤5 unidades</p>
          </div>
        </Card>
      </div>
      {/* Recent Orders and Low Stock Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Orders */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Pedido Reciente</h3>
          <div className="space-y-4">
            {recentOrder ? (
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{recentOrder.code}</p>
                  <p className="text-sm text-gray-600">{recentOrder.userName}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${recentOrder.total.toFixed(2)}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded ${
                    recentOrder.status === 'entregado' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {recentOrder.status === 'entregado' ? 'Entregado' : 'En proceso'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay pedidos recientes</p>
            )}
          </div>
        </Card>

        {/* Top Rated Product */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Producto Mejor Calificado</h3>
          <div className="space-y-4">
            {topRatedProduct ? (
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4 overflow-hidden">
                    {topRatedProduct.image ? (
                      <img 
                        src={topRatedProduct.image} 
                        alt={topRatedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{topRatedProduct.name}</p>
                    <p className="text-sm text-gray-600">{topRatedProduct.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end mb-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(topRatedProduct.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-sm text-gray-600">
                      {topRatedProduct.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {topRatedProduct.stock} unidades
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay productos disponibles</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
