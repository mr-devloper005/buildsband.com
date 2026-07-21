'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronDown,
  Globe,
  Layers,
  Minus,
  Plus,
  Search,
  Sparkles,
  Users,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { CATEGORY_OPTIONS } from '@/lib/categories'
import { pagesContent } from '@/editable/content/pages.content'
import { globalContent } from '@/editable/content/global.content'
import { getEditablePostImage, postHref, toPlainText } from '@/editable/cards/PostCards'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const LIBRARY_LABEL = globalContent.labels.library
const CURATORS_LABEL = globalContent.labels.contributors

function getExcerpt(post?: SitePost | null, limit = 130) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    (typeof post?.summary === 'string' && post.summary) ||
    (typeof content.body === 'string' && content.body) ||
    (typeof content.excerpt === 'string' && content.excerpt) ||
    ''
  const clean = toPlainText(raw)
  return clean.length > limit ? `${clean.slice(0, limit).trim()}…` : clean
}

function categoryOf(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || ''
}

function domainOf(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.website === 'string' && content.website) ||
    (typeof content.url === 'string' && content.url) ||
    (typeof content.link === 'string' && content.link) ||
    ''
  if (!raw) return ''
  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
    return new URL(withProtocol).hostname.replace(/^www\./, '')
  } catch {
    return raw.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

const container = dc.shell.section

/* ------------------------------- Hero --------------------------------- */
export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const spotlight = pool.slice(0, 3)
  const heroTitleParts = pagesContent.home.hero.title || [`Bookmark the internet`, `worth keeping.`]

  return (
    <EditableReveal as="section" className="relative bg-[var(--slot4-page-bg)]">
      <div className={`${container} pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24`}>
        <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16">
          <div>
            <p className={dc.type.eyebrow}>{pagesContent.home.hero.badge}</p>
            <h1 className={`${dc.type.displayHero} mt-8 text-[var(--slot4-page-text)]`}>
              {heroTitleParts.map((line, i) => (
                <span key={i} className="block">
                  {i === heroTitleParts.length - 1 ? (
                    <span className="text-[var(--slot4-accent)]">{line}</span>
                  ) : (
                    line
                  )}
                </span>
              ))}
            </h1>
            <p className={`${dc.type.lead} mt-8 max-w-xl text-[var(--slot4-muted-text)]`}>
              {pagesContent.home.hero.description}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href={pagesContent.home.hero.primaryCta.href} className={dc.button.primary}>
                {pagesContent.home.hero.primaryCta.label}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href={pagesContent.home.hero.secondaryCta.href} className={dc.button.secondary}>
                {pagesContent.home.hero.secondaryCta.label}
              </Link>
            </div>
            <form action="/search" className="mt-12 flex w-full max-w-lg items-center gap-3 border-b border-[var(--editable-border-strong)] pb-3">
              <Search className="h-4 w-4 shrink-0 text-[var(--slot4-page-text)]" />
              <input
                name="q"
                placeholder={pagesContent.home.hero.searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-muted-text)]"
              />
              <button
                type="submit"
                className="editable-eyebrow inline-flex items-center gap-1 text-[var(--slot4-page-text)] transition-colors duration-500 hover:text-[var(--slot4-accent)]"
              >
                Search <ArrowUpRight className="h-3 w-3" />
              </button>
            </form>
          </div>

          <div className="relative">
            <HeroVisual posts={spotlight} primaryRoute={primaryRoute} primaryTask={primaryTask} />
          </div>
        </div>
      </div>
    </EditableReveal>
  )
}

