'use client'

import { useEffect, useState } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────

interface CalendarEvent {
  time: string
  title: string
  attendees: string
  flag?: string | null
}

interface Email {
  from: string
  subject: string
  preview: string
  priority: boolean
  replied: boolean
}

interface NewsItem {
  headline: string
  source: string
  summary: string
}

interface Job {
  title: string
  company: string
  location: string
  fit: string
  link: string
}

interface Brief {
  date?: string
  summary?: string
  focus?: string
  calendar?: CalendarEvent[]
  emails?: Email[]
  news?: NewsItem[]
  jobs?: Job[]
}

// ── Constants ────────────────────────────────────────────────────────────────

const FLAG_COLORS: Record<string, string> = {
  prep: '#d4a5a0',
  priority: '#c97d77',
}

const TABS = ['summary', 'calendar', 'email', 'news', 'jobs'] as const
type Tab = typeof TABS[number]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MorningBrief() {
  const [brief, setBrief] = useState<Brief | null>(null)
  const [briefLoading, setBriefLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('summary')
  const [checkedEmails, setCheckedEmails] = useState<Record<number, boolean>>({})

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  // Fetch brief
  useEffect(() => {
    fetch('/api/brief')
      .then(r => r.ok ? r.json() : null)
      .then(data => { setBrief(data); setBriefLoading(false) })
      .catch(() => setBriefLoading(false))
  }, [])

  const toggleEmail = (i: number) =>
    setCheckedEmails(prev => ({ ...prev, [i]: !prev[i] }))

  const cal = brief?.calendar ?? []
  const emails = brief?.emails ?? []
  const news = brief?.news ?? []
  const jobs = brief?.jobs ?? []

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1c1a18',
      color: '#9a9590',
      fontFamily: "'Montserrat', sans-serif",
      position: 'relative',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1c1a18; }
        ::-webkit-scrollbar-thumb { background: #3a3633; border-radius: 2px; }
        .tab-btn { background: none; border: none; cursor: pointer; font-family: 'Montserrat', sans-serif; letter-spacing: 0.15em; font-size: 10px; font-weight: 600; text-transform: uppercase; padding: 8px 16px; transition: all 0.2s; }
        .tab-btn:hover { color: #d4a5a0; }
        .tab-active { color: #d4a5a0 !important; border-bottom: 1px solid #d4a5a0; }
        .tab-inactive { color: #4a4743; }
        .card { background: #242220; border: 1px solid #2e2c2a; padding: 20px; margin-bottom: 12px; position: relative; transition: border-color 0.2s; }
        .card:hover { border-color: #3a3633; }
        .flag { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; padding: 3px 8px; border: 1px solid; display: inline-block; }
        .job-link { color: #d4a5a0; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none; border-bottom: 1px solid #d4a5a066; padding-bottom: 1px; transition: border-color 0.2s; }
        .job-link:hover { border-color: #d4a5a0; }
        .checkbox-wrap { width: 16px; height: 16px; border: 1px solid #3a3633; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: border-color 0.2s; }
        .checkbox-wrap:hover { border-color: #d4a5a0; }
        .checkbox-checked { border-color: #d4a5a0; background: #d4a5a011; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        .pulse { animation: pulse 1.5s ease-in-out infinite; }
        @keyframes shimmer { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        .shimmer { animation: shimmer 1.4s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #2e2c2a', padding: '28px 40px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#4a4743', marginBottom: '6px' }}>
              ∿ &nbsp; AI Whispers Back
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: 300, color: '#f0ece6', lineHeight: 1, letterSpacing: '-0.01em' }}>
              Morning Brief
            </h1>
            <div style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#4a4743', marginTop: '6px', textTransform: 'uppercase' }}>
              {brief?.date ?? dateStr}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {TABS.map(t => (
            <button
              key={t}
              className={`tab-btn ${activeTab === t ? 'tab-active' : 'tab-inactive'}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '32px 40px', maxWidth: '900px' }}>

        {/* Loading skeleton */}
        {briefLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[180, 80, 80].map((h, i) => (
              <div key={i} className="shimmer" style={{ height: h, background: '#242220', border: '1px solid #2e2c2a' }} />
            ))}
          </div>
        )}

        {/* No brief yet */}
        {!briefLoading && !brief && (
          <div className="fade-in" style={{ paddingTop: '40px' }}>
            <div style={{ borderLeft: '2px solid #2e2c2a', paddingLeft: '20px', marginBottom: '32px' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 300, color: '#4a4743', lineHeight: 1.5, fontStyle: 'italic' }}>
                No brief available yet.
              </div>
              <div style={{ fontSize: '11px', color: '#3a3633', marginTop: '10px', letterSpacing: '0.08em' }}>
                POST a payload to /api/ingest to populate this dashboard.
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        {!briefLoading && brief && activeTab === 'summary' && (
          <div className="fade-in">
            <div style={{ borderLeft: '2px solid #d4a5a0', paddingLeft: '20px', marginBottom: '32px' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 300, color: '#f0ece6', lineHeight: 1.5, fontStyle: 'italic' }}>
                {brief.summary ?? 'No summary available.'}
              </div>
            </div>

            {brief.focus && (
              <div style={{ background: '#242220', border: '1px solid #2e2c2a', padding: '20px', marginBottom: '12px' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#d4a5a0', marginBottom: '10px', fontWeight: 600 }}>
                  Today's Focus
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', color: '#f0ece6', fontWeight: 400 }}>
                  {brief.focus}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '24px' }}>
              {[
                { label: 'Meetings', value: cal.length, sub: 'today' },
                { label: 'Unread Priority', value: emails.filter(e => e.priority).length, sub: 'emails' },
                { label: 'Job Leads', value: jobs.length, sub: 'new' },
              ].map(s => (
                <div key={s.label} style={{ background: '#242220', border: '1px solid #2e2c2a', padding: '20px' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4a4743', marginBottom: '8px', fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', color: '#f0ece6', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '10px', color: '#4a4743', marginTop: '4px' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar */}
        {!briefLoading && brief && activeTab === 'calendar' && (
          <div className="fade-in">
            <div style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4a4743', marginBottom: '20px', fontWeight: 600 }}>
              {cal.length} Events
            </div>
            {cal.length === 0 && (
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', color: '#4a4743', fontStyle: 'italic' }}>Nothing on the calendar.</div>
            )}
            {cal.map((ev, i) => (
              <div key={i} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#d4a5a0', marginBottom: '6px', fontWeight: 600 }}>{ev.time}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', color: '#f0ece6', marginBottom: '6px' }}>{ev.title}</div>
                    <div style={{ fontSize: '11px', color: '#4a4743' }}>{ev.attendees}</div>
                  </div>
                  {ev.flag && (
                    <span className="flag" style={{ color: FLAG_COLORS[ev.flag] ?? '#9a9590', borderColor: (FLAG_COLORS[ev.flag] ?? '#9a9590') + '44' }}>
                      {ev.flag}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Email */}
        {!briefLoading && brief && activeTab === 'email' && (
          <div className="fade-in">
            <div style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4a4743', marginBottom: '20px', fontWeight: 600 }}>
              Priority Inbox
            </div>
            {emails.length === 0 && (
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', color: '#4a4743', fontStyle: 'italic' }}>No emails in this brief.</div>
            )}
            {emails.map((em, i) => (
              <div key={i} className="card" style={{ opacity: checkedEmails[i] ? 0.4 : 1, transition: 'opacity 0.3s' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    className={`checkbox-wrap ${checkedEmails[i] ? 'checkbox-checked' : ''}`}
                    onClick={() => toggleEmail(i)}
                    style={{ marginTop: '3px' }}
                  >
                    {checkedEmails[i] && <div style={{ width: '6px', height: '6px', background: '#d4a5a0', borderRadius: '1px' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ fontSize: '11px', color: '#f0ece6', fontWeight: 500 }}>{em.from}</div>
                      {em.priority && <span className="flag" style={{ color: '#d4a5a0', borderColor: '#d4a5a044', fontSize: '8px' }}>priority</span>}
                    </div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', color: '#f0ece6', marginBottom: '4px' }}>{em.subject}</div>
                    <div style={{ fontSize: '11px', color: '#4a4743' }}>{em.preview}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* News */}
        {!briefLoading && brief && activeTab === 'news' && (
          <div className="fade-in">
            <div style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4a4743', marginBottom: '20px', fontWeight: 600 }}>
              AI Overnight
            </div>
            {news.length === 0 && (
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', color: '#4a4743', fontStyle: 'italic' }}>No news in this brief.</div>
            )}
            {news.map((n, i) => (
              <div key={i} className="card">
                <div style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4a4743', marginBottom: '8px', fontWeight: 600 }}>{n.source}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '19px', color: '#f0ece6', marginBottom: '10px', lineHeight: 1.3 }}>{n.headline}</div>
                <div style={{ fontSize: '12px', color: '#6a6663', lineHeight: 1.6 }}>{n.summary}</div>
              </div>
            ))}
          </div>
        )}

        {/* Jobs */}
        {!briefLoading && brief && activeTab === 'jobs' && (
          <div className="fade-in">
            <div style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4a4743', marginBottom: '20px', fontWeight: 600 }}>
              Live Leads
            </div>
            {jobs.length === 0 && (
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', color: '#4a4743', fontStyle: 'italic' }}>No job leads in this brief.</div>
            )}
            {jobs.map((j, i) => (
              <div key={i} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '19px', color: '#f0ece6', marginBottom: '4px' }}>{j.title}</div>
                    <div style={{ fontSize: '11px', color: '#d4a5a0', marginBottom: '2px', fontWeight: 500 }}>{j.company}</div>
                    <div style={{ fontSize: '10px', color: '#4a4743', marginBottom: '10px' }}>{j.location}</div>
                    <div style={{ fontSize: '12px', color: '#6a6663', lineHeight: 1.5 }}>{j.fit}</div>
                  </div>
                  <a href={j.link} className="job-link" style={{ marginLeft: '20px', marginTop: '4px', flexShrink: 0 }}>Apply →</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
