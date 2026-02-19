import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify user has admin privileges (extra safety beyond middleware)
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && user.email !== adminEmail) {
    return NextResponse.json({ error: 'Forbidden — admin access required' }, { status: 403 })
  }

  const body = await request.json()
  const { donorIds, subject, htmlBody, sendToAll } = body

  if (!subject?.trim()) {
    return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
  }
  if (!htmlBody?.trim()) {
    return NextResponse.json({ error: 'Email body is required' }, { status: 400 })
  }

  const adminClient = await createAdminClient()

  // Get recipients
  let recipients: { id: string; email: string; first_name: string }[] = []

  if (sendToAll) {
    const { data } = await adminClient
      .from('donors')
      .select('id, email, first_name')
      .not('email', 'is', null)
    recipients = data ?? []
  } else if (Array.isArray(donorIds) && donorIds.length > 0) {
    const { data } = await adminClient
      .from('donors')
      .select('id, email, first_name')
      .in('id', donorIds)
      .not('email', 'is', null)
    recipients = data ?? []
  }

  if (recipients.length === 0) {
    return NextResponse.json({ error: 'No valid recipients found' }, { status: 400 })
  }

  const results = { sent: 0, failed: 0, errors: [] as string[] }

  for (const recipient of recipients) {
    if (!recipient.email) continue

    // Personalize body
    const personalizedHtml = htmlBody
      .replace(/\{\{first_name\}\}/g, recipient.first_name ?? 'Friend')
      .replace(/\{\{name\}\}/g, recipient.first_name ?? 'Friend')

    const result = await sendEmail({
      to: recipient.email,
      subject,
      html: personalizedHtml,
    })

    // Log each attempt
    await adminClient.from('admin_email_log').insert({
      sent_by: user.id,
      recipient_email: recipient.email,
      recipient_donor_id: recipient.id,
      subject,
      body: personalizedHtml,
      status: result.success ? 'sent' : 'failed',
    })

    if (result.success) {
      results.sent++
    } else {
      results.failed++
      results.errors.push(`${recipient.email}: ${result.error}`)
    }
  }

  return NextResponse.json({ success: true, results })
}
