import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

/*
  Task surfaces share one editorial identity: warm cream base, near-black ink,
  orange accent, hairline borders, sharp corners, Anton display + Roboto body.
  Per-task kicker/note copy still varies for voice, but the visual language is
  unified. Tokens are delivered via CSS variables (`--tk-*`).
*/

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const DISPLAY_FONT = "'Anton', 'Bebas Neue', 'Impact', 'Helvetica Neue', Arial, sans-serif"
const BODY_FONT = "'Roboto', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"

const base = {
  dark: false,
  fontDisplay: DISPLAY_FONT,
  fontBody: BODY_FONT,
  bg: '#faf4eb',
  surface: '#ffffff',
  raised: '#f2ecdf',
  text: '#131116',
  muted: '#5a544d',
  line: 'rgba(19,17,22,0.12)',
  accent: '#f56815',
  accentSoft: 'rgba(245,104,21,0.10)',
  onAccent: '#faf4eb',
  glow: 'rgba(245,104,21,0.10)',
  radius: '0px',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Long reads', note: 'Essays and long-form pieces from the library.' },
  listing: { ...base, kicker: 'Directory', note: 'Curated organisations worth knowing.' },
  classified: { ...base, kicker: 'Notice board', note: 'Fast-moving offers and open calls.' },
  image: { ...base, kicker: 'Visual shelf', note: 'A visual thread of standout finds.' },
  sbm: { ...base, kicker: 'The Library', note: 'Curated collections of bookmarks and resources worth saving.' },
  pdf: { ...base, kicker: 'Documents', note: 'Reference PDFs, guides, and briefs.' },
  profile: { ...base, kicker: 'Curator', note: 'The person behind the collection.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.sbm
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
