'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ImageModal from './ImageModal'
import { useInView } from 'react-intersection-observer'

interface Image {
  id: string
  url: string
  title?: string
  category?: string
  tags?: string[]
}

export default function ImageGrid() {
  const [images, setImages] = useState<Image[]>([])
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  
  const { ref, inView } = useInView({
    threshold: 0,
  })

  const fetchImages = async () => {
    if (loading || !hasMore) return
    
    setLoading(true)
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .range((page - 1) * 20, page * 20 - 1)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching images:', error)
      return
    }

    if (data.length === 0) {
      setHasMore(false)
    } else {
      setImages(prev => [...prev, ...data])
      setPage(prev => prev + 1)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchImages()
  }, [])

  useEffect(() => {
    if (inView && hasMore) {
      fetchImages()
    }
  }, [inView])

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="aspect-square relative group cursor-pointer"
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image.url}
              alt={image.title || 'Crypto sticker'}
              className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
            />
          </div>
        ))}
      </div>
      
      <div ref={ref} className="h-10">
        {loading && <div className="text-center">Loading...</div>}
      </div>

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  )
} 