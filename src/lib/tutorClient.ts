/**
 * tutorClient.ts — browser-side streaming client for /api/tutor/chat.
 *
 * Wraps fetch + SSE parsing. Calls onDelta(textChunk) for each incremental
 * text token from the model, then resolves when the stream finishes.
 */

import type { TutorMessage } from '../store/tutorStore'
import type {
  TutorProfile,
  TutorMSV,
  TutorTurnContext,
} from './tutorPrompt'

export interface TutorChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[]
  profile: TutorProfile
  msv: TutorMSV
  turn: TutorTurnContext
}

export interface TutorChatCallbacks {
  onDelta: (chunk: string) => void
  onDone: () => void
  onError: (err: Error) => void
  signal?: AbortSignal
}

export async function streamTutorChat(
  req: TutorChatRequest,
  cb: TutorChatCallbacks,
): Promise<void> {
  try {
    const res = await fetch('/api/tutor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: cb.signal,
    })
    if (!res.ok || !res.body) {
      const txt = await res.text().catch(() => '')
      throw new Error(`tutor/chat HTTP ${res.status}: ${txt.slice(0, 200)}`)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    // SSE frame: lines starting with "data: ", terminated by blank line.
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const frames = buffer.split('\n\n')
      buffer = frames.pop() ?? ''
      for (const frame of frames) {
        const line = frame.split('\n').find((l) => l.startsWith('data:'))
        if (!line) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const obj = JSON.parse(payload) as { type?: string; delta?: string; error?: string }
          if (obj.error) throw new Error(obj.error)
          if (obj.type === 'delta' && typeof obj.delta === 'string') {
            cb.onDelta(obj.delta)
          }
        } catch (parseErr) {
          // ignore malformed SSE frames; surface only fatal
          if ((parseErr as Error).message.startsWith('tutor/')) throw parseErr
        }
      }
    }
    cb.onDone()
  } catch (err) {
    cb.onError(err instanceof Error ? err : new Error(String(err)))
  }
}

/** Convert tutorStore messages into the wire format the edge fn expects. */
export function toWireMessages(
  msgs: TutorMessage[],
): { role: 'user' | 'assistant'; content: string }[] {
  // Cap to last 20 to match localStorage retention
  return msgs.slice(-20).map((m) => ({ role: m.role, content: m.content }))
}
