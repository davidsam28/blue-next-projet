import { NextRequest, NextResponse } from 'next/server'
import { getStripe, getWebhookSecret } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { sendEmail, donationReceiptHtml, FROM_NAME } from '@/lib/resend'
import { formatDate } from '@/lib/utils'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, getWebhookSecret())
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session, supabase)
        break
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoiceSucceeded(invoice, supabase)
        break
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailed(pi, supabase)
        break
      }
      default:
        break
    }
  } catch (err) {
    console.error(`[stripe-webhook] Error handling ${event.type}:`, err)
    return NextResponse.json({ error: 'Processing error', received: true }, { status: 200 })
  }

  return NextResponse.json({ received: true })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAdmin = any

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: SupabaseAdmin,
) {
  const meta = session.metadata ?? {}
  const firstName = meta.donor_first_name ?? ''
  const lastName = meta.donor_last_name ?? ''
  const email = meta.donor_email ?? session.customer_email ?? ''
  const amountTotal = session.amount_total ? session.amount_total / 100 : 0
  const isRecurring = meta.is_recurring === 'true'

  // For subscriptions, the first payment fires invoice.payment_succeeded — skip here
  if (isRecurring && session.mode === 'subscription') return

  let donorId: string | null = null
  if (email) {
    const { data: existingDonor } = await supabase
      .from('donors')
      .select('id')
      .eq('email', email)
      .single()

    if (existingDonor) {
      donorId = existingDonor.id
    } else {
      const { data: newDonor } = await supabase
        .from('donors')
        .insert({
          first_name: firstName,
          last_name: lastName || 'Unknown',
          email,
          stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
        })
        .select('id')
        .single()
      donorId = newDonor?.id ?? null
    }
  }

  await supabase.from('donation_records').insert({
    donor_id: donorId,
    amount: amountTotal,
    source: 'stripe',
    status: 'completed',
    stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    notes: meta.message || null,
    donation_date: new Date().toISOString(),
  })

  if (email) {
    await sendEmail({
      to: email,
      subject: `Thank you for your donation to ${FROM_NAME}!`,
      html: donationReceiptHtml({
        firstName: firstName || 'Friend',
        amount: amountTotal,
        source: 'Credit / Debit Card',
        date: formatDate(new Date().toISOString()),
        orgName: FROM_NAME,
      }),
    })
  }
}

async function handleInvoiceSucceeded(
  invoice: Stripe.Invoice,
  supabase: SupabaseAdmin,
) {
  const amountPaid = invoice.amount_paid / 100
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : null

  let donorId: string | null = null
  let donorEmail: string | null = invoice.customer_email ?? null
  let donorFirstName = 'Friend'

  if (customerId) {
    const { data } = await supabase
      .from('donors')
      .select('id, first_name, email')
      .eq('stripe_customer_id', customerId)
      .single()

    if (data) {
      donorId = data.id
      donorEmail = data.email
      donorFirstName = data.first_name
    }
  }

  await supabase.from('donation_records').insert({
    donor_id: donorId,
    amount: amountPaid,
    source: 'stripe',
    status: 'completed',
    stripe_payment_intent_id: invoice.id,
    notes: 'Recurring donation',
    donation_date: new Date().toISOString(),
  })

  if (donorEmail) {
    await sendEmail({
      to: donorEmail,
      subject: `Recurring donation receipt — ${FROM_NAME}`,
      html: donationReceiptHtml({
        firstName: donorFirstName,
        amount: amountPaid,
        source: 'Credit / Debit Card (Recurring)',
        date: formatDate(new Date().toISOString()),
        orgName: FROM_NAME,
      }),
    })
  }
}

async function handlePaymentFailed(
  pi: Stripe.PaymentIntent,
  supabase: SupabaseAdmin,
) {
  const { data: existing } = await supabase
    .from('donation_records')
    .select('id')
    .eq('stripe_payment_intent_id', pi.id)
    .single()

  if (existing) {
    await supabase
      .from('donation_records')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', existing.id)
  }
}
