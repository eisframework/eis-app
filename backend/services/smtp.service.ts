import nodemailer from 'nodemailer'

const host = process.env.SMTP_HOST
const port = Number(process.env.SMTP_PORT) || 587
const secure = (process.env.SMTP_SECURE || 'false') === 'true'
const user = process.env.SMTP_USER
const pass = process.env.SMTP_PASS
const defaultFrom = process.env.EMAIL_FROM || 'no-reply@example.com'

if (!host || !user || !pass) {
  console.warn('SMTP_HOST, SMTP_USER, and SMTP_PASS not set. Email service will not work.')
}

const transporter = host && user && pass ? nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user,
    pass,
  },
}) : null

export async function send(to: string | string[], subject: string, html?: string, text?: string, options?: {
  from?: string
  replyTo?: string
  attachments?: Array<{ filename: string; content: string | Buffer }>
}): Promise<void> {
  if (!transporter) {
    throw new Error('SMTP configuration is incomplete')
  }

  const recipients = Array.isArray(to) ? to : [to]

  await transporter.sendMail({
    from: options?.from || defaultFrom,
    to: recipients,
    subject,
    html,
    text,
    replyTo: options?.replyTo,
    attachments: options?.attachments,
  })
}
