import { searchProductsSelector } from '@/store/selectors/searchProductSelector';
import ProductGrid from '@/components/product/ProductGrid';
import ProductsLoading from '@/components/product/ProductsLoading';
import { Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

const SearchList = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const results = useRecoilValue(searchProductsSelector(query));

  return (
    <div className="w-full max-w-[1600px] mx-auto mt-16 md:mt-20 px-4 py-4 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">
        Search Results for "{query}"
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        {results.length} {results.length === 1 ? 'product' : 'products'} found
      </p>
      
      {results.length > 0 ? (
        <ProductGrid products={results} />
      ) : (
        <p className="text-center text-muted-foreground mt-12">
          No products found
        </p>
      )}
    </div>
  );
};

const SearchResults = () => (
  <Suspense fallback={<ProductsLoading />}>
    <SearchList />
  </Suspense>
);

export default SearchResults;
