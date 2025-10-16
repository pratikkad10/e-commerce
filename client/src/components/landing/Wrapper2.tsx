import BrandCard from "./BrandCard"
import { brands } from "@/utils/brands"

const Wrapper2 = () => {
  return (
    <div className="brands card mb-8 lg:mx-40 py-6 rounded-lg text-center">
      <h2 className="lg:text-4xl text-foreground/90 text-2xl text-center font-semibold py-4">Our brands</h2>
      <div className="brand-logos flex flex-wrap lg:space-x-[1.6rem] sm:px-6 md:px-12   xl:px-40 justify-center gap-4">
        {brands.map((brand, idx) => (
          <BrandCard key={idx} brand={brand} />
        ))}
      </div>
    </div>
  )
}

export default Wrapper2