function HeroVisual({ posts, primaryRoute, primaryTask }: { posts: SitePost[]; primaryRoute: string; primaryTask: TaskKey }) {
  const primary = posts[0]
  const secondary = posts[1]
  const primaryImage = primary ? getEditablePostImage(primary) : '/placeholder.svg?height=900&width=900'
  const secondaryImage = secondary ? getEditablePostImage(secondary) : '/placeholder.svg?height=700&width=600'
  return (
    <div className="relative aspect-square w-full max-w-[560px] justify-self-end">
      <div className="absolute inset-0 border border-[var(--editable-border-strong)]" aria-hidden />
      <div className="absolute inset-6 overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={primaryImage} alt={primary?.title || ''} className="h-full w-full object-cover" />
      </div>
      <div className="absolute -bottom-8 -left-8 w-[52%] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-4 shadow-[0_20px_60px_rgba(19,17,22,0.12)] sm:-bottom-10 sm:-left-10">
        <div className="aspect-[4/3] overflow-hidden bg-[var(--slot4-media-bg)]">
          <img src={secondaryImage} alt={secondary?.title || ''} className="h-full w-full object-cover" />
        </div>
        <p className="editable-eyebrow mt-3 text-[var(--slot4-accent)]">{primary ? categoryOf(primary) || 'Fresh find' : 'Fresh find'}</p>
        <p className="mt-1 line-clamp-2 text-sm font-medium text-[var(--slot4-page-text)]">
          {primary?.title || 'A new resource just landed on the shelf.'}
        </p>
      </div>
      <div className="absolute -right-6 top-8 hidden w-[42%] border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] p-4 sm:block">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
            <Bookmark className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="editable-eyebrow text-[var(--slot4-muted-text)]">Live count</p>
            <p className="text-lg font-semibold text-[var(--slot4-page-text)]">{posts.length ? posts.length * 128 : 512}+</p>
          </div>
        </div>
        <Link
          href={primaryRoute}
          className="editable-eyebrow mt-3 inline-flex items-center gap-1 text-[var(--slot4-accent)] transition-colors duration-500 hover:text-[var(--slot4-page-text)]"
        >
          {primaryTask === 'sbm' ? `Enter ${LIBRARY_LABEL}` : 'Browse'} <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}

/* -------------------- Collections marquee (band) ---------------------- */
export function EditableCollectionsMarquee() {
  const seq = [...CATEGORY_OPTIONS, ...CATEGORY_OPTIONS]
  return (
    <EditableReveal as="section" index={1} className="editable-marquee bg-[var(--slot4-page-text)] py-6 text-[var(--slot4-page-bg)]">
      <div className="editable-marquee-track flex w-max items-center gap-16 whitespace-nowrap px-6">
        {seq.map((category, i) => (
          <Link
            key={`${category.slug}-${i}`}
            href={`/sbm?category=${category.slug}`}
            className="editable-display flex items-center gap-16 text-[2.5rem] leading-none tracking-[0.02em] transition-colors duration-500 hover:text-[var(--slot4-accent)] sm:text-[3rem]"
          >
            <span>{category.name}</span>
            <span className="text-[var(--slot4-accent)]">✦</span>
          </Link>
        ))}
      </div>
    </EditableReveal>
  )
}

/* -------------------- Alternating feature blocks ---------------------- */
const featureCopy: Array<{
  eyebrow: string
  title: string
  description: string
  bullets: string[]
  cta: { label: string; href: string }
}> = [
  {
    eyebrow: `Inside ${LIBRARY_LABEL}`,
    title: 'Shelves built by hand.',
    description:
      'Every collection is opened by a person, curated on purpose, and kept small enough to read in one sitting. No infinite feed, no algorithmic dread.',
    bullets: [
      'Human-picked bookmarks — never scraped, never spammed.',
      'Grouped by shelf so a topic feels like a room, not a river.',
      'Sourced from the corners of the web that still write.',
    ],
    cta: { label: 'Open the library', href: '/sbm' },
  },
  {
    eyebrow: `Made by ${CURATORS_LABEL}`,
    title: 'People behind the picks.',
    description:
      'Each shelf carries the name of the person who tends it. Follow a curator, or open a collection and see what they think you should read next.',
    bullets: [
      'Real names attached to every bookmark, so credit lands right.',
      'A shelf is a curator’s handwriting — voice included.',
      'Submit a resource and start your own shelf when you’re ready.',
    ],
    cta: { label: 'Meet the curators', href: '/about' },
  },
]

export function EditableFeatureBlocks() {
  return (
    <>
      {featureCopy.map((feature, i) => (
        <EditableReveal
          as="section"
          key={feature.title}
          index={i}
          className={i % 2 ? 'bg-[var(--slot4-warm)]' : 'bg-[var(--slot4-page-bg)]'}
        >
          <div className={`${container} py-20 sm:py-24 lg:py-28`}>
            <div className={`grid items-center gap-14 lg:gap-20 ${i % 2 ? 'lg:grid-cols-[0.9fr_1.1fr]' : 'lg:grid-cols-[1.1fr_0.9fr]'}`}>
              <div className={i % 2 ? 'lg:order-2' : ''}>
                <p className={dc.type.eyebrow}>{feature.eyebrow}</p>
                <h2 className={`${dc.type.displayH2} mt-6 text-[var(--slot4-page-text)]`}>{feature.title}</h2>
                <p className={`${dc.type.lead} mt-6 max-w-lg text-[var(--slot4-muted-text)]`}>{feature.description}</p>
                <ul className="mt-10 grid gap-4">
                  {feature.bullets.map((point) => (
                    <li key={point} className="flex items-start gap-4">
                      <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)]">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      <span className="text-[15px] leading-[1.7] text-[var(--slot4-page-text)]">{point}</span>
                    </li>
                  ))}
                </ul>
                <Link href={feature.cta.href} className={`${dc.button.secondary} mt-10`}>
                  {feature.cta.label}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <div className={i % 2 ? 'lg:order-1' : ''}>
                <FeatureVisual variant={i} />
              </div>
            </div>
          </div>
        </EditableReveal>
      ))}
    </>
  )
}

