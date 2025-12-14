import { Product } from '@/types/product';

async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch('http://localhost:8000/products', {
      cache: 'no-store', // Disable caching to always fetch fresh data
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function ProductTable() {
  const products = await fetchProducts();

  // Format price to currency
  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="overflow-x-auto rounded-xl">
      {products.length > 0 ? (
        <table className="min-w-full bg-transparent">
          <thead>
            <tr className="border-b border-glass-border">
              <th className="py-3 px-4 text-left text-white font-semibold">ID</th>
              <th className="py-3 px-4 text-left text-white font-semibold">Name</th>
              <th className="py-3 px-4 text-left text-white font-semibold">Price</th>
              <th className="py-3 px-4 text-left text-white font-semibold">In Stock</th>
              <th className="py-3 px-4 text-left text-white font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={product.id}
                className={`border-b border-glass-border transition-all duration-300 ease-in-out ${index % 2 === 0 ? 'bg-glass/20' : 'bg-glass/10'} glass-hover`}
              >
                <td className="py-3 px-4 text-gray-200">{product.id}</td>
                <td className="py-3 px-4 text-gray-200 font-medium">{product.name}</td>
                <td className="py-3 px-4 text-gray-200">{formatCurrency(product.price)}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    product.in_stock
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {product.in_stock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2 opacity-70">
                    <span className="text-blue-300">
                      Edit
                    </span>
                    <span className="text-red-300">
                      Delete
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No products found. Add some products to get started.</p>
        </div>
      )}
    </div>
  );
}