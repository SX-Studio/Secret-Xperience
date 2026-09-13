import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MAIL_FROM } from '../../lib/mail-from'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error: dbErr } = await supabase.from('contact_messages').insert({
    name,
    email,
    subject: subject || 'General enquiry',
    message,
  })
  if (dbErr) console.error('[contact] db insert failed:', dbErr.message)

  // Send email via Resend
  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    const safeName    = esc(String(name))
    const safeEmail   = esc(String(email))
    const safeSubject = esc(String(subject || 'General enquiry'))
    const safeMessage = esc(String(message))

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: ['support@secretxperience.eu'],
        reply_to: email,
        subject: `[Contact] ${safeSubject} — ${safeName}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2 style="color:#c5a05a;margin:0 0 16px">New Contact Message</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
              <tr><td style="padding:8px 0;color:#888;width:100px">From</td><td style="padding:8px 0"><strong>${safeName}</strong> &lt;${safeEmail}&gt;</td></tr>
              <tr><td style="padding:8px 0;color:#888">Subject</td><td style="padding:8px 0">${safeSubject}</td></tr>
            </table>
            <div style="background:#f5f5f5;border-radius:8px;padding:16px;white-space:pre-wrap;color:#333">${safeMessage}</div>
            <p style="color:#999;font-size:12px;margin-top:20px">Reply directly to this email to respond to ${safeName}.</p>
          </div>
        `,
      }),
    })
  } else {
    console.log('[Contact form]', { name, email, subject, message })
  }

  return NextResponse.json({ ok: true })
}
