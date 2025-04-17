'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { TrashIcon, PencilIcon, XMarkIcon, ChevronUpIcon, ChevronDownIcon, HomeIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { Database } from '@/lib/database.types'
import Link from 'next/link'

interface Image {
  id: string
  url: string
  title?: string
  tags: string[] | null
  views: number
  description: string | null
}

interface Tag {
  id: string
  name: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export default function AdminPage() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingImage, setEditingImage] = useState<Image | null>(null)
  const [tags, setTags] = useState<Tag[]>([])
  const [newTag, setNewTag] = useState('')
  const [showTags, setShowTags] = useState(true)
  
  // Form states
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [editSelectedTags, setEditSelectedTags] = useState<string[]>([])

  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    checkAuth()
    fetchImages()
    fetchTags()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setImages(data || [])
    } catch (error) {
      console.error('Error fetching images:', error)
      setError(error instanceof Error ? error.message : 'Error fetching images')
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      
      // Validate file types and sizes
      const invalidFiles = fileList.filter(file => 
        !ALLOWED_FILE_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE
      );

      if (invalidFiles.length > 0) {
        setError('Invalid files detected. Please ensure all files are images under 5MB.');
        e.target.value = '';
        return;
      }

      setFiles(e.target.files);
      setError(null);
    }
  }

  const handleUpload = async () => {
    if (!files) return;

    setUploading(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Additional validation
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          throw new Error(`Invalid file type: ${file.type}`);
        }
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`File too large: ${file.name}`);
        }

        // Generate a secure random filename
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const randomName = crypto.randomUUID();
        const fileName = `${randomName}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('stickers')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`Upload error: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('stickers')
          .getPublicUrl(fileName)

        const { error: dbError } = await supabase
          .from('images')
          .insert({
            url: publicUrl,
            tags: selectedTags.length > 0 ? selectedTags : null
          })

        if (dbError) {
          throw new Error(`Database error: ${dbError.message}`)
        }
      }

      alert('Upload successful!')
      setFiles(null)
      setSelectedTags([])
      fetchImages()
    } catch (error) {
      console.error('Error uploading files:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (image: Image) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      // Extract filename from URL
      const fileName = image.url.split('/').pop()
      if (!fileName) throw new Error('Invalid file URL')

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('stickers')
        .remove([fileName])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('images')
        .delete()
        .eq('id', image.id)

      if (dbError) throw dbError

      // Update local state
      setImages(images.filter(img => img.id !== image.id))
      alert('Image deleted successfully')
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Error deleting image')
    }
  }

  const handleEdit = (image: Image) => {
    setEditingImage(image)
    setEditSelectedTags(image.tags || [])
  }

  const handleSaveEdit = async () => {
    if (!editingImage) return

    try {
      const { error } = await supabase
        .from('images')
        .update({
          tags: editSelectedTags.length > 0 ? editSelectedTags : null,
          description: editingImage.description
        })
        .eq('id', editingImage.id)

      if (error) throw error

      // Update local state
      setImages(images.map(img => 
        img.id === editingImage.id 
          ? { 
              ...img, 
              tags: editSelectedTags.length > 0 ? editSelectedTags : null,
              description: editingImage.description
            }
          : img
      ))

      setEditingImage(null)
      alert('Image updated successfully')
    } catch (error) {
      console.error('Error updating image:', error)
      alert('Error updating image')
    }
  }

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    // Sanitize and validate tag name
    const sanitizedTag = newTag.trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with hyphens
      .replace(/-+/g, '-')         // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '');      // Remove leading/trailing hyphens

    if (!sanitizedTag) {
      alert('Please enter a valid tag name using letters, numbers, and hyphens');
      return;
    }

    if (sanitizedTag.length > 50) {
      alert('Tag name is too long (maximum 50 characters)');
      return;
    }

    if (tags.some(tag => tag.name === sanitizedTag)) {
      alert('This tag already exists');
      return;
    }

    try {
      const { error } = await supabase
        .from('tags')
        .insert({ name: sanitizedTag });

      if (error) throw error;

      fetchTags(); // Refresh tags list
      setNewTag('');
    } catch (error) {
      console.error('Error adding tag:', error);
      alert('Error adding tag');
    }
  }

  const handleDeleteTag = async (tagToDelete: string) => {
    if (!confirm(`Are you sure you want to delete the tag "${tagToDelete}"?`)) return

    try {
      // First, remove the tag from all images that have it
      const { data: images, error: fetchError } = await supabase
        .from('images')
        .select('*')
        .filter('tags', 'cs', `{"${tagToDelete}"}`)

      if (fetchError) throw fetchError

      // Update each image that has this tag
      for (const image of images) {
        const updatedTags = (image.tags || []).filter((tag: string) => tag !== tagToDelete)
        const { error: updateError } = await supabase
          .from('images')
          .update({ 
            tags: updatedTags.length > 0 ? updatedTags : null 
          })
          .eq('id', image.id)

        if (updateError) throw updateError
      }

      // Delete the tag from the tags table
      const { error: deleteError } = await supabase
        .from('tags')
        .delete()
        .eq('name', tagToDelete)

      if (deleteError) throw deleteError

      // Update local state
      setTags(prevTags => prevTags.filter(tag => tag.name !== tagToDelete))
      setImages(prevImages => prevImages.map(img => ({
        ...img,
        tags: img.tags?.filter(tag => tag !== tagToDelete) || null
      })))
    } catch (error) {
      console.error('Error deleting tag:', error)
      alert('Error deleting tag')
    }
  }

  const toggleTag = (tagName: string, isEditing: boolean = false) => {
    if (isEditing) {
      setEditSelectedTags(prev => 
        prev.includes(tagName) 
          ? prev.filter(t => t !== tagName)
          : [...prev, tagName]
      )
    } else {
      setSelectedTags(prev => 
        prev.includes(tagName) 
          ? prev.filter(t => t !== tagName)
          : [...prev, tagName]
      )
    }
  }

  const renderTags = () => {
    return tags.map((tag: Tag) => (
      <div
        key={tag.id}
        className="group relative inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700"
      >
        {tag.name}
        <button
          onClick={() => handleDeleteTag(tag.name)}
          className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with logout button */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Link 
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center gap-2"
            >
              <HomeIcon className="h-5 w-5" />
              Home
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Upload Section */}
        <div className="bg-white shadow sm:rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Upload Images</h2>
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
            />
            
            {/* Tag Selection */}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.name)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTags.includes(tag.name)
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>

            <button
              onClick={handleUpload}
              disabled={!files || uploading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                !files || uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
              }`}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>

        {/* Tag Management Section */}
        <div className="bg-white shadow sm:rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Manage Tags</h2>
            <button
              onClick={() => setShowTags(!showTags)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showTags ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {showTags && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="New tag name"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Add Tag
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {renderTags()}
              </div>
            </div>
          )}
        </div>

        {/* Images Grid */}
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Uploaded Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                  <Image
                    src={image.url}
                    alt=""
                    width={300}
                    height={300}
                    className="object-cover"
                  />
                </div>
                
                {/* Image Actions */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50">
                  <button
                    onClick={() => handleEdit(image)}
                    className="p-2 text-white hover:text-gray-200 mx-2"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(image)}
                    className="p-2 text-white hover:text-gray-200 mx-2"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Tags Display */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {image.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Modal */}
        {editingImage && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Edit Image</h3>
                <button
                  onClick={() => setEditingImage(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Description Input */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={editingImage.description || ''}
                    onChange={(e) => setEditingImage({...editingImage, description: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter a description for this image..."
                  />
                </div>

                {/* Tag Selection in Edit Modal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.name, true)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          editSelectedTags.includes(tag.name)
                            ? 'bg-gray-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveEdit}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 