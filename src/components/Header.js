import React from 'react';
import { ShoppingCart, User, LogOut, DollarSign } from 'lucide-react';

const Header = ({ currentUser, onLogout }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <ShoppingCart className="w-8 h-8 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">MarketPlace</h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center bg-green-100 px-4 py-2 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-600 mr-1" />
            <span className="font-bold text-green-700">
              {currentUser.balance.toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <User className="w-5 h-5 mr-2" />
            <span>{currentUser.username}</span>
          </div>
          
          <button
            onClick={onLogout}
            className="flex items-center text-red-600 hover:text-red-700"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;