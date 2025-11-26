import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';

const ShopPage = ({ currentUser, setCurrentUser }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = currentUser?.token || null;
        const data = await apiFetch('/products', 'GET', null, token);
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };
    fetchProducts();
  }, [currentUser]);

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      if (!currentUser?.token) return;
      try {
        const data = await apiFetch('/cart', 'GET', null, currentUser.token);
        setCart(data);
      } catch (err) {
        console.error('Failed to fetch cart:', err);
      }
    };
    fetchCart();
  }, [currentUser?.token]);

  // Add to cart
  const addToCart = async (product) => {
    if (!currentUser) return alert('You must be logged in to add to cart!');
    if (product.sellerId === currentUser.id) return alert("You can't buy your own product!");
    if (product.stock <= 0) return alert('Out of stock!');

    try {
      await apiFetch('/cart', 'POST', {
        userId: currentUser.id,
        productId: product.id,
        quantity: 1
      }, currentUser.token);

      const updatedCart = await apiFetch('/cart', 'GET', null, currentUser.token);
      setCart(updatedCart);
    } catch (err) {
      console.error(err);
      alert('Failed to add to cart');
    }
  };

  // Remove from cart
  const removeFromCart = async (cartId) => {
    try {
      await apiFetch(`/cart/${cartId}`, 'DELETE', null, currentUser.token);
      setCart(prev => prev.filter(item => item.cartId !== cartId));
    } catch (err) {
      alert(err.message);
    }
  };

  // Checkout
  const checkout = async () => {
    if (!currentUser) return alert('You must be logged in to checkout!');
    if (cart.length === 0) return alert('Your cart is empty!');

    try {
      // Pass full cart items including cartId, productId, quantity, price, sellerId
      const checkoutItems = cart.map(item => ({
        cartId: item.cartId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        sellerId: item.sellerId,
        name: item.name
      }));

      const result = await apiFetch('/transactions/checkout', 'POST', { cartItems: checkoutItems }, currentUser.token);

      alert('Purchase successful!');
      setCart([]); // Clear local cart
      const updatedProducts = await apiFetch('/products', 'GET', null, currentUser.token);
      setProducts(updatedProducts);
      setCurrentUser(prev => ({ ...prev, balance: result.newBalance }));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Products */}
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
              <div className="text-sm text-gray-500 mb-4">Sold by: {product.sellerName}</div>
              <button
                onClick={() => addToCart(product)}
                disabled={!currentUser || product.sellerId === currentUser.id}
                className={`w-full py-2 rounded-lg font-semibold transition ${
                  !currentUser || product.sellerId === currentUser.id
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {!currentUser ? 'Login to Buy' : product.sellerId === currentUser.id ? 'Your Product' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cart */}
      {currentUser && (
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Shopping Cart ({cart.length})</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.cartId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-green-600 font-bold">${item.price}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.cartId)}
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
                      ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
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
      )}
    </div>
  );
};

export default ShopPage;