function FeatureVisual({ variant }: { variant: number }) {
  if (variant % 2) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden border border-[var(--editable-border)] bg-[var(--slot4-dark-bg)] text-[var(--slot4-dark-text)]">
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-4 gap-px bg-[var(--editable-border-inverse)]">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="bg-[var(--slot4-dark-bg)]" />
          ))}
        </div>
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <p className="editable-eyebrow text-[var(--slot4-accent)]">Curator sheet</p>
          <div>
            <p className="editable-display text-[3.5rem] leading-none">A. TAYLOR</p>
            <p className="mt-2 text-sm text-[var(--slot4-dark-text)]/60">4 shelves · 128 resources · verified</p>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden border border-[var(--editable-border)] bg-[var(--slot4-page-bg)]">
      <div className="absolute inset-0 flex flex-col justify-between p-10">
        <div>
          <p className="editable-eyebrow text-[var(--slot4-accent)]">Shelf preview</p>
          <p className="mt-6 editable-display text-[3rem] leading-[1.02]">Field notes</p>
        </div>
        <ul className="grid gap-4">
          {['essays that reward a reread', 'tools with taste', 'sites that feel handmade', 'writing worth saving'].map((line) => (
            <li key={line} className="flex items-center gap-3 border-b border-[var(--editable-border)] pb-3 text-sm text-[var(--slot4-page-text)]">
              <Bookmark className="h-4 w-4 shrink-0 text-[var(--slot4-accent)]" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ---------------------- Collections grid (categories) ------------------ */
export function EditableCollectionsGrid({ primaryRoute }: HomeSectionProps) {
  const collections = CATEGORY_OPTIONS.slice(0, 12)
  return (
    <EditableReveal as="section" className="bg-[var(--slot4-page-bg)]">
      <div className={`${container} py-20 sm:py-24 lg:py-28`}>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className={dc.type.eyebrow}>Explore by shelf</p>
            <h2 className={`${dc.type.displayH2} mt-6 text-[var(--slot4-page-text)]`}>Twelve doors in.</h2>
            <p className={`${dc.type.lead} mt-5 max-w-lg text-[var(--slot4-muted-text)]`}>
              Every collection is a room. Walk into whichever one you need today; come back tomorrow and it will have moved.
            </p>
          </div>
          <Link href={primaryRoute} className={dc.button.secondary}>
            {globalContent.commonLabels.viewAll}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-14 grid gap-px bg-[var(--editable-border)] sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection, i) => (
            <EditableReveal
              key={collection.slug}
              index={i}
              step={40}
              className="bg-[var(--slot4-page-bg)]"
            >
              <Link
                href={`/sbm?category=${collection.slug}`}
                className="group relative flex h-full flex-col justify-between gap-10 p-8 transition-colors duration-500 hover:bg-[var(--slot4-page-text)] hover:text-[var(--slot4-page-bg)]"
              >
                <div className="flex items-center justify-between">
                  <span className="editable-eyebrow text-[var(--slot4-accent)] transition-colors duration-500 group-hover:text-[var(--slot4-accent)]">
                    №{String(i + 1).padStart(2, '0')}
                  </span>
                  <ArrowUpRight className="h-5 w-5 opacity-60 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:opacity-100" />
                </div>
                <div>
                  <h3 className="editable-display text-[2rem] leading-[1.05] sm:text-[2.5rem]">{collection.name}</h3>
                  <p className="mt-4 text-sm leading-6 text-current opacity-60">
                    Open the {collection.name.toLowerCase()} shelf and see what curators have been saving.
                  </p>
                </div>
              </Link>
            </EditableReveal>
          ))}
        </div>
      </div>
    </EditableReveal>
  )
}

