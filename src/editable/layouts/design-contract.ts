import type { CSSProperties } from 'react'

/*
  Design contract for the editorial reference language.
  Warm cream base, near-black ink, orange punch, Anton display + Roboto body.
  Sharp corners, hairline borders, oversized editorial rhythm.
*/

export const editableRootStyle = {
  '--slot4-page-bg': '#faf4eb',
  '--slot4-page-text': '#131116',
  '--slot4-panel-bg': '#f2ecdf',
  '--slot4-surface-bg': '#ffffff',
  '--slot4-muted-text': '#5a544d',
  '--slot4-soft-muted-text': '#8a8378',
  '--slot4-accent': '#f56815',
  '--slot4-accent-fill': '#f56815',
  '--slot4-accent-soft': 'rgba(245,104,21,0.10)',
  '--slot4-on-accent': '#faf4eb',
  '--slot4-dark-bg': '#131116',
  '--slot4-dark-text': '#faf4eb',
  '--slot4-media-bg': '#e8e1d1',
  '--slot4-cream': '#faf4eb',
  '--slot4-warm': '#f2ecdf',
  '--slot4-body-gradient': 'none',

  '--editable-page-bg': '#faf4eb',
  '--editable-page-text': '#131116',
  '--editable-container': '1440px',
  '--editable-gutter': '2.5rem',
  '--editable-section-y': '6rem',
  '--editable-section-y-hero': '9rem',
  '--editable-border': 'rgba(19,17,22,0.12)',
  '--editable-border-strong': 'rgba(19,17,22,0.25)',
  '--editable-border-inverse': 'rgba(250,244,235,0.20)',
  '--editable-radius-sharp': '0px',
  '--editable-radius-chip': '3px',
  '--editable-radius-pill': '999px',

  '--editable-nav-bg': '#faf4eb',
  '--editable-nav-text': '#131116',
  '--editable-nav-active': '#f56815',
  '--editable-nav-active-text': '#faf4eb',
  '--editable-cta-bg': '#f56815',
  '--editable-cta-text': '#faf4eb',
  '--editable-search-bg': '#ffffff',
  '--editable-footer-bg': '#131116',
  '--editable-footer-text': '#faf4eb',
} as CSSProperties

export const editablePalette = {
  pageBg: 'bg-[var(--slot4-page-bg)]',
  pageText: 'text-[var(--slot4-page-text)]',
  panelBg: 'bg-[var(--slot4-panel-bg)]',
  panelText: 'text-[var(--slot4-page-text)]',
  surfaceBg: 'bg-[var(--slot4-surface-bg)]',
  surfaceText: 'text-[var(--slot4-page-text)]',
  mutedText: 'text-[var(--slot4-muted-text)]',
  softMutedText: 'text-[var(--slot4-soft-muted-text)]',
  accentText: 'text-[var(--slot4-accent)]',
  accentBg: 'bg-[var(--slot4-accent-fill)]',
  accentSoftBg: 'bg-[var(--slot4-accent-soft)]',
  onAccentText: 'text-[var(--slot4-on-accent)]',
  darkBg: 'bg-[var(--slot4-dark-bg)]',
  darkText: 'text-[var(--slot4-dark-text)]',
  mediaBg: 'bg-[var(--slot4-media-bg)]',
  creamBg: 'bg-[var(--slot4-cream)]',
  warmBg: 'bg-[var(--slot4-warm)]',
  border: 'border-[var(--editable-border)]',
  borderStrong: 'border-[var(--editable-border-strong)]',
  darkBorder: 'border-[var(--editable-border-inverse)]',
} as const

