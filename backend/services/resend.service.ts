import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
const defaultFrom = process.env.EMAIL_FROM || 'no-reply@example.com'

if (!apiKey) {
  console.warn('RESEND_API_KEY not set. Email service will not work.')
}

const resend = new Resend(apiKey || '')

export async function send(to: string | string[], subject: string, html?: string, text?: string, options?: {
  from?: string
  replyTo?: string
  attachments?: Array<{ filename: string; content: string }>
}): Promise<void> {
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is required')
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
