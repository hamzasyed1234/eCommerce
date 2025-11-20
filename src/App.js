import React, { useState, useEffect } from 'react';
import { Store, Dice1, TrendingUp, Package } from 'lucide-react';
import { storage } from './utils/storage';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import ShopPage from './pages/ShopPage';
import SellPage from './pages/SellPage';
import GamblingPage from './pages/GamblingPage';
import MyProductsPage from './pages/MyProductsPage';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('shop');

  // Load data on mount
  useEffect(() => {
    setUsers(storage.getUsers());
    setProducts(storage.getProducts());
    setCurrentUser(storage.getCurrentUser());
  }, []);

  // Save data when changed
  useEffect(() => {
    if (users.length > 0) storage.setUsers(users);
  }, [users]);

  useEffect(() => {
    if (products.length > 0) storage.setProducts(products);
  }, [products]);

  useEffect(() => {
    if (currentUser) storage.setCurrentUser(currentUser);
  }, [currentUser]);

  // Simulate automated purchases
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      setProducts(prevProducts => {
        return prevProducts.map(product => {
          if (product.stock > 0 && product.sellerId !== currentUser.id) {
            const baseProbability = 0.3;
            const priceFactor = Math.max(0.01, 1 - (product.price / 1000));
            const purchaseProbability = baseProbability * priceFactor;
            
            if (Math.random() < purchaseProbability) {
              const newStock = product.stock - 1;
              
              setUsers(prevUsers => {
                return prevUsers.map(user => {
                  if (user.id === product.sellerId) {
                    return { ...user, balance: user.balance + product.price };
                  }
                  return user;
                });
              });

              if (product.sellerId === currentUser.id) {
                setCurrentUser(prev => ({
                  ...prev,
                  balance: prev.balance + product.price
                }));
              }

              return { ...product, stock: newStock, totalSold: (product.totalSold || 0) + 1 };
            }
          }
          return product;
        });
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleLogin = (username, password, mode) => {
    if (mode === 'signup') {
      const existingUser = users.find(u => u.username === username);
      if (existingUser) {
        alert('Username already exists!');
        return;
      }
      
      const newUser = {
        id: Date.now(),
        username,
        password,
        balance: 2000,
        createdAt: new Date().toISOString()
      };
      
      setUsers([...users, newUser]);
      setCurrentUser(newUser);
    } else {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        setCurrentUser(user);
      } else {
        alert('Invalid credentials!');
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCart([]);
    setActiveTab('shop');
    storage.removeCurrentUser();
  };

  const addToCart = (product) => {
    if (product.sellerId === currentUser.id) {
      alert("You can't buy your own product!");
      return;
    }
    if (product.stock <= 0) {
      alert('Out of stock!');
      return;
    }
    setCart([...cart, product]);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const checkout = () => {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    if (currentUser.balance < total) {
      alert('Insufficient funds!');
      return;
    }

    const updatedUser = { ...currentUser, balance: currentUser.balance - total };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));

    cart.forEach(item => {
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === item.id ? { ...p, stock: p.stock - 1, totalSold: (p.totalSold || 0) + 1 } : p
        )
      );
      
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === item.sellerId ? { ...u, balance: u.balance + item.price } : u
        )
      );
    });

    alert(`Purchase successful! Spent $${total}`);
    setCart([]);
  };

  const listProduct = (newProduct) => {
    const product = {
      id: Date.now(),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      description: newProduct.description,
      stock: parseInt(newProduct.stock),
      sellerId: currentUser.id,
      sellerName: currentUser.username,
      totalSold: 0,
      listedAt: new Date().toISOString()
    };

    setProducts([...products, product]);
    alert('Product listed successfully!');
  };

  const rollDice = (betAmount, selectedNumber) => {
    const bet = parseFloat(betAmount);
    
    if (!bet || bet <= 0) {
      return null;
    }
    
    if (bet > currentUser.balance) {
      alert('Insufficient funds!');
      return null;
    }

    const roll = Math.floor(Math.random() * 6) + 1;

    if (roll === selectedNumber) {
      const winnings = bet * 5;
      const updatedUser = { ...currentUser, balance: currentUser.balance + winnings };
      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      return {
        roll,
        message: `🎉 You won $${winnings}! The dice rolled ${roll}!`
      };
    } else {
      const updatedUser = { ...currentUser, balance: currentUser.balance - bet };
      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      return {
        roll,
        message: `😞 You lost $${bet}. The dice rolled ${roll}.`
      };
    }
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentUser={currentUser} onLogout={handleLogout} />

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('shop')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'shop'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Store className="w-5 h-5 inline mr-2" />
              Shop
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'sell'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingUp className="w-5 h-5 inline mr-2" />
              Sell
            </button>
            <button
              onClick={() => setActiveTab('gambling')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'gambling'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Dice1 className="w-5 h-5 inline mr-2" />
              Gambling
            </button>
            <button
              onClick={() => setActiveTab('myproducts')}
              className={`py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'myproducts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="w-5 h-5 inline mr-2" />
              My Products
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'shop' && (
          <ShopPage
            products={products}
            currentUser={currentUser}
            cart={cart}
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
            onCheckout={checkout}
          />
        )}

        {activeTab === 'sell' && (
          <SellPage onListProduct={listProduct} />
        )}

        {activeTab === 'gambling' && (
          <GamblingPage onRollDice={rollDice} />
        )}

        {activeTab === 'myproducts' && (
          <MyProductsPage products={products} currentUser={currentUser} />
        )}
      </main>
    </div>
  );
};

export default App;