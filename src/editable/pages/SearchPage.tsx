import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Filter, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { toPlainText } from '@/editable/cards/PostCards'
import { pagesContent } from '@/editable/content/pages.content'
import { globalContent, isUiHiddenTask } from '@/editable/content/global.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) =>
  typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const getContent = (post: SitePost) =>
  post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
const compactRaw = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const summaryOf = (post: SitePost) => {
  const content = getContent(post)
  return toPlainText(
    (typeof post.summary === 'string' && post.summary) ||
      compactRaw(content.description) ||
      compactRaw(content.excerpt) ||
      compactRaw(content.body) ||
      '',
  )
}

function domainOf(post: SitePost) {
  const content = getContent(post)
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

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (derivedTask && isUiHiddenTask(derivedTask)) return false
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [
    post.title,
    post.summary,
    content.description,
    content.body,
    content.excerpt,
    content.category,
    Array.isArray(post.tags) ? post.tags.join(' ') : '',
  ].some((value) => compactText(value).includes(query))
}

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const taskConfig = SITE_CONFIG.tasks.find((item) => item.key === task)
  const href = `${taskConfig?.route || `/${task || 'sbm'}`}/${post.slug}`
  const summary = summaryOf(post)
  const domain = domainOf(post)
  const taskLabel =
    task === 'sbm' ? globalContent.labels.library : taskConfig?.label || 'Resource'
  return (
    <Link
      href={href}
      className={`group flex h-full flex-col justify-between gap-8 border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-8 ${dc.motion.lift}`}
    >
      <div>
        <div className="editable-eyebrow flex items-center justify-between text-[var(--slot4-accent)]">
          <span>{taskLabel}</span>
          <span className="text-[var(--slot4-muted-text)]">Nº {String(index + 1).padStart(3, '0')}</span>
        </div>
        <h2 className={`${dc.type.displayH3} mt-6 line-clamp-3 text-[var(--slot4-page-text)]`}>{post.title}</h2>
        {summary ? (
          <p className={`${dc.type.bodySmall} mt-5 line-clamp-3 text-[var(--slot4-muted-text)]`}>{summary}</p>
        ) : null}
      </div>
      <div className="flex items-center justify-between border-t border-[var(--editable-border)] pt-4">
        <span className="editable-eyebrow text-[var(--slot4-muted-text)]">{domain || 'On the shelf'}</span>
        <ArrowUpRight className={`h-4 w-4 text-[var(--slot4-accent)] ${dc.motion.arrowNudge}`} />
      </div>
    </Link>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }>
}) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  if (task && isUiHiddenTask(task)) {
    // Silently ignore a hidden task filter — it must not appear in results.
  }
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(
    useMaster ? 1000 : 300,
    useMaster ? { fresh: true, category: category || undefined, task: task && !isUiHiddenTask(task) ? task : undefined } : undefined,
  )
  const posts = feed?.posts?.length
    ? feed.posts
    : useMaster
    ? []
    : SITE_CONFIG.tasks
        .filter((item) => item.enabled && !isUiHiddenTask(item.key))
        .flatMap((item) => getMockPostsForTask(item.key))

  const effectiveTask = task && !isUiHiddenTask(task) ? task : ''
  const results = posts.filter((post) => matches(post, normalized, category, effectiveTask)).slice(0, normalized ? 80 : 36)

  const visibleTasks = SITE_CONFIG.tasks.filter((item) => item.enabled && !isUiHiddenTask(item.key))

  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <EditableReveal as="section" className={`${dc.shell.section} py-16 sm:py-20 lg:py-24`}>
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-end">
            <div>
              <p className={dc.type.eyebrow}>{pagesContent.search.hero.badge}</p>
              <h1 className={`${dc.type.displayHero} mt-8 text-[var(--slot4-page-text)]`}>
                {pagesContent.search.hero.title}
              </h1>
              <p className={`${dc.type.lead} mt-8 max-w-xl text-[var(--slot4-muted-text)]`}>
                {pagesContent.search.hero.description}
              </p>
            </div>
            <form action="/search" className="border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6">
              <input type="hidden" name="master" value="1" />
              <label className="editable-eyebrow flex items-center gap-3 border-b border-[var(--editable-border-strong)] pb-4 text-[var(--slot4-page-text)]">
                <Search className="h-4 w-4" />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder={pagesContent.search.hero.placeholder}
                  className="min-w-0 flex-1 bg-transparent text-[15px] font-medium normal-case tracking-normal text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-muted-text)]"
                />
              </label>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="editable-eyebrow flex items-center gap-2 border border-[var(--editable-border)] px-4 py-3 text-[var(--slot4-muted-text)]">
                  <Filter className="h-3.5 w-3.5" />
                  <input
                    name="category"
                    defaultValue={category}
                    placeholder="Category"
                    className="min-w-0 flex-1 bg-transparent text-[13px] font-medium normal-case tracking-normal text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-muted-text)]"
                  />
                </label>
                <select
                  name="task"
                  defaultValue={effectiveTask}
                  className="editable-eyebrow border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-3 text-[var(--slot4-page-text)] outline-none"
                >
                  <option value="">All content types</option>
                  {visibleTasks.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.key === 'sbm' ? globalContent.labels.library : item.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className={`${dc.button.primary} mt-6 w-full`}
              >
                Search the library <ArrowUpRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="mt-16 flex flex-wrap items-end justify-between gap-6 border-t border-[var(--editable-border)] pt-10">
            <div>
              <p className="editable-eyebrow text-[var(--slot4-accent)]">
                {results.length.toString().padStart(3, '0')} {results.length === 1 ? 'result' : 'results'}
              </p>
              <h2 className={`${dc.type.displayH2} mt-4 text-[var(--slot4-page-text)]`}>
                {query ? `“${query}” on the shelf.` : pagesContent.search.resultsTitle}
              </h2>
            </div>
            <Link href="/sbm" className={dc.button.secondary}>
              {globalContent.commonLabels.viewAll} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {results.length ? (
            <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {results.map((post, index) => (
                <EditableReveal key={post.id || post.slug} index={index} step={45}>
                  <SearchResultCard post={post} index={index} />
                </EditableReveal>
              ))}
            </div>
          ) : (
            <div className="mt-14 border border-dashed border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-10 py-20 text-center">
              <h3 className={`${dc.type.displayH3} text-[var(--slot4-page-text)]`}>Nothing matched.</h3>
              <p className="mx-auto mt-5 max-w-md text-sm text-[var(--slot4-muted-text)]">
                Try a wider keyword, or open the library and pick a shelf that looks close.
              </p>
              <Link href="/sbm" className={`${dc.button.secondary} mt-8`}>
                Open the library
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          <div className="mt-20 border-t border-[var(--editable-border)] pt-10">
            <Ads slot="footer" size={pickRandom(getSlotSizes('footer'))} showLabel className="mx-auto w-full" />
          </div>
        </EditableReveal>
      </main>
    </EditableSiteShell>
  )
}
