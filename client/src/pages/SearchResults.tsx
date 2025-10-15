import { searchProductsSelector } from '@/store/selectors/searchProductSelector';
import { Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';


const SearchList = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const results = useRecoilValue(searchProductsSelector(query));

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Search Results for "{query}"
      </h1>
      <p className="text-muted-foreground mb-6">
        Found {results.length} products
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {results.map(product => (
          <div key={product._id} className="border rounded-lg p-4">
            <img 
              src={product.images[0]?.url} 
              alt={product.name}
              className="w-full h-48 object-cover rounded"
            />
            <h3 className="font-semibold mt-2">{product.name}</h3>
            <p className="text-lg font-bold">${product.price}</p>
          </div>
        ))}
      </div>
      
      {results.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">
          No products found
        </p>
      )}
    </div>
  );
};

const SearchResults = () => (
  <Suspense fallback={<div className="p-6">Loading...</div>}>
    <SearchList />
  </Suspense>
);

export default SearchResults;
