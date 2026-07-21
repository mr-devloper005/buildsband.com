import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Check } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { EditableLocalSignupForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { globalContent } from '@/editable/content/global.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/signup', title: 'Become a curator', description: pagesContent.auth.signup.metadataDescription })
}

const perks = [
  'Tend a shelf of your own — start small, grow it slow.',
  'Save resources with a click and a note.',
  'Get read by people who actually open bookmarks.',
]

export default function SignupPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className={`${dc.shell.section} grid min-h-[calc(100vh-14rem)] items-center gap-16 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:py-24`}>
          <EditableReveal className="border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-8 sm:p-10">
            <p className={dc.type.eyebrow}>{pagesContent.auth.signup.badge}</p>
            <h1 className={`${dc.type.displayH2} mt-4 text-[var(--slot4-page-text)]`}>
              {pagesContent.auth.signup.formTitle}
            </h1>
            <EditableLocalSignupForm />
            <p className="mt-8 border-t border-[var(--editable-border)] pt-6 text-sm text-[var(--slot4-muted-text)]">
              Already a {globalContent.labels.contributors.toLowerCase().slice(0, -1)}?{' '}
              <Link href="/login" className="editable-eyebrow inline-flex items-center gap-1 text-[var(--slot4-accent)] hover:text-[var(--slot4-page-text)]">
                {pagesContent.auth.signup.loginCta} <ArrowUpRight className="h-3 w-3" />
              </Link>
            </p>
          </EditableReveal>
          <EditableReveal index={1}>
            <p className={dc.type.eyebrow}>{globalContent.labels.contributors} welcome</p>
            <h2 className={`${dc.type.displayHero} mt-8 max-w-xl text-[var(--slot4-page-text)]`}>
              {pagesContent.auth.signup.title}
            </h2>
            <p className={`${dc.type.lead} mt-8 max-w-lg text-[var(--slot4-muted-text)]`}>
              {pagesContent.auth.signup.description}
            </p>
            <ul className="mt-12 grid gap-6">
              {perks.map((perk) => (
                <li key={perk} className="flex items-start gap-4">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)]">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-[15px] leading-[1.7] text-[var(--slot4-page-text)]">{perk}</span>
                </li>
              ))}
            </ul>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
