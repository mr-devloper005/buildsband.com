import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Bookmark } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { EditableLocalLoginForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { globalContent } from '@/editable/content/global.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/login', title: 'Log in', description: pagesContent.auth.login.metadataDescription })
}

export default function LoginPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className={`${dc.shell.section} grid min-h-[calc(100vh-14rem)] items-center gap-16 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24 lg:py-24`}>
          <EditableReveal>
            <p className={dc.type.eyebrow}>{pagesContent.auth.login.badge}</p>
            <h1 className={`${dc.type.displayHero} mt-8 max-w-xl text-[var(--slot4-page-text)]`}>
              {pagesContent.auth.login.title}
            </h1>
            <p className={`${dc.type.lead} mt-8 max-w-lg text-[var(--slot4-muted-text)]`}>
              {pagesContent.auth.login.description}
            </p>
            <ul className="mt-12 grid gap-4 text-sm text-[var(--slot4-muted-text)]">
              <li className="flex items-start gap-3 border-b border-[var(--editable-border)] pb-4">
                <Bookmark className="mt-1 h-4 w-4 shrink-0 text-[var(--slot4-accent)]" />
                Pick up your shelves where you left them.
              </li>
              <li className="flex items-start gap-3 border-b border-[var(--editable-border)] pb-4">
                <Bookmark className="mt-1 h-4 w-4 shrink-0 text-[var(--slot4-accent)]" />
                Add a resource in two clicks, publish in three.
              </li>
              <li className="flex items-start gap-3">
                <Bookmark className="mt-1 h-4 w-4 shrink-0 text-[var(--slot4-accent)]" />
                See the collections you follow, all in one room.
              </li>
            </ul>
          </EditableReveal>
          <EditableReveal index={1} className="border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-8 sm:p-10">
            <p className={dc.type.eyebrow}>{globalContent.labels.contributors}</p>
            <h2 className={`${dc.type.displayH2} mt-4 text-[var(--slot4-page-text)]`}>{pagesContent.auth.login.formTitle}</h2>
            <EditableLocalLoginForm />
            <p className="mt-8 border-t border-[var(--editable-border)] pt-6 text-sm text-[var(--slot4-muted-text)]">
              New to {globalContent.labels.library}?{' '}
              <Link href="/signup" className="editable-eyebrow inline-flex items-center gap-1 text-[var(--slot4-accent)] hover:text-[var(--slot4-page-text)]">
                {pagesContent.auth.login.createCta} <ArrowUpRight className="h-3 w-3" />
              </Link>
            </p>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
