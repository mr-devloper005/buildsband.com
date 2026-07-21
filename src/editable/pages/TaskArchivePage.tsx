import Link from 'next/link'
import { ArrowUpRight, ChevronDown, Globe, Search } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { globalContent, isUiHiddenTask } from '@/editable/content/global.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

const getContent = (post: SitePost) =>
  post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media)
    ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const images = Array.isArray(content.images)
    ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) =>
  asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) =>
  value
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
const getSummary = (post: SitePost) =>
  stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => {
  if (!value) return ''
  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`
    return new URL(withProtocol).hostname.replace(/^www\./, '')
  } catch {
    return value.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }
}

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

// Non-sbm variants keep an editorial grid; sbm is the shelf.
const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-8 md:grid-cols-2 xl:grid-cols-3',
  listing: 'grid gap-6 lg:grid-cols-2',
  classified: 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3',
  image: 'columns-1 gap-6 [column-fill:_balance] sm:columns-2 xl:columns-3',
  sbm: 'grid gap-px bg-[var(--tk-line)] md:grid-cols-2 xl:grid-cols-3',
  pdf: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  profile: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3',
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return (
    <TaskArchiveView
      task={task}
      posts={posts}
      pagination={pagination}
      category={category}
      basePath={basePath || taskConfig?.route || `/${task}`}
    />
  )
}

export function TaskArchiveView({
  task,
  posts,
  pagination,
  category,
  basePath,
}: {
  task: TaskKey
  posts: SitePost[]
  pagination: SiteFeedPagination
  category: string
  basePath: string
}) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = task === 'sbm' ? globalContent.labels.library : taskConfig?.label || task
  const categoryLabel =
    category === 'all' ? 'All shelves' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category

  // In-feed ad appears once, roughly two rows in, on the SBM shelf only.
  const showInFeedAd = task === 'sbm' && posts.length > 3

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <EditableReveal as="header" className="relative border-b border-[var(--tk-line)]">
          <div className={`${dc.shell.section} py-20 sm:py-24 lg:py-28`}>
            <div className="editable-eyebrow flex items-center gap-3 text-[var(--tk-accent)]">
              <span>{theme.kicker}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-60" />
              <span className="text-[var(--tk-muted)]">{label}</span>
            </div>
            <h1 className={`${dc.type.displayHero} mt-8 max-w-4xl text-[var(--tk-text)]`}>
              {task === 'sbm' ? 'The shelf, opened.' : voice?.headline || `Browse ${label}`}
            </h1>
            <p className={`${dc.type.lead} mt-6 max-w-2xl text-[var(--tk-muted)]`}>
              {task === 'sbm'
                ? 'Every collection sits on this page. Pick a shelf, or scroll the whole room — nothing here was picked by an algorithm.'
                : voice?.description || theme.note}
            </p>

            <div className="mt-14 flex flex-col gap-6 border-t border-[var(--tk-line)] pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="editable-eyebrow text-[var(--tk-muted)]">
                <span className="text-[var(--tk-text)]">{posts.length.toString().padStart(3, '0')}</span> ·{' '}
                {posts.length === 1 ? 'resource' : 'resources'} · {categoryLabel}
              </p>
              <form action={basePath} className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <select
                    name="category"
                    defaultValue={category}
                    className="editable-eyebrow h-12 w-full appearance-none rounded-[3px] border border-[var(--tk-line)] bg-[var(--tk-surface)] pl-4 pr-12 text-[var(--tk-text)] outline-none transition-colors duration-500 focus:border-[var(--tk-accent)] sm:w-auto"
                    aria-label={voice?.filterLabel || 'Filter shelf'}
                  >
                    <option value="all">All shelves</option>
                    {CATEGORY_OPTIONS.map((item) => (
                      <option key={item.slug} value={item.slug}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                </div>
                <button
                  type="submit"
                  className="editable-eyebrow inline-flex h-12 items-center justify-center gap-2 rounded-[3px] bg-[var(--tk-accent)] px-6 text-[var(--tk-on-accent)] transition-colors duration-500 hover:bg-[var(--tk-text)] hover:text-[var(--tk-bg)]"
                >
                  Apply <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </EditableReveal>

        <section className={`${dc.shell.section} py-16 sm:py-20 lg:py-24`}>
          {posts.length ? (
            <>
              <div className={taskGrid[task]}>
                {posts.map((post, index) => (
                  <EditableReveal key={post.id || post.slug} index={index} step={45}>
                    <ArchivePostCard post={post} task={task} basePath={basePath} index={index} />
                  </EditableReveal>
                ))}
              </div>
              {showInFeedAd ? (
                <div className="mt-16 flex justify-center border-t border-[var(--tk-line)] pt-10">
                  <Ads slot="in-feed" size={pickRandom(getSlotSizes('in-feed'))} showLabel className="mx-auto w-full" />
                </div>
              ) : null}
            </>
          ) : (
            <div className="mx-auto max-w-xl border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-10 py-20 text-center">
              <Search className="mx-auto h-8 w-8 text-[var(--tk-muted)]" />
              <h2 className={`${dc.type.displayH3} mt-6 text-[var(--tk-text)]`}>The shelf is quiet.</h2>
              <p className="mt-4 text-sm leading-6 text-[var(--tk-muted)]">
                Try another collection, or come back after {globalContent.labels.contributors.toLowerCase()} add the next batch.
              </p>
            </div>
          )}

          {posts.length ? (
            <nav className="editable-eyebrow mt-20 flex flex-wrap items-center justify-center gap-3 border-t border-[var(--tk-line)] pt-10 text-[var(--tk-text)]">
              {pagination.hasPrevPage ? (
                <Link
                  href={pageHref(basePath, category, page - 1)}
                  className="inline-flex items-center gap-2 rounded-[3px] border border-[var(--tk-line)] px-5 py-3 transition-colors duration-500 hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]"
                >
                  ← Previous
                </Link>
              ) : null}
              <span className="rounded-[3px] bg-[var(--tk-text)] px-5 py-3 text-[var(--tk-bg)]">
                Page {page} / {pagination.totalPages || 1}
              </span>
              {pagination.hasNextPage ? (
                <Link
                  href={pageHref(basePath, category, page + 1)}
                  className="inline-flex items-center gap-2 rounded-[3px] border border-[var(--tk-line)] px-5 py-3 transition-colors duration-500 hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]"
                >
                  Next →
                </Link>
              ) : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({
  post,
  task,
  basePath,
  index,
}: {
  post: SitePost
  task: TaskKey
  basePath: string
  index: number
}) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'sbm') return <BookmarkShelfCard post={post} href={href} index={index} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <EditorialArchiveCard post={post} href={href} index={index} />
}

/*
  BookmarkShelfCard — the sbm shelf tile. Editorial reference language:
  hairline hidden by grid gap-px, sharp corners, Anton title, kicker, domain
  and a big arrow that slides on hover. No image required — this is a
  bookmark, not an article.
*/
function BookmarkShelfCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const category = getCategory(post, 'Shelf')
  const website = getField(post, ['website', 'url', 'link'])
  const domain = cleanDomain(website)
  return (
    <Link
      href={href}
      className="group relative flex h-full flex-col justify-between gap-12 bg-[var(--tk-bg)] p-8 transition-colors duration-500 hover:bg-[var(--tk-text)] hover:text-[var(--tk-bg)] sm:p-10"
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <span className="editable-eyebrow text-[var(--tk-accent)]">№{String(index + 1).padStart(3, '0')}</span>
          <p className="editable-eyebrow mt-3 opacity-60">{category}</p>
        </div>
        <ArrowUpRight className="h-6 w-6 shrink-0 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" />
      </div>
      <div>
        <h2 className={`${dc.type.displayH3} text-current`}>{post.title}</h2>
        <p className="mt-6 line-clamp-3 text-[15px] leading-[1.7] text-current opacity-70">{getSummary(post)}</p>
        {domain ? (
          <p className="editable-eyebrow mt-8 inline-flex items-center gap-2 border-t border-current/20 pt-6 text-current opacity-80">
            <Globe className="h-3.5 w-3.5" /> {domain}
          </p>
        ) : null}
      </div>
    </Link>
  )
}

function EditorialArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  const category = getCategory(post, 'Read')
  return (
    <Link
      href={href}
      className={`group flex flex-col overflow-hidden border border-[var(--tk-line)] bg-[var(--tk-surface)] ${dc.motion.lift}`}
    >
      <div className="aspect-[4/3] overflow-hidden bg-[var(--tk-raised)]">
        <img
          src={image}
          alt=""
          className={`h-full w-full object-cover ${dc.motion.imageZoom}`}
        />
      </div>
      <div className="flex flex-1 flex-col p-8">
        <span className="editable-eyebrow text-[var(--tk-accent)]">
          {category} · Nº {String(index + 1).padStart(2, '0')}
        </span>
        <h2 className={`${dc.type.displayH3} mt-4 line-clamp-3 text-[var(--tk-text)]`}>{post.title}</h2>
        <p className="mt-4 line-clamp-3 text-[15px] leading-[1.7] text-[var(--tk-muted)]">{getSummary(post)}</p>
        <span className="editable-eyebrow mt-auto inline-flex items-center gap-2 pt-6 text-[var(--tk-text)]">
          Open resource <ArrowUpRight className={`h-4 w-4 ${dc.motion.arrowNudge}`} />
        </span>
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <Link
      href={href}
      className="group mb-6 block break-inside-avoid overflow-hidden border border-[var(--tk-line)] bg-[var(--tk-surface)]"
    >
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={image} alt="" className={`h-full w-full object-cover ${dc.motion.imageZoom}`} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(19,17,22,0.85))]" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h2 className={`${dc.type.displayH4} line-clamp-2 text-white`}>{post.title}</h2>
          <span className="editable-eyebrow mt-3 inline-flex items-center gap-2 text-white/80">
            Open frame <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link
      href={href}
      className={`group flex flex-col items-center border border-[var(--tk-line)] bg-[var(--tk-surface)] p-10 text-center ${dc.motion.lift}`}
    >
      <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {avatar ? (
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="editable-display text-[2rem] text-[var(--tk-muted)]">
            {post.title?.charAt(0) || 'C'}
          </span>
        )}
      </div>
      <h2 className={`${dc.type.displayH4} mt-6 text-[var(--tk-text)]`}>{post.title}</h2>
      {role ? <p className="editable-eyebrow mt-3 text-[var(--tk-accent)]">{role}</p> : null}
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
    </Link>
  )
}

// Re-export so hidden-task guards in HomePage can consult it here too.
export { isUiHiddenTask, SITE_CONFIG }
