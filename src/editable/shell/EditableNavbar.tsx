'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, UserPlus, LogIn, X, PlusCircle, ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

/*
  Editorial reference navbar. No task links. Only: logo, About, Contact,
  a search icon that goes to /search, and auth actions. Mobile mirrors it.
  Search is a link (not an inline form) to match the reference's minimal top bar.
*/
export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()

  const primary = globalContent.nav.primaryLinks

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--editable-border)] bg-[var(--editable-nav-bg)]/95 text-[var(--editable-nav-text)] backdrop-blur-md">
      <nav className="mx-auto flex min-h-[76px] w-full max-w-[var(--editable-container)] items-center gap-6 px-5 sm:px-8 lg:px-10">
        <Link href="/" className="group inline-flex shrink-0 items-center gap-3">
          <span className="editable-display text-[1.6rem] leading-none tracking-[0.02em] text-[var(--slot4-page-text)] transition-colors duration-500 group-hover:text-[var(--slot4-accent)]">
            {SITE_CONFIG.name}
          </span>
          <span className="hidden h-4 w-px bg-[var(--editable-border-strong)] md:inline-block" />
          <span className="editable-eyebrow hidden text-[var(--slot4-muted-text)] md:inline-block">
            {globalContent.nav.tagline}
          </span>
        </Link>

        <div className="ml-auto hidden items-center gap-8 lg:flex">
          {primary.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`editable-eyebrow relative transition-colors duration-500 hover:text-[var(--slot4-accent)] ${
                  active ? 'text-[var(--slot4-accent)]' : 'text-[var(--slot4-page-text)]'
                }`}
              >
                {item.label}
                {active ? (
                  <span className="absolute -bottom-2 left-0 h-[2px] w-full bg-[var(--slot4-accent)]" />
                ) : null}
              </Link>
            )
          })}
          <Link
            href="/search"
            aria-label={globalContent.nav.searchAria}
            className="inline-flex h-10 w-10 items-center justify-center border border-[var(--editable-border)] text-[var(--slot4-page-text)] transition-all duration-500 hover:border-[var(--slot4-accent)] hover:bg-[var(--slot4-accent)] hover:text-[var(--slot4-on-accent)]"
          >
            <Search className="h-4 w-4" />
          </Link>
          {session ? (
            <>
              <Link
                href="/create"
                className="editable-eyebrow inline-flex items-center gap-2 rounded-[3px] bg-[var(--editable-cta-bg)] px-5 py-3 text-[var(--editable-cta-text)] transition-all duration-500 hover:bg-[var(--slot4-page-text)] hover:text-[var(--slot4-page-bg)]"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Add resource
              </Link>
              <button
                type="button"
                onClick={logout}
                className="editable-eyebrow text-[var(--slot4-muted-text)] transition-colors duration-500 hover:text-[var(--slot4-accent)]"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="editable-eyebrow inline-flex items-center gap-2 text-[var(--slot4-page-text)] transition-colors duration-500 hover:text-[var(--slot4-accent)]"
              >
                <LogIn className="h-3.5 w-3.5" /> Log in
              </Link>
              <Link
                href="/signup"
                className="editable-eyebrow inline-flex items-center gap-2 rounded-[3px] bg-[var(--editable-cta-bg)] px-5 py-3 text-[var(--editable-cta-text)] transition-all duration-500 hover:bg-[var(--slot4-page-text)] hover:text-[var(--slot4-page-bg)]"
              >
                <UserPlus className="h-3.5 w-3.5" /> Sign up
              </Link>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-3 lg:hidden">
          <Link
            href="/search"
            aria-label={globalContent.nav.searchAria}
            className="inline-flex h-10 w-10 items-center justify-center border border-[var(--editable-border)] text-[var(--slot4-page-text)] transition-colors duration-500 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
          >
            <Search className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center border border-[var(--editable-border)] text-[var(--slot4-page-text)] transition-colors duration-500 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-[var(--editable-border)] bg-[var(--editable-nav-bg)] px-5 py-6 lg:hidden">
          <div className="grid gap-1">
            {[{ label: 'Home', href: '/' }, ...primary].map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`editable-eyebrow flex items-center justify-between border-b border-[var(--editable-border)] py-4 transition-colors duration-500 hover:text-[var(--slot4-accent)] ${
                    active ? 'text-[var(--slot4-accent)]' : 'text-[var(--slot4-page-text)]'
                  }`}
                >
                  {item.label}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              )
            })}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {session ? (
              <>
                <Link
                  href="/create"
                  onClick={() => setOpen(false)}
                  className="editable-eyebrow inline-flex flex-1 items-center justify-center gap-2 rounded-[3px] bg-[var(--editable-cta-bg)] px-5 py-3 text-[var(--editable-cta-text)]"
                >
                  <PlusCircle className="h-3.5 w-3.5" /> Add resource
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    setOpen(false)
                  }}
                  className="editable-eyebrow inline-flex flex-1 items-center justify-center gap-2 rounded-[3px] border border-[var(--editable-border-strong)] px-5 py-3 text-[var(--slot4-page-text)]"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="editable-eyebrow inline-flex flex-1 items-center justify-center gap-2 rounded-[3px] border border-[var(--editable-border-strong)] px-5 py-3 text-[var(--slot4-page-text)]"
                >
                  <LogIn className="h-3.5 w-3.5" /> Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="editable-eyebrow inline-flex flex-1 items-center justify-center gap-2 rounded-[3px] bg-[var(--editable-cta-bg)] px-5 py-3 text-[var(--editable-cta-text)]"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}
