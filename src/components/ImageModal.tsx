'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect } from 'react'
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { Image as ImageType } from '../types/image'

interface ImageModalProps {
  image: ImageType
  onClose: () => void
}

export default function ImageModal({ image, onClose }: ImageModalProps) {
  useEffect(() => {
    // Increment view count when modal opens
    const incrementViews = async () => {
      try {
        const { error } = await supabase
          .from('images')
          .update({ views: image.views + 1 })
          .eq('id', image.id)
        
        if (error) throw error
      } catch (error) {
        console.error('Error incrementing views:', error)
      }
    }

    incrementViews()
  }, [image.id])

  const handleDownload = async () => {
    const response = await fetch(image.url)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'crypto-sticker.png'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="absolute right-4 top-4">
                  <button
                    type="button"
                    className="rounded-full bg-white p-2 text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="relative aspect-square">
                    <Image
                      src={image.url}
                      alt="Sticker"
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 1024px) 90vw, 1024px"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                    onClick={handleDownload}
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Download
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 