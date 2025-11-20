import React from 'react';

const MyProductsPage = ({ products, currentUser }) => {
  const myProducts = products.filter(p => p.sellerId === currentUser.id);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Listed Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myProducts.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-bold text-green-600">${product.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stock:</span>
                <span className="font-bold">{product.stock}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Sold:</span>
                <span className="font-bold text-blue-600">{product.totalSold || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue:</span>
                <span className="font-bold text-green-600">
                  ${((product.totalSold || 0) * product.price).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
        {myProducts.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            You haven't listed any products yet. Go to the Sell tab to list your first product!
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProductsPage;