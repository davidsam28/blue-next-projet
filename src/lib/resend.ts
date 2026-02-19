import { Resend } from 'resend'

// Lazy singleton — avoids build-time crash when env vars aren't set
let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set')
    }
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

export const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@bluenextprojet.org'
export const FROM_NAME = process.env.FROM_NAME || 'Blue Next Projet'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email disabled] Would have sent:', { to, subject })
    return { success: false, error: 'Email not configured' }
  }

  try {
    const resend = getResend()
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    })

    if (error) return { success: false, error: error.message }
    return { success: true, data }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export function donationReceiptHtml(params: {
  firstName: string
  amount: number
  source: string
  date: string
  orgName: string
}) {
  const { firstName, amount, source, date, orgName } = params
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background:#f4f4f4; margin:0; padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4; padding:40px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
            <tr>
              <td style="background:#0033FF; padding:32px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size:24px; font-weight:700;">${orgName}</h1>
                <p style="color:#E6EBFF; margin:8px 0 0 0; font-size:14px;">Donation Receipt</p>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 32px;">
                <h2 style="color:#001A80; margin:0 0 16px 0;">Thank you, ${firstName}!</h2>
                <p style="color:#404040; line-height:1.6;">Your generous donation makes our work in Trauma Informed Media Arts possible. This email serves as your official receipt.</p>
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#E6EBFF; border-radius:6px; margin:24px 0;">
                  <tr><td style="padding:20px;">
                    <table width="100%">
                      <tr>
                        <td style="color:#001A80; font-weight:600; padding:4px 0;">Amount</td>
                        <td style="color:#0033FF; font-weight:700; font-size:24px; text-align:right;">$${amount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="color:#001A80; font-weight:600; padding:4px 0;">Method</td>
                        <td style="color:#404040; text-align:right; text-transform:capitalize;">${source}</td>
                      </tr>
                      <tr>
                        <td style="color:#001A80; font-weight:600; padding:4px 0;">Date</td>
                        <td style="color:#404040; text-align:right;">${date}</td>
                      </tr>
                    </table>
                  </td></tr>
                </table>
                <p style="color:#404040; line-height:1.6;">${orgName} is a registered nonprofit organization. Your donation may be tax-deductible to the extent permitted by law. Please consult your tax advisor.</p>
                <p style="color:#CCCCCC; font-size:12px; margin-top:32px;">If you have questions, please contact us at <a href="mailto:${FROM_EMAIL}" style="color:#0033FF;">${FROM_EMAIL}</a></p>
              </td>
            </tr>
            <tr>
              <td style="background:#F2F2F2; padding:20px 32px; text-align:center;">
                <p style="color:#CCCCCC; font-size:12px; margin:0;">&copy; ${new Date().getFullYear()} ${orgName}. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `
}
