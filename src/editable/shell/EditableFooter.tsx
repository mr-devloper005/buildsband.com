'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { CATEGORY_OPTIONS } from '@/lib/categories'
import { globalContent, isUiHiddenTask } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

/*
  Editorial dark footer. Collections column links into /sbm?category=<slug>,
  which is the discovery surface for the whole site. Profile stays out.
*/
export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  const sbmRoute = SITE_CONFIG.taskViews.sbm || '/sbm'
  const collections = CATEGORY_OPTIONS.slice(0, 10)

  const enabledVisibleTasks = SITE_CONFIG.tasks.filter(
    (task) => task.enabled && !isUiHiddenTask(task.key),
  )

  return (
    <footer className="bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="editable-display inline-block text-[2.5rem] leading-none tracking-[0.02em] text-[var(--slot4-dark-text)] transition-colors duration-500 hover:text-[var(--slot4-accent)]">
              {SITE_CONFIG.name}
            </Link>
            <p className="mt-6 max-w-md text-base leading-[1.7] text-[var(--slot4-dark-text)]/70">
              {globalContent.footer.description}
            </p>
            <Link
              href={globalContent.footer.submit.href}
              className="editable-eyebrow mt-8 inline-flex items-center gap-2 rounded-[3px] bg-[var(--slot4-accent)] px-6 py-4 text-[var(--slot4-on-accent)] transition-all duration-500 hover:bg-[var(--slot4-cream)] hover:text-[var(--slot4-page-text)]"
            >
              {globalContent.footer.submit.label} <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div>
            <h3 className="editable-eyebrow text-[var(--slot4-accent)]">
              {globalContent.footer.columns[0].title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--slot4-dark-text)]/50">
              {globalContent.footer.columns[0].intro}
            </p>
            <ul className="mt-6 grid gap-3">
              {collections.map((collection) => (
                <li key={collection.slug}>
                  <Link
                    href={`${sbmRoute}?category=${collection.slug}`}
                    className="group inline-flex items-center gap-2 text-[15px] font-normal text-[var(--slot4-dark-text)]/80 transition-colors duration-500 hover:text-[var(--slot4-accent)]"
                  >
                    <span className="h-px w-4 bg-[var(--slot4-dark-text)]/30 transition-all duration-500 group-hover:w-8 group-hover:bg-[var(--slot4-accent)]" />
                    {collection.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={sbmRoute}
              className="editable-eyebrow mt-6 inline-flex items-center gap-2 text-[var(--slot4-accent)] transition-colors duration-500 hover:text-[var(--slot4-dark-text)]"
            >
              {globalContent.commonLabels.viewAll} <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div>
            <h3 className="editable-eyebrow text-[var(--slot4-accent)]">
              {globalContent.footer.columns[1].title}
            </h3>
            <ul className="mt-6 grid gap-3">
              {enabledVisibleTasks.map((task) => (
                <li key={task.key}>
                  <Link
                    href={task.route}
                    className="group inline-flex items-center gap-2 text-[15px] font-normal text-[var(--slot4-dark-text)]/80 transition-colors duration-500 hover:text-[var(--slot4-accent)]"
                  >
                    <span className="h-px w-4 bg-[var(--slot4-dark-text)]/30 transition-all duration-500 group-hover:w-8 group-hover:bg-[var(--slot4-accent)]" />
                    {task.key === 'sbm' ? globalContent.labels.library : task.label}
                  </Link>
                </li>
              ))}
              {[
                ['About', '/about'],
                ['Contact', '/contact'],
                ['Search', '/search'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href as string}
                    className="group inline-flex items-center gap-2 text-[15px] font-normal text-[var(--slot4-dark-text)]/80 transition-colors duration-500 hover:text-[var(--slot4-accent)]"
                  >
                    <span className="h-px w-4 bg-[var(--slot4-dark-text)]/30 transition-all duration-500 group-hover:w-8 group-hover:bg-[var(--slot4-accent)]" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="editable-eyebrow text-[var(--slot4-accent)]">
              {globalContent.footer.columns[2].title}
            </h3>
            <ul className="mt-6 grid gap-3">
              {session ? (
                <>
                  <li>
                    <Link
                      href="/create"
                      className="group inline-flex items-center gap-2 text-[15px] font-normal text-[var(--slot4-dark-text)]/80 transition-colors duration-500 hover:text-[var(--slot4-accent)]"
                    >
                      <span className="h-px w-4 bg-[var(--slot4-dark-text)]/30 transition-all duration-500 group-hover:w-8 group-hover:bg-[var(--slot4-accent)]" />
                      Add a resource
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={logout}
                      className="group inline-flex items-center gap-2 text-left text-[15px] font-normal text-[var(--slot4-dark-text)]/80 transition-colors duration-500 hover:text-[var(--slot4-accent)]"
                    >
                      <span className="h-px w-4 bg-[var(--slot4-dark-text)]/30 transition-all duration-500 group-hover:w-8 group-hover:bg-[var(--slot4-accent)]" />
                      Log out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/login"
                      className="group inline-flex items-center gap-2 text-[15px] font-normal text-[var(--slot4-dark-text)]/80 transition-colors duration-500 hover:text-[var(--slot4-accent)]"
                    >
                      <span className="h-px w-4 bg-[var(--slot4-dark-text)]/30 transition-all duration-500 group-hover:w-8 group-hover:bg-[var(--slot4-accent)]" />
                      Log in
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/signup"
                      className="group inline-flex items-center gap-2 text-[15px] font-normal text-[var(--slot4-dark-text)]/80 transition-colors duration-500 hover:text-[var(--slot4-accent)]"
                    >
                      <span className="h-px w-4 bg-[var(--slot4-dark-text)]/30 transition-all duration-500 group-hover:w-8 group-hover:bg-[var(--slot4-accent)]" />
                      Become a curator
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-[var(--editable-border-inverse)] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--slot4-dark-text)]/50">
            © {year} {SITE_CONFIG.name}. {globalContent.footer.bottomNote}
          </p>
          <p className="editable-eyebrow text-[var(--slot4-dark-text)]/50">{globalContent.footer.tagline}</p>
        </div>
      </div>
    </footer>
  )
}
