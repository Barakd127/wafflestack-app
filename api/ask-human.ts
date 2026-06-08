/**
 * Vercel Edge Function: /api/ask-human
 *
 * Relays an "🙋 שאל בן אדם" (Ask-a-Human) request to Barak by EMAIL, including
 * a screenshot of the question and the student's confusion/attempt.
 *
 * Wire protocol:
 *   POST { question, attempt, userId, topicId, screenshot }
 *     screenshot: a `data:image/png;base64,...` data URL (optional)
 *   Response: 200 { ok: true } on success.
 *
 * Email is sent via Resend (https://resend.com) REST API — no SDK, so it runs
 * on the edge runtime. Reads RESEND_API_KEY from the environment.
 *
 * ── SETUP (Barak, one-time) ─────────────────────────────────────────────────
 *   1. Create a free Resend account using Barakd127@gmail.com.
 *   2. Copy an API key from the Resend dashboard.
 *   3. In Vercel → Project → Settings → Environment Variables, add
 *      RESEND_API_KEY = <the key>  (Production + Preview), then redeploy.
 *   With the default `onboarding@resend.dev` sender, Resend only delivers to the
 *   account owner's own email — which is exactly Barakd127@gmail.com, so no
 *   domain verification is needed. To send from a custom domain later, verify it
 *   in Resend and change FROM below.
 */

export const config = { runtime: 'edge' }

const TO = 'Barakd127@gmail.com'
const FROM = 'WaffleStack <onboarding@resend.dev>'

interface AskBody {
  question?: string
  attempt?: string | null
  userId?: string | null
  topicId?: string | null
  screenshot?: string | null // data:image/png;base64,...
}

function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string),
  )
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const apiKey = (globalThis as unknown as { process?: { env?: Record<string, string> } })
    .process?.env?.RESEND_API_KEY
  if (!apiKey) return new Response('Missing RESEND_API_KEY', { status: 500 })

  let body: AskBody
  try {
    body = (await req.json()) as AskBody
  } catch {
    return new Response('Bad JSON', { status: 400 })
  }

  const question = (body.question ?? '').trim()
  const attempt = (body.attempt ?? '').toString().trim()
  const userId = (body.userId ?? '').toString().trim()
  const topicId = (body.topicId ?? '').toString().trim()
  const shot = typeof body.screenshot === 'string' ? body.screenshot : ''

  const attachments: { filename: string; content: string }[] = []
  if (shot.startsWith('data:image')) {
    const base64 = shot.slice(shot.indexOf(',') + 1)
    if (base64) attachments.push({ filename: 'question.png', content: base64 })
  }

  const html = `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;color:#1F2640;line-height:1.6">
    <h2 style="color:#254A9F">🙋 בקשת עזרה מתלמיד</h2>
    <p><b>משתמש:</b> ${esc(userId) || '—'}</p>
    <p><b>נושא:</b> ${esc(topicId) || '—'}</p>
    <p><b>השאלה:</b><br>${esc(question) || '—'}</p>
    <p><b>מה התלמיד לא הבין / מה ניסה:</b><br>${esc(attempt) || '—'}</p>
    <p style="color:#6b7280">${attachments.length ? 'צילום מסך של השאלה מצורף למייל.' : '(לא צורף צילום מסך)'}</p>
  </div>`

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      subject: '🙋 שאל בן אדם — בקשת עזרה מתלמיד',
      html,
      attachments,
    }),
  })

  if (!r.ok) {
    const detail = await r.text().catch(() => '')
    return new Response(`Resend error: ${detail}`, { status: 502 })
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
