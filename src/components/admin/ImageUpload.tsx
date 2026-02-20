'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  folder?: string
  label?: string
  aspectRatio?: string
  className?: string
}

export function ImageUpload({ value, onChange, folder = 'general', label, aspectRatio = 'aspect-video', className = '' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Upload failed')
      }
      const { url } = await res.json()
      onChange(url)
      toast.success('Image uploaded!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    e.target.value = ''
  }

  return (
    <div className={className}>
      {label && <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>}

      {value ? (
        <div className={`relative ${aspectRatio} rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group`}>
          <Image src={value} alt="Uploaded image" fill className="object-cover" sizes="400px" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/90 hover:bg-white text-gray-900 text-xs"
              >
                <Upload className="h-3 w-3 mr-1" />
                Replace
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onChange('')}
                className="bg-white/90 hover:bg-white text-red-600 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`relative ${aspectRatio} rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
            dragOver ? 'border-[#0033FF] bg-[#E6EBFF]' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-[#0033FF]" />
                <span className="text-sm font-medium text-[#0033FF]">Uploading...</span>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8" />
                <span className="text-sm font-medium">Drop image or click to upload</span>
                <span className="text-xs text-gray-300">JPEG, PNG, WebP up to 5MB</span>
              </>
            )}
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* URL input alternative */}
      <div className="mt-2">
        {showUrlInput ? (
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="text-xs h-8"
            />
            <Button
              size="sm"
              className="h-8 text-xs bg-[#0033FF] text-white"
              onClick={() => {
                if (urlInput.trim()) {
                  try {
                    const parsed = new URL(urlInput.trim())
                    if (parsed.protocol !== 'https:') {
                      toast.error('Only HTTPS URLs are allowed')
                      return
                    }
                  } catch {
                    toast.error('Invalid URL')
                    return
                  }
                  onChange(urlInput.trim())
                  setUrlInput('')
                  setShowUrlInput(false)
                }
              }}
            >
              Set
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setShowUrlInput(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <button
            type="button"
            className="text-xs text-gray-400 hover:text-[#0033FF] transition-colors"
            onClick={() => setShowUrlInput(true)}
          >
            Or paste image URL
          </button>
        )}
      </div>
    </div>
  )
}
