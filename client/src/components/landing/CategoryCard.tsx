import { useNavigate } from "react-router-dom"

const CategoryCard = ({ image, path, sectionName, description }: { 
  image: string
  path: string
  sectionName: string
  description: string
}) => {
  const navigate = useNavigate()
  
  return (
    <div 
      onClick={() => navigate(path)} 
      className="cursor-pointer group relative overflow-hidden rounded-lg h-56 sm:h-64 md:h-72 lg:h-80 hover:shadow-xl transition-all"
    >
      <img src={image} alt={sectionName} loading="lazy" className="h-full w-full object-center group-hover:scale-105 transition-transform duration-300" />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
      <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6">
        <h3 className="text-xl sm:text-2xl font-bold mb-2">{sectionName}</h3>
        <p className="text-xs sm:text-sm text-center">{description}</p>
      </div>
    </div>
  )
}

export default CategoryCard