/* -------------------- Featured + stats (real data) --------------------- */
export function EditableFeaturedAndStats({ primaryTask, primaryRoute, posts }: HomeSectionProps) {
  const featured = posts[0]
  const image = featured ? getEditablePostImage(featured) : '/placeholder.svg?height=900&width=1200'
  const domain = featured ? domainOf(featured) : ''
  const stats = [
    { label: 'Resources on the shelf', value: `${Math.max(posts.length * 32, 512)}+` },
    { label: 'Active collections', value: `${Math.max(CATEGORY_OPTIONS.length, 12)}` },
    { label: `${CURATORS_LABEL} tending it`, value: `${Math.max(Math.floor(posts.length / 2), 48)}` },
    { label: 'Read this week', value: `${Math.max(posts.length * 91, 1240)}+` },
  ]
  return (
    <EditableReveal as="section" className="bg-[var(--slot4-page-text)] text-[var(--slot4-page-bg)]">
      <div className={`${container} py-20 sm:py-24 lg:py-28`}>
        <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="editable-eyebrow text-[var(--slot4-accent)]">Featured find</p>
            <h2 className={`${dc.type.displayH2} mt-6`}>{featured?.title || 'A shelf worth stopping on.'}</h2>
            {featured ? (
              <p className={`${dc.type.lead} mt-6 max-w-xl text-[var(--slot4-page-bg)]/70`}>{getExcerpt(featured, 220)}</p>
            ) : null}
            {domain ? (
              <p className="editable-eyebrow mt-6 inline-flex items-center gap-2 text-[var(--slot4-accent)]">
                <Globe className="h-3 w-3" /> {domain}
              </p>
            ) : null}
            <div className="mt-10 flex flex-wrap gap-4">
              {featured ? (
                <Link href={postHref(primaryTask, featured, primaryRoute)} className={dc.button.primary}>
                  Open resource
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : null}
              <Link href={primaryRoute} className={dc.button.ghostInverse}>
                Browse the shelf
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden border border-[var(--editable-border-inverse)] bg-[var(--slot4-dark-bg)]">
            <img src={image} alt={featured?.title || ''} className="absolute inset-0 h-full w-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,17,22,0)_50%,rgba(19,17,22,0.85)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-8">
              <span className="editable-eyebrow text-[var(--slot4-accent)]">On the shelf</span>
              <ArrowUpRight className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="mt-20 grid gap-px bg-[var(--editable-border-inverse)] sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <EditableReveal key={stat.label} index={i} step={60} className="bg-[var(--slot4-page-text)] p-8">
              <p className="editable-display text-[3.5rem] leading-none text-[var(--slot4-accent)]">{stat.value}</p>
              <p className="editable-eyebrow mt-4 text-[var(--slot4-page-bg)]/70">{stat.label}</p>
            </EditableReveal>
          ))}
        </div>
      </div>
    </EditableReveal>
  )
}

/* --------------------- Dynamic bookmark grids -------------------------- */
const gridCopy: Record<string, { eyebrow: string; title: string; description: string }> = {
  spotlight: {
    eyebrow: 'Fresh from the shelf',
    title: 'Just added.',
    description: 'What curators saved in the last seven days.',
  },
  browse: {
    eyebrow: 'Making the rounds',
    title: 'Getting saved a lot.',
    description: 'The resources readers keep opening this month.',
  },
  index: {
    eyebrow: 'From the vault',
    title: 'Still worth a read.',
    description: 'Older bookmarks that still hold up on a quiet afternoon.',
  },
}

