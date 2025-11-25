// src/pages/MyPurchasesPage.js
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';

const MyPurchasesPage = ({ currentUser }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's purchased products
  const fetchOrders = async () => {
    if (!currentUser?.token) return;

    try {
      const data = await apiFetch(
        '/orders/purchases', // Backend endpoint to get user's purchases
        'GET',
        null,
        currentUser.token, // Pass JWT token for auth
        { userId: currentUser.userId } // optional query param
      );

      setOrders(data);
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setError('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  if (loading) return <p className="text-center mt-10">Loading your purchases...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (orders.length === 0) return <p className="text-center mt-10">You haven’t purchased anything yet.</p>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Purchases</h1>

      {orders.map((order) => (
        <div key={order.orderId} className="border rounded p-4 mb-4 shadow-sm">
          <p className="font-semibold">Order ID: {order.orderId}</p>
          <p className="text-sm text-gray-500">Ordered on: {new Date(order.orderedAt).toLocaleDateString()}</p>
          
          <table className="w-full mt-2 table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Product</th>
                <th className="border px-2 py-1">Quantity</th>
                <th className="border px-2 py-1">Price</th>
                <th className="border px-2 py-1">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.orderItemId}>
                  <td className="border px-2 py-1">{item.productName}</td>
                  <td className="border px-2 py-1">{item.quantity}</td>
                  <td className="border px-2 py-1">${item.price.toFixed(2)}</td>
                  <td className="border px-2 py-1">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-right font-bold mt-2">
            Total: ${order.totalAmount.toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default MyPurchasesPage;
