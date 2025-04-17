'use client'

import { useState } from 'react'
import Image from 'next/image'
import ImageModal from './ImageModal'
import { Image as ImageType } from '../types/image'

interface ImageGridProps {
  images: ImageType[]
  onImageClick?: (image: ImageType) => void
}

export default function ImageGrid({ images, onImageClick }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null)

  const handleImageClick = (image: ImageType) => {
    if (onImageClick) {
      onImageClick(image)
    } else {
      setSelectedImage(image)
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <div 
          key={image.id} 
          className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer"
          onClick={() => handleImageClick(image)}
        >
          <Image
            src={image.url}
            alt="Sticker"
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transform transition-transform group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
        </div>
      ))}

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  )
} 