export const editableDesignContract = {
  shell: {
    page: `min-h-screen ${editablePalette.pageBg} ${editablePalette.pageText}`,
    section: 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-10',
    sectionY: 'py-16 sm:py-20 lg:py-24',
    sectionYLarge: 'py-24 sm:py-28 lg:py-32',
  },
  layout: {
    safeGrid: 'grid gap-6 md:grid-cols-2 lg:grid-cols-3',
    featureGrid: 'grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center',
    rail: 'flex snap-x gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    minRailCard: 'w-[280px] shrink-0 snap-start sm:w-[320px]',
  },
  type: {
    eyebrow: 'editable-eyebrow text-[var(--slot4-accent)]',
    eyebrowInverse: 'editable-eyebrow text-[var(--slot4-accent)]',
    displayHero: 'editable-display text-[3rem] leading-[1.02] sm:text-[5.5rem] lg:text-[7rem]',
    displayH1: 'editable-display text-[3rem] leading-[1.05] sm:text-[4.5rem] lg:text-[6rem]',
    displayH2: 'editable-display text-[2.5rem] leading-[1.05] sm:text-[3.5rem] lg:text-[4.25rem]',
    displayH3: 'editable-display text-[2rem] leading-[1.1] sm:text-[2.5rem] lg:text-[3rem]',
    displayH4: 'editable-display text-[1.5rem] leading-[1.15] sm:text-[2rem] lg:text-[2.5rem]',
    body: 'text-base leading-7 sm:text-[1.0625rem] sm:leading-[1.7]',
    bodySmall: 'text-sm leading-6',
    lead: 'text-lg leading-[1.55] sm:text-xl sm:leading-[1.5]',
  },
  surface: {
    card: 'border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)]',
    soft: 'border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)]',
    dark: 'bg-[var(--slot4-dark-bg)] text-[var(--slot4-dark-text)]',
    hairline: 'border-t border-[var(--editable-border)]',
  },
  button: {
    primary:
      'inline-flex items-center justify-center gap-2 rounded-[3px] bg-[var(--slot4-accent-fill)] px-7 py-4 text-[13px] font-medium uppercase tracking-[0.14em] text-[var(--slot4-on-accent)] transition-all duration-500 hover:bg-[var(--slot4-page-text)] hover:text-[var(--slot4-page-bg)]',
    secondary:
      'inline-flex items-center justify-center gap-2 rounded-[3px] border border-[var(--editable-border-strong)] bg-transparent px-7 py-4 text-[13px] font-medium uppercase tracking-[0.14em] text-[var(--slot4-page-text)] transition-all duration-500 hover:border-[var(--slot4-accent)] hover:bg-[var(--slot4-accent)] hover:text-[var(--slot4-on-accent)]',
    ghostInverse:
      'inline-flex items-center justify-center gap-2 rounded-[3px] border border-[var(--editable-border-inverse)] px-7 py-4 text-[13px] font-medium uppercase tracking-[0.14em] text-[var(--slot4-dark-text)] transition-all duration-500 hover:border-[var(--slot4-accent)] hover:bg-[var(--slot4-accent)] hover:text-[var(--slot4-on-accent)]',
  },
  media: {
    frame: 'relative overflow-hidden bg-[var(--slot4-media-bg)]',
    ratio: 'aspect-[4/5]',
    ratioLandscape: 'aspect-[16/10]',
  },
  motion: {
    lift:
      'transition-all duration-500 hover:-translate-y-1',
    fade: 'transition duration-500 hover:opacity-80',
    imageZoom:
      'transition-transform duration-[900ms] group-hover:scale-[1.04]',
    arrowNudge:
      'transition-transform duration-500 group-hover:translate-x-1',
  },
} as const

export const aiLayoutRules = [
  'Update tokens in editableRootStyle/editable-global.css first; components consume vars.',
  'Never hardcode reference colors or fonts in JSX — always route through CSS variables.',
  'Wrap every home/section block in <EditableReveal index={i}> for staggered entry.',
  'Home + archive stay driven by real fetched posts; never replace with mock arrays.',
  'Use postHref() for all post links so task-specific routes keep working.',
  'Sharp corners are the reference default (radius 0); reserve 3px for chips only.',
] as const
