import BrandCard from "./BrandCard"

const Wrapper2 = () => {
    const brands = [
        { name: "Brand 1", logo: "/brand1-logo.png" },
        { name: "Brand 2", logo: "/brand2-logo.png" },
        { name: "Brand 2", logo: "/brand2-logo.png" },
        { name: "Brand 2", logo: "/brand2-logo.png" },
        { name: "Brand 3", logo: "/brand3-logo.png" },
        { name: "Brand 1", logo: "/brand1-logo.png" },
    ]
  return (
    <div className="brands card mt-10 mb-10 lg:mx-40 py-6 rounded-lg text-center">
      <h2 className="lg:text-4xl text-muted-foreground text-2xl text-center font-bold py-4">OUR BRANDS</h2>
      <div className="brand-logos flex flex-wrap lg:space-x-[1.6rem] sm:px-6 md:px-12   xl:px-40 justify-center gap-4">
        {brands.map((brand, idx) => (
            <BrandCard key={idx} brand={brand} />
        ))}
      </div>
    </div>
  )
}

export default Wrapper2