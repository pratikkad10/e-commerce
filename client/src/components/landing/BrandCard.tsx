
function BrandCard({ brand }: { brand: { name: string; logo: string } }) {
  return (
    <div className="brand-card p-2 sm:p-3 md:p-4 w-18 sm:w-20 md:w-24 lg:w-28 bg-card-foreground rounded-lg shadow-md flex items-center justify-center flex-shrink-0">
        <img key={brand.name} src={brand.logo} alt={brand.name} className="w-full h-auto object-contain" />
    </div>
  )
}

export default BrandCard