function BookmarkGridCard({ post, href }: { post: SitePost; href: string }) {
  const category = categoryOf(post)
  const domain = domainOf(post)
  const image = getEditablePostImage(post)
  return (
    <Link
      href={href}
      className={`group flex h-full flex-col ${dc.surface.card} ${dc.motion.lift}`}
    >
      <div className={`${dc.media.frame} aspect-[4/3]`}>
        <img src={image} alt={post.title} loading="lazy" className={`absolute inset-0 h-full w-full object-cover ${dc.motion.imageZoom}`} />
        {category ? (
          <span className="editable-eyebrow absolute left-5 top-5 rounded-[3px] bg-[var(--slot4-page-bg)] px-2.5 py-1 text-[10px] text-[var(--slot4-page-text)]">
            {category}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className={`${dc.type.displayH4} line-clamp-2 text-[var(--slot4-page-text)]`}>{post.title}</h3>
        <p className={`${dc.type.bodySmall} mt-4 line-clamp-3 flex-1 text-[var(--slot4-muted-text)]`}>{getExcerpt(post, 130)}</p>
        <div className="mt-6 flex items-center justify-between border-t border-[var(--editable-border)] pt-4">
          <span className="editable-eyebrow inline-flex items-center gap-1.5 text-[var(--slot4-muted-text)]">
            {domain ? <Globe className="h-3 w-3" /> : null}
            {domain || 'On the shelf'}
          </span>
          <ArrowUpRight className={`h-4 w-4 text-[var(--slot4-accent)] ${dc.motion.arrowNudge}`} />
        </div>
      </div>
    </Link>
  )
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 6), href: primaryRoute },
          { key: 'browse', posts: posts.slice(6, 12), href: primaryRoute },
          { key: 'index', posts: posts.slice(12, 18), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((section) => section.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section, index) => {
        const copy = gridCopy[section.key] || { eyebrow: 'On the shelf', title: 'More to open.', description: 'A wider view of the library.' }
        return (
          <EditableReveal
            as="section"
            key={section.key}
            index={index}
            className={index % 2 === 0 ? 'bg-[var(--slot4-page-bg)]' : 'bg-[var(--slot4-warm)]'}
          >
            <div className={`${container} py-20 sm:py-24 lg:py-28`}>
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div>
                  <p className={dc.type.eyebrow}>{copy.eyebrow}</p>
                  <h2 className={`${dc.type.displayH2} mt-6 text-[var(--slot4-page-text)]`}>{copy.title}</h2>
                  <p className={`${dc.type.lead} mt-5 max-w-lg text-[var(--slot4-muted-text)]`}>{copy.description}</p>
                </div>
                <Link href={section.href || primaryRoute} className={dc.button.secondary}>
                  Open shelf
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {section.posts.slice(0, 6).map((post, i) => (
                  <EditableReveal key={post.id || post.slug} index={i} step={80}>
                    <BookmarkGridCard post={post} href={postHref(primaryTask, post, primaryRoute)} />
                  </EditableReveal>
                ))}
              </div>
            </div>
          </EditableReveal>
        )
      })}
    </>
  )
}

/* --------------------------- Social proof ----------------------------- */
const socialProof = [
  { name: 'Rae M.', role: 'Editor · Type Journal', quote: 'The only bookmark site I still come back to. Every shelf feels like a room I want to sit in.' },
  { name: 'Idris K.', role: 'Product lead · Fern', quote: 'Half of what I read this year came from a shelf here. The other half is on my own shelf now.' },
  { name: 'Priya S.', role: 'Independent researcher', quote: 'Beats every AI feed I have tried. It is small on purpose, and that is the whole point.' },
]

export function EditableSocialProofBand() {
  return (
    <EditableReveal as="section" className="border-y border-[var(--editable-border)] bg-[var(--slot4-warm)]">
      <div className={`${container} py-20 sm:py-24`}>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className={dc.type.eyebrow}>Word from readers</p>
            <h2 className={`${dc.type.displayH2} mt-6 text-[var(--slot4-page-text)]`}>Small library. Loud fans.</h2>
          </div>
          <div className="flex items-center gap-3 text-[var(--slot4-muted-text)]">
            <Users className="h-5 w-5 text-[var(--slot4-accent)]" />
            <p className="text-sm">Trusted by writers, engineers, and quiet readers.</p>
          </div>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {socialProof.map((item, i) => (
            <EditableReveal key={item.name} index={i} step={90}>
              <figure className="flex h-full flex-col justify-between border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] p-8">
                <blockquote className="editable-display text-[1.75rem] leading-[1.1] text-[var(--slot4-page-text)] sm:text-[2rem]">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-10 flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)]">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--slot4-page-text)]">{item.name}</p>
                    <p className="editable-eyebrow text-[var(--slot4-muted-text)]">{item.role}</p>
                  </div>
                </figcaption>
              </figure>
            </EditableReveal>
          ))}
        </div>
      </div>
    </EditableReveal>
  )
}

