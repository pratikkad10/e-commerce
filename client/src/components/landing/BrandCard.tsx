function BrandCard({ brand }: { brand: string }) {
  return (
    <div className="brand-card p-2 sm:p-3 md:p-4 bg-card rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
      <span className="text-lg sm:text-xl md:text-2xl font-birthstone font-light text-foreground/70">
        {brand}
      </span>
    </div>
  )
}

export default BrandCard