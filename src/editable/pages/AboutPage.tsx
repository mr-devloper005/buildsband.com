import Link from 'next/link'
import { ArrowUpRight, BookOpen, Compass, Hand } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { globalContent } from '@/editable/content/global.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

/*
  Editorial About page. Content stays task-agnostic: no mention of a specific
  content type. It reads as a manifesto for the whole site.
*/
export default function AboutPage() {
  const { title, description, paragraphs, values, badge } = pagesContent.about
  const valueIcons = [BookOpen, Compass, Hand] as const

  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <EditableReveal as="section" className="border-b border-[var(--editable-border)]">
          <div className={`${dc.shell.section} py-20 sm:py-24 lg:py-28`}>
            <p className={dc.type.eyebrow}>{badge}</p>
            <h1 className={`${dc.type.displayHero} mt-8 max-w-5xl text-[var(--slot4-page-text)]`}>{title}</h1>
            <p className={`${dc.type.lead} mt-10 max-w-2xl text-[var(--slot4-muted-text)]`}>{description}</p>
          </div>
        </EditableReveal>

        <EditableReveal as="section" className="bg-[var(--slot4-warm)]">
          <div className={`${dc.shell.section} py-20 sm:py-24`}>
            <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
              <div>
                <p className={dc.type.eyebrow}>Origin</p>
                <h2 className={`${dc.type.displayH2} mt-6 text-[var(--slot4-page-text)]`}>Why {SITE_CONFIG.name} exists.</h2>
              </div>
              <div className="space-y-6 text-[1.0625rem] leading-[1.8] text-[var(--slot4-muted-text)]">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </EditableReveal>

        <EditableReveal as="section" className="bg-[var(--slot4-page-bg)]">
          <div className={`${dc.shell.section} py-20 sm:py-24 lg:py-28`}>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className={dc.type.eyebrow}>House rules</p>
                <h2 className={`${dc.type.displayH2} mt-6 text-[var(--slot4-page-text)]`}>What we hold to.</h2>
              </div>
              <p className="max-w-md text-sm text-[var(--slot4-muted-text)]">
                Three quiet principles keep every corner of the site consistent.
              </p>
            </div>
            <div className="mt-14 grid gap-px bg-[var(--editable-border)] md:grid-cols-3">
              {values.map((value, i) => {
                const Icon = valueIcons[i % valueIcons.length]
                return (
                  <EditableReveal key={value.title} index={i} step={80} className="flex flex-col gap-8 bg-[var(--slot4-page-bg)] p-10">
                    <span className="flex h-14 w-14 items-center justify-center rounded-[3px] border border-[var(--editable-border-strong)] text-[var(--slot4-accent)]">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="editable-eyebrow text-[var(--slot4-accent)]">Nº {String(i + 1).padStart(2, '0')}</p>
                      <h3 className={`${dc.type.displayH3} mt-4 text-[var(--slot4-page-text)]`}>{value.title}</h3>
                      <p className="mt-5 text-[15px] leading-[1.7] text-[var(--slot4-muted-text)]">{value.description}</p>
                    </div>
                  </EditableReveal>
                )
              })}
            </div>
          </div>
        </EditableReveal>

        <EditableReveal as="section" className="bg-[var(--slot4-page-text)] text-[var(--slot4-page-bg)]">
          <div className={`${dc.shell.section} py-20 sm:py-24 lg:py-28`}>
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="editable-eyebrow text-[var(--slot4-accent)]">Say hello</p>
                <h2 className={`${dc.type.displayHero} mt-8`}>Come knock.</h2>
              </div>
              <div>
                <p className={`${dc.type.lead} text-[var(--slot4-page-bg)]/70`}>
                  Suggest a resource, pitch a collection, or just tell us the site is quietly on your bookmarks bar — either way, the contact page is the door.
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link href="/contact" className={dc.button.primary}>
                    Open the door <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href="/sbm" className={dc.button.ghostInverse}>
                    {globalContent.commonLabels.viewAll}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </EditableReveal>
      </main>
    </EditableSiteShell>
  )
}
