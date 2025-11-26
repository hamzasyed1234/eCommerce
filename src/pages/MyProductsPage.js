import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';

const MyProductsPage = ({ currentUser }) => {
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', description: '' });

  useEffect(() => {
    const fetchMyProducts = async () => {
      if (!currentUser?.token) return;

      try {
        const data = await apiFetch('/products/mine', 'GET', null, currentUser.token);
        setMyProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch my products:', err);
        setMyProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProducts();
  }, [currentUser]);

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await apiFetch(`/products/${productId}`, 'DELETE', null, currentUser.token);
      setMyProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product. Try again.');
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description
    });
  };

  const closeEditModal = () => {
    setEditingProduct(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const { name, price, stock, description } = formData;
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock);

    if (!name || isNaN(parsedPrice) || isNaN(parsedStock)) {
      alert('Please enter valid name, price, and stock.');
      return;
    }

    try {
      await apiFetch(`/products/${editingProduct.id}`, 'PUT', {
        name,
        price: parsedPrice,
        stock: parsedStock,
        description,
        categoryId: editingProduct.categoryId
      }, currentUser.token);

      setMyProducts(prev =>
        prev.map(p => p.id === editingProduct.id ? { ...p, name, price: parsedPrice, stock: parsedStock, description } : p)
      );

      closeEditModal();
    } catch (err) {
      console.error('Failed to update product:', err);
      alert('Failed to update product. Try again.');
    }
  };

  if (loading) return <div>Loading your products...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Listed Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myProducts.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            You haven't listed any products yet. Go to the Sell tab to list your first product!
          </div>
        )}
        {myProducts.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md p-6 relative">
            <h3 className="text-xl font-bold mb-2">{product.name}</h3>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Price:</span><span className="font-bold text-green-600">${product.price}</span></div>
              <div className="flex justify-between"><span>Stock:</span><span className="font-bold">{product.stock}</span></div>
              <div className="flex justify-between"><span>Total Sold:</span><span className="font-bold text-blue-600">{product.totalSold || 0}</span></div>
              <div className="flex justify-between"><span>Revenue:</span><span className="font-bold text-green-600">${((product.totalSold || 0) * product.price).toFixed(2)}</span></div>
            </div>

            {/* Edit & Delete Buttons */}
            <div className="flex justify-end mt-4 gap-2">
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => openEditModal(product)}
              >
                Edit
              </button>
              <button
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => handleDelete(product.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Edit Product</h3>
            <div className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="number"
                name="stock"
                placeholder="Stock"
                value={formData.stock}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <button
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                onClick={closeEditModal}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProductsPage;
