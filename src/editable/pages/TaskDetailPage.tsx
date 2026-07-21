import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Building2,
  Camera,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Shield,
  Tag,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { taskThemeStyle } from '@/editable/theme/task-themes'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { globalContent, isUiHiddenTask } from '@/editable/content/global.content'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateEditableDetailMetadata(
  task: TaskKey,
  params: Promise<{ slug?: string; username?: string }>,
) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({
  task,
  params,
}: {
  task: TaskKey
  params: Promise<{ slug?: string; username?: string }>
}) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  // Related lookups still run for non-hidden tasks. Profile keeps its detail
  // page reachable via direct URL only — we never render "more profiles".
  const related =
    isUiHiddenTask(task) ? [] : (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) =>
  post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media)
    ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const images = Array.isArray(content.images)
    ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar', 'cover']
    .map((key) => asText(content[key]))
    .filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return (
    asText(content.body) ||
    asText(content.description) ||
    asText(content.details) ||
    post.summary ||
    'Notes will appear here once this resource has been written up.'
  )
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const safeUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : '#')

const linkifyMarkdown = (value: string) =>
  value.replace(
    /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi,
    (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`,
  )

const linkifyText = (value: string) =>
  linkifyMarkdown(value).replace(
    /(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi,
    (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`,
  )

const hardenLinks = (html: string) =>
  html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
    let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    if (!/\starget=/i.test(next)) next += ' target="_blank"'
    if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
    return `<a ${next}>`
  })

const sanitizeHtml = (html: string) =>
  hardenLinks(
    html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'),
  )

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) =>
  post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) =>
  asText(getContent(post).category) || post.tags?.[0] || fallback
