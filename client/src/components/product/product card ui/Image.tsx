
const Image = ({ image } : { image: { url: string; alt?: string } }) => {
  return (
    <div className="aspect-square overflow-hidden bg-muted">
        <img 
          loading="lazy" 
          className="w-full h-full object-cover hover:scale-105 transition-transform" 
          src={image?.url} 
          alt={image?.alt || 'Product Image'} 
        />
      </div>
  )
}

export default Image