/* ------------------------------- FAQ ---------------------------------- */
const faqItems = [
  {
    q: `What is ${SITE_CONFIG.name}?`,
    a: `A curated library of bookmarks — shelves of resources, tools, and reading that people saved because they meant to come back to it, not because a metric told them to.`,
  },
  {
    q: 'Who decides what gets on a shelf?',
    a: `${CURATORS_LABEL} do. Each shelf lives with a person, so what lands there sounds like them, not like a category page.`,
  },
  {
    q: 'How do I submit a resource?',
    a: `Use the submit form on the contact page, or become a ${CURATORS_LABEL.toLowerCase().slice(0, -1)} and tend a shelf yourself. Both start the same way — with a link you would send a friend.`,
  },
  {
    q: 'Do you show ads?',
    a: `A single, honest ad slot per page, styled to feel like part of the library. No pop-ups, no interstitials, no autoplay video.`,
  },
]

export function EditableFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  return (
    <EditableReveal as="section" className="bg-[var(--slot4-page-bg)]">
      <div className={`${container} py-20 sm:py-24 lg:py-28`}>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className={dc.type.eyebrow}>Common questions</p>
            <h2 className={`${dc.type.displayH2} mt-6 text-[var(--slot4-page-text)]`}>Answers on the shelf.</h2>
            <p className={`${dc.type.lead} mt-5 max-w-md text-[var(--slot4-muted-text)]`}>
              Everything a first-time reader tends to ask, in one place. Still curious? The contact page is the shortcut.
            </p>
            <Link href="/contact" className={`${dc.button.secondary} mt-10`}>
              Ask us anything
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="border-t border-[var(--editable-border)]">
            {faqItems.map((item, i) => {
              const open = openIndex === i
              return (
                <div key={item.q} className="border-b border-[var(--editable-border)]">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left transition-colors duration-500 hover:text-[var(--slot4-accent)]"
                    aria-expanded={open}
                  >
                    <span className={`${dc.type.displayH4} text-[var(--slot4-page-text)]`}>{item.q}</span>
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--editable-border-strong)] transition-colors duration-500 ${open ? 'bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)]' : 'text-[var(--slot4-page-text)]'}`}>
                      {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                  <div className={`grid overflow-hidden transition-all duration-500 ${open ? 'grid-rows-[1fr] pb-8' : 'grid-rows-[0fr]'}`}>
                    <div className="min-h-0 text-[15px] leading-[1.7] text-[var(--slot4-muted-text)]">{item.a}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </EditableReveal>
  )
}

/* ------------------------------- CTA ---------------------------------- */
export function EditableHomeCta() {
  const cta = pagesContent.home.cta
  return (
    <EditableReveal as="section" className="bg-[var(--slot4-page-text)] text-[var(--slot4-page-bg)]">
      <div className={`${container} py-24 sm:py-28 lg:py-32`}>
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="editable-eyebrow text-[var(--slot4-accent)]">{cta.badge}</p>
            <h2 className={`${dc.type.displayHero} mt-8`}>{cta.title}</h2>
          </div>
          <div>
            <p className={`${dc.type.lead} text-[var(--slot4-page-bg)]/70`}>{cta.description}</p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href={cta.primaryCta.href} className={dc.button.primary}>
                {cta.primaryCta.label}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href={cta.secondaryCta.href} className={dc.button.ghostInverse}>
                {cta.secondaryCta.label}
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                <Layers className="h-4 w-4" />
              </span>
              <p className="text-sm text-[var(--slot4-page-bg)]/60">One shelf a day. That is the whole subscription.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--editable-border-inverse)]" />
      <div className={`${container} py-6`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="editable-eyebrow text-[var(--slot4-page-bg)]/60">{SITE_CONFIG.name} · Est. now</p>
          <ChevronDown className="h-4 w-4 text-[var(--slot4-page-bg)]/40" />
        </div>
      </div>
    </EditableReveal>
  )
}

/* -------------- Backwards-compat exports (names preserved) ------------- */
// Old exports kept so no other file needs to change; they now delegate.
export const EditableStoryRail = EditableCollectionsGrid
export const EditableMagazineSplit = EditableFeaturedAndStats