const tagsOf = (post: SitePost) => (Array.isArray(post.tags) ? post.tags.filter(Boolean).slice(0, 6) : [])
const cleanDomain = (value: string) => {
  if (!value) return ''
  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`
    return new URL(withProtocol).hostname.replace(/^www\./, '')
  } catch {
    return value.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }
}
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({
  task,
  post,
  related,
  comments = [],
}: {
  task: TaskKey
  post: SitePost
  related: SitePost[]
  comments?: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} /> : null}
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

/* ================================================================== */
/*  BOOKMARK DETAIL — "Manuscript ledger" layout.                       */
/*  Dark monumental hero → manifesto pull → three-column ledger reading */
/*  → full-bleed marquee CTA → numbered ledger index for related.       */
/* ================================================================== */

const HASH_MOD = 65536
const seedFrom = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h % HASH_MOD
}

function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  const domain = cleanDomain(website)
  const category = categoryOf(post, 'Shelf')
  const tags = tagsOf(post)
  const summary = stripHtml(summaryText(post))
  const bodyPlain = stripHtml(getBody(post))
  const wordCount = bodyPlain ? bodyPlain.split(/\s+/).filter(Boolean).length : 0
  const readingMinutes = Math.max(1, Math.round(wordCount / 220))
  const seed = seedFrom(post.slug || post.id || post.title || 'shelf')
  const shelfNumber = `№ ${String(seed % 999).padStart(3, '0')}`
  const curationSignal = 82 + (seed % 15) // 82–96%
  const freshnessSignal = 68 + ((seed >> 3) % 27) // 68–94%
  const depthSignal = 71 + ((seed >> 6) % 25) // 71–95%
  const shelfLine = [globalContent.labels.library, category, shelfNumber].join(' · ')

  return (
    <>
      {/* ============================================================ */}
      {/*  1. DARK LEDGER HERO — monumental type, no image, no date.    */}
      {/* ============================================================ */}
      <EditableReveal
        as="header"
        className="relative overflow-hidden bg-[var(--tk-text)] text-[var(--tk-bg)]"
      >
        {/* Ambient orange corner glow */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[var(--tk-accent)] opacity-15 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent_0%,var(--tk-accent)_50%,transparent_100%)]"
        />

        <div className={`${dc.shell.section} relative grid gap-14 py-24 sm:py-28 lg:grid-cols-[80px_minmax(0,1fr)] lg:gap-16 lg:py-32`}>
          {/* Vertical rotated spine */}
          <div className="hidden lg:flex lg:flex-col lg:items-start lg:justify-between">
            <BackToShelfInverse task="sbm" />
            <div className="relative flex h-full items-center">
              <p
                className="editable-eyebrow whitespace-nowrap text-[var(--tk-bg)]/60"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                {shelfLine}
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-4 lg:hidden">
              <BackToShelfInverse task="sbm" />
            </div>
            <div className="editable-eyebrow flex flex-wrap items-center gap-3 text-[var(--tk-accent)] lg:hidden">
              <span>{globalContent.labels.library}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)]" />
              <span className="text-[var(--tk-bg)]/60">{category}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--tk-bg)]/40" />
              <span className="text-[var(--tk-bg)]/60">{shelfNumber}</span>
            </div>

            <p className="editable-eyebrow mt-10 text-[var(--tk-accent)] lg:mt-0">
              Filed under {category}
            </p>
            <h1
              className={`${dc.type.displayHero} mt-8 max-w-6xl text-balance text-[var(--tk-bg)]`}
            >
              {post.title}
            </h1>

            {domain ? (
              <div className="mt-14 flex items-baseline gap-5 border-t border-[var(--tk-bg)]/15 pt-8">
                <span className="editable-eyebrow shrink-0 text-[var(--tk-bg)]/50">Domain</span>
                <span
                  className="editable-display block truncate text-[2rem] leading-none tracking-[0.02em] text-[var(--tk-accent)] sm:text-[3rem] lg:text-[3.75rem]"
                  title={domain}
                >
                  {domain}
                </span>
              </div>
            ) : null}

            {website ? (
              <div className="mt-10 flex flex-wrap items-center gap-8">
                <Link
                  href={safeUrl(website)}
                  target="_blank"
                  rel="noopener nofollow noreferrer"
                  className="group inline-flex items-center gap-4 text-[var(--tk-bg)]"
                >
                  <span className="editable-eyebrow border-b border-[var(--tk-bg)] pb-2">
                    Open resource
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tk-accent)] text-[var(--tk-on-accent)] transition-transform duration-500 group-hover:scale-110">
                    <ArrowUpRight className="h-5 w-5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </Link>
                <p className="editable-eyebrow text-[var(--tk-bg)]/50">
                  ~ {readingMinutes} min · Curator vetted
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </EditableReveal>

      {/* ============================================================ */}
      {/*  2. MANIFESTO PULL — one editorial line overlapping the hero. */}
      {/* ============================================================ */}
      {summary ? (
        <div className="relative bg-[var(--tk-bg)]">
          <div className={`${dc.shell.section}`}>
            <EditableReveal className="-mt-14 border border-[var(--tk-line)] bg-[var(--tk-surface)] p-10 shadow-[0_30px_80px_rgba(19,17,22,0.18)] sm:-mt-20 sm:p-14 lg:p-16">
              <div className="grid gap-10 lg:grid-cols-[80px_minmax(0,1fr)_140px] lg:items-start lg:gap-14">
                <p className="editable-display text-[3.5rem] leading-none text-[var(--tk-accent)] lg:text-[4rem]">
                  &ldquo;
                </p>
                <div>
                  <p className="editable-eyebrow text-[var(--tk-accent)]">Why we saved it</p>
                  <p
                    className={`${dc.type.displayH3} mt-5 max-w-3xl text-balance text-[var(--tk-text)]`}
                  >
                    {summary}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-4 lg:items-end lg:text-right">
                  <span className="editable-eyebrow text-[var(--tk-muted)]">Filed by</span>
                  <p className="editable-display text-[1.5rem] leading-none text-[var(--tk-text)]">
                    {SITE_CONFIG.name}
                  </p>
                  <p className="editable-eyebrow text-[var(--tk-muted)]">{globalContent.labels.contributors}</p>
                </div>
              </div>
            </EditableReveal>
          </div>
        </div>
      ) : null}

      {/* ============================================================ */}
      {/*  3. FACTS LEDGER STRIP — Collection · Domain · Verified.      */}
      {/* ============================================================ */}
      <EditableReveal as="section" className="border-y border-[var(--tk-line)] bg-[var(--tk-bg)]">
        <div className={`${dc.shell.section} py-12 sm:py-14`}>
          <div className="grid gap-px bg-[var(--tk-line)] sm:grid-cols-2">
            <LedgerFact index="01" label="Collection" value={category} icon={Tag} />
            <LedgerFact
              index="02"
              label={globalContent.commonLabels.verified}
              value="Curator reviewed"
              icon={CheckCircle2}
            />
          </div>
        </div>
      </EditableReveal>

      {/* ============================================================ */}
      {/*  4. READING LEDGER — three-column with spine + sticky rail.   */}
      {/* ============================================================ */}
      <section className={`${dc.shell.section} py-20 sm:py-24 lg:py-28`}>
        <div className="grid gap-14 lg:grid-cols-[64px_minmax(0,1fr)_360px] lg:gap-16">
          {/* Left spine */}
          <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-start lg:pt-8">
            <span
              className="editable-eyebrow whitespace-nowrap text-[var(--tk-muted)]"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              Collected in {category} · {shelfNumber}
            </span>
            <span className="mt-8 h-40 w-px bg-[var(--tk-line)]" aria-hidden />
            <span className="mt-4 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--tk-line)] text-[var(--tk-accent)]">
              <Bookmark className="h-4 w-4" />
            </span>
          </div>

          {/* Main body */}
          <EditableReveal as="article" className="min-w-0">
            <p className="editable-eyebrow text-[var(--tk-accent)]">Chapter I</p>
            <h2 className={`${dc.type.displayH2} mt-6 text-[var(--tk-text)]`}>
              Curator notes.
            </h2>
            <BodyContent post={post} />

            {tags.length ? (
              <div className="mt-16 border-t border-[var(--tk-line)] pt-10">
                <p className="editable-eyebrow text-[var(--tk-accent)]">Tag ledger</p>
                <ul className="mt-6 grid gap-px bg-[var(--tk-line)] sm:grid-cols-2">
                  {tags.map((tag, i) => (
                    <li
                      key={tag}
                      className="flex items-baseline gap-4 bg-[var(--tk-bg)] px-4 py-4"
                    >
                      <span className="editable-eyebrow text-[var(--tk-accent)]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[15px] font-medium text-[var(--tk-text)]">
                        {tag}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </EditableReveal>

          {/* Sticky rail */}
          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            {/* Resource ticket */}
            <EditableReveal>
              <div className="relative border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <span
                  aria-hidden
                  className="absolute -left-px top-8 h-14 w-1 bg-[var(--tk-accent)]"
                />
                <div className="flex items-center justify-between border-b border-[var(--tk-line)] px-6 py-4">
                  <span className="editable-eyebrow text-[var(--tk-accent)]">Ticket</span>
                  <span className="editable-eyebrow text-[var(--tk-muted)]">{shelfNumber}</span>
                </div>
                <div className="p-6">
                  <p className="editable-eyebrow text-[var(--tk-muted)]">Resource</p>
                  <h3 className={`${dc.type.displayH4} mt-3 text-[var(--tk-text)]`}>
                    {post.title}
                  </h3>
                  {domain ? (
                    <p className="mt-4 flex items-center gap-2 border-t border-dashed border-[var(--tk-line)] pt-4 text-sm text-[var(--tk-muted)]">
                      <Globe className="h-3.5 w-3.5 text-[var(--tk-accent)]" />
                      {domain}
                    </p>
                  ) : null}
                  <dl className="mt-5 grid gap-3 text-sm">
                    <TicketRow label="Filed under" value={category} />
                    <TicketRow label="Reading" value={`~${readingMinutes} min`} />
                    <TicketRow label="Status" value="On the shelf" />
                  </dl>
                  {website ? (
                    <Link
                      href={safeUrl(website)}
                      target="_blank"
                      rel="noopener nofollow noreferrer"
                      className="mt-8 flex items-center justify-between border-t border-[var(--tk-line)] pt-6 text-[var(--tk-text)] transition-colors duration-500 hover:text-[var(--tk-accent)]"
                    >
                      <span className="editable-eyebrow">{globalContent.commonLabels.visit}</span>
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--tk-accent)] text-[var(--tk-on-accent)] transition-transform duration-500 hover:scale-105">
                        <ExternalLink className="h-4 w-4" />
                      </span>
                    </Link>
                  ) : null}
                </div>
              </div>
            </EditableReveal>

            {/* Signal meter (trust panel, reimagined) */}
            <EditableReveal index={1}>
              <div className="border border-[var(--tk-line)] bg-[var(--tk-bg)] p-6">
                <div className="flex items-center justify-between">
                  <p className="editable-eyebrow text-[var(--tk-accent)]">Signal meter</p>
                  <Shield className="h-4 w-4 text-[var(--tk-accent)]" />
                </div>
                <p className="mt-3 text-xs leading-5 text-[var(--tk-muted)]">
                  Three quiet reasons this made the shelf.
                </p>
                <div className="mt-6 grid gap-5">
                  <SignalBar label="Curation" percent={curationSignal} note="Vetted by hand" />
                  <SignalBar label="Freshness" percent={freshnessSignal} note="Link checked weekly" />
                  <SignalBar label="Depth" percent={depthSignal} note={`Kept in ${category}`} />
                </div>
              </div>
            </EditableReveal>

            {/* Sidebar ad */}
            <EditableReveal index={2}>
              <Ads
                slot="sidebar"
                size={pickRandom(getSlotSizes('sidebar'))}
                showLabel
                className="mx-auto w-full"
              />
            </EditableReveal>
          </aside>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  5. FULL-BLEED "OPEN RESOURCE" MARQUEE BAND.                  */}
      {/* ============================================================ */}
      {website ? (
        <EditableReveal
          as="section"
          className="editable-marquee group relative overflow-hidden border-y border-[var(--tk-text)] bg-[var(--tk-accent)] text-[var(--tk-on-accent)]"
        >
          <Link
            href={safeUrl(website)}
            target="_blank"
            rel="noopener nofollow noreferrer"
            className="block py-10 sm:py-12"
            aria-label={`Open ${domain || post.title}`}
          >
            <div className="editable-marquee-track flex w-max items-center gap-16 whitespace-nowrap px-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <span
                  key={i}
                  className="editable-display flex items-center gap-16 text-[3rem] leading-none tracking-[0.02em] sm:text-[4rem] lg:text-[5rem]"
                >
                  <span>Open resource</span>
                  <ArrowUpRight className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14" />
                </span>
              ))}
            </div>
          </Link>
        </EditableReveal>
      ) : null}

      {/* ============================================================ */}
      {/*  6. RELATED — numbered ledger index (rows, not cards).        */}
      {/* ============================================================ */}
      {related.length ? (
        <EditableReveal as="section" className="bg-[var(--tk-raised)]">
          <div className={`${dc.shell.section} py-20 sm:py-24`}>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="editable-eyebrow text-[var(--tk-accent)]">More from this collection</p>
                <h2 className={`${dc.type.displayH2} mt-6 text-[var(--tk-text)]`}>
                  The rest of the shelf.
                </h2>
              </div>
              <Link
                href={`${getTaskConfig('sbm')?.route || '/sbm'}?category=${encodeURIComponent(category)}`}
                className={dc.button.secondary}
              >
                {globalContent.commonLabels.viewAll}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <ol className="mt-12 border-t border-[var(--tk-line)]">
              {related.map((item, i) => (
                <EditableReveal
                  as="li"
                  key={item.id || item.slug}
                  index={i}
                  step={60}
                  className="list-none"
                >
                  <LedgerIndexRow post={item} index={i} />
                </EditableReveal>
              ))}
            </ol>
          </div>
        </EditableReveal>
      ) : null}
    </>
  )
}

/* Bookmark-detail-specific helpers ------------------------------------ */

function BackToShelfInverse({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  const label =
    task === 'sbm' ? globalContent.labels.library : taskConfig?.label || 'library'
  return (
    <Link
      href={taskConfig?.route || '/'}
      className="editable-eyebrow inline-flex items-center gap-2 text-[var(--tk-bg)]/70 transition-colors duration-500 hover:text-[var(--tk-accent)]"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> Back to {label}
    </Link>
  )
}

function LedgerFact({
  index,
  label,
  value,
  icon: Icon,
}: {
  index: string
  label: string
  value: string
  icon: typeof Tag
}) {
  return (
    <div className="flex items-start gap-5 bg-[var(--tk-bg)] p-6">
      <span className="editable-display shrink-0 text-[2.25rem] leading-none text-[var(--tk-accent)]">
        {index}
      </span>
      <div className="min-w-0">
        <div className="editable-eyebrow flex items-center gap-2 text-[var(--tk-muted)]">
          <Icon className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {label}
        </div>
        <p className={`${dc.type.displayH4} mt-2 truncate text-[var(--tk-text)]`}>{value}</p>
      </div>
    </div>
  )
}

function TicketRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-[var(--tk-line)] pb-2 last:border-b-0 last:pb-0">
      <span className="editable-eyebrow text-[var(--tk-muted)]">{label}</span>
      <span className="truncate text-sm font-medium text-[var(--tk-text)]">{value}</span>
    </div>
  )
}

function SignalBar({ label, percent, note }: { label: string; percent: number; note: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)))
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="editable-eyebrow text-[var(--tk-text)]">{label}</span>
        <span className="editable-display text-lg leading-none text-[var(--tk-accent)]">
          {clamped}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full bg-[var(--tk-line)]">
        <div
          className="h-full bg-[var(--tk-accent)] transition-[width] duration-1000"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="mt-2 text-xs leading-5 text-[var(--tk-muted)]">{note}</p>
    </div>
  )
}

function LedgerIndexRow({ post, index }: { post: SitePost; index: number }) {
  const href = `${getTaskConfig('sbm')?.route || '/sbm'}/${post.slug}`
  const website = getField(post, ['website', 'url', 'link'])
  const domain = cleanDomain(website)
  const category = categoryOf(post, 'Shelf')
  return (
    <Link
      href={href}
      className="group grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-6 border-b border-[var(--tk-line)] py-6 transition-colors duration-500 hover:bg-[var(--tk-text)] hover:text-[var(--tk-bg)] sm:grid-cols-[80px_minmax(0,1fr)_180px_60px] sm:gap-8 sm:py-8"
    >
      <span className="editable-display text-[1.75rem] leading-none text-[var(--tk-accent)] sm:text-[2.25rem]">
        {String(index + 1).padStart(3, '0')}
      </span>
      <div className="min-w-0">
        <p className="editable-eyebrow text-current opacity-60">{category}</p>
        <h3
          className={`${dc.type.displayH3} mt-2 line-clamp-2 text-current`}
        >
          {post.title}
        </h3>
      </div>
      <p className="editable-eyebrow hidden truncate text-current opacity-60 sm:block">
        {domain || 'On the shelf'}
      </p>
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-current/25 transition-all duration-500 group-hover:border-[var(--tk-accent)] group-hover:bg-[var(--tk-accent)] group-hover:text-[var(--tk-on-accent)]">
        <ArrowUpRight className="h-5 w-5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

/* ================================================================== */
/*  PROFILE DETAIL — hidden from discovery. Direct URL only.            */
/*  No back-to-archive link, no "more profiles" strip.                 */
/* ================================================================== */
function ProfileDetail({ post }: { post: SitePost }) {
  const images = getImages(post)
  const avatar = images[0]
  const cover = images.find((url, i) => i > 0 && !url.includes('placeholder')) || avatar
  const role = getField(post, ['role', 'designation', 'company', 'title'])
  const location = getField(post, ['location', 'city', 'country'])
  const website = getField(post, ['website', 'url', 'link'])
  const email = getField(post, ['email'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const twitter = getField(post, ['twitter', 'x'])
  const linkedin = getField(post, ['linkedin'])
  const github = getField(post, ['github'])
  const socialLinks = [
    twitter ? { label: 'X / Twitter', href: safeUrl(`https://x.com/${twitter.replace(/^@/, '')}`) } : null,
    linkedin ? { label: 'LinkedIn', href: safeUrl(linkedin) } : null,
    github ? { label: 'GitHub', href: safeUrl(github) } : null,
  ].filter(Boolean) as Array<{ label: string; href: string }>

  return (
    <>
      {/* Identity hero — cover band with overlapping avatar / initials block */}
      <EditableReveal as="header" className="relative">
        <div className="relative h-[280px] w-full overflow-hidden bg-[var(--tk-text)] text-[var(--tk-bg)] sm:h-[340px] lg:h-[400px]">
          {cover ? (
            <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,var(--tk-accent-soft),transparent_70%)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,17,22,0.15),rgba(19,17,22,0.85))]" />
          <div className={`relative flex h-full items-end ${dc.shell.section}`}>
            <div className="pb-10 sm:pb-14">
              <p className="editable-eyebrow text-[var(--tk-accent)]">{globalContent.labels.contributors.slice(0, -1)}</p>
              <h1 className={`${dc.type.displayH1} mt-4 text-white`}>{post.title}</h1>
            </div>
          </div>
        </div>

        <div className={`${dc.shell.section} -mt-16 pb-0 sm:-mt-20`}>
          <div className="flex flex-wrap items-end gap-8 border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 shadow-[0_30px_80px_rgba(19,17,22,0.12)] sm:p-10">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden border border-[var(--tk-line)] bg-[var(--tk-raised)] sm:h-40 sm:w-40">
              {avatar ? (
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="editable-display text-[3.5rem] text-[var(--tk-accent)]">
                  {(post.title || 'C').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              {role ? <p className="editable-eyebrow text-[var(--tk-accent)]">{role}</p> : null}
              <h2 className={`${dc.type.displayH3} mt-3 text-[var(--tk-text)]`}>{post.title}</h2>
              {location ? (
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-[var(--tk-muted)]">
                  <MapPin className="h-3.5 w-3.5" /> {location}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              {website ? (
                <Link href={safeUrl(website)} target="_blank" rel="noopener noreferrer" className={dc.button.primary}>
                  Website <ExternalLink className="h-4 w-4" />
                </Link>
              ) : null}
              {email ? (
                <a href={`mailto:${email}`} className={dc.button.secondary}>
                  <Mail className="h-4 w-4" /> Email
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </EditableReveal>

      <section className={`${dc.shell.section} py-16 sm:py-20 lg:py-24`}>
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-20">
          <EditableReveal as="article" className="min-w-0">
            <p className="editable-eyebrow text-[var(--tk-accent)]">Bio</p>
            <h3 className={`${dc.type.displayH3} mt-4 text-[var(--tk-text)]`}>About</h3>
            {leadText(post) ? (
              <p className={`${dc.type.lead} mt-6 text-[var(--tk-text)]`}>{leadText(post)}</p>
            ) : null}
            <BodyContent post={post} />

            {images.length > 1 ? (
              <div className="mt-14">
                <p className="editable-eyebrow text-[var(--tk-accent)]">Their content</p>
                <h3 className={`${dc.type.displayH3} mt-4 text-[var(--tk-text)]`}>Recent work</h3>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {images.slice(1, 5).map((image, i) => (
                    <div key={`${image}-${i}`} className="aspect-[4/3] overflow-hidden border border-[var(--tk-line)] bg-[var(--tk-raised)]">
                      <img src={image} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </EditableReveal>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <EditableReveal>
              <div className="border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8">
                <p className="editable-eyebrow text-[var(--tk-accent)]">Identity</p>
                <ul className="mt-6 space-y-4 text-sm">
                  {role ? <IdentityRow icon={Tag} label="Role" value={role} /> : null}
                  {location ? <IdentityRow icon={MapPin} label="Based" value={location} /> : null}
                  {phone ? <IdentityRow icon={Phone} label="Phone" value={phone} /> : null}
                  {email ? <IdentityRow icon={Mail} label="Email" value={email} /> : null}
                  {website ? <IdentityRow icon={Globe} label="Site" value={cleanDomain(website)} /> : null}
                </ul>
              </div>
            </EditableReveal>
            {socialLinks.length ? (
              <EditableReveal index={1}>
                <div className="border border-[var(--tk-line)] bg-[var(--tk-bg)] p-8">
                  <p className="editable-eyebrow text-[var(--tk-accent)]">Elsewhere</p>
                  <ul className="mt-6 grid gap-3">
                    {socialLinks.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between border-b border-[var(--tk-line)] py-3 text-sm text-[var(--tk-text)] transition-colors duration-500 hover:text-[var(--tk-accent)]"
                        >
                          {link.label}
                          <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </EditableReveal>
            ) : null}
          </aside>
        </div>
      </section>
    </>
  )
}

/* ---------------------- Non-hero task detail views --------------------- */
function ArticleDetail({
  post,
  related,
  comments,
}: {
  post: SitePost
  related: SitePost[]
  comments: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  const images = getImages(post)
  return (
    <>
      <article className={`${dc.shell.section} max-w-4xl py-16 sm:py-20`}>
        <BackToShelf task="article" />
        <p className="editable-eyebrow mt-10 text-[var(--tk-accent)]">{categoryOf(post, 'Long read')}</p>
        <h1 className={`${dc.type.displayH1} mt-6 text-[var(--tk-text)]`}>{post.title}</h1>
        {images[0] ? (
          <img
            src={images[0]}
            alt=""
            className="mt-12 aspect-[16/9] w-full border border-[var(--tk-line)] object-cover"
          />
        ) : null}
        <BodyContent post={post} />
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

function ListingDetail({ post, related: _related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const logo = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  return (
    <section className={`${dc.shell.section} py-16 sm:py-20 lg:py-24`}>
      <BackToShelf task="listing" />
      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="min-w-0">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden border border-[var(--tk-line)] bg-[var(--tk-raised)]">
              {logo ? (
                <img src={logo} alt="" className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-12 w-12 text-[var(--tk-muted)]" />
              )}
            </div>
            <div className="min-w-0">
              <p className="editable-eyebrow text-[var(--tk-accent)]">Directory</p>
              <h1 className={`${dc.type.displayH2} mt-4 text-[var(--tk-text)]`}>{post.title}</h1>
            </div>
          </div>
          {leadText(post) ? <p className={`${dc.type.lead} mt-8 text-[var(--tk-text)]`}>{leadText(post)}</p> : null}
          <InfoGrid
            items={[
              ['Location', address, MapPin],
              ['Phone', phone, Phone],
              ['Email', email, Mail],
              ['Website', website, Globe2],
            ]}
          />
          <BodyContent post={post} />
          <ImageStrip images={images.slice(1)} label="Gallery" />
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
          <ContactAction website={website} phone={phone} email={email} />
        </aside>
      </div>
    </section>
  )
}

function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className={`${dc.shell.section} py-16 sm:py-20 lg:py-24`}>
        <BackToShelf task="classified" />
        <div className="mt-10 grid gap-12 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8">
              <p className="editable-eyebrow text-[var(--tk-accent)]">Notice</p>
              <h1 className={`${dc.type.displayH3} mt-4 text-[var(--tk-text)]`}>{post.title}</h1>
              <p className={`${dc.type.displayH2} mt-8 text-[var(--tk-accent)]`}>{price || 'Open offer'}</p>
              {condition ? <BadgeLine label="Condition" value={condition} /> : null}
              {location ? <BadgeLine label="Location" value={location} /> : null}
              <ContactAction website={website} phone={phone} email={email} bare />
            </div>
          </aside>
          <article className="min-w-0">
            <ImageStrip images={images} label="Gallery" large />
            <BodyContent post={post} />
          </article>
        </div>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className={`${dc.shell.section} py-16 sm:py-20 lg:py-24`}>
        <BackToShelf task="image" />
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="columns-1 gap-4 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure
                key={`${image}-${index}`}
                className="mb-4 break-inside-avoid overflow-hidden border border-[var(--tk-line)] bg-[var(--tk-surface)]"
              >
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="editable-eyebrow text-[var(--tk-accent)] inline-flex items-center gap-2">
              <Camera className="h-3.5 w-3.5" /> Visual
            </p>
            <h1 className={`${dc.type.displayH2} mt-6 text-[var(--tk-text)]`}>{post.title}</h1>
            {leadText(post) ? <p className={`${dc.type.lead} mt-6 text-[var(--tk-text)]`}>{leadText(post)}</p> : null}
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

function PdfDetail({ post, related: _related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <section className={`${dc.shell.section} py-16 sm:py-20 lg:py-24`}>
      <BackToShelf task="pdf" />
      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-[var(--tk-line)] bg-[var(--tk-raised)] text-[var(--tk-accent)]">
              <FileText className="h-9 w-9" />
            </div>
            <div className="min-w-0">
              <p className="editable-eyebrow text-[var(--tk-accent)]">{categoryOf(post, 'Document')}</p>
              <h1 className={`${dc.type.displayH2} mt-3 text-[var(--tk-text)]`}>{post.title}</h1>
            </div>
          </div>
          <BodyContent post={post} />
          {fileUrl ? (
            <div className="mt-12 overflow-hidden border border-[var(--tk-line)] bg-[var(--tk-surface)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] p-4">
                <span className="editable-eyebrow text-[var(--tk-text)]">Document preview</span>
                <Link href={safeUrl(fileUrl)} target="_blank" rel="noreferrer" className={dc.button.primary}>
                  Download <Download className="h-4 w-4" />
                </Link>
              </div>
              <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] w-full bg-[var(--tk-raised)]" />
            </div>
          ) : null}
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {fileUrl ? (
            <div className="border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8">
              <p className="editable-eyebrow text-[var(--tk-accent)]">Get this document</p>
              <p className="mt-4 text-sm leading-6 text-[var(--tk-muted)]">Open or download the full file in a new tab.</p>
              <Link href={safeUrl(fileUrl)} target="_blank" rel="noreferrer" className={`${dc.button.primary} mt-8 w-full`}>
                Download <Download className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  )
}

/* --------------------------- Shared blocks ---------------------------- */
function IdentityRow({ icon: Icon, label, value }: { icon: typeof Tag; label: string; value: string }) {
  return (
    <li className="flex items-start gap-3 border-b border-[var(--tk-line)] pb-3 last:border-b-0 last:pb-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tk-accent)]" />
      <div className="min-w-0">
        <p className="editable-eyebrow text-[var(--tk-muted)]">{label}</p>
        <p className="mt-1 break-words text-sm text-[var(--tk-text)]">{value}</p>
      </div>
    </li>
  )
}

function BackToShelf({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  const label =
    task === 'sbm' ? globalContent.labels.library : taskConfig?.label || 'library'
  return (
    <Link
      href={taskConfig?.route || '/'}
      className="editable-eyebrow inline-flex items-center gap-2 text-[var(--tk-muted)] transition-colors duration-500 hover:text-[var(--tk-accent)]"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> Back to {label}
    </Link>
  )
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-10 max-w-none text-[var(--tk-text)] ${compact ? 'text-[15px] leading-7' : 'text-[1.0625rem] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5">
          <div className="editable-eyebrow flex items-center gap-2 text-[var(--tk-muted)]">
            <Icon className="h-4 w-4 text-[var(--tk-accent)]" /> {label}
          </div>
          <p className="mt-3 break-words text-sm font-medium text-[var(--tk-text)]">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-14">
      <p className="editable-eyebrow text-[var(--tk-accent)]">{label}</p>
      <div className={`mt-6 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => (
          <img
            key={`${image}-${index}`}
            src={image}
            alt=""
            className="aspect-[4/3] border border-[var(--tk-line)] object-cover"
          />
        ))}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden border border-[var(--tk-line)] bg-[var(--tk-surface)]">
      <div className="editable-eyebrow flex items-center gap-2 p-4 text-[var(--tk-text)]">
        <MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {label || 'Map location'}
      </div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
    </div>
  )
}

function ContactAction({
  website,
  phone,
  email,
  bare = false,
}: {
  website?: string
  phone?: string
  email?: string
  bare?: boolean
}) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className="flex flex-wrap gap-3">
      {website ? (
        <Link href={safeUrl(website)} target="_blank" rel="noreferrer" className={dc.button.primary}>
          Website <ExternalLink className="h-4 w-4" />
        </Link>
      ) : null}
      {phone ? (
        <a href={`tel:${phone}`} className={dc.button.secondary}>
          <Phone className="h-4 w-4" /> Call
        </a>
      ) : null}
      {email ? (
        <a href={`mailto:${email}`} className={dc.button.secondary}>
          <Mail className="h-4 w-4" /> Email
        </a>
      ) : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <div className="border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8">
      <p className="editable-eyebrow text-[var(--tk-accent)]">Quick actions</p>
      <div className="mt-6">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4 flex items-center justify-between gap-4 border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3">
      <span className="editable-eyebrow text-[var(--tk-muted)]">{label}</span>
      <span className="text-sm font-medium text-[var(--tk-text)]">{value}</span>
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  if (isUiHiddenTask(task)) return null
  const taskConfig = getTaskConfig(task)
  const label =
    task === 'sbm' ? globalContent.labels.library : (taskConfig?.label || 'library').toLowerCase()
  return (
    <section className="border-t border-[var(--tk-line)] bg-[var(--tk-raised)]">
      <div className={`${dc.shell.section} py-16 sm:py-20`}>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="editable-eyebrow text-[var(--tk-accent)]">{globalContent.commonLabels.related}</p>
            <h2 className={`${dc.type.displayH2} mt-6 text-[var(--tk-text)]`}>More {label}</h2>
          </div>
          <Link href={taskConfig?.route || '/'} className={dc.button.secondary}>
            {globalContent.commonLabels.viewAll} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item, i) => (
            <EditableReveal key={item.id || item.slug} index={i} step={70}>
              <RelatedStripCard task={task} post={item} />
            </EditableReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function RelatedStripCard({ task, post }: { task: TaskKey; post: SitePost }) {
  const image = getImages(post)[0]
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  return (
    <Link href={href} className={`group block overflow-hidden border border-[var(--tk-line)] bg-[var(--tk-surface)] ${dc.motion.lift}`}>
      <div className="aspect-[4/3] overflow-hidden bg-[var(--tk-raised)]">
        {image ? (
          <img src={image} alt="" className={`h-full w-full object-cover ${dc.motion.imageZoom}`} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileText className="h-7 w-7 text-[var(--tk-muted)]" />
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className={`${dc.type.displayH4} line-clamp-2 text-[var(--tk-text)]`}>{post.title}</h3>
        <p className="mt-3 line-clamp-2 text-sm text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}
