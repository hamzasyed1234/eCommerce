// src/pages/SellPage.js
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';

const SellPage = ({ currentUser }) => {
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', stock: '', categoryId: '' });
  const [categories, setCategories] = useState([]);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiFetch('/categories', 'GET', null, currentUser.token);
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, [currentUser.token]);

  const handleSubmit = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.categoryId) {
      return alert('Please fill all fields!');
    }

    try {
      await apiFetch('/products', 'POST', newProduct, currentUser.token);
      alert('Product listed successfully!');
      setNewProduct({ name: '', price: '', description: '', stock: '', categoryId: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6">List a Product</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Price ($)"
            value={newProduct.price}
            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Description"
            value={newProduct.description}
            onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            rows="4"
          />

          {/* Category Dropdown */}
          <select
            value={newProduct.categoryId}
            onChange={e => setNewProduct({ ...newProduct, categoryId: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${!newProduct.categoryId ? 'text-gray-400' : 'text-black'}`}
          >
            <option value="" disabled className="text-gray-400">Select Category</option>
            {categories.map(cat => (
              <option key={cat.CATEGORY_ID} value={cat.CATEGORY_ID} className="text-black">
                {cat.CATEGORY_NAME}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Stock Quantity"
            value={newProduct.stock}
            onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            List Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellPage;
