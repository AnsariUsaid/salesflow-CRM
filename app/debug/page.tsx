'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function DebugPage() {
  const { user } = useUser();
  const [products, setProducts] = useState<any>(null);
  const [orders, setOrders] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function test() {
      try {
        const productsRes = await fetch('/api/products');
        const ordersRes = await fetch('/api/orders');
        
        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();
        
        setProducts({ status: productsRes.status, data: productsData });
        setOrders({ status: ordersRes.status, data: ordersData });
      } catch (err: any) {
        setError(err.message);
      }
    }
    test();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">🔍 Debug Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">User Info</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify({ 
              id: user?.id,
              firstName: user?.firstName,
              email: user?.emailAddresses?.[0]?.emailAddress 
            }, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Products API</h2>
          <p className="mb-2">Status: <span className="font-mono">{products?.status}</span></p>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(products?.data, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Orders API</h2>
          <p className="mb-2">Status: <span className="font-mono">{orders?.status}</span></p>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(orders?.data, null, 2)}
          </pre>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
