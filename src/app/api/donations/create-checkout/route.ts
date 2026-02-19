import { NextRequest, NextResponse } from 'next/server'
import { getStripe, formatAmountForStripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, firstName, lastName, email, isRecurring, frequency, message } = body

    if (!amount || typeof amount !== 'number' || amount < 1) {
      return NextResponse.json({ error: 'Invalid donation amount' }, { status: 400 })
    }
    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const stripe = getStripe()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const amountInCents = formatAmountForStripe(amount)

    const commonMetadata: Record<string, string> = {
      donor_first_name: firstName,
      donor_last_name: lastName,
      donor_email: email,
      message: message ?? '',
      is_recurring: isRecurring ? 'true' : 'false',
      frequency: frequency ?? '',
    }

    if (isRecurring) {
      const intervalMap: Record<string, 'month' | 'year'> = {
        monthly: 'month',
        quarterly: 'month',
        annually: 'year',
      }
      const intervalCountMap: Record<string, number> = {
        monthly: 1,
        quarterly: 3,
        annually: 1,
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: email,
        metadata: commonMetadata,
        success_url: `${appUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/donate`,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Donation — Blue Next Projet',
                description: `Recurring ${frequency ?? 'monthly'} donation to support trauma-informed media arts.`,
              },
              unit_amount: amountInCents,
              recurring: {
                interval: intervalMap[frequency ?? 'monthly'] ?? 'month',
                interval_count: intervalCountMap[frequency ?? 'monthly'] ?? 1,
              },
            },
            quantity: 1,
          },
        ],
      })

      return NextResponse.json({ sessionId: session.id, url: session.url })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      metadata: commonMetadata,
      success_url: `${appUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/donate`,
      payment_intent_data: {
        metadata: commonMetadata,
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Donation — Blue Next Projet',
              description: 'One-time donation to support trauma-informed media arts programming.',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (err) {
    console.error('[create-checkout]', err)
    const msg = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
