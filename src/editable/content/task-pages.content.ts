import type { TaskKey } from '@/lib/site-config'
import { slot4BrandConfig } from '@/editable/theme/brand.config'

const LIBRARY = slot4BrandConfig.labels.library
const CURATORS = slot4BrandConfig.labels.contributors

export type TaskPageVoice = {
  eyebrow: string
  headline: string
  description: string
  filterLabel: string
  secondaryNote: string
  chips: string[]
}

export const taskPageVoices = {
  sbm: {
    eyebrow: LIBRARY,
    headline: `Bookmarks worth keeping, shelved by hand.`,
    description: `Every collection here is a shelf a ${CURATORS.toLowerCase().slice(0, -1)} opened, curated, and keeps tending. Pick one and walk in.`,
    filterLabel: 'Filter shelf',
    secondaryNote: `${CURATORS} keep the collections small enough to read end-to-end.`,
    chips: ['Curated collections', 'Weekly link check', 'Human-picked'],
  },
  article: {
    eyebrow: 'Long reads',
    headline: 'Essays, guides, and pieces worth an hour.',
    description: 'Slower, longer, and made for reading — not scrolling. Each piece lives on a shelf of its own.',
    filterLabel: 'Filter topic',
    secondaryNote: 'Reading rewards attention. So does the page.',
    chips: ['Editorial pacing', 'Deeper reading', 'One at a time'],
  },
  classified: {
    eyebrow: 'Notice board',
    headline: 'Open calls and short-lived listings.',
    description: 'The corkboard of the library — fast to scan, easy to act on, gone when the moment passes.',
    filterLabel: 'Filter notice',
    secondaryNote: 'Urgency, honestly labelled.',
    chips: ['Time-sensitive', 'Short and clear', 'Action-first'],
  },
  profile: {
    eyebrow: CURATORS.slice(0, -1),
    headline: 'The person behind the shelf.',
    description: 'A curator page tells you who tends a collection — and why they think it is worth your time.',
    filterLabel: 'Filter curator',
    secondaryNote: 'Named shelves. Named people.',
    chips: ['Identity first', 'Named voice', 'Trust cues'],
  },
  pdf: {
    eyebrow: 'Documents',
    headline: 'Reference PDFs and downloadable briefs.',
    description: 'A reference shelf — reports, guides, and documents worth saving on disk, not just a tab.',
    filterLabel: 'Filter document',
    secondaryNote: 'Archive-ready, download-friendly.',
    chips: ['Reports', 'Briefs', 'Downloadable'],
  },
  listing: {
    eyebrow: 'Directory',
    headline: 'Organisations worth knowing about.',
    description: 'A small directory of studios, publishers, and outfits worth a look — vetted, not scraped.',
    filterLabel: 'Filter directory',
    secondaryNote: 'Comparison, location, and context.',
    chips: ['Directory', 'Compare', 'Small enough to matter'],
  },
  image: {
    eyebrow: 'Visual shelf',
    headline: 'Frames worth a second look.',
    description: 'A gallery-first shelf for visual bookmarks — photos, illustrations, and screens worth saving.',
    filterLabel: 'Filter visual',
    secondaryNote: 'Let the image lead. Words come after.',
    chips: ['Gallery', 'Visual-first', 'Slow scroll'],
  },
} satisfies Record<TaskKey, TaskPageVoice>
