import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
const defaultFrom = process.env.EMAIL_FROM || 'no-reply@example.com'

let resend: Resend | null = null

if (apiKey) {
  resend = new Resend(apiKey)
} else {
  console.warn('RESEND_API_KEY not set. Email service will not work.')
}

export async function send(to: string | string[], subject: string, html?: string, text?: string, options?: {
  from?: string
  replyTo?: string
  attachments?: Array<{ filename: string; content: string }>
}): Promise<void> {
  if (!resend) {
    console.warn('Email service is not configured. Email sending skipped.')
    return
  }

  const recipients = Array.isArray(to) ? to : [to]

  const emailData: any = {
    from: options?.from || defaultFrom,
    to: recipients,
    subject,
  }

  if (html) emailData.html = html
  if (text) emailData.text = text
  if (options?.replyTo) emailData.replyTo = options.replyTo
  if (options?.attachments) emailData.attachments = options.attachments

  await resend.emails.send(emailData)
}
