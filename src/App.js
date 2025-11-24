// src/App.js
import React, { useState } from 'react';
import { Store, TrendingUp, Package } from 'lucide-react';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import ShopPage from './pages/ShopPage';
import SellPage from './pages/SellPage';
import MyProductsPage from './pages/MyProductsPage';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('shop');

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('shop');
  };

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentUser={currentUser} onLogout={handleLogout} />

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

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'shop' && (
          <ShopPage currentUser={currentUser} setCurrentUser={setCurrentUser} />
        )}
        {activeTab === 'sell' && <SellPage currentUser={currentUser} />}
        {activeTab === 'myproducts' && <MyProductsPage currentUser={currentUser} />}
      </main>
    </div>
  );
};

export default App;
