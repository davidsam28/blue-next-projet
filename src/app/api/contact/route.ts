import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'
import { rateLimit } from '@/lib/rate-limit'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    const { success: allowed } = rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const body = await request.json()
    const { name, email, subject, message } = body

    // Server-side validation
    if (!name?.trim() || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }
    if (!subject?.trim()) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
    }
    if (!message?.trim() || message.trim().length < 20) {
      return NextResponse.json({ error: 'Message must be at least 20 characters' }, { status: 400 })
    }

    const safeName = escapeHtml(name.trim())
    const safeEmail = escapeHtml(email.trim())
    const safeSubject = escapeHtml(subject.trim())
    const safeMessage = escapeHtml(message.trim())

    const contactEmail = process.env.ADMIN_EMAIL ?? 'contact@bluenextprojet.org'

    const result = await sendEmail({
      to: contactEmail,
      subject: `[Contact Form] ${safeSubject} — from ${safeName}`,
      replyTo: email,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #001A80; padding: 24px; border-radius: 8px 8px 0 0;">
            <h2 style="color: #ffffff; margin: 0; font-size: 18px;">New Contact Form Submission</h2>
          </div>
          <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #001A80; width: 100px;">Name</td>
                <td style="padding: 8px 0; color: #404040;">${safeName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #001A80;">Email</td>
                <td style="padding: 8px 0;"><a href="mailto:${safeEmail}" style="color: #0033FF;">${safeEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #001A80;">Subject</td>
                <td style="padding: 8px 0; color: #404040;">${safeSubject}</td>
              </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 16px 0;" />
            <h3 style="color: #001A80; margin: 0 0 12px;">Message</h3>
            <p style="color: #404040; line-height: 1.7; white-space: pre-wrap; margin: 0;">${safeMessage}</p>
          </div>
        </div>
      `,
    })

    if (!result.success) {
      // Still return 200 if email fails — log it, don't fail the user
      console.error('[contact] Email failed:', result.error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/contact]', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
