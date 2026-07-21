'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  Bookmark,
  CheckCircle2,
  FileText,
  ImageIcon,
  Lock,
  PlusCircle,
  Send,
  Sparkles,
} from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { globalContent, isUiHiddenTask } from '@/editable/content/global.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const taskIcon: Record<string, typeof FileText> = {
  article: FileText,
  listing: Sparkles,
  classified: PlusCircle,
  image: ImageIcon,
  profile: Sparkles,
  pdf: FileText,
  sbm: Bookmark,
}

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

const inputClass =
  'w-full border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] px-4 py-3 text-[15px] text-[var(--slot4-page-text)] outline-none transition-colors duration-500 placeholder:text-[var(--slot4-muted-text)] focus:border-[var(--slot4-accent)]'

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const visibleTasks = useMemo(
    () => SITE_CONFIG.tasks.filter((task) => task.enabled && !isUiHiddenTask(task.key)),
    [],
  )
  const [task, setTask] = useState<TaskKey>((visibleTasks[0]?.key || 'sbm') as TaskKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTask = visibleTasks.find((item) => item.key === task) || visibleTasks[0]
  const activeLabel =
    activeTask?.key === 'sbm' ? globalContent.labels.library : activeTask?.label || 'Resource'

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
          <section className={`${dc.shell.section} py-20 sm:py-24 lg:py-28`}>
            <EditableReveal className="grid gap-14 border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-8 sm:p-12 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
              <div className="flex h-full min-h-72 items-center justify-center bg-[var(--slot4-page-text)] text-[var(--slot4-page-bg)]">
                <Lock className="h-16 w-16 opacity-80" />
              </div>
              <div className="self-center">
                <p className={dc.type.eyebrow}>{pagesContent.create.locked.badge}</p>
                <h1 className={`${dc.type.displayH1} mt-6 text-[var(--slot4-page-text)]`}>
                  {pagesContent.create.locked.title}
                </h1>
                <p className={`${dc.type.lead} mt-8 max-w-xl text-[var(--slot4-muted-text)]`}>
                  {pagesContent.create.locked.description}
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link href="/login" className={dc.button.primary}>
                    Log in <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href="/signup" className={dc.button.secondary}>
                    Become a curator
                  </Link>
                </div>
              </div>
            </EditableReveal>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className={`${dc.shell.section} py-20 sm:py-24 lg:py-28`}>
          <EditableReveal>
            <p className={dc.type.eyebrow}>{pagesContent.create.hero.badge}</p>
            <h1 className={`${dc.type.displayHero} mt-8 max-w-4xl text-[var(--slot4-page-text)]`}>
              {pagesContent.create.hero.title}
            </h1>
            <p className={`${dc.type.lead} mt-8 max-w-2xl text-[var(--slot4-muted-text)]`}>
              {pagesContent.create.hero.description}
            </p>
          </EditableReveal>

          <div className="mt-16 grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <EditableReveal>
              <p className={dc.type.eyebrow}>Content type</p>
              <div className="mt-6 grid gap-px bg-[var(--editable-border)]">
                {visibleTasks.map((item, i) => {
                  const Icon = taskIcon[item.key] || FileText
                  const active = item.key === task
                  const label = item.key === 'sbm' ? globalContent.labels.library : item.label
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTask(item.key)}
                      className={`group flex items-start gap-5 p-6 text-left transition-colors duration-500 ${
                        active
                          ? 'bg-[var(--slot4-page-text)] text-[var(--slot4-page-bg)]'
                          : 'bg-[var(--slot4-page-bg)] hover:bg-[var(--slot4-warm)]'
                      }`}
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center border transition-colors duration-500 ${active ? 'border-[var(--slot4-accent)] text-[var(--slot4-accent)]' : 'border-[var(--editable-border-strong)] text-[var(--slot4-accent)]'}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="editable-eyebrow">Nº {String(i + 1).padStart(2, '0')}</p>
                        <p className={`${dc.type.displayH4} mt-2`}>{label}</p>
                        <p className="mt-2 text-sm leading-6 opacity-70">{item.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </EditableReveal>

            <EditableReveal index={1}>
              <form onSubmit={submit} className="border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-8 sm:p-10">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--editable-border)] pb-6">
                  <div>
                    <p className="editable-eyebrow text-[var(--slot4-accent)]">Add to {activeLabel}</p>
                    <h2 className={`${dc.type.displayH3} mt-3 text-[var(--slot4-page-text)]`}>
                      {pagesContent.create.formTitle}
                    </h2>
                  </div>
                  <span className="editable-eyebrow rounded-[3px] border border-[var(--editable-border-strong)] px-4 py-2 text-[var(--slot4-page-text)]">
                    {session.name}
                  </span>
                </div>

                <div className="mt-8 grid gap-5">
                  <input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" required />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <input className={inputClass} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Collection / category" />
                    <input className={inputClass} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Source URL" />
                  </div>
                  <input className={inputClass} value={image} onChange={(event) => setImage(event.target.value)} placeholder="Cover image URL (optional)" />
                  <textarea
                    className={`${inputClass} min-h-24`}
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    placeholder="One-line pitch — why the shelf should keep this."
                    required
                  />
                  <textarea
                    className={`${inputClass} min-h-56`}
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    placeholder="Curator notes — what someone should know before they click through."
                    required
                  />
                </div>

                {created ? (
                  <div className="mt-8 flex items-start gap-3 border border-[var(--slot4-accent)] bg-[var(--slot4-accent-soft)] p-5">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[var(--slot4-accent)]" />
                    <div>
                      <p className="editable-eyebrow text-[var(--slot4-accent)]">{pagesContent.create.successTitle}</p>
                      <p className="mt-2 text-sm text-[var(--slot4-page-text)]">{created.title}</p>
                    </div>
                  </div>
                ) : null}

                <button type="submit" className={`${dc.button.primary} mt-10 w-full`}>
                  <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
                </button>
              </form>
            </EditableReveal>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
