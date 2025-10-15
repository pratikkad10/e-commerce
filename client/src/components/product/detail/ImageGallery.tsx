import { useState } from "react"

type ImageGalleryProps = {
  images: { url: string; alt: string }[]
  primaryImage: { url: string; alt: string }
}

const ImageGallery = ({ images, primaryImage }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(primaryImage.url)

  return (
    <div className="space-y-4">
      <div className="aspect-square rounded-md overflow-hidden bg-muted shadow-md max-w-sm sm:max-w-md mx-auto">
        <img
          src={selectedImage}
          alt="Product"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(img.url)}
            className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
              selectedImage === img.url ? 'border-primary shadow-lg' : 'border-border hover:border-primary/50'
            }`}
          >
            <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

export default ImageGallery
