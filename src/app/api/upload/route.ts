import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string) || 'general'

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum 5MB' }, { status: 400 })
  }

  // Create a unique filename
  const ext = file.name.split('.').pop() ?? 'jpg'
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^.]+$/, '')
  const filePath = `${folder}/${timestamp}-${safeName}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { data, error } = await supabase.storage
    .from('site-images')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    console.error('[POST /api/upload]', error)
    return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 })
  }

  const { data: urlData } = supabase.storage
    .from('site-images')
    .getPublicUrl(data.path)

  return NextResponse.json({
    url: urlData.publicUrl,
    path: data.path,
  })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { path } = await request.json()
  if (!path) return NextResponse.json({ error: 'Path required' }, { status: 400 })

  const { error } = await supabase.storage
    .from('site-images')
    .remove([path])

  if (error) {
    console.error('[DELETE /api/upload]', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
