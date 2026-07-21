import Link from 'next/link'
import { ArrowUpRight, Globe } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'

export function getEditablePostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const images = Array.isArray(content.images) ? content.images : []
  const contentImage = images.find((url): url is string => typeof url === 'string' && Boolean(url))
  const logo = typeof content.logo === 'string' ? content.logo : ''
  return mediaUrl || contentImage || logo || '/placeholder.svg?height=900&width=1400'
}

export function toPlainText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getEditableExcerpt(post?: SitePost | null, limit = 150) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
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

export function getEditableCategory(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Featured'
}

export function postHref(task: TaskKey, post: SitePost, route = `/${task}`) {
  return `${route}/${post.slug}`
}

function getDomain(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
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

/*
  EditorialFeatureCard — dark editorial spotlight card used as the hero of a
  section. Anton display over a dim image, orange accent kicker, ghost arrow.
*/
export function EditorialFeatureCard({ post, href, label = 'Featured shelf' }: { post: SitePost; href: string; label?: string }) {
  return (
    <Link href={href} className={`group relative block min-h-[520px] overflow-hidden ${dc.surface.dark} ${dc.motion.lift} lg:min-h-[620px]`}>
      <img src={getEditablePostImage(post)} alt={post.title} className={`absolute inset-0 h-full w-full object-cover opacity-45 ${dc.motion.imageZoom}`} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,17,22,0)_0%,rgba(19,17,22,0.35)_45%,rgba(19,17,22,0.9)_100%)]" />
      <div className="relative z-10 flex h-full min-h-[520px] flex-col justify-end p-8 sm:p-10 lg:min-h-[620px] lg:p-12">
        <span className="editable-eyebrow text-[var(--slot4-accent)]">{label}</span>
        <h3 className={`${dc.type.displayH2} mt-6 max-w-3xl text-[var(--slot4-dark-text)]`}>{post.title}</h3>
        <p className={`${dc.type.body} mt-6 max-w-2xl text-[var(--slot4-dark-text)]/75`}>{getEditableExcerpt(post, 190)}</p>
        <span className="editable-eyebrow mt-8 inline-flex items-center gap-3 text-[var(--slot4-dark-text)]">
          Open the shelf
          <ArrowUpRight className={`h-4 w-4 ${dc.motion.arrowNudge}`} />
        </span>
      </div>
    </Link>
  )
}

/*
  RailPostCard — horizontally scrollable rail card. Big cover, kicker,
  Anton headline, quiet meta. Used on home rails.
*/
export function RailPostCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const domain = getDomain(post)
  return (
    <Link href={href} className={`group ${dc.layout.minRailCard} block ${dc.surface.card} ${dc.motion.lift}`}>
      <div className={`${dc.media.frame} ${dc.media.ratio}`}>
        <img src={getEditablePostImage(post)} alt={post.title} className={`absolute inset-0 h-full w-full object-cover ${dc.motion.imageZoom}`} />
        <span className="editable-eyebrow absolute left-5 top-5 rounded-[3px] bg-[var(--slot4-page-text)] px-2.5 py-1 text-[10px] text-[var(--slot4-page-bg)]">
          №{String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="p-6">
        <p className={dc.type.eyebrow}>{getEditableCategory(post)}</p>
        <h3 className={`${dc.type.displayH4} mt-4 line-clamp-3 ${pal.pageText}`}>{post.title}</h3>
        <p className={`${dc.type.bodySmall} mt-4 line-clamp-3 ${pal.mutedText}`}>{getEditableExcerpt(post, 130)}</p>
        {domain ? (
          <p className={`editable-eyebrow mt-5 inline-flex items-center gap-2 ${pal.softMutedText}`}>
            <Globe className="h-3 w-3" /> {domain}
          </p>
        ) : null}
      </div>
    </Link>
  )
}

/*
  CompactIndexCard — numbered index row used in dense listings.
*/
export function CompactIndexCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`group block ${dc.surface.soft} p-6 ${dc.motion.lift}`}>
      <div className="flex items-start gap-5">
        <span className={`editable-display shrink-0 text-[2.5rem] leading-none text-[var(--slot4-accent)]`}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <p className={dc.type.eyebrow}>{getEditableCategory(post)}</p>
          <h3 className={`${dc.type.displayH4} mt-3 line-clamp-2 ${pal.pageText}`}>{post.title}</h3>
          <p className={`${dc.type.bodySmall} mt-3 line-clamp-2 ${pal.mutedText}`}>{getEditableExcerpt(post, 110)}</p>
        </div>
      </div>
    </Link>
  )
}

/*
  ArticleListCard — wide split card with cover left, headline right.
*/
export function ArticleListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`group grid overflow-hidden ${dc.surface.card} ${dc.motion.lift} sm:grid-cols-[280px_minmax(0,1fr)]`}>
      <div className={`${dc.media.frame} aspect-[4/3] sm:aspect-auto sm:min-h-[220px]`}>
        <img src={getEditablePostImage(post)} alt={post.title} className={`absolute inset-0 h-full w-full object-cover ${dc.motion.imageZoom}`} />
      </div>
      <div className="flex min-w-0 flex-col p-7 sm:p-8">
        <p className={dc.type.eyebrow}>{getEditableCategory(post)} · Nº {String(index + 1).padStart(2, '0')}</p>
        <h2 className={`${dc.type.displayH3} mt-4 line-clamp-3 ${pal.pageText}`}>{post.title}</h2>
        <p className={`${dc.type.body} mt-5 line-clamp-3 ${pal.mutedText}`}>{getEditableExcerpt(post, 180)}</p>
        <span className={`editable-eyebrow mt-auto inline-flex items-center gap-2 pt-6 text-[var(--slot4-page-text)]`}>
          Open resource <ArrowUpRight className={`h-4 w-4 ${dc.motion.arrowNudge}`} />
        </span>
      </div>
    </Link>
  )
}
