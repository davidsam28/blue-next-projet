import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { sendEmail, FROM_NAME } from '@/lib/resend'

// GET /api/enrollments — admin: list all enrollments with search/filter
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const status = searchParams.get('status')
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') ?? '100') || 100, 1), 500)
  const offset = Math.max(parseInt(searchParams.get('offset') ?? '0') || 0, 0)

  let query = supabase
    .from('enrollments')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
    )
  }

  const { data, count, error } = await query

  if (error) {
    console.error('[GET /api/enrollments]', error)
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 })
  }

  return NextResponse.json({ data, count })
}

// POST /api/enrollments — public: submit enrollment application
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 per hour per IP
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    const { success: allowed } = rateLimit(`enrollment:${ip}`, 3, 60 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Honeypot check — bots fill hidden fields, real users don't
    if (body.website) {
      return NextResponse.json({ data: {} }, { status: 201 })
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      age,
      school,
      address,
      city,
      state,
      zip,
      interests,
      experience_level,
      social_links,
      music_links,
      how_heard,
      additional_notes,
    } = body

    // Server-side validation
    if (!first_name?.trim() || first_name.trim().length < 1) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 })
    }
    if (!last_name?.trim() || last_name.trim().length < 1) {
      return NextResponse.json({ error: 'Last name is required' }, { status: 400 })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 })
    }

    // Validate experience_level if provided
    const validLevels = ['none', 'beginner', 'intermediate', 'advanced']
    if (experience_level && !validLevels.includes(experience_level)) {
      return NextResponse.json({ error: 'Invalid experience level' }, { status: 400 })
    }

    // Validate age if provided
    const parsedAge = age ? parseInt(age) : null
    if (parsedAge !== null && (isNaN(parsedAge) || parsedAge < 5 || parsedAge > 120)) {
      return NextResponse.json({ error: 'Please enter a valid age' }, { status: 400 })
    }

    // Validate interests if provided
    const validInterests = [
      'Audio Production', 'Film', 'Photography', 'Music', 'Digital Media', 'Graphic Design',
    ]
    if (interests && Array.isArray(interests)) {
      const invalid = interests.filter((i: string) => !validInterests.includes(i))
      if (invalid.length > 0) {
        return NextResponse.json({ error: `Invalid interest(s): ${invalid.join(', ')}` }, { status: 400 })
      }
    }

    // Use the admin client for public INSERT (RLS allows anon INSERT, but we
    // use the regular client with anon key which handles this fine)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        age: parsedAge,
        school: school?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        zip: zip?.trim() || null,
        interests: interests?.length ? interests : null,
        experience_level: experience_level || null,
        social_links: social_links ?? {},
        music_links: music_links?.trim() || null,
        how_heard: how_heard?.trim() || null,
        additional_notes: additional_notes?.trim() || null,
        status: 'pending',
        reviewed_by: null,
        reviewed_at: null,
      })
      .select()
      .single()

    if (error) {
      console.error('[POST /api/enrollments]', error)
      return NextResponse.json({ error: 'Failed to submit enrollment' }, { status: 500 })
    }

    revalidatePath('/admin/enrollments')

    // Send admin notification email (non-blocking — don't fail the request if email fails)
    const adminEmail = process.env.ADMIN_EMAIL || 'bluenextproject@gmail.com'
    sendEmail({
      to: adminEmail,
      subject: `New Enrollment: ${first_name.trim()} ${last_name.trim()}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color: #0033FF;">New Enrollment Application</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 8px; font-weight: bold; color: #333;">Name</td><td style="padding: 8px;">${first_name.trim()} ${last_name.trim()}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold; color: #333;">Email</td><td style="padding: 8px;">${email.trim()}</td></tr>
            ${phone ? `<tr><td style="padding: 8px; font-weight: bold; color: #333;">Phone</td><td style="padding: 8px;">${phone.trim()}</td></tr>` : ''}
            ${parsedAge ? `<tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold; color: #333;">Age</td><td style="padding: 8px;">${parsedAge}</td></tr>` : ''}
            ${school ? `<tr><td style="padding: 8px; font-weight: bold; color: #333;">School</td><td style="padding: 8px;">${school.trim()}</td></tr>` : ''}
            ${interests?.length ? `<tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold; color: #333;">Interests</td><td style="padding: 8px;">${interests.join(', ')}</td></tr>` : ''}
            ${experience_level ? `<tr><td style="padding: 8px; font-weight: bold; color: #333;">Experience</td><td style="padding: 8px; text-transform: capitalize;">${experience_level}</td></tr>` : ''}
          </table>
          <p style="margin-top: 20px; color: #666;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://blue-next-projet.vercel.app'}/admin/enrollments" style="color: #0033FF;">View in Admin Panel</a>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 16px;">— ${FROM_NAME}</p>
        </div>
      `,
    }).catch((err) => console.error('[Enrollment notification email]', err))

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/enrollments] Unexpected error:', err)
    return NextResponse.json({ error: 'Failed to submit enrollment' }, { status: 500 })
  }
}
