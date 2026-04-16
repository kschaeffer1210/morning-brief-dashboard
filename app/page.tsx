'use client'

import { useEffect, useRef, useState } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────

interface BriefSection {
  title: string
  items: string[]
}

interface Brief {
  date: string
  greeting?: string
  sections: BriefSection[]
  summary?: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function useTime() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

function pad(n: number) { return String(n).padStart(2, '0') }

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ section }: { section: BriefSection }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-3">
      <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-muted">
        {section.title}
      </span>
      <ul className="flex flex-col gap-2">
        {section.items.map((item, i) => (
          <li key={i} className="flex gap-2.5 items-start">
            <span className="mt-[6px] w-1 h-1 rounded-full bg-pink-dim flex-shrink-0" />
            <span className="text-[13px] font-light text-text-dim leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <span className="text-4xl">☀️</span>
      <p className="text-sm text-muted font-light">No brief available yet.</p>
      <p className="text-xs text-muted/60 font-light max-w-xs leading-relaxed">
        POST a brief payload to <code className="bg-border px-1.5 py-0.5 rounded text-text-dim">/api/ingest</code> to populate this dashboard.
      </p>
      <button
        onClick={onRefresh}
        className="mt-2 text-xs text-pink border border-border px-4 py-2 rounded-lg hover:border-pink-dim transition-colors"
      >
        Check again
      </button>
    </div>
  )
}

function ChatPanel({ brief }: { brief: Brief | null }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    const next: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, brief }),
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Something went wrong. Try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface flex flex-col h-full min-h-[420px]">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-muted">Ask the Brief</span>
        <span className="w-2 h-2 rounded-full bg-pink animate-pulse-dot" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-xs text-muted font-light italic text-center mt-6">
            Ask anything about today's brief…
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-[12px] leading-relaxed font-light ${
              m.role === 'user'
                ? 'bg-pink-glow text-pink border border-pink-dim/30'
                : 'bg-border/50 text-text-dim'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-border/50 rounded-xl px-3.5 py-2.5 flex gap-1 items-center">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted animate-shimmer" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 pb-4">
        <div className="flex gap-2 items-center border border-border rounded-xl px-3 py-2 focus-within:border-pink-dim/50 transition-colors">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask anything…"
            className="flex-1 bg-transparent text-[12px] text-text-dim placeholder:text-muted/50 outline-none font-light"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="text-pink text-[11px] font-medium disabled:opacity-30 hover:text-pink-dim transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const now = useTime()
  const h = now.getHours()
  const mins = pad(now.getMinutes())
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  const [brief, setBrief] = useState<Brief | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  async function fetchBrief() {
    setLoading(true); setNotFound(false)
    try {
      const res = await fetch('/api/brief')
      if (res.status === 404) { setNotFound(true); setBrief(null) }
      else { const data = await res.json(); setBrief(data) }
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    await fetchBrief()
    setTimeout(() => setRefreshing(false), 800)
  }

  useEffect(() => { fetchBrief() }, [])

  return (
    <div className="min-h-screen bg-bg flex flex-col animate-fadein">

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-border">
        <div>
          <h1 className="text-xl font-medium text-[#e8e3de] tracking-tight">
            {greeting},{' '}
            <span className="bg-gradient-to-r from-pink to-[#e8c5c1] bg-clip-text text-transparent">Kelly</span>
            <span className="text-muted">.</span>
          </h1>
          <p className="text-xs text-text-dim mt-0.5">{dateStr}</p>
        </div>

        <span className="text-[10px] font-bold tracking-[0.5em] uppercase text-muted/40">Morning Brief</span>

        <div className="flex items-center gap-5">
          <div className="text-3xl font-extralight tracking-tight text-pink tabular-nums">
            {h12}:{mins}{' '}
            <span className="text-sm text-pink-dim font-light">{period}</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-border text-muted text-xs hover:border-pink-dim hover:text-pink transition-all disabled:opacity-40"
          >
            <svg
              className={`w-3 h-3 ${refreshing ? 'animate-spin-slow' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-8 py-6 max-w-[1400px] w-full mx-auto">

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-36 rounded-2xl bg-surface border border-border animate-shimmer" />
            ))}
          </div>
        )}

        {/* Not found */}
        {!loading && notFound && <EmptyState onRefresh={handleRefresh} />}

        {/* Brief content */}
        {!loading && brief && (
          <div className="flex flex-col gap-6">

            {/* Summary banner */}
            {brief.summary && (
              <div className="rounded-2xl border border-pink-dim/20 bg-pink-glow px-6 py-4">
                <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-pink-dim block mb-1.5">
                  Today's Summary
                </span>
                <p className="text-sm font-light text-[#e8e3de]/80 leading-relaxed">{brief.summary}</p>
              </div>
            )}

            {/* Two-column: sections + chat */}
            <div className="grid grid-cols-[1fr_380px] gap-6 items-start">

              {/* Section cards grid */}
              <div className="grid grid-cols-2 gap-4">
                {brief.sections.map((s, i) => (
                  <SectionCard key={i} section={s} />
                ))}
              </div>

              {/* Chat panel */}
              <div className="sticky top-6">
                <ChatPanel brief={brief} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-8 py-3 flex justify-center">
        <span className="text-[10px] text-muted/40 tracking-widest uppercase">
          Morning Brief · {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
      </footer>
    </div>
  )
}
