'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { XMarkIcon, ArrowDownTrayIcon, MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface ImageType {
  id: string
  url: string
  tags: string[] | null
  views: number
  created_at: string
  description: string | null
}

interface Tag {
  id: string
  name: string
}

type SortOrder = 'recent' | 'popular'

export default function Home() {
  const [images, setImages] = useState<ImageType[]>([])
  const [filteredImages, setFilteredImages] = useState<ImageType[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent')
  const [searchQuery, setSearchQuery] = useState('')
  const [showInstructions, setShowInstructions] = useState(true)
  const [showTags, setShowTags] = useState(true)

  useEffect(() => {
    fetchImages()
    fetchTags()
  }, [sortOrder])

  useEffect(() => {
    let filtered = images

    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter(image => 
        image.tags?.includes(selectedTag)
      )
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(image => {
        const matchesDescription = image.description?.toLowerCase().includes(query) || false
        const matchesTags = image.tags?.some(tag => tag.toLowerCase().includes(query)) || false
        return matchesDescription || matchesTags
      })
    }

    setFilteredImages(filtered)
  }, [selectedTag, images, searchQuery])

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null)
      }
    }

    window.addEventListener('keydown', handleEscKey)
    return () => window.removeEventListener('keydown', handleEscKey)
  }, [])

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order(sortOrder === 'recent' ? 'created_at' : 'views', { 
          ascending: false 
        })

      if (error) throw error
      setImages(data || [])
      setFilteredImages(data || [])
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name')

      if (error) throw error
      setTags(data || [])
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const handleTagClick = (tagName: string) => {
    setSelectedTag(selectedTag === tagName ? null : tagName)
    setSelectedImage(null)
  }

  const handleTitleClick = () => {
    setSelectedTag(null)
    setSelectedImage(null)
    fetchImages()
    fetchTags()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Title and Attribution */}
        <div className="text-center mb-12">
          <h1 
            className="text-4xl font-bold mb-2 cursor-pointer hover:text-gray-700 transition-colors"
            onClick={handleTitleClick}
          >
            CryptoStickers.Fun
          </h1>
          <p className="text-gray-600 mb-12">
            created by{' '}
            <a 
              href="https://x.com/Wongsworth" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              @Wongsworth
            </a>
          </p>
        </div>

        {/* Instructions */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-2xl font-semibold text-gray-800">How to Create a Sticker</h2>
              <div className="transform transition-transform duration-300">
                <ChevronUpIcon className={`h-6 w-6 text-gray-600 ${showInstructions ? 'rotate-0' : 'rotate-180'}`} />
              </div>
            </button>
            
            <div 
              className={`transition-all duration-500 ease-in-out ${
                showInstructions ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              } overflow-hidden`}
            >
              <ol className="p-4 space-y-4 text-gray-700">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full font-medium">1</span>
                  <span>Select an image below and save it to your phone.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full font-medium">2</span>
                  <span>Open your Photos app, select the photo and open the photo in full screen.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full font-medium">3</span>
                  <span>Touch and hold the subject of the photo, then release. A popup menu will appear.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full font-medium">4</span>
                  <span>Tap "Add Sticker" from the menu.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full font-medium">5</span>
                  <span>Your sticker is now saved and can be accessed in iMessage and WhatsApp.</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Donation Info */}
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <p className="text-sm text-gray-700 mb-4">
            This resource is free, please enjoy!<br />
            Any gifts/donations are greatly appreciated
          </p>
          <div className="space-y-2 text-xs text-gray-600">
            <p>btc: bc1q572vqtgqhd9s9800sc76wzrvx7kxn6s2fqvgs4</p>
            <p>eth: 0x3166dB56F20a87e25bA2463747B303bE88ba3E5B</p>
            <p>sol: FMbUc88pMoixLoFbUC2GrWQuDaHvWdMbUBzgt9oH4REg</p>
            <p>base: 0x3166dB56F20a87e25bA2463747B303bE88ba3E5B</p>
          </div>
        </div>

        {/* Filter by Tag Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <button
              onClick={() => setShowTags(!showTags)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-2xl font-semibold text-gray-800">Filter by Tag</h2>
              <div className="transform transition-transform duration-300">
                <ChevronUpIcon className={`h-6 w-6 text-gray-600 ${showTags ? 'rotate-0' : 'rotate-180'}`} />
              </div>
            </button>
            
            <div 
              className={`transition-all duration-500 ease-in-out ${
                showTags ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              } overflow-hidden`}
            >
              <div className="flex flex-wrap justify-center gap-2 p-4 max-h-[300px] overflow-y-auto">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    !selectedTag
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  See All
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagClick(tag.name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedTag === tag.name
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sort Controls and Search */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setSortOrder('recent')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                sortOrder === 'recent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Most Recent
            </button>
            <button
              onClick={() => setSortOrder('popular')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                sortOrder === 'popular'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Most Popular
            </button>
          </div>
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by description or tags..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <div 
              key={image.id} 
              className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer"
              onClick={() => setSelectedImage(image)}
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
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No images found for the selected tag.</p>
          </div>
        )}
      </div>

      {/* Image Popup Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-90 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div 
              className="relative bg-white rounded-lg max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="Close popup"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>

              <div className="relative aspect-square">
                <Image
                  src={selectedImage.url}
                  alt="Sticker"
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 1024px) 90vw, 1024px"
                />
              </div>

              <div className="p-4 bg-white border-t flex justify-between items-center">
                <div className="flex flex-wrap gap-2">
                  {selectedImage.tags?.map((tag, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTagClick(tag)
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTag === tag
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  )) || (
                    <span className="text-gray-500 text-sm">No tags</span>
                  )}
                </div>
                <a
                  href={selectedImage.url}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-blue-700 transition-colors"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
} 