'use client'

import { Bookmark, Compass, Mail, MessageSquare } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { globalContent } from '@/editable/content/global.content'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

/*
  Editorial Contact page. The form component itself stays untouched — only the
  page shell and lanes are re-skinned to the reference language.
*/
const lanes = [
  {
    icon: Bookmark,
    title: 'Submit a resource',
    body: `Send a link you would send a friend. If it lands on a shelf, ${globalContent.labels.contributors.toLowerCase()} will take it from there.`,
  },
  {
    icon: Compass,
    title: 'Start a shelf',
    body: `Have a small collection worth opening? Pitch the topic and we will help you set up a shelf inside ${globalContent.labels.library}.`,
  },
  {
    icon: MessageSquare,
    title: 'Anything else',
    body: `Feedback, corrections, partnerships, or just a note about a resource that made your week — all welcome here.`,
  },
]

export default function ContactPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <EditableReveal as="section" className={`${dc.shell.section} py-20 sm:py-24 lg:py-28`}>
          <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-20">
            <div>
              <p className={dc.type.eyebrow}>{pagesContent.contact.eyebrow}</p>
              <h1 className={`${dc.type.displayHero} mt-8 text-[var(--slot4-page-text)]`}>
                {pagesContent.contact.title}
              </h1>
              <p className={`${dc.type.lead} mt-8 max-w-xl text-[var(--slot4-muted-text)]`}>
                {pagesContent.contact.description}
              </p>
              <div className="mt-14 grid gap-px bg-[var(--editable-border)]">
                {lanes.map((lane, i) => (
                  <EditableReveal
                    key={lane.title}
                    index={i}
                    step={80}
                    className="flex items-start gap-6 bg-[var(--slot4-page-bg)] p-8"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-[var(--editable-border-strong)] text-[var(--slot4-accent)]">
                      <lane.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="editable-eyebrow text-[var(--slot4-accent)]">Nº {String(i + 1).padStart(2, '0')}</p>
                      <h2 className={`${dc.type.displayH4} mt-3 text-[var(--slot4-page-text)]`}>{lane.title}</h2>
                      <p className="mt-3 text-[15px] leading-[1.7] text-[var(--slot4-muted-text)]">{lane.body}</p>
                    </div>
                  </EditableReveal>
                ))}
              </div>
            </div>

            <EditableReveal className="border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-8 sm:p-10">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className={dc.type.eyebrow}>Message</p>
                  <h2 className={`${dc.type.displayH2} mt-4 text-[var(--slot4-page-text)]`}>
                    {pagesContent.contact.formTitle}
                  </h2>
                </div>
                <span className="hidden h-12 w-12 shrink-0 items-center justify-center bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)] sm:flex">
                  <Mail className="h-5 w-5" />
                </span>
              </div>
              <EditableContactLeadForm />
            </EditableReveal>
          </div>
        </EditableReveal>
      </main>
    </EditableSiteShell>
  )
}
