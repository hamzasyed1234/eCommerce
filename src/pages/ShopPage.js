import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';

const ShopPage = ({ currentUser }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiFetch('/products');
        setProducts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    if (product.sellerId === currentUser.id) return alert("You can't buy your own product!");
    if (product.stock <= 0) return alert('Out of stock!');
    setCart([...cart, product]);
  };

  const removeFromCart = (index) => setCart(cart.filter((_, i) => i !== index));

  const checkout = async () => {
    try {
      await apiFetch('/purchase', 'POST', { items: cart }, currentUser.token);
      alert('Purchase successful!');
      setCart([]);
      const updatedProducts = await apiFetch('/products');
      setProducts(updatedProducts);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold mb-6">Available Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.filter(p => p.stock > 0).map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-green-600">${product.price}</span>
                <span className="text-sm text-gray-500">Stock: {product.stock}</span>
              </div>
              <div className="text-sm text-gray-500 mb-4">
                Sold by: {product.sellerName}
              </div>
              <button
                onClick={() => addToCart(product)}
                disabled={product.sellerId === currentUser.id}
                className={`w-full py-2 rounded-lg font-semibold transition ${
                  product.sellerId === currentUser.id
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {product.sellerId === currentUser.id ? 'Your Product' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
          <h2 className="text-xl font-bold mb-4">Shopping Cart ({cart.length})</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-green-600 font-bold">${item.price}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between mb-4">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-xl text-green-600">
                    ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={checkout}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
